from io import BytesIO

import numpy as np
from PIL import Image


def ensure_rgb_array(image: Image.Image | np.ndarray) -> np.ndarray:
    if isinstance(image, Image.Image):
        return np.array(image.convert("RGB"))

    if image.ndim == 2:
        return np.stack([image, image, image], axis=-1).astype(np.uint8)

    if image.shape[-1] == 4:
        return image[:, :, :3].astype(np.uint8)

    return image.astype(np.uint8)


def pil_to_png_bytes(image: Image.Image) -> bytes:
    buffer = BytesIO()
    image.save(buffer, format="PNG")
    return buffer.getvalue()
