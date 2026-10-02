"""
Emergent Object Storage client (session-scoped storage_key, init once).
All paths prefixed with APP_NAME to avoid bucket collisions.
"""
import os

import requests

STORAGE_BASE = (os.environ.get("INTEGRATION_PROXY_URL") or "").strip() or "https://integrations.emergentagent.com"
STORAGE_URL = STORAGE_BASE.rstrip("/") + "/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
APP_NAME = "harirams-ghee"

storage_key = None


def init_storage(force: bool = False):
    """Call ONCE at startup. force=True mints a new key (recovery from inactive key)."""
    global storage_key
    if storage_key and not force:
        return storage_key
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
    resp.raise_for_status()
    storage_key = resp.json()["storage_key"]
    return storage_key


def get_object(path: str) -> tuple:
    """Download file. Returns (content_bytes, content_type).

    Automatically re-mints the session-scoped storage key once if the cached
    key is rejected (401/403) or the storage service returns a transient 5xx.
    This recovers from "image goes missing after some time" caused by the
    cached key going inactive between backend restarts.
    """
    def _fetch(k: str) -> requests.Response:
        return requests.get(
            f"{STORAGE_URL}/objects/{path}",
            headers={"X-Storage-Key": k},
            timeout=60,
        )

    key = init_storage()
    resp = _fetch(key)
    if resp.status_code in (401, 403) or resp.status_code >= 500:
        # Session key expired / inactive — mint a fresh one and retry once.
        new_key = init_storage(force=True)
        resp = _fetch(new_key)
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")


def put_object(path: str, data: bytes, content_type: str) -> dict:  # noqa: F811
    """Upload file. Auto-recovers from an inactive storage key."""
    def _put(k: str) -> requests.Response:
        return requests.put(
            f"{STORAGE_URL}/objects/{path}",
            headers={"X-Storage-Key": k, "Content-Type": content_type},
            data=data,
            timeout=120,
        )

    key = init_storage()
    resp = _put(key)
    if resp.status_code in (401, 403) or resp.status_code >= 500:
        new_key = init_storage(force=True)
        resp = _put(new_key)
    resp.raise_for_status()
    return resp.json()
