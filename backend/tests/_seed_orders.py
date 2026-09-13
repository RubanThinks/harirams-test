"""Seed 7 CONFIRMED orders via the public storefront /api/orders flow."""
import os, requests

BASE = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE:
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE = line.split("=", 1)[1].strip().rstrip("/")


def seed(n=7):
    created = []
    # get a product
    p = requests.get(f"{BASE}/api/products", timeout=10).json()["products"][0]
    for i in range(n):
        phone = f"98700000{i:02d}"
        requests.post(f"{BASE}/api/auth/send-otp", json={"phone": phone}, timeout=10)
        requests.post(f"{BASE}/api/auth/verify-otp", json={"phone": phone, "otp": "123456"}, timeout=10)
        payload = {
            "phone": phone,
            "address": {
                "name": f"TEST Buyer {i}",
                "line1": f"{i+1} MG Road",
                "line2": "Flat 3B",
                "landmark": "Park",
                "city": "Chennai",
                "state": "Tamil Nadu",
                "pincode": "600001",
            },
            "items": [{
                "sku": p["sku"], "name": p["name"], "variant": p.get("variant", ""),
                "price": p["price"], "quantity": 1,
            }],
            "subtotal": p["price"],
            "shipping": 0,
            "total": p["price"],
            "paymentMethod": "MOCK",
        }
        r = requests.post(f"{BASE}/api/orders", json=payload, timeout=15)
        if r.status_code == 200:
            created.append(r.json()["order"]["orderNumber"])
        else:
            print("FAIL", r.status_code, r.text)
    print("created:", created)
    return created


if __name__ == "__main__":
    seed(7)
