"""
Iteration 8 backend tests:
  - Razorpay: config, create-order (valid/invalid), verify (valid/invalid signature)
  - MSG91 customer OTP: send + verify in MOCK mode (empty template ids)
  - Admin 2FA: login returns mockOtp; verify-otp exchanges for JWT
  - Company config: gstNumber updated to 33DDOPS8117L2ZV
  - Products: HG500 has >=2 images
  - Admin address-label PDF endpoint after refactor
  - Regression: full order flow (send-otp -> verify-otp -> create order)
"""
import hmac
import hashlib
import os
import random
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    # fallback for local runs
    BASE_URL = "http://localhost:8001"
API = f"{BASE_URL}/api"

RAZORPAY_KEY_ID = "rzp_test_Tbm7gsmmd6v4hU"
RAZORPAY_KEY_SECRET = "z9ZY2OU7bghhi5oqGM5rhOaE"


@pytest.fixture(scope="session")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# --------------------------- Razorpay ---------------------------
class TestRazorpay:
    def test_config(self, client):
        r = client.get(f"{API}/payments/razorpay/config")
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["enabled"] is True
        assert data["keyId"] == RAZORPAY_KEY_ID

    def test_create_order_valid(self, client):
        r = client.post(f"{API}/payments/razorpay/create-order",
                        json={"amount": 499.0, "receipt": "test-it8-1"})
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["currency"] == "INR"
        assert data["amount"] == 49900  # paise
        assert data["keyId"] == RAZORPAY_KEY_ID
        assert data["orderId"].startswith("order_")
        assert data["receipt"] == "test-it8-1"

    def test_create_order_zero_amount_rejected(self, client):
        r = client.post(f"{API}/payments/razorpay/create-order", json={"amount": 0})
        assert r.status_code == 400
        assert "greater than zero" in r.text.lower()

    def test_create_order_negative_rejected(self, client):
        r = client.post(f"{API}/payments/razorpay/create-order", json={"amount": -10})
        assert r.status_code == 400

    def test_verify_valid_signature(self, client):
        order_id = "order_TEST123456"
        payment_id = "pay_TEST123456"
        payload = f"{order_id}|{payment_id}".encode()
        sig = hmac.new(RAZORPAY_KEY_SECRET.encode(), payload, hashlib.sha256).hexdigest()
        r = client.post(f"{API}/payments/razorpay/verify", json={
            "razorpay_order_id": order_id,
            "razorpay_payment_id": payment_id,
            "razorpay_signature": sig,
        })
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["verified"] is True
        assert data["orderId"] == order_id
        assert data["paymentId"] == payment_id

    def test_verify_invalid_signature(self, client):
        r = client.post(f"{API}/payments/razorpay/verify", json={
            "razorpay_order_id": "order_X",
            "razorpay_payment_id": "pay_X",
            "razorpay_signature": "deadbeef",
        })
        assert r.status_code == 400
        assert "signature verification failed" in r.text.lower()


# --------------------------- Customer OTP (MOCK) ---------------------------
class TestCustomerOtp:
    def test_send_otp_mock_hint_contains_123456(self, client):
        phone = "9" + "".join(str(random.randint(0, 9)) for _ in range(9))
        r = client.post(f"{API}/auth/send-otp", json={"phone": phone})
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["success"] is True
        assert data["mock"] is True
        assert "123456" in data.get("hint", "")

    def test_verify_otp_mock_success(self, client):
        phone = "9" + "".join(str(random.randint(0, 9)) for _ in range(9))
        client.post(f"{API}/auth/send-otp", json={"phone": phone})
        r = client.post(f"{API}/auth/verify-otp", json={"phone": phone, "otp": "123456"})
        assert r.status_code == 200, r.text
        assert r.json()["verified"] is True

    def test_verify_otp_wrong_returns_401(self, client):
        phone = "9" + "".join(str(random.randint(0, 9)) for _ in range(9))
        client.post(f"{API}/auth/send-otp", json={"phone": phone})
        r = client.post(f"{API}/auth/verify-otp", json={"phone": phone, "otp": "000000"})
        assert r.status_code == 401


# --------------------------- Admin 2FA ---------------------------
class TestAdmin2FA:
    def test_login_returns_mock_otp(self, client):
        r = client.post(f"{API}/admin/auth/login",
                        json={"username": "admin", "password": "Harirams0507"})
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["otpRequired"] is True
        assert isinstance(data["sessionId"], str) and len(data["sessionId"]) > 0
        assert data["otpTarget"] == "+91-9500049550"
        assert data["ttlMinutes"] == 5
        assert data["mock"] is True
        assert "mockOtp" in data and len(data["mockOtp"]) == 6

    def test_verify_otp_returns_jwt(self, client):
        r = client.post(f"{API}/admin/auth/login",
                        json={"username": "admin", "password": "Harirams0507"})
        data = r.json()
        r2 = client.post(f"{API}/admin/auth/verify-otp",
                         json={"sessionId": data["sessionId"], "otp": data["mockOtp"]})
        assert r2.status_code == 200, r2.text
        tok = r2.json()
        assert tok["tokenType"] == "Bearer"
        assert tok["user"]["username"] == "admin"
        assert isinstance(tok["token"], str) and len(tok["token"]) > 20

    def test_invalid_password(self, client):
        r = client.post(f"{API}/admin/auth/login",
                        json={"username": "admin", "password": "wrong"})
        assert r.status_code == 401


@pytest.fixture(scope="session")
def admin_token(client):
    r = client.post(f"{API}/admin/auth/login",
                    json={"username": "admin", "password": "Harirams0507"})
    d = r.json()
    r2 = client.post(f"{API}/admin/auth/verify-otp",
                     json={"sessionId": d["sessionId"], "otp": d["mockOtp"]})
    return r2.json()["token"]


# --------------------------- Company config & products ---------------------------
class TestConfigAndProducts:
    def test_company_gst(self, client):
        r = client.get(f"{API}/config/company")
        assert r.status_code == 200
        assert r.json().get("gstNumber") == "33DDOPS8117L2ZV"

    def _fetch_products(self, client):
        r = client.get(f"{API}/products")
        assert r.status_code == 200
        j = r.json()
        return j.get("products", j) if isinstance(j, dict) else j

    def test_products_have_images(self, client):
        products = self._fetch_products(client)
        assert isinstance(products, list) and len(products) > 0
        for p in products:
            assert "images" in p
            assert isinstance(p["images"], list)

    def test_hg500_multi_images(self, client):
        prods = self._fetch_products(client)
        hg500 = next((p for p in prods if p.get("sku") == "HG500"), None)
        assert hg500 is not None, "HG500 not found"
        assert len(hg500["images"]) >= 2, f"HG500 must have >=2 images, got {len(hg500['images'])}"


# --------------------------- Admin address-label PDF ---------------------------
class TestAddressPdf:
    def test_address_pdf(self, client, admin_token):
        # Grab a couple of pending order numbers
        r = client.get(f"{API}/admin/orders/pending",
                       headers={"Authorization": f"Bearer {admin_token}"})
        assert r.status_code == 200, r.text
        j = r.json()
        orders = j.get("orders", j) if isinstance(j, dict) else j
        if not orders:
            pytest.skip("No pending orders in DB to test PDF")
        order_numbers = [o["orderNumber"] for o in orders[:2]]
        r = client.post(f"{API}/admin/orders/print-address",
                        json={"orderNumbers": order_numbers},
                        headers={"Authorization": f"Bearer {admin_token}"})
        assert r.status_code == 200, r.text[:300]
        assert r.headers.get("content-type", "").startswith("application/pdf")
        assert r.content[:4] == b"%PDF"
        assert len(r.content) > 1000


# --------------------------- Regression: full order flow ---------------------------
class TestOrderRegression:
    def test_end_to_end_order(self, client):
        phone = "9" + "".join(str(random.randint(0, 9)) for _ in range(9))
        r = client.post(f"{API}/auth/send-otp", json={"phone": phone})
        assert r.status_code == 200
        r = client.post(f"{API}/auth/verify-otp", json={"phone": phone, "otp": "123456"})
        assert r.status_code == 200

        # pick a product
        j = client.get(f"{API}/products").json()
        products = j.get("products", j) if isinstance(j, dict) else j
        p = products[0]
        variant_label = p.get("variant") or "default"
        price = p.get("price") or 100
        payload = {
            "phone": phone,
            "address": {
                "name": "TEST_Customer",
                "line1": "123 Test St",
                "line2": "",
                "city": "Chennai",
                "state": "Tamil Nadu",
                "pincode": "600001",
            },
            "items": [{
                "sku": p["sku"],
                "name": p["name"],
                "variant": variant_label,
                "price": price,
                "quantity": 1,
            }],
            "subtotal": price,
            "shipping": 0,
            "total": price,
            "paymentMethod": "MOCK",
        }
        r = client.post(f"{API}/orders", json=payload)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["success"] is True
        assert data["order"]["orderNumber"].startswith("HR")
        assert data["order"]["paymentStatus"] == "PAID"
        assert data["order"]["status"] == "CONFIRMED"
