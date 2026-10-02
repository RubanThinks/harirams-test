"""Iteration 12 backend tests:
- POST /api/orders triggers two owner WhatsApp notifications (ownerNotifications field).
- POST /api/admin/orders/print-address returns a non-empty PDF (fonts bumped).
- Admin product image upload + public /api/uploads/products/{filename}.
- storage.get_object auto-remints storage key on invalid cached key.
- GST 5% + weight-based shipping regression (Chennai 500 ml -> 45 * qty).
"""
import io
import os
import random

import pytest
import requests

BASE = os.environ.get("REACT_APP_BACKEND_URL", "http://localhost:8001").rstrip("/")
API = f"{BASE}/api"
MOCK_OTP = "123456"


# ---------- shared fixtures ----------
def _rand_phone():
    return "9" + "".join(str(random.randint(0, 9)) for _ in range(9))


@pytest.fixture(scope="module")
def customer_phone():
    phone = _rand_phone()
    r = requests.post(f"{API}/auth/send-otp", json={"phone": phone}, timeout=15)
    assert r.status_code == 200, r.text
    r = requests.post(f"{API}/auth/verify-otp", json={"phone": phone, "otp": MOCK_OTP}, timeout=15)
    assert r.status_code == 200, r.text
    return phone


@pytest.fixture(scope="module")
def admin_token():
    r = requests.post(f"{API}/admin/auth/login",
                      json={"username": "admin", "password": "Harirams0507"}, timeout=15)
    assert r.status_code == 200, r.text
    j = r.json()
    sid = j["sessionId"]
    otp = j.get("mockOtp")
    assert otp, f"mockOtp missing: {j}"
    r = requests.post(f"{API}/admin/auth/verify-otp",
                      json={"sessionId": sid, "otp": otp}, timeout=15)
    assert r.status_code == 200, r.text
    return r.json()["token"]


def _chennai_order(phone, name="Owner Notify Buyer"):
    return {
        "phone": phone,
        "address": {
            "name": name, "phone": phone, "pincode": "600033",
            "city": "Chennai", "state": "Tamil Nadu", "line1": "1 Test St",
        },
        "items": [{"sku": "TEST-500", "name": "Ghee 500 ml", "variant": "500 ml",
                   "price": 555, "quantity": 1}],
        "subtotal": 555, "shipping": 45, "total": 627.75,
        "paymentMethod": "MOCK",
    }


# ---------- 1. Owner notifications on order create ----------
class TestOwnerNotifications:
    def test_order_triggers_two_owner_whatsapp(self, customer_phone, admin_token):
        payload = _chennai_order(customer_phone)
        r = requests.post(f"{API}/orders", json=payload, timeout=25)
        assert r.status_code == 200, r.text
        order = r.json()["order"]
        order_number = order["orderNumber"]

        # Fetch via admin pending list (no single-order GET exists) and
        # locate the just-placed order.
        h = {"Authorization": f"Bearer {admin_token}"}
        r = requests.get(f"{API}/admin/orders/pending", headers=h, timeout=15)
        assert r.status_code == 200, r.text
        orders = r.json().get("orders", [])
        doc = next((o for o in orders if o.get("orderNumber") == order_number), None)
        assert doc is not None, f"order {order_number} missing from pending list"
        notifs = doc.get("ownerNotifications")
        assert isinstance(notifs, list), f"ownerNotifications missing: {doc}"
        assert len(notifs) == 2, f"expected 2 recipients, got {notifs}"
        tos = sorted([(n.get("to") or "") for n in notifs])
        assert tos == ["919500049550", "919632262000"], tos
        for n in notifs:
            assert n.get("delivered") is True, n


# ---------- 2. Admin print-address PDF ----------
class TestAdminPrintAddressPdf:
    def test_print_address_pdf_bold_bump(self, admin_token, customer_phone):
        payload = _chennai_order(customer_phone, name="PDF Addr Buyer")
        r = requests.post(f"{API}/orders", json=payload, timeout=25)
        assert r.status_code == 200, r.text
        order_number = r.json()["order"]["orderNumber"]

        h = {"Authorization": f"Bearer {admin_token}"}
        r = requests.post(f"{API}/admin/orders/print-address",
                          headers=h, json={"orderNumbers": [order_number]}, timeout=25)
        assert r.status_code == 200, r.text
        assert "application/pdf" in r.headers.get("content-type", "").lower()
        assert r.content[:4] == b"%PDF"
        assert len(r.content) > 1000


# ---------- 3. Admin image upload + public GET ----------
class TestProductImageUpload:
    PNG_1x1 = (
        b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01"
        b"\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\rIDATx\x9cc\xf8"
        b"\xcf\xc0\x00\x00\x00\x03\x00\x01\x5e\xf3\x2a\x8a\x00\x00\x00\x00"
        b"IEND\xaeB`\x82"
    )

    def test_upload_and_public_fetch(self, admin_token):
        h = {"Authorization": f"Bearer {admin_token}"}
        files = {"file": ("tiny.png", io.BytesIO(self.PNG_1x1), "image/png")}
        data = {"sku": "ghee-500"}
        r = requests.post(f"{API}/admin/products/upload-image",
                          headers=h, files=files, data=data, timeout=60)
        assert r.status_code == 200, r.text
        j = r.json()
        assert j["success"] is True
        url = j["url"]
        assert url.startswith("/api/uploads/products/"), url

        # Public, unauthenticated GET of returned URL.
        full = f"{BASE}{url}"
        r2 = requests.get(full, timeout=30)
        assert r2.status_code == 200, f"{r2.status_code} - {r2.text[:200]}"
        ct = r2.headers.get("content-type", "")
        assert ct.startswith("image/"), f"bad content-type: {ct}"
        assert len(r2.content) > 0


# ---------- 4. Storage key auto-recovery (unit level) ----------
class TestStorageKeyRecovery:
    def test_get_object_remints_on_bad_key(self):
        # Must import inside the test so backend process state is accessed.
        # We cannot touch the live backend process memory from the test
        # subprocess, so we simulate by importing storage directly here.
        import importlib
        import sys
        # Load backend .env so EMERGENT_LLM_KEY is populated for init_storage.
        env_path = "/app/backend/.env"
        if os.path.exists(env_path):
            with open(env_path) as f:
                for line in f:
                    line = line.strip()
                    if "=" in line and not line.startswith("#"):
                        k, v = line.split("=", 1)
                        os.environ.setdefault(k, v.strip().strip('"').strip("'"))
        sys.path.insert(0, "/app/backend")
        storage = importlib.import_module("storage")
        # Prime a bogus key so the first fetch is forced to fail -> remint.
        storage.storage_key = "bogus-key-0000"
        old = storage.storage_key
        try:
            storage.get_object(f"{storage.APP_NAME}/does-not-exist-{random.randint(1,99999)}.png")
        except Exception:
            # 404 after remint is EXPECTED for this missing path; what we
            # care about is that storage_key got refreshed.
            pass
        assert storage.storage_key and storage.storage_key != old, (
            f"storage_key was not re-minted (still {storage.storage_key})"
        )
        assert isinstance(storage.storage_key, str) and len(storage.storage_key) > 0


# ---------- 5. GST + shipping regression ----------
class TestGstShippingRegression:
    def test_chennai_500ml_qty1(self, customer_phone):
        payload = _chennai_order(customer_phone, name="Regression Buyer")
        r = requests.post(f"{API}/orders", json=payload, timeout=20)
        assert r.status_code == 200, r.text
        order = r.json()["order"]
        assert order["subtotal"] == 555
        assert order["gst"] == 27.75
        assert order["shipping"] == 45
        assert order["total"] == 627.75
