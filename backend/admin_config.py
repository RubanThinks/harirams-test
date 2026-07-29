"""
Admin — universal config-file browser and editor.
Lists every JSON file in /app/backend/config/ (and legal/*.md files) and
allows the admin to view/save any of them with JSON validation.
"""
import json
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Any

from admin_auth import require_admin

CONFIG_DIR = Path(__file__).parent / "config"
router = APIRouter(prefix="/admin/config", tags=["admin-config"])


class SaveRequest(BaseModel):
    content: Any  # JSON payload (dict/list/scalar) OR string (for .md)
    kind: str = "json"  # "json" or "text"


def _list_config_files():
    """Recursively list config files under /app/backend/config/ (json + md)."""
    out = []
    for p in sorted(CONFIG_DIR.rglob("*")):
        if not p.is_file():
            continue
        if p.suffix.lower() not in {".json", ".md"}:
            continue
        rel = p.relative_to(CONFIG_DIR).as_posix()
        out.append({
            "path": rel,
            "size": p.stat().st_size,
            "type": p.suffix.lstrip("."),
        })
    return out


def _resolve(rel_path: str) -> Path:
    """Safe path resolution — must stay under CONFIG_DIR."""
    target = (CONFIG_DIR / rel_path).resolve()
    if CONFIG_DIR.resolve() not in target.parents and target != CONFIG_DIR.resolve():
        raise HTTPException(status_code=400, detail="Invalid path")
    if target.suffix.lower() not in {".json", ".md"}:
        raise HTTPException(status_code=400, detail="Only .json and .md files can be edited")
    return target


@router.get("")
async def list_files(_: dict = Depends(require_admin)):
    return {"files": _list_config_files()}


@router.get("/read")
async def read_file(path: str, _: dict = Depends(require_admin)):
    target = _resolve(path)
    if not target.exists():
        raise HTTPException(status_code=404, detail="File not found")
    with open(target, "r", encoding="utf-8") as f:
        raw = f.read()
    parsed = None
    if target.suffix.lower() == ".json":
        try:
            parsed = json.loads(raw)
        except json.JSONDecodeError:
            parsed = None  # let admin see raw text and fix
    return {
        "path": path,
        "type": target.suffix.lstrip("."),
        "size": len(raw),
        "raw": raw,
        "parsed": parsed,
    }


@router.put("/save")
async def save_file(path: str, req: SaveRequest, _: dict = Depends(require_admin)):
    target = _resolve(path)
    if target.suffix.lower() == ".json":
        # Accept either parsed content OR a raw JSON string
        if isinstance(req.content, str):
            try:
                parsed = json.loads(req.content)
            except json.JSONDecodeError as e:
                raise HTTPException(status_code=400, detail=f"Invalid JSON: {e}")
            payload = parsed
        else:
            payload = req.content
        with open(target, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2, ensure_ascii=False)
    else:
        # Markdown / text
        if not isinstance(req.content, str):
            raise HTTPException(status_code=400, detail="Text file requires a string body")
        with open(target, "w", encoding="utf-8") as f:
            f.write(req.content)
    return {"success": True, "path": path, "size": target.stat().st_size}


@router.get("/download")
async def download_file(path: str, _: dict = Depends(require_admin)):
    target = _resolve(path)
    if not target.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(target, filename=target.name)


def register(api: APIRouter):
    api.include_router(router)
