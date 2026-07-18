"""
Admin authentication — bcrypt + JWT bearer token.
Single-admin design (credentials from backend/.env).
"""
import os
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel

JWT_ALGORITHM = "HS256"
ACCESS_TTL_HOURS = 8
BRUTE_LOCK_MINUTES = 15
BRUTE_MAX_ATTEMPTS = 5

router = APIRouter(prefix="/admin/auth", tags=["admin-auth"])


class LoginRequest(BaseModel):
    username: str
    password: str


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
    """Attach admin auth routes + brute-force protection using db.admin_login_attempts."""

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
        client_ip = request.client.host if request.client else "unknown"
        identifier = f"{client_ip}:{req.username.lower()}"
        await _check_lock(identifier)

        env_user = os.environ.get("ADMIN_USER", "admin")
        env_hash = os.environ.get("ADMIN_PASSWORD_HASH", "")
        if req.username.lower() != env_user.lower() or not _verify_password(req.password, env_hash):
            await _record_fail(identifier)
            raise HTTPException(status_code=401, detail="Invalid username or password")

        await _clear_fails(identifier)
        token = _make_token(env_user)
        return {
            "token": token,
            "tokenType": "Bearer",
            "expiresInHours": ACCESS_TTL_HOURS,
            "user": {"username": env_user, "role": "admin"},
        }

    @router.get("/me")
    async def me(admin=Depends(require_admin)):
        return {"username": admin["sub"], "role": admin.get("role", "admin")}

    api.include_router(router)
