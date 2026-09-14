"""
Notification service — sends order confirmation over SMS + WhatsApp.

Real WhatsApp delivery is routed via `msg91.py` when the outbound sender is
configured. Everything else falls back to MOCK logs (Phase 1 behaviour).
"""
import logging
import os

from msg91 import send_message as msg91_whatsapp

log = logging.getLogger("hariram.notifications")

PROVIDER_SMS = os.environ.get("SMS_PROVIDER", "MOCK")          # MOCK | TWILIO | MSG91
PROVIDER_WHATSAPP = os.environ.get("WHATSAPP_PROVIDER", "MOCK")  # MOCK | TWILIO


def _format_items(items) -> str:
    return ", ".join(
        f"{i.get('name', 'Item')} {i.get('variant', '')} x {i.get('quantity', 1)}"
        for i in items
    )


def _order_message(order: dict) -> str:
    items_line = _format_items(order.get("items", []))
    total = order.get("total", 0)
    return (
        f"Hi {order.get('name', 'Customer')}, thank you for shopping with Hariram's! "
        f"Your order {order['orderNumber']} ({items_line}) for Rs.{int(total)} is confirmed "
        f"and will be delivered soon. — Hariram's Pure Cow Ghee"
    )


def _send_sms(phone: str, message: str) -> dict:
    if PROVIDER_SMS == "MOCK":
        log.info(f"[MOCK-SMS -> +91-{phone}] {message}")
        return {"provider": "MOCK", "delivered": True, "mock": True}
    # TODO: Add real Twilio / MSG91 client call here at go-live
    log.warning(f"[SMS provider {PROVIDER_SMS}] not implemented — falling back to MOCK")
    return {"provider": PROVIDER_SMS, "delivered": False, "reason": "provider not wired"}


def _send_whatsapp(phone: str, message: str) -> dict:
    """Delegate WhatsApp delivery to MSG91 helper; it falls back to MOCK
    logs when MSG91 outbound isn't configured."""
    try:
        return msg91_whatsapp(phone, message)
    except Exception as e:
        log.warning(f"WhatsApp send failed via MSG91: {e}")
        return {"provider": "MOCK", "delivered": False, "error": str(e)}


def send_order_confirmation(order: dict) -> dict:
    """
    Send order-confirmation via SMS + WhatsApp. Never raises — logs failures.
    Returns a receipt object that gets stored on the order for audit.
    """
    phone = order.get("phone", "")
    message = _order_message(order)
    receipts = {"sms": None, "whatsapp": None}
    try:
        receipts["sms"] = _send_sms(phone, message)
    except Exception as e:
        log.exception("SMS send failed: %s", e)
        receipts["sms"] = {"delivered": False, "error": str(e)}
    try:
        receipts["whatsapp"] = _send_whatsapp(phone, message)
    except Exception as e:
        log.exception("WhatsApp send failed: %s", e)
        receipts["whatsapp"] = {"delivered": False, "error": str(e)}
    return receipts
