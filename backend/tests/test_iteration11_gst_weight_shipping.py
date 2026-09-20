"""Iteration 11: GST + weight-based shipping backend tests.

Covers:
 - POST /api/shipping/calculate weight-based per-unit charges by zone
   (chennai / tn / south_india / others), free-shipping threshold,
   invalid / unserviceable pincodes.
 - POST /api/orders server-side authoritative GST + shipping recompute.
 - GET /api/admin/orders/{orderNumber}/invoice.pdf returns application/pdf.
 - Admin shipping GET/PUT/download regression with weightRates preserved.
"""
import os
import io
import json
import time
import random
import pytest
import requests

BASE = os.environ.get("REACT_APP_BACKEND_URL", "http://localhost:8001").rstrip("/")
API = f"{BASE}/api"

MOCK_OTP = "123456"


# ---------- helpers ----------
def _rand_phone():
    return "9" + "".join(str(random.randint(0, 9)) for _ in range(9))


@pytest.fixture(scope="module")
def customer_phone():
    phone = _rand_phone()
    # request OTP
    r = requests.post(f"{API}/auth/request-otp", json={"phone": phone}, timeout=15)
    if r.status_code == 404:
        r = requests.post(f"{API}/auth/send-otp", json={"phone": phone}, timeout=15)
    assert r.status_code == 200, r.text
    # verify OTP (MOCK 123456)
    r = requests.post(f"{API}/auth/verify-otp", json={"phone": phone, "otp": MOCK_OTP}, timeout=15)
    assert r.status_code == 200, r.text
    return phone


@pytest.fixture(scope="module")
def admin_token():
    r = requests.post(f"{API}/admin/auth/login", json={"username": "admin", "password": "Harirams0507"}, timeout=15)
    assert r.status_code == 200, r.text
    j = r.json()
    session_id = j["sessionId"]
    otp = j.get("mockOtp")
    assert otp, f"mockOtp missing: {j}"
    r = requests.post(f"{API}/admin/auth/verify-otp", json={"sessionId": session_id, "otp": otp}, timeout=15)
    assert r.status_code == 200, r.text
    return r.json()["token"]


# ---------- POST /api/shipping/calculate ----------
class TestShippingCalculate:
    def _post(self, **payload):
        r = requests.post(f"{API}/shipping/calculate", json=payload, timeout=15)
        return r

    def test_chennai_city_500ml(self):
        r = self._post(pincode="600001", city="Chennai", state="Tamil Nadu",
                       subtotal=500, items=[{"variant": "500 ml", "quantity": 1}])
        assert r.status_code == 200, r.text
        j = r.json()
        assert j["charge"] == 45
        assert j["rule"] == "WEIGHT:CHENNAI"

    def test_chennai_by_pincode_1000ml(self):
        r = self._post(pincode="600042", state="Tamil Nadu",
                       subtotal=500, items=[{"variant": "1000 ml", "quantity": 1}])
        assert r.status_code == 200, r.text
        j = r.json()
        assert j["charge"] == 70
        assert j["rule"] == "WEIGHT:CHENNAI"

    def test_tn_trichy_500ml(self):
        r = self._post(pincode="620001", city="Trichy", state="Tamil Nadu",
                       subtotal=500, items=[{"variant": "500 ml", "quantity": 1}])
        j = r.json()
        assert r.status_code == 200
        assert j["charge"] == 65
        assert j["rule"] == "WEIGHT:TN"

    def test_tn_trichy_1000ml(self):
        r = self._post(pincode="620001", state="Tamil Nadu",
                       subtotal=500, items=[{"variant": "1000 ml", "quantity": 1}])
        j = r.json()
        assert j["charge"] == 95
        assert j["rule"] == "WEIGHT:TN"

    @pytest.mark.parametrize("state,pincode", [
        ("Kerala", "682001"),
        ("Karnataka", "560001"),
        ("Andhra Pradesh", "500081"),
        ("Telangana", "500001"),
    ])
    def test_south_india_500ml(self, state, pincode):
        r = self._post(pincode=pincode, state=state, subtotal=500,
                       items=[{"variant": "500 ml", "quantity": 1}])
        j = r.json()
        assert r.status_code == 200
        assert j["charge"] == 100
        assert j["rule"] == "WEIGHT:SOUTH_INDIA"

    def test_south_india_1000ml(self):
        r = self._post(pincode="560001", state="Karnataka", subtotal=500,
                       items=[{"variant": "1000 ml", "quantity": 1}])
        j = r.json()
        assert j["charge"] == 150

    def test_south_india_2x500ml_per_unit(self):
        r = self._post(pincode="682001", state="Kerala", subtotal=500,
                       items=[{"variant": "500 ml", "quantity": 2}])
        j = r.json()
        assert j["charge"] == 200
        assert j["rule"] == "WEIGHT:SOUTH_INDIA"

    def test_others_delhi_500ml(self):
        r = self._post(pincode="110001", state="Delhi", subtotal=500,
                       items=[{"variant": "500 ml", "quantity": 1}])
        j = r.json()
        assert j["charge"] == 150
        assert j["rule"] == "WEIGHT:OTHERS"

    def test_others_delhi_1000ml(self):
        r = self._post(pincode="110001", state="Delhi", subtotal=500,
                       items=[{"variant": "1000 ml", "quantity": 1}])
        j = r.json()
        assert j["charge"] == 250

    def test_others_mixed(self):
        r = self._post(pincode="110001", state="Delhi", subtotal=500,
                       items=[{"variant": "1000 ml", "quantity": 1},
                              {"variant": "500 ml", "quantity": 1}])
        j = r.json()
        assert j["charge"] == 400
        assert j["rule"] == "WEIGHT:OTHERS"

    def test_unlisted_variant_free(self):
        r = self._post(pincode="110001", state="Delhi", subtotal=500,
                       items=[{"variant": "200 ml", "quantity": 3},
                              {"variant": "5 Litre", "quantity": 1}])
        j = r.json()
        assert j["charge"] == 0

    def test_free_shipping_above_threshold(self):
        r = self._post(pincode="110001", state="Delhi", subtotal=1500,
                       items=[{"variant": "1000 ml", "quantity": 1}])
        j = r.json()
        assert j["charge"] == 0
        assert j["rule"] == "FREE_SHIPPING"

    def test_free_shipping_boundary_999(self):
        # subtotal >= freeShippingAbove(999) -> free
        r = self._post(pincode="110001", state="Delhi", subtotal=999,
                       items=[{"variant": "1000 ml", "quantity": 1}])
        j = r.json()
        assert j["charge"] == 0
        assert j["rule"] == "FREE_SHIPPING"

    def test_invalid_pincode(self):
        r = self._post(pincode="12", state="Delhi", subtotal=500,
                       items=[{"variant": "500 ml", "quantity": 1}])
        assert r.status_code == 400

    def test_unserviceable_pincode_via_admin(self, admin_token):
        # Fetch current rates, add unserviceable pincode, PUT, test, then restore
        h = {"Authorization": f"Bearer {admin_token}"}
        r = requests.get(f"{API}/admin/shipping-rates", headers=h, timeout=15)
        assert r.status_code == 200, r.text
        current = r.json()
        original = json.loads(json.dumps(current))
        current["unserviceablePincodes"] = list(set(current.get("unserviceablePincodes", []) + ["999999"]))
        put = requests.put(f"{API}/admin/shipping-rates", headers=h, json=current, timeout=15)
        assert put.status_code == 200, put.text
        try:
            r = self._post(pincode="999999", state="Delhi", subtotal=500,
                           items=[{"variant": "500 ml", "quantity": 1}])
            assert r.status_code == 422, r.text
        finally:
            # restore
            requests.put(f"{API}/admin/shipping-rates", headers=h, json=original, timeout=15)


# ---------- POST /api/orders (GST + server-side authority) ----------
class TestOrderGst:
    def _addr(self, **over):
        base = {
            "name": "Test User",
            "phone": "9000000000",
            "pincode": "600001",
            "city": "Chennai",
            "state": "Tamil Nadu",
            "line1": "1 Test St",
        }
        base.update(over)
        return base

    def test_order_gst_5_percent_and_shipping(self, customer_phone):
        payload = {
            "phone": customer_phone,
            "address": self._addr(name="GST Buyer"),
            "items": [{"sku": "TEST-500", "name": "Ghee 500 ml", "variant": "500 ml",
                       "price": 555, "quantity": 1}],
            "subtotal": 555,
            "shipping": 45,
            "total": 627.75,
            "paymentMethod": "MOCK",
        }
        r = requests.post(f"{API}/orders", json=payload, timeout=20)
        assert r.status_code == 200, r.text
        order = r.json()["order"]
        assert order["subtotal"] == 555
        assert order["gst"] == 27.75  # 5% of 555
        assert order["shipping"] == 45  # weight-based, chennai
        assert order["total"] == 627.75

    def test_order_ignores_wrong_client_totals(self, customer_phone):
        # Send deliberately wrong shipping/total; server must recompute
        payload = {
            "phone": customer_phone,
            "address": self._addr(name="Cheeky Buyer"),
            "items": [{"sku": "TEST-500", "name": "Ghee 500 ml", "variant": "500 ml",
                       "price": 555, "quantity": 1}],
            "subtotal": 555,
            "shipping": 0,     # WRONG
            "total": 1,        # WRONG
            "paymentMethod": "MOCK",
        }
        r = requests.post(f"{API}/orders", json=payload, timeout=20)
        assert r.status_code == 200, r.text
        order = r.json()["order"]
        assert order["gst"] == 27.75
        assert order["shipping"] == 45
        assert order["total"] == 627.75

    def test_order_free_shipping_over_999(self, customer_phone):
        # subtotal 1000 -> gst 50, free shipping, total 1050
        payload = {
            "phone": customer_phone,
            "address": self._addr(name="Free Ship", state="Delhi", pincode="110001", city="Delhi"),
            "items": [{"sku": "TEST-1L", "name": "Ghee 1L", "variant": "1000 ml",
                       "price": 1000, "quantity": 1}],
            "subtotal": 1000,
            "shipping": 250,
            "total": 1250,
            "paymentMethod": "MOCK",
        }
        r = requests.post(f"{API}/orders", json=payload, timeout=20)
        assert r.status_code == 200, r.text
        order = r.json()["order"]
        assert order["gst"] == 50.0
        assert order["shipping"] == 0
        assert order["total"] == 1050.0


# ---------- Invoice PDF ----------
class TestInvoicePdf:
    def test_invoice_pdf_download(self, admin_token, customer_phone):
        # Create an order first
        payload = {
            "phone": customer_phone,
            "address": {
                "name": "PDF Buyer", "phone": "9000000000", "pincode": "600001",
                "city": "Chennai", "state": "Tamil Nadu", "line1": "1 Test St",
            },
            "items": [{"sku": "TEST-500", "name": "Ghee 500 ml", "variant": "500 ml",
                       "price": 555, "quantity": 1}],
            "subtotal": 555, "shipping": 45, "total": 627.75, "paymentMethod": "MOCK",
        }
        r = requests.post(f"{API}/orders", json=payload, timeout=20)
        assert r.status_code == 200, r.text
        order_number = r.json()["order"]["orderNumber"]

        h = {"Authorization": f"Bearer {admin_token}"}
        r = requests.get(f"{API}/admin/orders/{order_number}/invoice.pdf", headers=h, timeout=20)
        assert r.status_code == 200, r.text
        assert "application/pdf" in r.headers.get("content-type", "").lower()
        assert r.content[:4] == b"%PDF"
        # PDF stream is compressed (FlateDecode/ASCII85) so we can't grep raw
        # bytes for "GST". 200 + application/pdf is sufficient per spec.


# ---------- Admin shipping regression ----------
class TestAdminShippingRegression:
    def test_get_and_put_roundtrip_preserves_weightrates(self, admin_token):
        h = {"Authorization": f"Bearer {admin_token}"}
        r = requests.get(f"{API}/admin/shipping-rates", headers=h, timeout=15)
        assert r.status_code == 200, r.text
        rates = r.json()
        assert "weightRates" in rates
        assert "500 ml" in rates["weightRates"]
        assert rates["weightRates"]["500 ml"]["chennai"] == 45
        # PUT the same payload back (round-trip)
        put = requests.put(f"{API}/admin/shipping-rates", headers=h, json=rates, timeout=15)
        assert put.status_code == 200, put.text
        # Re-fetch, weightRates preserved
        r2 = requests.get(f"{API}/admin/shipping-rates", headers=h, timeout=15)
        rates2 = r2.json()
        assert rates2["weightRates"]["1000 ml"]["others"] == 250
        assert rates2.get("southIndiaStates") == rates.get("southIndiaStates")

    def test_download_returns_json(self, admin_token):
        h = {"Authorization": f"Bearer {admin_token}"}
        r = requests.get(f"{API}/admin/shipping-rates/download", headers=h, timeout=15)
        assert r.status_code == 200, r.text
        # Should be valid JSON
        data = json.loads(r.content)
        assert "weightRates" in data

    def test_put_missing_rules_returns_400(self, admin_token):
        h = {"Authorization": f"Bearer {admin_token}"}
        bad = {"defaultCharge": 100}  # no 'rules'
        r = requests.put(f"{API}/admin/shipping-rates", headers=h, json=bad, timeout=15)
        assert r.status_code == 400, r.text
