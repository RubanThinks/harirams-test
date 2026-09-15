"""Iteration 10 backend tests — MSG91 WhatsApp OTP refactor + Razorpay regression.

Covers:
- Customer OTP (MOCK) send / verify happy path + wrong OTP + rate-limit
- Admin 2FA (MOCK) login → verify-otp exchange for JWT
- LIVE MSG91 payload SHAPE via monkey-patched httpx.post (no real network)
- Razorpay config + create-order + verify-mismatch regression
- End-to-end COD order flow post-OTP-refactor
- Admin purge endpoint via 2FA-issued JWT, then re-order still works
"""
import os
import sys
import random
import string
from pathlib import Path
from unittest import mock

import pytest
import requests

# Backend URL — use production frontend .env if present, else localhost:8001
def _load_backend_url() -> str:
    env_path = Path("/app/frontend/.env")
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            if line.startswith("REACT_APP_BACKEND_URL"):
                return line.split("=", 1)[1].strip().strip('"').rstrip("/")
    return "http://localhost:8001"


BASE_URL = _load_backend_url()
API = f"{BASE_URL}/api"


def _rand_phone() -> str:
    # Indian mobile numbers start with 6-9
    return random.choice("6789") + "".join(random.choice(string.digits) for _ in range(9))


# ---------------- Customer OTP (MOCK) ----------------
class TestCustomerOtpMock:
    def test_send_otp_mock_hint_contains_123456(self):
        phone = _rand_phone()
        r = requests.post(f"{API}/auth/send-otp", json={"phone": phone}, timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["success"] is True
        assert data.get("mock") is True
        assert "123456" in data.get("hint", ""), f"Expected mock hint w/ 123456, got: {data}"

    def test_send_otp_invalid_phone(self):
        r = requests.post(f"{API}/auth/send-otp", json={"phone": "12345"}, timeout=15)
        assert r.status_code == 400

    def test_verify_otp_happy_path(self):
        phone = _rand_phone()
        requests.post(f"{API}/auth/send-otp", json={"phone": phone}, timeout=15)
        r = requests.post(f"{API}/auth/verify-otp", json={"phone": phone, "otp": "123456"}, timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["verified"] is True
        assert data["phone"] == phone

    def test_verify_otp_wrong_returns_401(self):
        phone = _rand_phone()
        requests.post(f"{API}/auth/send-otp", json={"phone": phone}, timeout=15)
        r = requests.post(f"{API}/auth/verify-otp", json={"phone": phone, "otp": "999999"}, timeout=15)
        assert r.status_code == 401

    def test_verify_otp_rate_limit(self):
        phone = _rand_phone()
        requests.post(f"{API}/auth/send-otp", json={"phone": phone}, timeout=15)
        codes = []
        for _ in range(8):
            r = requests.post(f"{API}/auth/verify-otp", json={"phone": phone, "otp": "000000"}, timeout=15)
            codes.append(r.status_code)
        assert 429 in codes, f"Expected a 429 after multiple wrong OTPs, got: {codes}"


# ---------------- Admin 2FA (MOCK) ----------------
ADMIN_USER = "admin"
ADMIN_PASS = "Harirams0507"


def _admin_login_and_jwt() -> str:
    r = requests.post(f"{API}/admin/auth/login",
                      json={"username": ADMIN_USER, "password": ADMIN_PASS}, timeout=15)
    assert r.status_code == 200, r.text
    j = r.json()
    assert j["otpRequired"] is True
    assert j["otpTarget"] == "+91-9500049550"
    assert j["mock"] is True
    assert "mockOtp" in j and len(j["mockOtp"]) == 6
    sess = j["sessionId"]
    otp = j["mockOtp"]
    r2 = requests.post(f"{API}/admin/auth/verify-otp",
                       json={"sessionId": sess, "otp": otp}, timeout=15)
    assert r2.status_code == 200, r2.text
    data = r2.json()
    assert data["tokenType"] == "Bearer"
    assert data["user"]["role"] == "admin"
    return data["token"]


class TestAdmin2FAMock:
    def test_admin_login_returns_mock_otp(self):
        r = requests.post(f"{API}/admin/auth/login",
                          json={"username": ADMIN_USER, "password": ADMIN_PASS}, timeout=15)
        assert r.status_code == 200, r.text
        j = r.json()
        assert j["otpRequired"] is True
        assert j["mock"] is True
        assert j["otpTarget"] == "+91-9500049550"
        assert "mockOtp" in j

    def test_admin_verify_otp_issues_jwt(self):
        token = _admin_login_and_jwt()
        assert token and isinstance(token, str)
        # sanity-check the JWT is accepted by /me
        r = requests.get(f"{API}/admin/auth/me",
                         headers={"Authorization": f"Bearer {token}"}, timeout=15)
        assert r.status_code == 200
        assert r.json()["role"] == "admin"


# ---------------- LIVE MSG91 payload SHAPE (mocked httpx.post) ----------------
class TestMsg91LivePayloadShape:
    def test_live_payload_shape(self):
        # Import fresh so env changes take effect on the module-level constants
        sys.path.insert(0, "/app/backend")
        import importlib
        import msg91 as msg91_mod
        importlib.reload(msg91_mod)

        env = {
            "MSG91_AUTHKEY": "TEST_AUTHKEY",
            "MSG91_INTEGRATED_NUMBER": "919999999999",
            "MSG91_TEMPLATE_NAME": "whatsappotp",
            "MSG91_TEMPLATE_LANGUAGE": "en",
            "MSG91_TEMPLATE_NAMESPACE": "7fe9dc17_51c3_4e12_a20e_712b61d3b6a5",
        }
        captured = {}

        class _Resp:
            status_code = 200
            text = "{}"
            def json(self):
                return {"type": "success", "request_id": "rq_test_123"}

        def _fake_post(url, json=None, headers=None, timeout=None):
            captured["url"] = url
            captured["json"] = json
            captured["headers"] = headers
            return _Resp()

        with mock.patch.dict(os.environ, env, clear=False), \
             mock.patch.object(msg91_mod.httpx, "post", side_effect=_fake_post):
            assert msg91_mod.is_configured() is True
            result = msg91_mod.send_whatsapp_otp("9876543210", "654321")

        assert result["mock"] is False
        assert result["delivered"] is True
        # (a) URL
        assert captured["url"] == "https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/"
        # authkey header
        assert captured["headers"]["authkey"] == "TEST_AUTHKEY"
        payload = captured["json"]
        # (a) integrated_number
        assert payload["integrated_number"] == "919999999999"
        # (b) content_type
        assert payload["content_type"] == "template"
        tpl = payload["payload"]["template"]
        # (c) name
        assert tpl["name"] == "whatsappotp"
        # (d) language.code
        assert tpl["language"]["code"] == "en"
        # (e) namespace
        assert tpl["namespace"] == "7fe9dc17_51c3_4e12_a20e_712b61d3b6a5"
        tac = tpl["to_and_components"][0]
        # (f) to = ['91<10-digit>']
        assert tac["to"] == ["919876543210"]
        # (g) body_1.value == OTP
        assert tac["components"]["body_1"]["value"] == "654321"
        # (h) button_1.value == OTP
        assert tac["components"]["button_1"]["value"] == "654321"


# ---------------- Razorpay regression ----------------
class TestRazorpay:
    def test_config(self):
        r = requests.get(f"{API}/payments/razorpay/config", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data.get("enabled") is True
        assert data.get("keyId") == "rzp_test_Tbm7gsmmd6v4hU"

    def test_create_order(self):
        r = requests.post(f"{API}/payments/razorpay/create-order",
                          json={"amount": 100.0, "currency": "INR"}, timeout=20)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "orderId" in data
        assert data["currency"] == "INR"
        assert data["keyId"] == "rzp_test_Tbm7gsmmd6v4hU"
        assert data["amount"] == 10000  # paise

    def test_verify_signature_mismatch(self):
        r = requests.post(f"{API}/payments/razorpay/verify", json={
            "razorpay_order_id": "order_test_xxx",
            "razorpay_payment_id": "pay_test_xxx",
            "razorpay_signature": "0" * 64,
        }, timeout=15)
        assert r.status_code == 400


# ---------------- E2E COD order flow after OTP refactor ----------------
class TestE2ECODOrder:
    def test_send_verify_place_cod(self):
        phone = _rand_phone()
        assert requests.post(f"{API}/auth/send-otp", json={"phone": phone}, timeout=15).status_code == 200
        assert requests.post(f"{API}/auth/verify-otp",
                             json={"phone": phone, "otp": "123456"}, timeout=15).status_code == 200

        payload = {
            "phone": phone,
            "address": {
                "name": "Test Customer",
                "line1": "123 Test Lane",
                "line2": "",
                "landmark": "",
                "city": "Chennai",
                "state": "Tamil Nadu",
                "pincode": "600001",
            },
            "items": [{
                "sku": "GHEE-500",
                "name": "Pure Cow Ghee",
                "variant": "500ml",
                "price": 750.0,
                "quantity": 1,
            }],
            "subtotal": 750.0,
            "shipping": 0.0,
            "total": 750.0,
            "paymentMethod": "COD",
        }
        r = requests.post(f"{API}/orders", json=payload, timeout=20)
        assert r.status_code == 200, r.text
        j = r.json()
        assert j["success"] is True
        assert j["order"]["paymentMethod"] == "COD"
        assert j["order"]["phone"] == phone
        assert j["order"]["orderNumber"].startswith("HR")


# ---------------- Admin purge + re-place order ----------------
class TestAdminPurgeAndReorder:
    def test_purge_then_reorder(self):
        token = _admin_login_and_jwt()
        r = requests.post(f"{API}/admin/orders/purge",
                          json={"confirm": "DELETE_ALL_ORDERS"},
                          headers={"Authorization": f"Bearer {token}"}, timeout=30)
        assert r.status_code == 200, r.text
        j = r.json()
        assert j["success"] is True
        assert "orders" in j["deleted"]

        # Now re-place an order to prove subsequent creation isn't blocked
        phone = _rand_phone()
        assert requests.post(f"{API}/auth/send-otp", json={"phone": phone}, timeout=15).status_code == 200
        assert requests.post(f"{API}/auth/verify-otp",
                             json={"phone": phone, "otp": "123456"}, timeout=15).status_code == 200
        payload = {
            "phone": phone,
            "address": {"name": "Post Purge", "line1": "1 A St", "city": "Chennai",
                        "state": "TN", "pincode": "600002"},
            "items": [{"sku": "GHEE-250", "name": "Ghee", "variant": "250ml",
                       "price": 400.0, "quantity": 1}],
            "subtotal": 400.0, "shipping": 0.0, "total": 400.0,
            "paymentMethod": "COD",
        }
        r2 = requests.post(f"{API}/orders", json=payload, timeout=20)
        assert r2.status_code == 200, r2.text
        assert r2.json()["success"] is True


if __name__ == "__main__":
    sys.exit(pytest.main([__file__, "-v"]))
