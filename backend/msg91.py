"""
MSG91 WhatsApp OTP helper.

Uses MSG91's hosted OTP service (v5/otp) — MSG91 handles OTP generation,
persistence and verification. To route delivery via WhatsApp, the referenced
`template_id` must be configured in the MSG91 dashboard against a WhatsApp
template.

If MSG91_TEMPLATE_ID (customer) or MSG91_ADMIN_TEMPLATE_ID (admin 2FA) is
blank, the corresponding call falls back to MOCK mode so local dev keeps
working. The MOCK provides a fixed OTP (123456 for customers, echoed OTP for
admin) so the flow can still be exercised end-to-end.
"""
import logging
import os
import random
from typing import Optional

import httpx

log = logging.getLogger("hariram.msg91")

MSG91_BASE = "https://control.msg91.com/api/v5"
MOCK_CUSTOMER_OTP = "123456"


def _authkey() -> str:
    return (os.environ.get("MSG91_AUTHKEY") or "").strip()


def _template_id(kind: str) -> str:
    env_key = "MSG91_ADMIN_TEMPLATE_ID" if kind == "admin" else "MSG91_TEMPLATE_ID"
    return (os.environ.get(env_key) or "").strip()


def _normalize_to_e164(phone: str) -> str:
    """Return 12-digit MSG91-style number: 91XXXXXXXXXX (no plus)."""
    digits = "".join(ch for ch in (phone or "") if ch.isdigit())
    if len(digits) == 10:
        digits = "91" + digits
    elif digits.startswith("091") and len(digits) == 13:
        digits = "91" + digits[3:]
    elif digits.startswith("0") and len(digits) == 11:
        digits = "91" + digits[1:]
    return digits


def is_configured(kind: str = "customer") -> bool:
    return bool(_authkey() and _template_id(kind))


def send_otp(
    phone: str,
    kind: str = "customer",
    length: int = 6,
    expiry_minutes: int = 5,
    otp: Optional[str] = None,
) -> dict:
    """Send an OTP via MSG91.

    Returns a dict describing the outcome:
      {mock: bool, provider: str, otp: Optional[str], request_id: str|None, delivered: bool}

    If `otp` is passed, it will be forwarded to MSG91 (they will use it instead
    of generating one). This is important for admin 2FA where we want to keep
    the OTP tied to our sessionId.
    """
    authkey = _authkey()
    tpl = _template_id(kind)
    to = _normalize_to_e164(phone)

    if not authkey or not tpl:
        # MOCK — mimic MSG91 behavior for local/dev.
        mock_otp = otp or (MOCK_CUSTOMER_OTP if kind == "customer" else f"{random.randint(0, 999999):06d}")
        log.info(f"[MOCK-WHATSAPP OTP -> +{to}] {mock_otp} (kind={kind})")
        return {
            "mock": True,
            "provider": "MOCK",
            "otp": mock_otp,
            "request_id": None,
            "delivered": True,
        }

    params = {
        "template_id": tpl,
        "mobile": to,
        "authkey": authkey,
        "otp_length": length,
        "otp_expiry": expiry_minutes,
    }
    if otp:
        params["otp"] = otp
    try:
        r = httpx.post(f"{MSG91_BASE}/otp", params=params, timeout=15)
        data = r.json() if r.headers.get("content-type", "").startswith("application/json") else {"raw": r.text}
        ok = str(data.get("type", "")).lower() == "success" or 200 <= r.status_code < 300
        log.info(f"[MSG91 send-otp -> +{to}] status={r.status_code} body={data}")
        return {
            "mock": False,
            "provider": "MSG91",
            "otp": otp,  # only echoed if caller supplied it
            "request_id": data.get("request_id"),
            "delivered": bool(ok),
            "raw": data,
        }
    except Exception as e:  # pragma: no cover
        log.exception("MSG91 send-otp failed: %s", e)
        return {"mock": False, "provider": "MSG91", "otp": otp, "request_id": None, "delivered": False, "error": str(e)}


def verify_otp(phone: str, otp: str, kind: str = "customer") -> dict:
    """Verify an OTP via MSG91.

    Returns {ok: bool, provider: str, raw: dict}. Callers should treat ok=True
    as verified. When not configured, callers must do their own verification.
    """
    authkey = _authkey()
    tpl = _template_id(kind)
    to = _normalize_to_e164(phone)

    if not authkey or not tpl:
        return {"ok": False, "provider": "MOCK", "raw": {"reason": "MSG91 not configured"}}

    try:
        r = httpx.get(
            f"{MSG91_BASE}/otp/verify",
            params={"authkey": authkey, "otp": otp, "mobile": to},
            timeout=15,
        )
        data = r.json() if r.headers.get("content-type", "").startswith("application/json") else {"raw": r.text}
        ok = str(data.get("type", "")).lower() == "success"
        log.info(f"[MSG91 verify-otp -> +{to}] status={r.status_code} ok={ok}")
        return {"ok": ok, "provider": "MSG91", "raw": data}
    except Exception as e:  # pragma: no cover
        log.exception("MSG91 verify-otp failed: %s", e)
        return {"ok": False, "provider": "MSG91", "raw": {"error": str(e)}}


def send_message(phone: str, message: str) -> dict:
    """Free-form WhatsApp message (order confirmations etc.) — MSG91 requires a
    template for outbound WhatsApp. Until an outbound template is configured,
    keep this as a MOCK so order flow is not blocked."""
    authkey = _authkey()
    integrated = (os.environ.get("MSG91_SENDER") or "").strip()
    if not authkey or not integrated:
        log.info(f"[MOCK-WHATSAPP -> +91-{phone}] {message}")
        return {"provider": "MOCK", "delivered": True, "mock": True}
    # Real outbound requires a template — deferred to go-live.
    log.info(f"[MSG91 outbound (not-wired) -> +91-{phone}] {message}")
    return {"provider": "MSG91", "delivered": False, "reason": "outbound template not wired"}
