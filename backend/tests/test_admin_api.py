"""
Phase 3 Admin API — pytest suite.
Covers: auth, products CRUD, image upload, shipping rates CRUD,
pending orders (sort), mark-shipped, print-address PDF, print-pending PDF,
send-invoice + dispatch log, invoice.pdf, completed list + XLSX + PDF exports.

Also seeds a couple of confirmed orders via the public storefront flow so pending
tests have data.
"""
import io
import json
import os
import time
from pathlib import Path

import pytest
import requests
from pymongo import MongoClient

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/") if os.environ.get("REACT_APP_BACKEND_URL") else None
if not BASE_URL:
    # Fallback: read frontend/.env
    for line in Path("/app/frontend/.env").read_text().splitlines():
        if line.startswith("REACT_APP_BACKEND_URL="):
            BASE_URL = line.split("=", 1)[1].strip().rstrip("/")

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "test_database")

ADMIN_USER = "admin"
ADMIN_PASS = "Harirams0507"

BACKEND_DIR = Path("/app/backend")
PRODUCTS_JSON = BACKEND_DIR / "config" / "products.json"
SHIPPING_JSON = BACKEND_DIR / "config" / "shipping_rates.json"


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------
@pytest.fixture(scope="session", autouse=True)
def _reset_bruteforce():
    """Clear login attempts before/after test session so lockout tests are deterministic."""
    m = MongoClient(MONGO_URL)
    m[DB_NAME].admin_login_attempts.delete_many({})
    yield
    m[DB_NAME].admin_login_attempts.delete_many({})
    m.close()


@pytest.fixture(scope="session")
def admin_token():
    r = requests.post(f"{BASE_URL}/api/admin/auth/login",
                      json={"username": ADMIN_USER, "password": ADMIN_PASS})
    assert r.status_code == 200, f"admin login failed: {r.status_code} {r.text}"
    data = r.json()
    assert "token" in data and data["user"]["role"] == "admin"
    return data["token"]


@pytest.fixture
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture(scope="session")
def seeded_orders():
    """Create 2 CONFIRMED orders through public API so pending list has data."""
    numbers = []
    for phone, city, name in [("9812340001", "Chennai", "Admin TestBuyer A"),
                              ("9812340002", "Bengaluru", "Admin TestBuyer B")]:
        requests.post(f"{BASE_URL}/api/auth/send-otp", json={"phone": phone})
        r = requests.post(f"{BASE_URL}/api/auth/verify-otp", json={"phone": phone, "otp": "123456"})
        assert r.status_code == 200
        payload = {
            "phone": phone,
            "address": {"name": name, "line1": "10 Test Rd", "city": city,
                        "state": "TN" if city == "Chennai" else "KA", "pincode": "600001" if city == "Chennai" else "560001"},
            "items": [{"sku": "HG500", "name": "Pure Cow Ghee", "variant": "500ml",
                       "price": 750, "quantity": 2}],
            "subtotal": 1500, "shipping": 40, "total": 1540, "paymentMethod": "UPI",
        }
        r = requests.post(f"{BASE_URL}/api/orders", json=payload)
        assert r.status_code == 200, r.text
        numbers.append(r.json()["order"]["orderNumber"])
    return numbers


# ---------------------------------------------------------------------------
# AUTH
# ---------------------------------------------------------------------------
class TestAdminAuth:
    def test_login_success(self):
        r = requests.post(f"{BASE_URL}/api/admin/auth/login",
                          json={"username": ADMIN_USER, "password": ADMIN_PASS})
        assert r.status_code == 200
        d = r.json()
        assert d["tokenType"] == "Bearer"
        assert d["user"] == {"username": "admin", "role": "admin"}
        assert isinstance(d["token"], str) and len(d["token"]) > 20

    def test_login_wrong_password(self):
        r = requests.post(f"{BASE_URL}/api/admin/auth/login",
                          json={"username": ADMIN_USER, "password": "wrong-pw-xyz"})
        assert r.status_code == 401
        assert "Invalid username or password" in r.json().get("detail", "")

    def test_me_requires_token(self):
        r = requests.get(f"{BASE_URL}/api/admin/auth/me")
        assert r.status_code == 401

    def test_me_with_token(self, admin_headers):
        r = requests.get(f"{BASE_URL}/api/admin/auth/me", headers=admin_headers)
        assert r.status_code == 200
        assert r.json() == {"username": "admin", "role": "admin"}

    def test_bruteforce_lockout(self):
        """5 fails should lock the identifier (429)."""
        m = MongoClient(MONGO_URL)
        m[DB_NAME].admin_login_attempts.delete_many({})
        m.close()
        # Use a unique-ish username to avoid affecting other tests
        for _ in range(5):
            requests.post(f"{BASE_URL}/api/admin/auth/login",
                          json={"username": "admin", "password": "bad"})
        r = requests.post(f"{BASE_URL}/api/admin/auth/login",
                          json={"username": "admin", "password": "bad"})
        assert r.status_code == 429, f"expected 429, got {r.status_code}: {r.text}"
        # cleanup so subsequent tests can login
        m = MongoClient(MONGO_URL)
        m[DB_NAME].admin_login_attempts.delete_many({})
        m.close()

    def test_admin_endpoints_require_auth(self):
        for path in ["/api/admin/products", "/api/admin/shipping-rates",
                     "/api/admin/orders/pending", "/api/admin/orders/completed"]:
            r = requests.get(f"{BASE_URL}{path}")
            assert r.status_code == 401, f"{path} did not require auth (got {r.status_code})"


# ---------------------------------------------------------------------------
# PRODUCTS
# ---------------------------------------------------------------------------
class TestAdminProducts:
    def test_list_products(self, admin_headers):
        r = requests.get(f"{BASE_URL}/api/admin/products", headers=admin_headers)
        assert r.status_code == 200
        d = r.json()
        assert "products" in d
        assert len(d["products"]) >= 4

    def test_create_update_delete_and_persistence(self, admin_headers):
        sku = "TESTSKU_ADMIN_01"
        # Cleanup any leftover
        requests.delete(f"{BASE_URL}/api/admin/products/{sku}", headers=admin_headers)

        body = {"sku": sku, "name": "TEST Ghee Small", "variant": "100ml",
                "price": 199.0, "mrp": 249.0, "description": "test",
                "displaySequence": 500, "available": True, "family": "ghee"}
        r = requests.post(f"{BASE_URL}/api/admin/products", json=body, headers=admin_headers)
        assert r.status_code == 200, r.text
        # File should be mutated
        assert sku in PRODUCTS_JSON.read_text()

        # Duplicate → 409
        r = requests.post(f"{BASE_URL}/api/admin/products", json=body, headers=admin_headers)
        assert r.status_code == 409

        # Update
        body["price"] = 219.0
        r = requests.put(f"{BASE_URL}/api/admin/products/{sku}", json=body, headers=admin_headers)
        assert r.status_code == 200
        assert r.json()["product"]["price"] == 219.0

        # GET by sku
        r = requests.get(f"{BASE_URL}/api/admin/products/{sku}", headers=admin_headers)
        assert r.status_code == 200 and r.json()["price"] == 219.0

        # PUT non-existent
        r = requests.put(f"{BASE_URL}/api/admin/products/NOPE_SKU", json=body, headers=admin_headers)
        assert r.status_code == 404

        # Delete + verify
        r = requests.delete(f"{BASE_URL}/api/admin/products/{sku}", headers=admin_headers)
        assert r.status_code == 200
        r = requests.delete(f"{BASE_URL}/api/admin/products/{sku}", headers=admin_headers)
        assert r.status_code == 404
        assert sku not in PRODUCTS_JSON.read_text()

    def test_upload_image(self, admin_headers):
        # 1x1 png
        png = bytes.fromhex(
            "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4"
            "890000000d49444154789c63f8cf00000003000100c3e2c62b0000000049454e44ae426082"
        )
        files = {"file": ("t.png", png, "image/png")}
        data = {"sku": "HG500"}
        r = requests.post(f"{BASE_URL}/api/admin/products/upload-image",
                          files=files, data=data, headers=admin_headers)
        assert r.status_code == 200, r.text
        url = r.json()["url"]
        assert url.startswith("/api/uploads/products/")
        # Serve it
        r2 = requests.get(f"{BASE_URL}{url}")
        assert r2.status_code == 200
        assert r2.headers["content-type"].startswith("image/")

    def test_upload_image_too_large(self, admin_headers):
        big = b"\x00" * (5 * 1024 * 1024 + 100)
        files = {"file": ("big.png", big, "image/png")}
        r = requests.post(f"{BASE_URL}/api/admin/products/upload-image",
                          files=files, data={"sku": "HG500"}, headers=admin_headers)
        assert r.status_code == 413


# ---------------------------------------------------------------------------
# SHIPPING
# ---------------------------------------------------------------------------
class TestAdminShipping:
    def test_get_and_put_and_download(self, admin_headers):
        r = requests.get(f"{BASE_URL}/api/admin/shipping-rates", headers=admin_headers)
        assert r.status_code == 200
        original = r.json()
        assert "rules" in original and "defaultCharge" in original

        # PUT missing rules → 400
        r = requests.put(f"{BASE_URL}/api/admin/shipping-rates",
                         json={"defaultCharge": 50}, headers=admin_headers)
        assert r.status_code == 400

        # PUT valid — bump defaultCharge, verify public calculate uses new value
        modified = json.loads(json.dumps(original))
        modified["defaultCharge"] = 77
        # Bump free-shipping threshold way up so DEFAULT rule triggers
        modified["freeShippingAbove"] = 100000
        # Remove any CITY/STATE/PINCODE match for a random pincode
        modified["rules"] = []
        r = requests.put(f"{BASE_URL}/api/admin/shipping-rates",
                         json=modified, headers=admin_headers)
        assert r.status_code == 200

        r2 = requests.post(f"{BASE_URL}/api/shipping/calculate",
                           json={"pincode": "600001", "city": "Chennai",
                                 "state": "TN", "subtotal": 500})
        assert r2.status_code == 200
        assert r2.json()["charge"] == 77
        assert r2.json()["rule"] == "DEFAULT"

        # Download
        r3 = requests.get(f"{BASE_URL}/api/admin/shipping-rates/download",
                          headers=admin_headers)
        assert r3.status_code == 200
        assert "attachment" in r3.headers.get("content-disposition", "").lower()

        # Restore
        r = requests.put(f"{BASE_URL}/api/admin/shipping-rates",
                         json=original, headers=admin_headers)
        assert r.status_code == 200

    def test_upload_invalid_json(self, admin_headers):
        files = {"file": ("bad.json", b"{not-json", "application/json")}
        r = requests.post(f"{BASE_URL}/api/admin/shipping-rates/upload",
                          files=files, headers=admin_headers)
        assert r.status_code == 400


# ---------------------------------------------------------------------------
# ORDERS — pending / sort / mark-shipped / PDFs
# ---------------------------------------------------------------------------
class TestAdminOrders:
    def test_pending_default_sort(self, admin_headers, seeded_orders):
        r = requests.get(f"{BASE_URL}/api/admin/orders/pending", headers=admin_headers)
        assert r.status_code == 200
        d = r.json()
        assert d["count"] >= 2
        # All are CONFIRMED
        for o in d["orders"]:
            assert o["status"] == "CONFIRMED"

    @pytest.mark.parametrize("field", ["created_at", "city", "totalQuantity", "total", "orderNumber"])
    def test_pending_sort_fields(self, admin_headers, seeded_orders, field):
        for direction in ("asc", "desc"):
            r = requests.get(
                f"{BASE_URL}/api/admin/orders/pending",
                params={"sort": field, "direction": direction},
                headers=admin_headers,
            )
            assert r.status_code == 200

    def test_pending_invalid_sort(self, admin_headers):
        r = requests.get(f"{BASE_URL}/api/admin/orders/pending?sort=badfield",
                         headers=admin_headers)
        assert r.status_code == 400

    def test_print_addresses_pdf(self, admin_headers, seeded_orders):
        r = requests.post(f"{BASE_URL}/api/admin/orders/print-address",
                          json={"orderNumbers": seeded_orders},
                          headers=admin_headers)
        assert r.status_code == 200
        assert r.headers["content-type"] == "application/pdf"
        assert r.content[:4] == b"%PDF"
        assert "attachment" in r.headers.get("content-disposition", "").lower()
        assert f"addresses_{len(seeded_orders)}" in r.headers["content-disposition"]

    def test_print_addresses_empty(self, admin_headers):
        r = requests.post(f"{BASE_URL}/api/admin/orders/print-address",
                          json={"orderNumbers": []},
                          headers=admin_headers)
        assert r.status_code == 400

    def test_print_pending_pdf(self, admin_headers, seeded_orders):
        r = requests.get(f"{BASE_URL}/api/admin/orders/print-pending-pdf",
                         headers=admin_headers)
        assert r.status_code == 200
        assert r.headers["content-type"] == "application/pdf"
        assert r.content[:4] == b"%PDF"
        assert len(r.content) > 500

    def test_send_invoice_and_get_pdf(self, admin_headers, seeded_orders):
        ordnum = seeded_orders[0]
        r = requests.post(f"{BASE_URL}/api/admin/orders/{ordnum}/send-invoice",
                          headers=admin_headers)
        assert r.status_code == 200
        d = r.json()
        assert d.get("queued") is True

        # File on disk
        p = BACKEND_DIR / "uploads" / "invoices" / f"{ordnum}.pdf"
        assert p.exists() and p.stat().st_size > 500

        # dispatch log
        m = MongoClient(MONGO_URL)
        rec = m[DB_NAME].invoice_dispatch_log.find_one({"orderNumber": ordnum})
        m.close()
        assert rec is not None
        assert rec["channel"] == "WHATSAPP"
        assert rec["provider"] == "MOCK"
        assert rec["status"] == "QUEUED"

        # GET invoice pdf
        r2 = requests.get(f"{BASE_URL}/api/admin/orders/{ordnum}/invoice.pdf",
                          headers=admin_headers)
        assert r2.status_code == 200
        assert r2.content[:4] == b"%PDF"

    def test_mark_shipped_bulk(self, admin_headers, seeded_orders):
        # Only use the LAST seeded order so earlier tests using seeded_orders still see 2 confirmed
        target = [seeded_orders[-1]]
        r = requests.post(f"{BASE_URL}/api/admin/orders/mark-shipped",
                          json={"orderNumbers": target},
                          headers=admin_headers)
        assert r.status_code == 200
        d = r.json()
        assert d["shipped"] == 1

        # No longer in pending
        r2 = requests.get(f"{BASE_URL}/api/admin/orders/pending", headers=admin_headers)
        nums = [o["orderNumber"] for o in r2.json()["orders"]]
        assert target[0] not in nums

    def test_completed_default_range(self, admin_headers, seeded_orders):
        r = requests.get(f"{BASE_URL}/api/admin/orders/completed", headers=admin_headers)
        assert r.status_code == 200
        d = r.json()
        assert "count" in d and "orders" in d and "from" in d and "to" in d
        assert d["count"] >= 1  # at least the shipped seeded one

    def test_completed_xlsx_export(self, admin_headers, seeded_orders):
        r = requests.get(f"{BASE_URL}/api/admin/orders/completed/export.xlsx",
                         headers=admin_headers)
        assert r.status_code == 200
        # ZIP magic (xlsx is a zip)
        assert r.content[:4] == b"PK\x03\x04"
        assert "xlsx" in r.headers.get("content-disposition", "").lower()

    def test_completed_pdf_export(self, admin_headers, seeded_orders):
        r = requests.get(f"{BASE_URL}/api/admin/orders/completed/export.pdf",
                         headers=admin_headers)
        assert r.status_code == 200
        assert r.content[:4] == b"%PDF"
