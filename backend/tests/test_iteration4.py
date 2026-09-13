"""Iteration 4 tests: legal endpoints + admin config editor + webp assets."""
import os
import json
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_USER = "admin"
ADMIN_PASS = "Harirams0507"


@pytest.fixture(scope="module")
def s():
    return requests.Session()


@pytest.fixture(scope="module")
def admin_token(s):
    # Two-step 2FA: password → verify OTP with the mockOtp echoed in response.
    r = s.post(f"{API}/admin/auth/login", json={"username": ADMIN_USER, "password": ADMIN_PASS})
    assert r.status_code == 200, r.text
    step1 = r.json()
    assert step1.get("otpRequired") is True and "mockOtp" in step1
    r2 = s.post(f"{API}/admin/auth/verify-otp",
                json={"sessionId": step1["sessionId"], "otp": step1["mockOtp"]})
    assert r2.status_code == 200, r2.text
    return r2.json()["token"]


@pytest.fixture(scope="module")
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


# ---------------- LEGAL ----------------
def test_legal_manifest(s):
    r = s.get(f"{API}/legal/manifest")
    assert r.status_code == 200
    d = r.json()
    ids = {x["id"] for x in d.get("documents", [])}
    expected = {"terms_and_conditions", "privacy_policy", "returns_refunds",
                "shipping_and_delivery", "payment_policy"}
    assert expected.issubset(ids), f"missing ids: {expected - ids}"
    assert len(d["documents"]) >= 5


@pytest.mark.parametrize("doc_id", [
    "terms_and_conditions", "privacy_policy", "returns_refunds",
    "shipping_and_delivery", "payment_policy",
])
def test_legal_document(s, doc_id):
    r = s.get(f"{API}/legal/{doc_id}")
    assert r.status_code == 200, r.text
    d = r.json()
    assert "markdown" in d and isinstance(d["markdown"], str) and len(d["markdown"]) > 10
    assert "title" in d
    assert "version" in d
    assert "effectiveDate" in d


def test_legal_unknown_404(s):
    r = s.get(f"{API}/legal/unknown_slug_xyz")
    assert r.status_code == 404


# ---------------- ADMIN CONFIG ----------------
def test_admin_config_list_requires_auth(s):
    r = s.get(f"{API}/admin/config")
    assert r.status_code in (401, 403)


def test_admin_config_list(s, admin_headers):
    r = s.get(f"{API}/admin/config", headers=admin_headers)
    assert r.status_code == 200
    files = r.json()["files"]
    assert len(files) >= 25, f"only {len(files)} files"
    paths = {f["path"] for f in files}
    # Top-level configs
    assert "footer.json" in paths
    assert "products.json" in paths
    # Nested legal files
    assert "legal/legal_manifest.json" in paths
    assert "legal/terms_and_conditions.json" in paths
    assert "legal/terms_and_conditions.md" in paths
    for f in files:
        assert "size" in f and "type" in f


def test_admin_config_path_traversal_blocked(s, admin_headers):
    r = s.get(f"{API}/admin/config/read", params={"path": "../server.py"}, headers=admin_headers)
    assert r.status_code == 400


def test_admin_config_read_footer(s, admin_headers):
    r = s.get(f"{API}/admin/config/read", params={"path": "footer.json"}, headers=admin_headers)
    assert r.status_code == 200
    d = r.json()
    assert "raw" in d and "parsed" in d
    assert isinstance(d["parsed"], dict)
    assert "brandLine" in d["parsed"]


def test_admin_config_save_json_roundtrip(s, admin_headers):
    # read original
    r0 = s.get(f"{API}/admin/config/read", params={"path": "footer.json"}, headers=admin_headers)
    original = r0.json()["parsed"]
    modified = dict(original)
    modified["_test_marker"] = "TEST_iter4"
    # save
    r = s.put(f"{API}/admin/config/save", params={"path": "footer.json"},
              json={"content": modified, "kind": "json"}, headers=admin_headers)
    assert r.status_code == 200, r.text
    # read back
    r2 = s.get(f"{API}/admin/config/read", params={"path": "footer.json"}, headers=admin_headers)
    assert r2.json()["parsed"].get("_test_marker") == "TEST_iter4"
    # restore
    r3 = s.put(f"{API}/admin/config/save", params={"path": "footer.json"},
               json={"content": original, "kind": "json"}, headers=admin_headers)
    assert r3.status_code == 200


def test_admin_config_save_invalid_json(s, admin_headers):
    r = s.put(f"{API}/admin/config/save", params={"path": "footer.json"},
              json={"content": "{not: json,,", "kind": "json"}, headers=admin_headers)
    assert r.status_code == 400


def test_admin_config_save_md_text(s, admin_headers):
    r0 = s.get(f"{API}/admin/config/read",
               params={"path": "legal/terms_and_conditions.md"}, headers=admin_headers)
    assert r0.status_code == 200
    original = r0.json()["raw"]
    new_text = original + "\n\n<!-- TEST_iter4 marker -->"
    r = s.put(f"{API}/admin/config/save",
              params={"path": "legal/terms_and_conditions.md"},
              json={"content": new_text, "kind": "text"}, headers=admin_headers)
    assert r.status_code == 200
    r2 = s.get(f"{API}/admin/config/read",
               params={"path": "legal/terms_and_conditions.md"}, headers=admin_headers)
    assert "TEST_iter4 marker" in r2.json()["raw"]
    # restore
    s.put(f"{API}/admin/config/save",
          params={"path": "legal/terms_and_conditions.md"},
          json={"content": original, "kind": "text"}, headers=admin_headers)


def test_admin_config_download(s, admin_headers):
    r = s.get(f"{API}/admin/config/download",
              params={"path": "footer.json"}, headers=admin_headers)
    assert r.status_code == 200
    assert "footer.json" in r.headers.get("content-disposition", "")


# ---------------- WEBP ASSETS ----------------
@pytest.mark.parametrize("url", [
    "/assets/hero/mother_daughter/desktop.webp",
    "/assets/hero/mother_daughter/mobile.webp",
    "/assets/hero/mother_daughter/tablet.webp",
])
def test_webp_hero_served(s, url):
    r = s.get(f"{BASE_URL}{url}")
    assert r.status_code == 200, f"{url}: {r.status_code}"
    ct = r.headers.get("content-type", "")
    assert "webp" in ct.lower() or r.content[:4] == b"RIFF", f"{url} ct={ct}"


def test_navigation_shop_url_updated(s):
    r = s.get(f"{API}/config/navigation")
    assert r.status_code == 200
    items = r.json()["items"]
    shop = [x for x in items if x["title"].lower() == "shop"]
    assert shop and shop[0]["url"] == "/#products"


def test_footer_customer_care_updated(s):
    r = s.get(f"{API}/config/footer")
    assert r.status_code == 200
    urls = {x["url"] for x in r.json()["customerCare"]}
    for u in ["/shipping-delivery", "/returns-refunds", "/payment-policy",
              "/terms-and-conditions", "/privacy-policy"]:
        assert u in urls, f"missing {u}"
