"""
Hariram's Pure Cow Ghee — Backend API
FastAPI + MongoDB. Phase 1 (Guest checkout, mocked OTP, mocked payment).
All business content is config-driven from /app/backend/config/*.json
"""
from fastapi import FastAPI, APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import json
import logging
import random
import re
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Any
import uuid
from datetime import datetime, timezone
from notifications import send_order_confirmation

ROOT_DIR = Path(__file__).parent
CONFIG_DIR = ROOT_DIR / "config"
load_dotenv(ROOT_DIR / ".env")

# MongoDB
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

app = FastAPI(title="Hariram's Ghee API", version="1.0.0")
api = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
log = logging.getLogger("hariram")


# ---------------------------------------------------------------------------
# Config loader
# ---------------------------------------------------------------------------
def load_config(name: str) -> Any:
    """Load a JSON config file from /app/backend/config/{name}.json"""
    path = CONFIG_DIR / f"{name}.json"
    if not path.exists():
        raise HTTPException(status_code=404, detail=f"Config '{name}' not found")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


ALLOWED_CONFIGS = {
    "company", "theme", "site_config", "navigation", "hero_banners",
    "products", "benefits", "footer", "social_links", "seo",
    "shipping_rates", "faq", "legal", "features", "testimonials",
    "asset_manifest",
}


@api.get("/legal/manifest")
async def legal_manifest():
    with open(CONFIG_DIR / "legal" / "legal_manifest.json", "r", encoding="utf-8") as f:
        return json.load(f)


@api.get("/legal/{doc_id}")
async def legal_document(doc_id: str):
    """Return a legal document's parsed JSON + raw markdown body."""
    safe = re.sub(r"[^a-z0-9_]", "", doc_id.lower())
    json_path = CONFIG_DIR / "legal" / f"{safe}.json"
    md_path = CONFIG_DIR / "legal" / f"{safe}.md"
    if not json_path.exists() and not md_path.exists():
        raise HTTPException(status_code=404, detail="Legal document not found")
    payload: dict = {}
    if json_path.exists():
        with open(json_path, "r", encoding="utf-8") as f:
            payload = json.load(f)
    # Inject manifest metadata for this doc
    manifest_path = CONFIG_DIR / "legal" / "legal_manifest.json"
    if manifest_path.exists():
        with open(manifest_path, "r", encoding="utf-8") as f:
            manifest = json.load(f)
        for doc in manifest.get("documents", []):
            if doc.get("id") == safe:
                payload.setdefault("title", doc.get("title"))
                payload.setdefault("version", doc.get("version"))
                payload.setdefault("effectiveDate", doc.get("effectiveDate"))
                payload.setdefault("lastUpdated", doc.get("lastUpdated"))
                break
    if md_path.exists():
        with open(md_path, "r", encoding="utf-8") as f:
            payload["markdown"] = f.read()
    return payload


@api.get("/config/{name}")
async def get_config(name: str):
    if name not in ALLOWED_CONFIGS:
        raise HTTPException(status_code=404, detail="Unknown config")
    return load_config(name)


@api.get("/config")
async def get_all_configs():
    """Convenience: return all configs at once for the initial app boot."""
    return {name: load_config(name) for name in ALLOWED_CONFIGS}


# ---------------------------------------------------------------------------
# Products (config-driven; DB used only for orders/customers)
# ---------------------------------------------------------------------------
@api.get("/products")
async def list_products(available_only: bool = True):
    data = load_config("products").get("products", [])
    if available_only:
        data = [p for p in data if p.get("available", True)]
    data.sort(key=lambda p: p.get("displaySequence", 999))
    return {"products": data}


@api.get("/products/{sku}")
async def get_product(sku: str):
    for p in load_config("products").get("products", []):
        if p.get("sku") == sku:
            return p
    raise HTTPException(status_code=404, detail="Product not found")


# ---------------------------------------------------------------------------
# Shipping calculation
# ---------------------------------------------------------------------------
class ShippingRequest(BaseModel):
    pincode: str
    city: Optional[str] = None
    state: Optional[str] = None
    subtotal: float = 0


@api.post("/shipping/calculate")
async def calculate_shipping(req: ShippingRequest):
    rates = load_config("shipping_rates")
    pincode = (req.pincode or "").strip()

    if not re.fullmatch(r"\d{6}", pincode):
        raise HTTPException(status_code=400, detail="Invalid PIN code. Must be 6 digits.")

    if pincode in rates.get("unserviceablePincodes", []):
        raise HTTPException(status_code=422, detail="Sorry — we do not ship to this PIN code yet.")

    # Free shipping threshold
    free_above = rates.get("freeShippingAbove")
    if free_above and req.subtotal >= float(free_above):
        return {"charge": 0, "rule": "FREE_SHIPPING", "freeShippingAbove": free_above}

    # Find most specific rule
    rules = sorted(rates.get("rules", []), key=lambda r: r.get("priority", 999))
    for rule in rules:
        rtype = rule.get("type")
        rval = str(rule.get("value", "")).lower().strip()
        if rtype == "CITY" and req.city and req.city.lower().strip() == rval:
            return {"charge": float(rule["charge"]), "rule": f"CITY:{rule['value']}"}
        if rtype == "STATE" and req.state and req.state.lower().strip() == rval:
            return {"charge": float(rule["charge"]), "rule": f"STATE:{rule['value']}"}
        if rtype == "PINCODE" and pincode == str(rule.get("value")):
            return {"charge": float(rule["charge"]), "rule": f"PINCODE:{rule['value']}"}

    return {"charge": float(rates.get("defaultCharge", 0)), "rule": "DEFAULT"}


# ---------------------------------------------------------------------------
# OTP (mocked — fixed 123456 for Phase 1)
# ---------------------------------------------------------------------------
class OtpSendRequest(BaseModel):
    phone: str


class OtpVerifyRequest(BaseModel):
    phone: str
    otp: str


MOCK_OTP = "123456"


def _norm_phone(phone: str) -> str:
    p = re.sub(r"\D", "", phone or "")
    if len(p) == 12 and p.startswith("91"):
        p = p[2:]
    return p


@api.post("/auth/send-otp")
async def send_otp(req: OtpSendRequest):
    phone = _norm_phone(req.phone)
    if len(phone) != 10:
        raise HTTPException(status_code=400, detail="Enter a valid 10-digit Indian mobile number")

    doc = {
        "phone": phone,
        "otp": MOCK_OTP,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "attempts": 0,
        "verified": False,
    }
    await db.otp_requests.update_one({"phone": phone}, {"$set": doc}, upsert=True)
    log.info(f"[MOCK OTP] Sent OTP {MOCK_OTP} to +91-{phone}")
    return {
        "success": True,
        "message": f"OTP sent to +91-{phone}",
        "mock": True,
        "hint": f"Use {MOCK_OTP} to verify (mock mode — replace with real SMS provider before go-live).",
    }


@api.post("/auth/verify-otp")
async def verify_otp(req: OtpVerifyRequest):
    phone = _norm_phone(req.phone)
    rec = await db.otp_requests.find_one({"phone": phone}, {"_id": 0})
    if not rec:
        raise HTTPException(status_code=404, detail="Please request an OTP first")

    await db.otp_requests.update_one({"phone": phone}, {"$inc": {"attempts": 1}})
    if rec.get("attempts", 0) >= 5:
        raise HTTPException(status_code=429, detail="Too many attempts. Please request a new OTP.")

    if (req.otp or "").strip() != rec["otp"]:
        raise HTTPException(status_code=401, detail="Invalid OTP. Please try again.")

    await db.otp_requests.update_one({"phone": phone}, {"$set": {"verified": True}})
    return {"success": True, "phone": phone, "verified": True}


# ---------------------------------------------------------------------------
# Customer helper — repeat customer address lookup
# ---------------------------------------------------------------------------
@api.get("/customers/last-address")
async def get_last_address(phone: str = Query(...)):
    p = _norm_phone(phone)
    order = await db.orders.find_one(
        {"phone": p}, {"_id": 0}, sort=[("created_at", -1)]
    )
    if not order:
        return {"found": False}
    return {
        "found": True,
        "name": order.get("name"),
        "address": order.get("address"),
    }


@api.get("/customers/{phone}/profile")
async def get_customer_profile(phone: str):
    """Return the customer's most-recent snapshot (name + address + counts).
    Available only after phone was OTP-verified."""
    p = _norm_phone(phone)
    otp_rec = await db.otp_requests.find_one({"phone": p}, {"_id": 0})
    if not otp_rec or not otp_rec.get("verified"):
        raise HTTPException(status_code=401, detail="Phone not verified. Please log in.")

    latest = await db.orders.find_one({"phone": p}, {"_id": 0}, sort=[("created_at", -1)])
    total_orders = await db.orders.count_documents({"phone": p})
    total_spent_cur = db.orders.aggregate([
        {"$match": {"phone": p}},
        {"$group": {"_id": None, "sum": {"$sum": "$total"}}},
    ])
    total_spent = 0
    async for row in total_spent_cur:
        total_spent = row.get("sum", 0)

    return {
        "phone": p,
        "name": latest.get("name") if latest else None,
        "address": latest.get("address") if latest else None,
        "email": latest.get("email") if latest else None,
        "totalOrders": total_orders,
        "totalSpent": total_spent,
        "lastOrderNumber": latest.get("orderNumber") if latest else None,
    }


@api.get("/customers/{phone}/orders")
async def get_customer_orders(phone: str, limit: int = 50):
    """Order history for a phone — requires prior OTP verification."""
    p = _norm_phone(phone)
    otp_rec = await db.otp_requests.find_one({"phone": p}, {"_id": 0})
    if not otp_rec or not otp_rec.get("verified"):
        raise HTTPException(status_code=401, detail="Phone not verified. Please log in.")

    cursor = db.orders.find({"phone": p}, {"_id": 0}).sort("created_at", -1).limit(int(limit))
    orders = [o async for o in cursor]
    return {"phone": p, "count": len(orders), "orders": orders}


# ---------------------------------------------------------------------------
# Orders
# ---------------------------------------------------------------------------
class Address(BaseModel):
    name: str
    line1: str
    line2: Optional[str] = ""
    landmark: Optional[str] = ""
    city: str
    state: str
    pincode: str


class OrderItem(BaseModel):
    sku: str
    name: str
    variant: str
    price: float
    quantity: int
    image: Optional[str] = None


class CreateOrderRequest(BaseModel):
    phone: str
    address: Address
    items: List[OrderItem]
    subtotal: float
    shipping: float
    total: float
    paymentMethod: str = "MOCK"  # UPI / CARD / NETBANKING / MOCK


class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    orderNumber: str
    phone: str
    name: str
    address: Address
    items: List[OrderItem]
    subtotal: float
    shipping: float
    total: float
    paymentMethod: str
    paymentStatus: str  # PAID / FAILED / PENDING
    status: str         # CONFIRMED / CANCELLED
    created_at: str


def _order_number() -> str:
    ts = datetime.now(timezone.utc).strftime("%y%m%d")
    rand = random.randint(1000, 9999)
    return f"HR{ts}{rand}"


@api.post("/orders")
async def create_order(req: CreateOrderRequest):
    phone = _norm_phone(req.phone)

    # Verify phone was OTP-verified in this session
    otp_rec = await db.otp_requests.find_one({"phone": phone}, {"_id": 0})
    if not otp_rec or not otp_rec.get("verified"):
        raise HTTPException(status_code=401, detail="Phone number not verified. Please verify OTP first.")

    if not req.items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    # Mock payment — always success in Phase 1
    payment_status = "PAID"

    order = Order(
        orderNumber=_order_number(),
        phone=phone,
        name=req.address.name,
        address=req.address,
        items=req.items,
        subtotal=req.subtotal,
        shipping=req.shipping,
        total=req.total,
        paymentMethod=req.paymentMethod,
        paymentStatus=payment_status,
        status="CONFIRMED",
        created_at=datetime.now(timezone.utc).isoformat(),
    )
    doc = json.loads(order.model_dump_json())

    # Send order-confirmation via SMS + WhatsApp (mocked in Phase 1 — logs only)
    receipts = send_order_confirmation(doc)
    doc["notificationReceipts"] = receipts

    await db.orders.insert_one(dict(doc))  # insert copy so `doc` isn't mutated with _id

    log.info(f"[ORDER CREATED] {order.orderNumber} — ₹{order.total} — {phone}")
    return {"success": True, "order": doc}


@api.get("/orders/{order_id}")
async def get_order(order_id: str):
    o = await db.orders.find_one(
        {"$or": [{"id": order_id}, {"orderNumber": order_id}]},
        {"_id": 0},
    )
    if not o:
        raise HTTPException(status_code=404, detail="Order not found")
    return o


# ---------------------------------------------------------------------------
# Newsletter (simple capture)
# ---------------------------------------------------------------------------
class Newsletter(BaseModel):
    email: str


@api.post("/newsletter/subscribe")
async def subscribe(req: Newsletter):
    if not re.match(r"[^@]+@[^@]+\.[^@]+", req.email or ""):
        raise HTTPException(status_code=400, detail="Please enter a valid email")
    await db.newsletter.update_one(
        {"email": req.email.lower()},
        {"$set": {"email": req.email.lower(), "created_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True,
    )
    return {"success": True}


# ---------------------------------------------------------------------------
@api.get("/")
async def root():
    return {"status": "ok", "brand": "Hariram's Pure Cow Ghee", "version": "1.0.0"}


# Admin routes (auth, product catalog, shipping rates, order book, universal config editor) —
# must be registered on `api` BEFORE app.include_router(api) so they get mounted.
from admin_auth import register as _reg_admin_auth
from admin_products import register as _reg_admin_products
from admin_shipping import register as _reg_admin_shipping
from admin_orders import register as _reg_admin_orders
from admin_config import register as _reg_admin_config

_reg_admin_auth(api, db)
_reg_admin_products(api)
_reg_admin_shipping(api)
_reg_admin_orders(api, db)
_reg_admin_config(api)

app.include_router(api)

# Serve uploaded product images (and any future admin uploads)
UPLOAD_ROOT = ROOT_DIR / "uploads"
UPLOAD_ROOT.mkdir(exist_ok=True)
(UPLOAD_ROOT / "products").mkdir(exist_ok=True)
app.mount("/api/uploads", StaticFiles(directory=str(UPLOAD_ROOT)), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
