"""FastAPI backend for the stage light image enhancer.

The image processing logic lives in ``src`` and is shared with the Streamlit
prototype. This module only exposes it over HTTP and serves the static frontend.
"""

from __future__ import annotations

import secrets
import time
from io import BytesIO
from pathlib import Path
from threading import Lock

import numpy as np
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import FileResponse, Response
from fastapi.staticfiles import StaticFiles
from PIL import Image, UnidentifiedImageError
from pydantic import BaseModel, Field

from src import superres
from src.pipeline import SUPPORTED_MODES, _analyze_color_cast, enhance_image
from src.utils import pil_to_png_bytes


BASE_DIR = Path(__file__).parent
WEB_DIR = BASE_DIR / "web"

MAX_UPLOAD_BYTES = 20 * 1024 * 1024
PREVIEW_MAX_EDGE = 1400
SESSION_TTL_SECONDS = 60 * 30
MAX_SESSIONS = 24

MODE_LABELS = {
    "auto": "整體白平衡",
    "purple": "紫色燈偏",
    "yellow": "黃光偏色",
    "red": "紅光偏色",
    "cyan": "藍綠光偏色",
    "low_light": "低光源照片",
}


class EnhanceParams(BaseModel):
    """Enhancement controls sent by the frontend."""

    mode: str = "auto"
    correction_strength: int = Field(default=70, ge=0, le=100)
    preserve_stage_light: int = Field(default=10, ge=0, le=100)
    brightness: int = Field(default=0, ge=-100, le=100)
    contrast: int = Field(default=0, ge=-100, le=100)
    saturation: int = Field(default=0, ge=-100, le=100)
    use_clahe: bool = True
    use_denoise: bool = False
    use_highlight_recovery: bool = True
    highlight_strength: int = Field(default=35, ge=0, le=100)
    use_quality_restore: bool = True
    quality_strength: int = Field(default=35, ge=0, le=100)
    use_sharpen: bool = True
    # Output-stage only: the interactive preview is downscaled anyway, so
    # upscaling it would cost time and show nothing.
    upscale_2x: bool = False


class ImageSession:
    """A single uploaded image kept in memory for interactive editing."""

    def __init__(self, full: Image.Image) -> None:
        self.full = full
        self.preview = _downscale(full, PREVIEW_MAX_EDGE)
        self.created_at = time.time()


_sessions: dict[str, ImageSession] = {}
_sessions_lock = Lock()


def _downscale(image: Image.Image, max_edge: int) -> Image.Image:
    """Shrink an image so its longest edge is at most ``max_edge`` pixels."""
    longest = max(image.size)
    if longest <= max_edge:
        return image.copy()

    scale = max_edge / longest
    new_size = (max(1, round(image.width * scale)), max(1, round(image.height * scale)))
    return image.resize(new_size, Image.LANCZOS)


def _evict_stale_sessions() -> None:
    """Drop expired sessions, then the oldest ones if still over capacity."""
    now = time.time()
    for image_id in [k for k, v in _sessions.items() if now - v.created_at > SESSION_TTL_SECONDS]:
        _sessions.pop(image_id, None)

    while len(_sessions) > MAX_SESSIONS:
        oldest = min(_sessions, key=lambda key: _sessions[key].created_at)
        _sessions.pop(oldest, None)


def _get_session(image_id: str) -> ImageSession:
    with _sessions_lock:
        session = _sessions.get(image_id)
        if session is None:
            raise HTTPException(status_code=404, detail="圖片工作階段已過期，請重新上傳。")
        return session


def _png_response(image: Image.Image) -> Response:
    return Response(content=pil_to_png_bytes(image), media_type="image/png")


app = FastAPI(title="演唱會影像修復工具", docs_url="/api/docs", openapi_url="/api/openapi.json")


@app.post("/api/images")
async def create_image_session(file: UploadFile = File(...)) -> dict:
    """Accept an upload, analyze its color cast, and open an editing session."""
    raw = await file.read()
    if not raw:
        raise HTTPException(status_code=400, detail="檔案是空的。")
    if len(raw) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="圖片超過 20 MB 上限。")

    try:
        image = Image.open(BytesIO(raw)).convert("RGB")
    except UnidentifiedImageError:
        raise HTTPException(status_code=400, detail="無法讀取這個檔案，請上傳有效的 JPG 或 PNG 圖片。")

    session = ImageSession(image)
    image_id = secrets.token_urlsafe(12)

    with _sessions_lock:
        _sessions[image_id] = session
        _evict_stale_sessions()

    detected_mode, severity = _analyze_color_cast(session.preview)

    return {
        "image_id": image_id,
        "width": image.width,
        "height": image.height,
        "detected_mode": detected_mode,
        "detected_label": MODE_LABELS.get(detected_mode, MODE_LABELS["auto"]),
        "detected_strength": int(round(severity * 100)),
    }


@app.get("/api/images/{image_id}/original")
def get_original_preview(image_id: str) -> Response:
    """Return the downscaled original, used as the 'before' side of the compare view."""
    return _png_response(_get_session(image_id).preview)


@app.post("/api/images/{image_id}/preview")
def render_preview(image_id: str, params: EnhanceParams) -> Response:
    """Enhance the downscaled copy for fast interactive feedback."""
    return _png_response(_enhance(_get_session(image_id).preview, params))


@app.post("/api/images/{image_id}/render")
def render_full(image_id: str, params: EnhanceParams) -> Response:
    """Enhance the original-resolution image for download."""
    result = _enhance(_get_session(image_id).full, params)

    if params.upscale_2x:
        # Upscale last, so the colour cast and noise are already gone rather
        # than being magnified along with the detail.
        result = Image.fromarray(superres.upscale_2x(result))

    return _png_response(result)


@app.get("/api/capabilities")
def capabilities() -> dict:
    """Report which optional features this deployment can actually deliver."""
    return {"superres": superres.is_available()}


def _enhance(image: Image.Image, params: EnhanceParams) -> Image.Image:
    if params.mode not in SUPPORTED_MODES:
        raise HTTPException(status_code=400, detail=f"不支援的修復模式：{params.mode}")

    try:
        result: np.ndarray = enhance_image(
            image=image,
            mode=params.mode,
            brightness=params.brightness,
            contrast=params.contrast,
            saturation=params.saturation,
            use_clahe=params.use_clahe,
            use_denoise=params.use_denoise,
            use_highlight_recovery=params.use_highlight_recovery,
            highlight_strength=params.highlight_strength,
            use_quality_restore=params.use_quality_restore,
            quality_strength=params.quality_strength,
            use_sharpen=params.use_sharpen,
            correction_strength=params.correction_strength,
            preserve_stage_light=params.preserve_stage_light,
        )
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))

    return Image.fromarray(result)


@app.get("/")
def index() -> FileResponse:
    return FileResponse(WEB_DIR / "index.html")


app.mount("/", StaticFiles(directory=WEB_DIR), name="web")
