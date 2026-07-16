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


# --- Newsletter ---
def test_newsletter_valid(s):
    r = s.post(f"{API}/newsletter/subscribe",
               json={"email": f"test_{random.randint(1, 9999)}@example.com"})
    assert r.status_code == 200
    assert r.json()["success"] is True


def test_newsletter_invalid(s):
    r = s.post(f"{API}/newsletter/subscribe", json={"email": "not-an-email"})
    assert r.status_code == 400
