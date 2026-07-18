"""
Admin — product catalog CRUD.
Source of truth: /app/backend/config/products.json (user's Phase 1 choice).
Product images stored on disk: /app/backend/uploads/products/*
Served via /api/uploads/products/* mount.
"""
import json
import os
import re
import uuid
from pathlib import Path
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from pydantic import BaseModel, Field

from admin_auth import require_admin

BACKEND_DIR = Path(__file__).parent
CONFIG_PATH = BACKEND_DIR / "config" / "products.json"
UPLOAD_DIR = BACKEND_DIR / "uploads" / "products"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXT = {".png", ".jpg", ".jpeg", ".webp"}
IMAGE_URL_PREFIX = "/api/uploads/products/"

router = APIRouter(prefix="/admin/products", tags=["admin-products"])


class ProductIn(BaseModel):
    sku: str
    name: str
    variant: str
    price: float
    mrp: Optional[float] = None
    description: Optional[str] = ""
    idealFor: Optional[str] = ""
    image: Optional[str] = ""
    bestSeller: bool = False
    available: bool = True
    displaySequence: int = 999
    family: str = "ghee"


def _read() -> dict:
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def _write(data: dict):
    with open(CONFIG_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def _sanitize_ext(filename: str) -> str:
    ext = Path(filename).suffix.lower()
    return ext if ext in ALLOWED_EXT else ".png"


@router.get("")
async def list_products(_: dict = Depends(require_admin)):
    return _read()


@router.get("/{sku}")
async def get_product(sku: str, _: dict = Depends(require_admin)):
    data = _read()
    for p in data.get("products", []):
        if p.get("sku") == sku:
            return p
    raise HTTPException(status_code=404, detail="Product not found")


@router.post("")
async def create_product(prod: ProductIn, _: dict = Depends(require_admin)):
    data = _read()
    products = data.get("products", [])
    if any(p.get("sku") == prod.sku for p in products):
        raise HTTPException(status_code=409, detail=f"SKU '{prod.sku}' already exists")
    products.append(prod.model_dump())
    products.sort(key=lambda p: p.get("displaySequence", 999))
    data["products"] = products
    _write(data)
    return {"success": True, "product": prod.model_dump()}


@router.put("/{sku}")
async def update_product(sku: str, prod: ProductIn, _: dict = Depends(require_admin)):
    data = _read()
    products = data.get("products", [])
    idx = next((i for i, p in enumerate(products) if p.get("sku") == sku), -1)
    if idx < 0:
        raise HTTPException(status_code=404, detail="Product not found")
    products[idx] = prod.model_dump()
    products.sort(key=lambda p: p.get("displaySequence", 999))
    data["products"] = products
    _write(data)
    return {"success": True, "product": prod.model_dump()}


@router.delete("/{sku}")
async def delete_product(sku: str, _: dict = Depends(require_admin)):
    data = _read()
    products = data.get("products", [])
    new_list = [p for p in products if p.get("sku") != sku]
    if len(new_list) == len(products):
        raise HTTPException(status_code=404, detail="Product not found")
    data["products"] = new_list
    _write(data)
    return {"success": True, "sku": sku}


@router.post("/upload-image")
async def upload_image(
    file: UploadFile = File(...),
    sku: str = Form(...),
    _: dict = Depends(require_admin),
):
    ext = _sanitize_ext(file.filename or "")
    safe_sku = re.sub(r"[^A-Za-z0-9_-]", "_", sku)
    filename = f"{safe_sku}_{uuid.uuid4().hex[:8]}{ext}"
    target = UPLOAD_DIR / filename
    content = await file.read()
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Image too large (max 5 MB)")
    with open(target, "wb") as f:
        f.write(content)
    return {"success": True, "url": f"{IMAGE_URL_PREFIX}{filename}", "size": len(content)}


def register(api: APIRouter):
    api.include_router(router)
