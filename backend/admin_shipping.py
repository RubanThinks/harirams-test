"""
Admin — shipping rates management (JSON editor + download / upload).
Source of truth: /app/backend/config/shipping_rates.json
"""
import json
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse

from admin_auth import require_admin

CONFIG_PATH = Path(__file__).parent / "config" / "shipping_rates.json"
router = APIRouter(prefix="/admin/shipping-rates", tags=["admin-shipping"])


@router.get("")
async def get_rates(_: dict = Depends(require_admin)):
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


@router.get("/download")
async def download_rates(_: dict = Depends(require_admin)):
    return FileResponse(
        CONFIG_PATH,
        filename="shipping_rates.json",
        media_type="application/json",
    )


@router.put("")
async def put_rates(payload: dict, _: dict = Depends(require_admin)):
    # Basic shape validation
    for key in ("defaultCharge", "rules"):
        if key not in payload:
            raise HTTPException(status_code=400, detail=f"Missing '{key}'")
    if not isinstance(payload.get("rules"), list):
        raise HTTPException(status_code=400, detail="'rules' must be a list")
    with open(CONFIG_PATH, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)
    return {"success": True}


@router.post("/upload")
async def upload_rates(file: UploadFile = File(...), _: dict = Depends(require_admin)):
    content = await file.read()
    try:
        parsed = json.loads(content)
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=400, detail=f"Invalid JSON: {e}")
    if not isinstance(parsed, dict) or "rules" not in parsed or "defaultCharge" not in parsed:
        raise HTTPException(status_code=400, detail="Missing required fields (rules, defaultCharge)")
    if not isinstance(parsed.get("rules"), list):
        raise HTTPException(status_code=400, detail="'rules' must be a list")
    with open(CONFIG_PATH, "w", encoding="utf-8") as f:
        json.dump(parsed, f, indent=2, ensure_ascii=False)
    return {"success": True}


def register(api: APIRouter):
    api.include_router(router)
