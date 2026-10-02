"""
MSG91 WhatsApp OTP helper — routes through the WhatsApp Outbound Message API
(POST /api/v5/whatsapp/whatsapp-outbound-message/bulk/).

Unlike MSG91's SMS OTP hosted endpoint (/api/v5/otp), the WhatsApp outbound
API does NOT generate, store or verify OTPs — the caller is responsible for
all of that. The caller must pass a pre-generated OTP and this helper simply
delivers it via the approved WhatsApp template.

Template used (approved on MSG91):
  name       : whatsappotp   (AUTHENTICATION category)
  language   : en            (parameter_format: POSITIONAL)
  namespace  : 7fe9dc17_51c3_4e12_a20e_712b61d3b6a5
  variables  : body_1 (OTP text), button_1 (OTP text for copy-code button)

If MSG91_INTEGRATED_NUMBER or MSG91_AUTHKEY is missing, the helper falls back
to MOCK mode: it logs the OTP and returns `mock=True` so the API layer can
show the code on-screen for local development.
"""
import logging
import os
from typing import Optional

import httpx

log = logging.getLogger("hariram.msg91")

MSG91_WHATSAPP_URL = "https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/"


def _cfg(key: str, default: str = "") -> str:
    return (os.environ.get(key) or default).strip()


def is_configured() -> bool:
    """True when live WhatsApp delivery is possible."""
    return bool(_cfg("MSG91_AUTHKEY") and _cfg("MSG91_INTEGRATED_NUMBER") and _cfg("MSG91_TEMPLATE_NAME"))


def normalize_to_e164_digits(phone: str) -> str:
    """Return MSG91-friendly digits: 91 + 10-digit local part, no plus."""
    digits = "".join(ch for ch in (phone or "") if ch.isdigit())
    if len(digits) == 10:
        digits = "91" + digits
    elif digits.startswith("091") and len(digits) == 13:
        digits = "91" + digits[3:]
    elif digits.startswith("0") and len(digits) == 11:
        digits = "91" + digits[1:]
    return digits


def send_whatsapp_otp(phone: str, otp: str) -> dict:
    """Deliver `otp` to `phone` via the approved WhatsApp OTP template.

    Returns {mock, delivered, request_id, provider, [error]}. Never raises.
    """
    authkey = _cfg("MSG91_AUTHKEY")
    integrated = _cfg("MSG91_INTEGRATED_NUMBER")
    template_name = _cfg("MSG91_TEMPLATE_NAME", "whatsappotp")
    language = _cfg("MSG91_TEMPLATE_LANGUAGE", "en")
    namespace = _cfg("MSG91_TEMPLATE_NAMESPACE")
    to = normalize_to_e164_digits(phone)

    if not authkey or not integrated:
        # MOCK path (preview / local dev without INTEGRATED_NUMBER).
        log.info(f"[MOCK-WHATSAPP OTP -> +{to}] {otp}")
        return {"mock": True, "delivered": True, "provider": "MOCK", "request_id": None}

    template: dict = {
        "name": template_name,
        "language": {"code": language, "policy": "deterministic"},
        "to_and_components": [
            {
                "to": [to],
                "components": {
                    "body_1": {"type": "text", "value": otp},
                    "button_1": {"subtype": "url", "type": "text", "value": otp},
                },
            }
        ],
    }
    if namespace:
        template["namespace"] = namespace

    payload = {
        "integrated_number": integrated,
        "content_type": "template",
        "payload": {
            "messaging_product": "whatsapp",
            "type": "template",
            "template": template,
        },
    }
    headers = {"Content-Type": "application/json", "authkey": authkey}
    try:
        r = httpx.post(MSG91_WHATSAPP_URL, json=payload, headers=headers, timeout=15)
        try:
            data = r.json()
        except ValueError:
            data = {"raw": r.text}
        ok = 200 <= r.status_code < 300 and str(data.get("type", "")).lower() != "error"
        request_id = data.get("request_id") or data.get("requestId")
        log.info(f"[MSG91 whatsapp-outbound -> +{to}] status={r.status_code} ok={ok} body={data}")
        return {
            "mock": False,
            "delivered": bool(ok),
            "provider": "MSG91",
            "request_id": request_id,
            "raw": data,
        }
    except Exception as e:  # pragma: no cover
        log.exception("MSG91 whatsapp-outbound failed: %s", e)
        return {"mock": False, "delivered": False, "provider": "MSG91", "request_id": None, "error": str(e)}


def send_message(phone: str, message: str) -> dict:
    """Free-form outbound WhatsApp message (order confirmations). MSG91 requires
    an approved template for every outbound message — kept as MOCK until an
    outbound template beyond the OTP one is approved."""
    log.info(f"[MOCK-WHATSAPP -> +91-{phone}] {message}")
    return {"provider": "MOCK", "delivered": True, "mock": True}


# ---------------------------------------------------------------------------
# Order-notification template ("notifyorder") — sent to the business owners'
# phones when a new order lands. Approved template config (from MSG91):
#   name       : notifyorder   (UTILITY category)
#   language   : en            (parameter_format: NAMED)
#   namespace  : null
#   HEADER     : "New order{{var_1}}"   (var_1 -> order number)
#   BODY       : "New order received "  (no variables)
# Fixed recipients per spec:
NOTIFY_ORDER_RECIPIENTS = ["+91-9500049550", "+91-9632262000"]


def send_order_notification(order_number: str, recipients: list[str] | None = None) -> list[dict]:
    """Deliver the `notifyorder` WhatsApp template to each recipient.

    Returns a list of per-recipient delivery receipts; never raises so the
    caller can safely store the result on the order document.
    """
    recipients = recipients or NOTIFY_ORDER_RECIPIENTS
    authkey = _cfg("MSG91_AUTHKEY")
    integrated = _cfg("MSG91_INTEGRATED_NUMBER")
    template_name = _cfg("MSG91_NOTIFY_TEMPLATE_NAME", "notifyorder")
    language = _cfg("MSG91_NOTIFY_TEMPLATE_LANGUAGE", "en")

    receipts: list[dict] = []
    for phone in recipients:
        to = normalize_to_e164_digits(phone)
        if not authkey or not integrated:
            log.info(f"[MOCK-WHATSAPP notifyorder -> +{to}] order={order_number}")
            receipts.append({"to": to, "provider": "MOCK", "delivered": True, "mock": True})
            continue

        payload = {
            "integrated_number": integrated,
            "content_type": "template",
            "payload": {
                "messaging_product": "whatsapp",
                "type": "template",
                "template": {
                    "name": template_name,
                    "language": {"code": language, "policy": "deterministic"},
                    "to_and_components": [
                        {
                            "to": [to],
                            "components": {
                                # Header text slot — parameter var_1 → order number.
                                "header_1": {
                                    "type": "text",
                                    "value": f" {order_number}",
                                    "parameter_name": "var_1",
                                }
                            },
                        }
                    ],
                },
            },
        }
        headers = {"Content-Type": "application/json", "authkey": authkey}
        try:
            r = httpx.post(MSG91_WHATSAPP_URL, json=payload, headers=headers, timeout=15)
            try:
                data = r.json()
            except ValueError:
                data = {"raw": r.text}
            ok = 200 <= r.status_code < 300 and str(data.get("type", "")).lower() != "error"
            request_id = data.get("request_id") or data.get("requestId")
            log.info(f"[MSG91 notifyorder -> +{to}] status={r.status_code} ok={ok} body={data}")
            receipts.append({
                "to": to,
                "provider": "MSG91",
                "delivered": bool(ok),
                "request_id": request_id,
                "raw": data,
            })
        except Exception as e:  # pragma: no cover
            log.exception("MSG91 notifyorder failed for %s: %s", to, e)
            receipts.append({"to": to, "provider": "MSG91", "delivered": False, "error": str(e)})
    return receipts
