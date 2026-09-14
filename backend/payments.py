"""
Razorpay payment gateway integration for the storefront checkout.

Flow (frontend calls in this order):
  1. POST /api/payments/razorpay/create-order  — amount in paise + receipt
       -> returns {orderId, keyId, amount, currency}
  2. Razorpay Checkout modal opens on the client using `keyId` + `orderId`.
  3. On success, client POSTs the signed response to
     /api/payments/razorpay/verify with {razorpay_order_id, razorpay_payment_id,
     razorpay_signature}. We verify signature server-side; only then may the
     client place the order (/api/orders) with paymentMethod set + trusted.

We deliberately keep our order-book untouched — the real Razorpay handle just
lives on the order via `paymentReference` set at /orders creation time.
"""
import hmac
import hashlib
import logging
import os
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

log = logging.getLogger("hariram.payments")

router = APIRouter(prefix="/payments/razorpay", tags=["payments"])


def _key_id() -> str:
    return (os.environ.get("RAZORPAY_KEY_ID") or "").strip()


def _key_secret() -> str:
    return (os.environ.get("RAZORPAY_KEY_SECRET") or "").strip()


def _client():
    import razorpay  # local import so app boots even if package missing
    return razorpay.Client(auth=(_key_id(), _key_secret()))


class CreateOrderIn(BaseModel):
    amount: float          # in INR (rupees) — we convert to paise
    receipt: Optional[str] = None
    notes: Optional[dict] = None


class VerifyIn(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


@router.get("/config")
async def config():
    """Public — lets the frontend know whether Razorpay is live-configured."""
    return {"enabled": bool(_key_id() and _key_secret()), "keyId": _key_id() or None}


@router.post("/create-order")
async def create_order(req: CreateOrderIn):
    if not _key_id() or not _key_secret():
        raise HTTPException(status_code=503, detail="Payment gateway is not configured")
    if req.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than zero")

    amount_paise = int(round(float(req.amount) * 100))
    # Razorpay receipt must be <=40 chars
    receipt = (req.receipt or "hariram-order")[:40]

    try:
        order = _client().order.create({
            "amount": amount_paise,
            "currency": "INR",
            "receipt": receipt,
            "payment_capture": 1,
            "notes": req.notes or {},
        })
    except Exception as e:
        log.exception("Razorpay create-order failed: %s", e)
        raise HTTPException(status_code=502, detail=f"Payment gateway error: {e}")

    return {
        "orderId": order["id"],
        "amount": order["amount"],
        "currency": order["currency"],
        "keyId": _key_id(),
        "receipt": order.get("receipt"),
    }


@router.post("/verify")
async def verify(req: VerifyIn):
    if not _key_secret():
        raise HTTPException(status_code=503, detail="Payment gateway is not configured")
    payload = f"{req.razorpay_order_id}|{req.razorpay_payment_id}".encode()
    expected = hmac.new(_key_secret().encode(), payload, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, req.razorpay_signature):
        log.warning(f"[razorpay] Signature mismatch for order {req.razorpay_order_id}")
        raise HTTPException(status_code=400, detail="Payment signature verification failed")
    return {
        "verified": True,
        "orderId": req.razorpay_order_id,
        "paymentId": req.razorpay_payment_id,
    }


def register(api):
    api.include_router(router)
