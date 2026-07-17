import cv2
import numpy as np


def _to_uint8_rgb(image: np.ndarray) -> np.ndarray:
    """Return a clipped uint8 RGB image."""
    return np.clip(image, 0, 255).astype(np.uint8)


def adjust_brightness_contrast(
    image: np.ndarray,
    brightness: int | float = 0,
    contrast: int | float = 0,
) -> np.ndarray:
    """Adjust brightness and contrast for an RGB image."""
    image_float = image.astype(np.float32)
    alpha = 1.0 + (float(contrast) / 100.0)
    beta = float(brightness)
    adjusted = (image_float - 127.5) * alpha + 127.5 + beta
    return _to_uint8_rgb(adjusted)


def apply_clahe(
    image: np.ndarray,
    clip_limit: float = 2.0,
    tile_grid_size: int = 8,
) -> np.ndarray:
    """Enhance local contrast with CLAHE on the luminance channel."""
    image_rgb = _to_uint8_rgb(image)
    lab = cv2.cvtColor(image_rgb, cv2.COLOR_RGB2LAB)
    lightness, a_channel, b_channel = cv2.split(lab)

    clahe = cv2.createCLAHE(
        clipLimit=clip_limit,
        tileGridSize=(tile_grid_size, tile_grid_size),
    )
    enhanced_lightness = clahe.apply(lightness)

    enhanced_lab = cv2.merge((enhanced_lightness, a_channel, b_channel))
    return cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2RGB)


def apply_clahe_rgb(
    image_rgb: np.ndarray,
    clip_limit: float = 2.0,
    tile_grid_size: int = 8,
) -> np.ndarray:
    """Enhance local contrast for an RGB image using CLAHE."""
    return apply_clahe(image_rgb, clip_limit=clip_limit, tile_grid_size=tile_grid_size)


def denoise_image(image: np.ndarray, strength: int = 7) -> np.ndarray:
    """Reduce color noise while preserving edges in an RGB image."""
    image_rgb = _to_uint8_rgb(image)
    image_bgr = cv2.cvtColor(image_rgb, cv2.COLOR_RGB2BGR)
    denoised_bgr = cv2.fastNlMeansDenoisingColored(
        image_bgr,
        None,
        h=strength,
        hColor=strength,
        templateWindowSize=7,
        searchWindowSize=21,
    )
    return cv2.cvtColor(denoised_bgr, cv2.COLOR_BGR2RGB)


def recover_highlights(
    image: np.ndarray,
    strength: int | float = 35,
    threshold: int | float = 195,
) -> np.ndarray:
    """Compress harsh highlights without changing the scene color."""
    image_rgb = _to_uint8_rgb(image)
    strength_value = float(np.clip(strength, 0, 100)) / 100.0

    if strength_value <= 0:
        return image_rgb

    threshold_value = float(np.clip(threshold, 150, 235))
    lab = cv2.cvtColor(image_rgb, cv2.COLOR_RGB2LAB).astype(np.float32)
    lightness, a_channel, b_channel = cv2.split(lab)

    highlight_mask = np.clip(
        (lightness - threshold_value) / max(255.0 - threshold_value, 1.0),
        0.0,
        1.0,
    )
    highlight_mask = cv2.GaussianBlur(highlight_mask, (0, 0), sigmaX=2.0)

    compression = 0.72 * strength_value
    compressed_lightness = lightness - np.maximum(lightness - threshold_value, 0.0) * compression

    blend_mask = np.clip(highlight_mask * (0.45 + strength_value * 0.45), 0.0, 0.85)
    blended_lightness = lightness * (1.0 - blend_mask) + compressed_lightness * blend_mask

    recovered_lab = cv2.merge((blended_lightness, a_channel, b_channel))
    return cv2.cvtColor(_to_uint8_rgb(recovered_lab), cv2.COLOR_LAB2RGB)


def restore_image_quality(image: np.ndarray, strength: int | float = 35) -> np.ndarray:
    """Improve perceived quality by reducing compression artifacts and restoring detail."""
    image_rgb = _to_uint8_rgb(image)
    strength_value = float(np.clip(strength, 0, 100)) / 100.0

    if strength_value <= 0:
        return image_rgb

    image_bgr = cv2.cvtColor(image_rgb, cv2.COLOR_RGB2BGR)
    smooth_bgr = cv2.bilateralFilter(
        image_bgr,
        d=5,
        sigmaColor=18 + 32 * strength_value,
        sigmaSpace=18 + 20 * strength_value,
    )
    smooth_rgb = cv2.cvtColor(smooth_bgr, cv2.COLOR_BGR2RGB)

    blur = cv2.GaussianBlur(smooth_rgb, (0, 0), sigmaX=1.0)
    detail_amount = 0.08 + 0.20 * strength_value
    detailed = cv2.addWeighted(smooth_rgb, 1.0 + detail_amount, blur, -detail_amount, 0)

    blend = 0.25 + 0.55 * strength_value
    restored = detailed.astype(np.float32) * blend + image_rgb.astype(np.float32) * (1.0 - blend)
    return _to_uint8_rgb(restored)


def sharpen_image(image: np.ndarray, amount: float = 0.35, sigma: float = 1.2) -> np.ndarray:
    """Sharpen image details with a gentle unsharp mask."""
    image_rgb = _to_uint8_rgb(image)
    blurred = cv2.GaussianBlur(image_rgb, (0, 0), sigmaX=sigma)
    sharpened = cv2.addWeighted(image_rgb, 1.0 + amount, blurred, -amount, 0)
    return _to_uint8_rgb(sharpened)
