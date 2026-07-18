"""Backend API tests for Hariram's Pure Cow Ghee — Phase 1."""
import os
import random
import re
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    # fallback: read frontend/.env
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def s():
    return requests.Session()


# --- Config endpoints ---
CONFIG_NAMES = [
    "company", "theme", "site_config", "navigation", "hero_banners",
    "products", "benefits", "footer", "social_links", "seo",
    "shipping_rates", "faq", "features",
]


@pytest.mark.parametrize("name", CONFIG_NAMES)
def test_get_config_by_name(s, name):
    r = s.get(f"{API}/config/{name}")
    assert r.status_code == 200, f"{name}: {r.status_code} {r.text[:200]}"
    data = r.json()
    assert data is not None


def test_get_config_bundle(s):
    r = s.get(f"{API}/config")
    assert r.status_code == 200
    data = r.json()
    for n in CONFIG_NAMES:
        assert n in data, f"missing {n} in bundle"


def test_get_config_unknown(s):
    r = s.get(f"{API}/config/unknown_thing")
    assert r.status_code == 404


# --- Products ---
def test_list_products(s):
    r = s.get(f"{API}/products")
    assert r.status_code == 200
    products = r.json()["products"]
    assert len(products) == 4
    # sorted by displaySequence
    seqs = [p.get("displaySequence") for p in products]
    assert seqs == sorted(seqs)
    for p in products:
        for f in ["sku", "name", "variant", "price", "image", "idealFor", "bestSeller"]:
            assert f in p, f"missing field {f} in product {p.get('sku')}"


def test_get_product_hg500(s):
    r = s.get(f"{API}/products/HG500")
    assert r.status_code == 200
    p = r.json()
    assert p["sku"] == "HG500"
    assert p["bestSeller"] is True
    assert "500" in p["variant"]


def test_get_product_unknown(s):
    r = s.get(f"{API}/products/UNKNOWN")
    assert r.status_code == 404


# --- Shipping ---
def test_shipping_chennai(s):
    r = s.post(f"{API}/shipping/calculate",
               json={"pincode": "600001", "city": "Chennai", "state": "Tamil Nadu", "subtotal": 399})
    assert r.status_code == 200
    d = r.json()
    assert d["charge"] == 40
    assert d["rule"] == "CITY:Chennai"


def test_shipping_tn(s):
    r = s.post(f"{API}/shipping/calculate",
               json={"pincode": "620001", "city": "Trichy", "state": "Tamil Nadu", "subtotal": 399})
    assert r.status_code == 200
    d = r.json()
    assert d["charge"] == 80
    assert d["rule"] == "STATE:Tamil Nadu"


def test_shipping_default(s):
    r = s.post(f"{API}/shipping/calculate",
               json={"pincode": "110001", "city": "Delhi", "state": "Delhi", "subtotal": 399})
    assert r.status_code == 200
    d = r.json()
    assert d["charge"] == 149
    assert d["rule"] == "DEFAULT"


def test_shipping_free(s):
    r = s.post(f"{API}/shipping/calculate",
               json={"pincode": "110001", "city": "Delhi", "state": "Delhi", "subtotal": 1200})
    assert r.status_code == 200
    d = r.json()
    assert d["charge"] == 0
    assert d["rule"] == "FREE_SHIPPING"


def test_shipping_invalid_pincode(s):
    r = s.post(f"{API}/shipping/calculate",
               json={"pincode": "12345", "city": "X", "state": "Y", "subtotal": 100})
    assert r.status_code == 400


# --- OTP ---
def _rand_phone():
    return "9" + "".join(str(random.randint(0, 9)) for _ in range(9))


def test_send_otp_valid(s):
    phone = _rand_phone()
    r = s.post(f"{API}/auth/send-otp", json={"phone": phone})
    assert r.status_code == 200
    d = r.json()
    assert d["success"] is True
    assert "123456" in d.get("hint", "")


def test_send_otp_invalid(s):
    r = s.post(f"{API}/auth/send-otp", json={"phone": "12345"})
    assert r.status_code == 400


def test_verify_otp_correct(s):
    phone = _rand_phone()
    s.post(f"{API}/auth/send-otp", json={"phone": phone})
    r = s.post(f"{API}/auth/verify-otp", json={"phone": phone, "otp": "123456"})
    assert r.status_code == 200
    d = r.json()
    assert d["verified"] is True


def test_verify_otp_wrong(s):
    phone = _rand_phone()
    s.post(f"{API}/auth/send-otp", json={"phone": phone})
    r = s.post(f"{API}/auth/verify-otp", json={"phone": phone, "otp": "000000"})
    assert r.status_code == 401


def test_verify_otp_rate_limit(s):
    phone = _rand_phone()
    s.post(f"{API}/auth/send-otp", json={"phone": phone})
    last = None
    for i in range(7):
        last = s.post(f"{API}/auth/verify-otp", json={"phone": phone, "otp": "000000"})
    # After many failed attempts, should return 429
    assert last.status_code == 429, f"got {last.status_code}: {last.text}"


# --- Customers last-address & Order flow ---
def test_last_address_and_order_flow(s):
    phone = _rand_phone()
    # No order yet
    r = s.get(f"{API}/customers/last-address", params={"phone": phone})
    assert r.status_code == 200
    assert r.json()["found"] is False

    # order without OTP verification -> 401
    order_payload = {
        "phone": phone,
        "address": {
            "name": "Test User", "line1": "1 Main St", "line2": "", "landmark": "",
            "city": "Chennai", "state": "Tamil Nadu", "pincode": "600001",
        },
        "items": [{"sku": "HG500", "name": "Pure Cow Ghee", "variant": "500 ml",
                    "price": 399, "quantity": 1, "image": "/x.png"}],
        "subtotal": 399, "shipping": 40, "total": 439, "paymentMethod": "UPI",
    }
    r = s.post(f"{API}/orders", json=order_payload)
    assert r.status_code == 401

    # send + verify OTP
    s.post(f"{API}/auth/send-otp", json={"phone": phone})
    r = s.post(f"{API}/auth/verify-otp", json={"phone": phone, "otp": "123456"})
    assert r.status_code == 200

    # create order
    r = s.post(f"{API}/orders", json=order_payload)
    assert r.status_code == 200, r.text
    order = r.json()["order"]
    assert order["orderNumber"].startswith("HR")
    assert order["paymentStatus"] == "PAID"
    assert order["status"] == "CONFIRMED"

    # get by orderNumber
    r = s.get(f"{API}/orders/{order['orderNumber']}")
    assert r.status_code == 200
    assert r.json()["orderNumber"] == order["orderNumber"]

    # get by uuid id
    r = s.get(f"{API}/orders/{order['id']}")
    assert r.status_code == 200

    # unknown
    r = s.get(f"{API}/orders/HR00000000")
    assert r.status_code == 404

    # last address now returns found=True
    r = s.get(f"{API}/customers/last-address", params={"phone": phone})
    d = r.json()
    assert d["found"] is True
    assert d["address"]["pincode"] == "600001"


# --- Notification receipts on order creation ---
def test_order_response_has_notification_receipts(s):
    phone = _rand_phone()
    s.post(f"{API}/auth/send-otp", json={"phone": phone})
    s.post(f"{API}/auth/verify-otp", json={"phone": phone, "otp": "123456"})
    payload = {
        "phone": phone,
        "address": {"name": "Notify Test", "line1": "1 Test Rd", "line2": "", "landmark": "",
                    "city": "Chennai", "state": "Tamil Nadu", "pincode": "600001"},
        "items": [{"sku": "HG500", "name": "Pure Cow Ghee", "variant": "500 ml",
                   "price": 399, "quantity": 1, "image": "/x.png"}],
        "subtotal": 399, "shipping": 40, "total": 439, "paymentMethod": "UPI",
    }
    r = s.post(f"{API}/orders", json=payload)
    assert r.status_code == 200, r.text
    order = r.json()["order"]
    receipts = order.get("notificationReceipts")
    assert receipts is not None, "notificationReceipts missing on order response"
    assert receipts["sms"]["mock"] is True
    assert receipts["sms"]["delivered"] is True
    assert receipts["whatsapp"]["mock"] is True
    assert receipts["whatsapp"]["delivered"] is True


# --- Customer profile & order history endpoints ---
def _seed_verified_order(s, phone=None):
    phone = phone or _rand_phone()
    s.post(f"{API}/auth/send-otp", json={"phone": phone})
    s.post(f"{API}/auth/verify-otp", json={"phone": phone, "otp": "123456"})
    payload = {
        "phone": phone,
        "address": {"name": "TEST User", "line1": "5 Marina Rd", "line2": "Apt 3", "landmark": "Beach",
                    "city": "Chennai", "state": "Tamil Nadu", "pincode": "600001"},
        "items": [{"sku": "HG500", "name": "Pure Cow Ghee", "variant": "500 ml",
                   "price": 399, "quantity": 2, "image": "/x.png"}],
        "subtotal": 798, "shipping": 40, "total": 838, "paymentMethod": "UPI",
    }
    r = s.post(f"{API}/orders", json=payload)
    assert r.status_code == 200, r.text
    return phone, r.json()["order"]


def test_customer_profile_unverified_returns_401(s):
    phone = _rand_phone()
    r = s.get(f"{API}/customers/{phone}/profile")
    assert r.status_code == 401


def test_customer_profile_verified_returns_200(s):
    phone, order = _seed_verified_order(s)
    r = s.get(f"{API}/customers/{phone}/profile")
    assert r.status_code == 200
    d = r.json()
    assert d["phone"] == phone
    assert d["name"] == "TEST User"
    assert d["address"]["pincode"] == "600001"
    assert d["totalOrders"] >= 1
    assert d["totalSpent"] >= 838
    assert d["lastOrderNumber"] == order["orderNumber"]


def test_customer_orders_unverified_returns_401(s):
    phone = _rand_phone()
    r = s.get(f"{API}/customers/{phone}/orders")
    assert r.status_code == 401


def test_customer_orders_verified_returns_list_desc(s):
    phone, order1 = _seed_verified_order(s)
    # place a second order for same phone
    payload = {
        "phone": phone,
        "address": {"name": "TEST User", "line1": "5 Marina Rd", "line2": "", "landmark": "",
                    "city": "Chennai", "state": "Tamil Nadu", "pincode": "600001"},
        "items": [{"sku": "HG200", "name": "Pure Cow Ghee", "variant": "200 ml",
                   "price": 199, "quantity": 1, "image": "/y.png"}],
        "subtotal": 199, "shipping": 40, "total": 239, "paymentMethod": "COD",
    }
    r2 = s.post(f"{API}/orders", json=payload)
    assert r2.status_code == 200
    order2 = r2.json()["order"]

    r = s.get(f"{API}/customers/{phone}/orders")
    assert r.status_code == 200
    d = r.json()
    assert d["phone"] == phone
    assert d["count"] >= 2
    nums = [o["orderNumber"] for o in d["orders"]]
    # newest first
    assert nums[0] == order2["orderNumber"]
    assert order1["orderNumber"] in nums


# --- Newsletter ---
def test_newsletter_valid(s):
    r = s.post(f"{API}/newsletter/subscribe",
               json={"email": f"test_{random.randint(1, 9999)}@example.com"})
    assert r.status_code == 200
    assert r.json()["success"] is True


def test_newsletter_invalid(s):
    r = s.post(f"{API}/newsletter/subscribe", json={"email": "not-an-email"})
    assert r.status_code == 400
