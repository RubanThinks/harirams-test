"""
Admin authentication — bcrypt + JWT bearer token + WhatsApp OTP 2FA (mocked).

Flow:
  Step 1 (POST /admin/auth/login)  ->  password check + generates 6-digit OTP,
                                       stores it against a challenge sessionId
                                       (5-min TTL) and returns sessionId.
                                       Mock delivery target: +91-9500049550.
                                       Response echoes `mockOtp` so it can be
                                       shown on screen until MSG91 WhatsApp
                                       integration replaces the mock.
  Step 2 (POST /admin/auth/verify-otp)  ->  verifies OTP for the sessionId and
                                            issues the real admin JWT (8 h).
"""
import os
import uuid
import random
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel

from msg91 import send_otp as msg91_send_otp, verify_otp as msg91_verify_otp, is_configured as msg91_is_configured

JWT_ALGORITHM = "HS256"
ACCESS_TTL_HOURS = 8
BRUTE_LOCK_MINUTES = 15
BRUTE_MAX_ATTEMPTS = 5
OTP_TTL_MINUTES = 5
OTP_MAX_ATTEMPTS = 5
OTP_TARGET_PHONE = "+91-9500049550"  # hardcoded per spec; swap when MSG91 goes live

router = APIRouter(prefix="/admin/auth", tags=["admin-auth"])


class LoginRequest(BaseModel):
    username: str
    password: str


class VerifyOtpRequest(BaseModel):
    sessionId: str
    otp: str


def _secret() -> str:
    return os.environ["JWT_SECRET"]


def _verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def _make_token(username: str) -> str:
    payload = {
        "sub": username,
        "role": "admin",
        "exp": datetime.now(timezone.utc) + timedelta(hours=ACCESS_TTL_HOURS),
        "iat": datetime.now(timezone.utc),
        "type": "access",
    }
    return jwt.encode(payload, _secret(), algorithm=JWT_ALGORITHM)


def _generate_otp() -> str:
    return f"{random.randint(0, 999999):06d}"


async def require_admin(request: Request) -> dict:
    """FastAPI dependency — enforces valid admin JWT."""
    auth = request.headers.get("Authorization", "")
    token = auth[7:] if auth.startswith("Bearer ") else request.cookies.get("admin_token")
    if not token:
        raise HTTPException(status_code=401, detail="Admin authentication required")
    try:
        payload = jwt.decode(token, _secret(), algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Session expired. Please sign in again.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid admin token")
    if payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return payload


def register(api: APIRouter, db):
    """Attach admin auth routes + brute-force protection + 2FA sessions."""

    async def _check_lock(identifier: str):
        rec = await db.admin_login_attempts.find_one({"identifier": identifier})
        if not rec:
            return
        if rec.get("locked_until"):
            try:
                lu = datetime.fromisoformat(rec["locked_until"])
                if lu > datetime.now(timezone.utc):
                    raise HTTPException(
                        status_code=429,
                        detail=f"Too many attempts. Locked until {lu.strftime('%H:%M UTC')}.",
                    )
            except (ValueError, TypeError):
                pass

    async def _record_fail(identifier: str):
        rec = await db.admin_login_attempts.find_one({"identifier": identifier}) or {"attempts": 0}
        attempts = int(rec.get("attempts", 0)) + 1
        upd = {"attempts": attempts, "last_at": datetime.now(timezone.utc).isoformat()}
        if attempts >= BRUTE_MAX_ATTEMPTS:
            upd["locked_until"] = (
                datetime.now(timezone.utc) + timedelta(minutes=BRUTE_LOCK_MINUTES)
            ).isoformat()
            upd["attempts"] = 0  # reset counter alongside lock
        await db.admin_login_attempts.update_one(
            {"identifier": identifier}, {"$set": {"identifier": identifier, **upd}}, upsert=True
        )

    async def _clear_fails(identifier: str):
        await db.admin_login_attempts.delete_one({"identifier": identifier})

    @router.post("/login")
    async def login(req: LoginRequest, request: Request):
        # Behind kubernetes ingress `request.client.host` can rotate across
        # ingress-controller pod IPs, breaking the identifier for the
        # brute-force limiter. Prefer the client IP the ingress forwards.
        fwd = (request.headers.get("x-forwarded-for") or "").split(",")[0].strip()
        client_ip = fwd or (request.client.host if request.client else "unknown")
        identifier = f"{client_ip}:{req.username.lower()}"
        await _check_lock(identifier)

        env_user = os.environ.get("ADMIN_USER", "admin")
        env_hash = os.environ.get("ADMIN_PASSWORD_HASH", "")
        if req.username.lower() != env_user.lower() or not _verify_password(req.password, env_hash):
            await _record_fail(identifier)
            raise HTTPException(status_code=401, detail="Invalid username or password")

        await _clear_fails(identifier)

        # Step 1 passed — issue an OTP challenge session.
        session_id = uuid.uuid4().hex
        otp = _generate_otp()
        now = datetime.now(timezone.utc)
        await db.admin_otp_sessions.insert_one({
            "sessionId": session_id,
            "username": env_user,
            "otp": otp,
            "attempts": 0,
            "verified": False,
            "created_at": now.isoformat(),
            "expires_at": (now + timedelta(minutes=OTP_TTL_MINUTES)).isoformat(),
        })
        # Dispatch OTP through MSG91 (falls back to MOCK when template not set).
        # We forward our locally-generated OTP so the sessionId/OTP stay in sync
        # regardless of provider.
        live = msg91_is_configured("admin")
        send_result = msg91_send_otp(
            OTP_TARGET_PHONE, kind="admin",
            length=6, expiry_minutes=OTP_TTL_MINUTES, otp=otp,
        )
        response = {
            "otpRequired": True,
            "sessionId": session_id,
            "otpTarget": OTP_TARGET_PHONE,
            "ttlMinutes": OTP_TTL_MINUTES,
            "mock": not live,
        }
        if not live:
            # Echo the OTP on-screen only in MOCK mode.
            response["mockOtp"] = otp
        return response

    @router.post("/verify-otp")
    async def verify_otp(req: VerifyOtpRequest):
        sess = await db.admin_otp_sessions.find_one({"sessionId": req.sessionId})
        if not sess:
            raise HTTPException(status_code=404, detail="Invalid or expired OTP session. Please sign in again.")

        try:
            expires_at = datetime.fromisoformat(sess["expires_at"])
        except (ValueError, TypeError):
            expires_at = datetime.now(timezone.utc)
        if expires_at < datetime.now(timezone.utc):
            await db.admin_otp_sessions.delete_one({"sessionId": req.sessionId})
            raise HTTPException(status_code=401, detail="OTP expired. Please sign in again.")

        await db.admin_otp_sessions.update_one({"sessionId": req.sessionId}, {"$inc": {"attempts": 1}})
        if sess.get("attempts", 0) + 1 >= OTP_MAX_ATTEMPTS:
            # Only invalidate the session after this attempt actually is the Nth wrong one
            if (req.otp or "").strip() != sess["otp"]:
                await db.admin_otp_sessions.delete_one({"sessionId": req.sessionId})
                raise HTTPException(status_code=429, detail="Too many OTP attempts. Please sign in again.")

        if (req.otp or "").strip() != sess["otp"]:
            raise HTTPException(status_code=401, detail="Invalid OTP. Please try again.")

        await db.admin_otp_sessions.delete_one({"sessionId": req.sessionId})
        username = sess.get("username") or os.environ.get("ADMIN_USER", "admin")
        token = _make_token(username)
        return {
            "token": token,
            "tokenType": "Bearer",
            "expiresInHours": ACCESS_TTL_HOURS,
            "user": {"username": username, "role": "admin"},
        }

    @router.get("/me")
    async def me(admin=Depends(require_admin)):
        return {"username": admin["sub"], "role": admin.get("role", "admin")}

    api.include_router(router)
