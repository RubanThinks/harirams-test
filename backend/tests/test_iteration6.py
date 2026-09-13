"""
Iteration 6 tests — Admin 2FA + multi-image products + address PDF (mixed page sizes).
"""
import io
import os
import re
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    # Read from frontend .env
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
                break

ADMIN_USER = "admin"
ADMIN_PASS = "Harirams0507"


def _step1():
    r = requests.post(f"{BASE_URL}/api/admin/auth/login",
                      json={"username": ADMIN_USER, "password": ADMIN_PASS}, timeout=15)
    return r


def _login_and_get_token():
    r1 = _step1()
    assert r1.status_code == 200, r1.text
    d = r1.json()
    r2 = requests.post(f"{BASE_URL}/api/admin/auth/verify-otp",
                       json={"sessionId": d["sessionId"], "otp": d["mockOtp"]}, timeout=15)
    assert r2.status_code == 200, r2.text
    return r2.json()["token"]


@pytest.fixture(scope="module")
def token():
    return _login_and_get_token()


@pytest.fixture(scope="module")
def auth(token):
    return {"Authorization": f"Bearer {token}"}


# ---------------- 2FA ----------------
class TestAdmin2FA:
    def test_login_returns_otp_challenge(self):
        r = _step1()
        assert r.status_code == 200
        d = r.json()
        assert d["otpRequired"] is True
        assert d["otpTarget"] == "+91-9500049550"
        assert d["ttlMinutes"] == 5
        assert re.fullmatch(r"\d{6}", d["mockOtp"])
        assert isinstance(d["sessionId"], str) and len(d["sessionId"]) > 8
        assert "token" not in d  # no JWT at step 1

    def test_login_wrong_password_no_leak(self):
        r = requests.post(f"{BASE_URL}/api/admin/auth/login",
                          json={"username": ADMIN_USER, "password": "wrong-pass"}, timeout=15)
        assert r.status_code == 401
        assert "mockOtp" not in r.text
        assert "sessionId" not in r.text

    def test_verify_otp_success_and_reuse_blocked(self):
        r1 = _step1()
        d = r1.json()
        sid, otp = d["sessionId"], d["mockOtp"]
        r2 = requests.post(f"{BASE_URL}/api/admin/auth/verify-otp",
                           json={"sessionId": sid, "otp": otp}, timeout=15)
        assert r2.status_code == 200
        body = r2.json()
        assert body.get("tokenType") == "Bearer"
        assert body["user"]["role"] == "admin"
        # Reuse same sessionId -> 404
        r3 = requests.post(f"{BASE_URL}/api/admin/auth/verify-otp",
                           json={"sessionId": sid, "otp": otp}, timeout=15)
        assert r3.status_code == 404

    def test_verify_otp_wrong_returns_401(self):
        d = _step1().json()
        r = requests.post(f"{BASE_URL}/api/admin/auth/verify-otp",
                          json={"sessionId": d["sessionId"], "otp": "000000" if d["mockOtp"] != "000000" else "111111"},
                          timeout=15)
        assert r.status_code == 401

    def test_verify_unknown_session_404(self):
        r = requests.post(f"{BASE_URL}/api/admin/auth/verify-otp",
                          json={"sessionId": "does-not-exist-xyz", "otp": "123456"}, timeout=15)
        assert r.status_code == 404

    def test_jwt_works_on_protected(self, auth):
        r = requests.get(f"{BASE_URL}/api/admin/auth/me", headers=auth, timeout=15)
        assert r.status_code == 200
        assert r.json()["role"] == "admin"
        r2 = requests.get(f"{BASE_URL}/api/admin/products", headers=auth, timeout=15)
        assert r2.status_code == 200


# ---------------- Multi-image products ----------------
class TestMultiImageProducts:
    def test_list_normalized_images(self, auth):
        r = requests.get(f"{BASE_URL}/api/admin/products", headers=auth, timeout=15)
        assert r.status_code == 200
        products = r.json().get("products", [])
        assert products
        for p in products:
            assert "images" in p and isinstance(p["images"], list)
            if p["images"]:
                mains = [i for i in p["images"] if i.get("isMain")]
                assert len(mains) == 1
                assert p["image"] == mains[0]["url"]

    def test_upload_add_image_and_persist(self, auth):
        # pick first product
        r = requests.get(f"{BASE_URL}/api/admin/products", headers=auth, timeout=15)
        products = r.json()["products"]
        sku = products[0]["sku"]
        original = products[0]
        # upload
        png = b"\x89PNG\r\n\x1a\n" + b"\x00" * 128
        files = {"file": ("test.png", png, "image/png")}
        data = {"sku": sku}
        r = requests.post(f"{BASE_URL}/api/admin/products/upload-image",
                          headers=auth, files=files, data=data, timeout=30)
        assert r.status_code == 200, r.text
        new_url = r.json()["url"]
        assert new_url.startswith("/api/uploads/products/")

        # PUT product with new image added as main
        payload = {
            "sku": original["sku"],
            "name": original["name"],
            "variant": original.get("variant", ""),
            "price": original.get("price", 0),
            "mrp": original.get("mrp"),
            "description": original.get("description", ""),
            "idealFor": original.get("idealFor", ""),
            "image": original.get("image", ""),
            "images": [{"url": i["url"], "isMain": False} for i in original.get("images", [])]
                       + [{"url": new_url, "isMain": True}],
            "bestSeller": original.get("bestSeller", False),
            "available": original.get("available", True),
            "displaySequence": original.get("displaySequence", 999),
            "family": original.get("family", "ghee"),
        }
        r = requests.put(f"{BASE_URL}/api/admin/products/{sku}", headers=auth, json=payload, timeout=15)
        assert r.status_code == 200, r.text
        prod = r.json()["product"]
        assert any(i["url"] == new_url and i["isMain"] for i in prod["images"])
        assert prod["image"] == new_url
        mains = [i for i in prod["images"] if i["isMain"]]
        assert len(mains) == 1  # exactly one main echoed

        # GET back
        r = requests.get(f"{BASE_URL}/api/admin/products/{sku}", headers=auth, timeout=15)
        assert r.status_code == 200
        got = r.json()
        assert got["image"] == new_url

        # delete just that image → main re-elects
        r = requests.post(f"{BASE_URL}/api/admin/products/{sku}/delete-image",
                          headers=auth, json={"url": new_url}, timeout=15)
        assert r.status_code == 200
        prod2 = r.json()["product"]
        assert not any(i["url"] == new_url for i in prod2["images"])
        if prod2["images"]:
            assert sum(1 for i in prod2["images"] if i["isMain"]) == 1

    def test_trim_beyond_six_images(self, auth):
        r = requests.get(f"{BASE_URL}/api/admin/products", headers=auth, timeout=15)
        original = r.json()["products"][0]
        sku = original["sku"]
        fake_imgs = [{"url": f"/api/uploads/products/fake_{i}.png", "isMain": i == 0} for i in range(10)]
        payload = {
            "sku": sku, "name": original["name"], "variant": original.get("variant", ""),
            "price": original.get("price", 0), "images": fake_imgs,
            "family": original.get("family", "ghee"),
        }
        r = requests.put(f"{BASE_URL}/api/admin/products/{sku}", headers=auth, json=payload, timeout=15)
        assert r.status_code == 200
        prod = r.json()["product"]
        assert len(prod["images"]) <= 6

        # restore to real main
        payload["images"] = [{"url": original["image"], "isMain": True}] if original.get("image") else []
        requests.put(f"{BASE_URL}/api/admin/products/{sku}", headers=auth, json=payload, timeout=15)


# ---------------- Address PDF ----------------
def _seed_order(order_number: str, city="Chennai"):
    """Insert a minimal CONFIRMED order via storefront /api/orders flow is complex;
    hit the DB directly via a public admin path is not available. Instead, use
    Mongo through motor is not possible from tests here. Use the /api/orders
    customer flow."""
    pass


class TestAddressPDF:
    """Uses already-existing orders in DB. If none exist, seed a few via the
    storefront checkout endpoints. Fallback: create orders through raw mongo
    would require a motor client — instead just skip gracefully."""

    def _existing_order_numbers(self, auth, n):
        r = requests.get(f"{BASE_URL}/api/admin/orders/pending", headers=auth, timeout=15)
        if r.status_code != 200:
            return []
        data = r.json()
        orders = data.get("orders") if isinstance(data, dict) else data
        return [o["orderNumber"] for o in (orders or [])][:n]

    def test_empty_list_400(self, auth):
        r = requests.post(f"{BASE_URL}/api/admin/orders/print-address",
                          headers=auth, json={"orderNumbers": []}, timeout=15)
        assert r.status_code == 400

    def test_single_a5(self, auth):
        nums = self._existing_order_numbers(auth, 1)
        if not nums:
            pytest.skip("no confirmed orders to test with")
        r = requests.post(f"{BASE_URL}/api/admin/orders/print-address",
                          headers=auth, json={"orderNumbers": nums}, timeout=30)
        assert r.status_code == 200
        assert r.headers["content-type"].startswith("application/pdf")
        assert r.content.startswith(b"%PDF")
        self._single_size = len(r.content)

    def test_multi_page_mixed(self, auth):
        nums = self._existing_order_numbers(auth, 7)
        if len(nums) < 7:
            pytest.skip(f"need 7 confirmed orders, have {len(nums)}")
        r = requests.post(f"{BASE_URL}/api/admin/orders/print-address",
                          headers=auth, json={"orderNumbers": nums}, timeout=30)
        assert r.status_code == 200
        assert r.content.startswith(b"%PDF")
        # multi-page => bigger than 1-address PDF
        r1 = requests.post(f"{BASE_URL}/api/admin/orders/print-address",
                           headers=auth, json={"orderNumbers": nums[:1]}, timeout=30)
        assert len(r.content) > len(r1.content)


# ---------------- Regression ----------------
class TestRegression:
    def test_landing_products(self):
        r = requests.get(f"{BASE_URL}/api/products", timeout=15)
        assert r.status_code == 200
        assert len(r.json().get("products", [])) > 0

    def test_content_manifest(self):
        r = requests.get(f"{BASE_URL}/api/content/manifest", timeout=15)
        assert r.status_code == 200
