"""
Admin — shipping rates management (JSON editor + download / upload).
Source of truth: /app/backend/config/shipping_rates.json
"""
import json
import os
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse

from admin_auth import require_admin

CONFIG_PATH = Path(__file__).parent / "config" / "shipping_rates.json"
router = APIRouter(prefix="/admin/shipping-rates", tags=["admin-shipping"])


def _write_atomic(payload: dict):
    tmp = CONFIG_PATH.with_suffix(".json.tmp")
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)
    os.replace(tmp, CONFIG_PATH)  # atomic — readers never see a partial file


ZONES = ("chennai", "tn", "south_india", "others")


def _validate(payload):
    if not isinstance(payload.get("rules"), list):
        raise HTTPException(status_code=400, detail="'rules' must be a list")
    wr = payload.get("weightRates")
    if wr is not None:
        if not isinstance(wr, dict):
            raise HTTPException(status_code=400, detail="'weightRates' must be an object keyed by variant")
        for variant, zones in wr.items():
            if not isinstance(zones, dict) or any(z not in ZONES for z in zones):
                raise HTTPException(status_code=400, detail=f"weightRates['{variant}'] must map zones {ZONES} to numbers")
            for z, v in zones.items():
                if not isinstance(v, (int, float)) or v < 0:
                    raise HTTPException(status_code=400, detail=f"weightRates['{variant}']['{z}'] must be a non-negative number")
    si = payload.get("southIndiaStates")
    if si is not None and not (isinstance(si, list) and all(isinstance(s, str) for s in si)):
        raise HTTPException(status_code=400, detail="'southIndiaStates' must be a list of state names")


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
    _validate(payload)
    _write_atomic(payload)
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
    _validate(parsed)
    _write_atomic(parsed)
    return {"success": True}


def register(api: APIRouter):
    api.include_router(router)
