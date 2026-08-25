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


def estimate_noise_sigma(image: np.ndarray) -> float:
    """Estimate luminance noise in grey levels using Immerkaer's method.

    Convolving with a Laplacian-like kernel cancels smooth image content, so
    what is left is dominated by noise. Typical values: under 2 for a clean
    shot, 6-12 for the high-ISO frames phones produce at concerts.
    """
    grey = cv2.cvtColor(_to_uint8_rgb(image), cv2.COLOR_RGB2GRAY).astype(np.float32)
    height, width = grey.shape

    if height < 3 or width < 3:
        return 0.0

    kernel = np.array([[1, -2, 1], [-2, 4, -2], [1, -2, 1]], dtype=np.float32)
    response = cv2.filter2D(grey, -1, kernel)[1:-1, 1:-1]

    return float(
        np.sqrt(np.pi / 2) * np.abs(response).sum()
        / (6.0 * (width - 2) * (height - 2))
    )


def _structure_mask(luma: np.ndarray) -> np.ndarray:
    """Weight edges and texture above flat areas, as a 0-1 float mask.

    Sharpening a noisy sky or a dark background just makes the grain louder, so
    detail recovery is steered towards places that actually hold structure.
    """
    gradient_x = cv2.Sobel(luma, cv2.CV_32F, 1, 0, ksize=3)
    gradient_y = cv2.Sobel(luma, cv2.CV_32F, 0, 1, ksize=3)
    magnitude = cv2.magnitude(gradient_x, gradient_y)

    magnitude = cv2.GaussianBlur(magnitude, (0, 0), sigmaX=1.6)
    scale = float(np.percentile(magnitude, 92)) or 1.0

    return np.clip(magnitude / scale, 0.0, 1.0)


def restore_image_quality(image: np.ndarray, strength: int | float = 35) -> np.ndarray:
    """Clean sensor noise and compression artifacts, then rebuild micro detail.

    Chroma and luma are handled separately because they degrade differently.
    Colour noise — the blotchy red/green speckle high-ISO concert shots are full
    of — can be smoothed hard, since human vision barely resolves fine colour
    detail. Luma carries the texture, so it is cleaned only as much as the
    measured noise level justifies, then re-sharpened where structure exists.
    """
    image_rgb = _to_uint8_rgb(image)
    strength_value = float(np.clip(strength, 0, 100)) / 100.0

    if strength_value <= 0:
        return image_rgb

    # Scale the cleaning to how noisy the frame actually is, so clean photos
    # are left alone and grainy ones get real treatment at the same setting.
    noise_level = float(np.clip(estimate_noise_sigma(image_rgb) / 7.0, 0.0, 1.0))

    ycrcb = cv2.cvtColor(image_rgb, cv2.COLOR_RGB2YCrCb)
    luma, red_diff, blue_diff = cv2.split(ycrcb)

    chroma_sigma = 14.0 + 46.0 * strength_value * (0.45 + 0.55 * noise_level)
    red_diff = cv2.bilateralFilter(red_diff, d=7, sigmaColor=chroma_sigma, sigmaSpace=9)
    blue_diff = cv2.bilateralFilter(blue_diff, d=7, sigmaColor=chroma_sigma, sigmaSpace=9)

    # Non-local means is the good luma denoiser but it is slow, so it only runs
    # when there is measurable grain to remove.
    if noise_level > 0.18:
        luma = cv2.fastNlMeansDenoising(
            luma,
            None,
            h=1.5 + 7.0 * strength_value * noise_level,
            templateWindowSize=7,
            searchWindowSize=21,
        )

    radius = 0.75 + 0.85 * strength_value
    amount = 0.18 + 0.5 * strength_value
    blurred = cv2.GaussianBlur(luma, (0, 0), sigmaX=radius)
    sharpened = cv2.addWeighted(luma, 1.0 + amount, blurred, -amount, 0)

    mask = _structure_mask(luma)
    luma = np.clip(
        luma.astype(np.float32) * (1.0 - mask) + sharpened.astype(np.float32) * mask,
        0, 255,
    ).astype(np.uint8)

    restored = cv2.cvtColor(cv2.merge((luma, red_diff, blue_diff)), cv2.COLOR_YCrCb2RGB)

    blend = 0.35 + 0.6 * strength_value
    blended = restored.astype(np.float32) * blend + image_rgb.astype(np.float32) * (1.0 - blend)
    return _to_uint8_rgb(blended)


def sharpen_image(image: np.ndarray, amount: float = 0.35, sigma: float = 1.2) -> np.ndarray:
    """Sharpen image details with a gentle unsharp mask."""
    image_rgb = _to_uint8_rgb(image)
    blurred = cv2.GaussianBlur(image_rgb, (0, 0), sigmaX=sigma)
    sharpened = cv2.addWeighted(image_rgb, 1.0 + amount, blurred, -amount, 0)
    return _to_uint8_rgb(sharpened)
