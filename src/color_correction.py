import cv2
import numpy as np


def _to_uint8_rgb(image: np.ndarray) -> np.ndarray:
    """Return a clipped uint8 RGB image."""
    return np.clip(image, 0, 255).astype(np.uint8)


def _midtone_weight(image: np.ndarray) -> np.ndarray:
    """Create a soft mask that protects very dark and very bright areas."""
    image_rgb = _to_uint8_rgb(image)
    luminance = cv2.cvtColor(image_rgb, cv2.COLOR_RGB2GRAY).astype(np.float32)
    shadow_weight = np.clip((luminance - 25.0) / 70.0, 0.0, 1.0)
    highlight_weight = np.clip((245.0 - luminance) / 70.0, 0.0, 1.0)
    weight = shadow_weight * highlight_weight
    return cv2.GaussianBlur(weight, (0, 0), sigmaX=3.0)[:, :, None]


def _blend_with_original(
    original: np.ndarray,
    corrected: np.ndarray,
    strength: float,
    weight_map: np.ndarray | None = None,
) -> np.ndarray:
    """Blend a corrected image with the original by strength."""
    strength = float(np.clip(strength, 0.0, 1.0))
    original_float = original.astype(np.float32)
    corrected_float = corrected.astype(np.float32)

    if weight_map is None:
        blend_weight = strength
    else:
        blend_weight = np.clip(weight_map.astype(np.float32) * strength, 0.0, 1.0)

    blended = corrected_float * blend_weight + original_float * (1.0 - blend_weight)
    return _to_uint8_rgb(blended)


def gray_world_white_balance(image: np.ndarray, strength: float = 0.45) -> np.ndarray:
    """Reduce overall color cast using conservative gray-world white balance."""
    image_rgb = _to_uint8_rgb(image)
    image_float = image_rgb.astype(np.float32)
    luminance = cv2.cvtColor(image_rgb, cv2.COLOR_RGB2GRAY)
    valid_pixels = (luminance > 35) & (luminance < 235)

    if np.count_nonzero(valid_pixels) < 100:
        channel_means = image_float.reshape(-1, 3).mean(axis=0)
    else:
        channel_means = image_float[valid_pixels].mean(axis=0)

    gray_mean = channel_means.mean()
    scale = gray_mean / np.maximum(channel_means, 1.0)
    scale = np.clip(scale, 0.75, 1.25)
    balanced = image_float * scale

    return _blend_with_original(image_rgb, balanced, strength, _midtone_weight(image_rgb))


def correct_purple_cast(image: np.ndarray, strength: float = 0.35) -> np.ndarray:
    """Reduce purple or magenta cast in an RGB image."""
    image_rgb = _to_uint8_rgb(image)
    corrected = image_rgb.astype(np.float32)
    red, green, blue = cv2.split(corrected)
    weight = _midtone_weight(image_rgb)[:, :, 0]

    purple_excess = np.maximum(((red + blue) / 2.0) - green, 0.0) * weight
    corrected[:, :, 0] = red - purple_excess * 0.30
    corrected[:, :, 1] = green + purple_excess * 0.40
    corrected[:, :, 2] = blue - purple_excess * 0.30

    return _blend_with_original(image_rgb, corrected, strength)


def correct_yellow_cast(image: np.ndarray, strength: float = 0.35) -> np.ndarray:
    """Reduce yellow cast in an RGB image."""
    image_rgb = _to_uint8_rgb(image)
    corrected = image_rgb.astype(np.float32)
    red, green, blue = cv2.split(corrected)
    weight = _midtone_weight(image_rgb)[:, :, 0]

    yellow_excess = np.maximum(((red + green) / 2.0) - blue, 0.0) * weight
    corrected[:, :, 0] = red - yellow_excess * 0.14
    corrected[:, :, 1] = green - yellow_excess * 0.12
    corrected[:, :, 2] = blue + yellow_excess * 0.18

    return _blend_with_original(image_rgb, corrected, strength)


def correct_cyan_cast(image: np.ndarray, strength: float = 0.35) -> np.ndarray:
    """Reduce cyan or blue-green stage-light cast in an RGB image."""
    image_rgb = _to_uint8_rgb(image)
    corrected = image_rgb.astype(np.float32)
    red, green, blue = cv2.split(corrected)
    weight = _midtone_weight(image_rgb)[:, :, 0]

    cyan_excess = np.maximum(((green + blue) / 2.0) - red, 0.0) * weight
    corrected[:, :, 0] = red + cyan_excess * 0.16
    corrected[:, :, 1] = green - cyan_excess * 0.05
    corrected[:, :, 2] = blue - cyan_excess * 0.05

    return _blend_with_original(image_rgb, corrected, strength)


def correct_red_cast(image: np.ndarray, strength: float = 0.35) -> np.ndarray:
    """Reduce red cast in an RGB image while protecting highlights."""
    image_rgb = _to_uint8_rgb(image)
    corrected = image_rgb.astype(np.float32)
    red, green, blue = cv2.split(corrected)
    weight = _midtone_weight(image_rgb)[:, :, 0]

    red_excess = np.maximum(red - ((green + blue) / 2.0), 0.0) * weight
    corrected[:, :, 0] = red - red_excess * 0.30
    corrected[:, :, 1] = green + red_excess * 0.08
    corrected[:, :, 2] = blue + red_excess * 0.14

    return _blend_with_original(image_rgb, corrected, strength)
