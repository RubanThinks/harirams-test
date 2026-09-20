"""Autouse fixture: snapshot mutable config files before each test and restore
them afterwards. Several admin tests PUT products.json / shipping_rates.json
against the live backend; without restore-on-failure the whole suite inherits
clobbered state (this caused cross-test failures in the past)."""
from pathlib import Path

import pytest

CONFIG_DIR = Path(__file__).parent.parent / "config"
WATCHED = ["products.json", "shipping_rates.json", "company.json"]


@pytest.fixture(autouse=True)
def _restore_config_files():
    snapshots = {
        name: (CONFIG_DIR / name).read_bytes()
        for name in WATCHED
        if (CONFIG_DIR / name).exists()
    }
    yield
    for name, data in snapshots.items():
        (CONFIG_DIR / name).write_bytes(data)
