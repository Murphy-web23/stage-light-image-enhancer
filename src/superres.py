"""2x upscaling with OpenCV's dnn_superres, falling back to Lanczos.

The model file lives outside the repository's Python code because it is a
binary artifact; if it is missing, or the installed OpenCV build has no
contrib modules, everything here degrades to classical interpolation rather
than failing, so the app keeps working on a plain opencv-python install.
"""

from __future__ import annotations

import shutil
import tempfile
from pathlib import Path

import cv2
import numpy as np

from src.utils import ensure_rgb_array

MODEL_PATH = Path(__file__).resolve().parent.parent / "models" / "FSRCNN_x2.pb"
MODEL_NAME = "fsrcnn"
SCALE = 2

# Tile size in source pixels. Upscaling a whole phone photo in one call would
# allocate hundreds of megabytes of intermediate blobs, so it is processed in
# bounded windows with a small overlap to keep tile seams out of the result.
TILE = 384
OVERLAP = 16

_model = None
_load_attempted = False


def _readable_path(path: Path) -> str:
    """Return a path OpenCV's model reader can actually open.

    That reader takes a narrow char path, so on Windows it fails on anything
    non-ASCII — including this project's own directory name. When the real path
    would not survive the round trip, the model is staged as a temp copy.
    """
    try:
        str(path).encode("ascii")
        return str(path)
    except UnicodeEncodeError:
        staged = Path(tempfile.gettempdir()) / f"stage-light-{path.name}"
        if not staged.exists() or staged.stat().st_size != path.stat().st_size:
            shutil.copyfile(path, staged)
        return str(staged)


def _load_model():
    """Load the model once; return None if it is unavailable."""
    global _model, _load_attempted

    if _load_attempted:
        return _model

    _load_attempted = True

    if not hasattr(cv2, "dnn_superres") or not MODEL_PATH.exists():
        return None

    try:
        model = cv2.dnn_superres.DnnSuperResImpl_create()
        model.readModel(_readable_path(MODEL_PATH))
        model.setModel(MODEL_NAME, SCALE)
        _model = model
    except (cv2.error, OSError):
        _model = None

    return _model


def is_available() -> bool:
    """True when the learned upscaler can be used, rather than the fallback."""
    return _load_model() is not None


def _upscale_tiled(model, image_bgr: np.ndarray) -> np.ndarray:
    height, width = image_bgr.shape[:2]
    result = np.empty((height * SCALE, width * SCALE, 3), dtype=np.uint8)

    for top in range(0, height, TILE):
        for left in range(0, width, TILE):
            # Read a padded window so the network sees context beyond the tile,
            # then keep only the part that belongs to this tile.
            src_top = max(0, top - OVERLAP)
            src_left = max(0, left - OVERLAP)
            src_bottom = min(height, top + TILE + OVERLAP)
            src_right = min(width, left + TILE + OVERLAP)

            upscaled = model.upsample(image_bgr[src_top:src_bottom, src_left:src_right])

            tile_height = (min(height, top + TILE) - top) * SCALE
            tile_width = (min(width, left + TILE) - left) * SCALE
            inner_top = (top - src_top) * SCALE
            inner_left = (left - src_left) * SCALE

            result[top * SCALE:top * SCALE + tile_height,
                   left * SCALE:left * SCALE + tile_width] = \
                upscaled[inner_top:inner_top + tile_height,
                         inner_left:inner_left + tile_width]

    return result


def upscale_2x(image) -> np.ndarray:
    """Return the image at twice its dimensions as an RGB array.

    Run this after colour correction and denoising — upscaling first would
    magnify exactly the noise and colour cast the rest of the pipeline exists
    to remove.
    """
    image_rgb = ensure_rgb_array(image)
    model = _load_model()

    if model is None:
        return cv2.resize(
            image_rgb, None, fx=SCALE, fy=SCALE, interpolation=cv2.INTER_LANCZOS4
        )

    image_bgr = cv2.cvtColor(image_rgb, cv2.COLOR_RGB2BGR)
    return cv2.cvtColor(_upscale_tiled(model, image_bgr), cv2.COLOR_BGR2RGB)
