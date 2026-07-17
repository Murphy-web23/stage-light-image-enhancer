import cv2
import numpy as np
from PIL import Image

from src.color_correction import (
    correct_cyan_cast,
    correct_purple_cast,
    correct_red_cast,
    correct_yellow_cast,
    gray_world_white_balance,
)
from src.enhancement import (
    adjust_brightness_contrast,
    apply_clahe,
    denoise_image,
    recover_highlights,
    restore_image_quality,
    sharpen_image,
)
from src.utils import ensure_rgb_array


SUPPORTED_MODES = {"auto", "purple", "yellow", "red", "cyan", "low_light"}


def _to_strength(value: int | float) -> float:
    """Convert a 0-100 slider value to a 0-1 strength value."""
    return float(np.clip(value, 0, 100)) / 100.0


def _valid_analysis_pixels(image: np.ndarray) -> np.ndarray:
    """Select midtone pixels for color-cast analysis."""
    image_rgb = np.clip(image, 0, 255).astype(np.uint8)
    luminance = cv2.cvtColor(image_rgb, cv2.COLOR_RGB2GRAY)
    return (luminance > 35) & (luminance < 235)


def _analyze_color_cast(image: Image.Image | np.ndarray) -> tuple[str, float]:
    """Return the detected color cast and an estimated severity from 0 to 1."""
    image_rgb = ensure_rgb_array(image)
    image_hsv = cv2.cvtColor(image_rgb, cv2.COLOR_RGB2HSV)
    base_mask = _valid_analysis_pixels(image_rgb)
    saturated_mask = base_mask & (image_hsv[:, :, 1] > 25)

    if np.count_nonzero(saturated_mask) >= 100:
        sample = image_rgb[saturated_mask].astype(np.float32)
    elif np.count_nonzero(base_mask) >= 100:
        sample = image_rgb[base_mask].astype(np.float32)
    else:
        sample = image_rgb.reshape(-1, 3).astype(np.float32)

    r_mean, g_mean, b_mean = sample.mean(axis=0)
    luminance_mean = sample.mean()
    bright_ratio = np.mean(cv2.cvtColor(image_rgb, cv2.COLOR_RGB2GRAY) > 180)
    mean_level = max(float((r_mean + g_mean + b_mean) / 3.0), 1.0)

    if luminance_mean < 75 and bright_ratio < 0.12:
        severity = np.clip((90.0 - luminance_mean) / 55.0, 0.25, 1.0)
        return "low_light", float(severity)

    purple_score = min(r_mean - g_mean, b_mean - g_mean) / mean_level
    red_score = (r_mean - max(g_mean, b_mean)) / mean_level
    yellow_score = (min(r_mean, g_mean) - b_mean) / mean_level
    cyan_score = (min(g_mean, b_mean) - r_mean) / mean_level

    # Purple stage light often has both red and blue above green. Check it first
    # so magenta light is not misread as a simple red cast.
    if purple_score > 0.035:
        severity = np.clip(purple_score / 0.28, 0.25, 1.0)
        return "purple", float(severity)

    if cyan_score > 0.035:
        severity = np.clip(cyan_score / 0.28, 0.25, 1.0)
        return "cyan", float(severity)

    if red_score > 0.045:
        severity = np.clip(red_score / 0.30, 0.25, 1.0)
        return "red", float(severity)

    if yellow_score > 0.045:
        severity = np.clip(yellow_score / 0.30, 0.25, 1.0)
        return "yellow", float(severity)

    return "auto", 0.25

def detect_color_cast(image: Image.Image | np.ndarray) -> str:
    """Detect the most likely stage-light color cast for auto mode."""
    detected_mode, _ = _analyze_color_cast(image)
    return detected_mode


def detect_color_cast_strength(image: Image.Image | np.ndarray) -> int:
    """Estimate color-cast severity as a percentage for display."""
    _, severity = _analyze_color_cast(image)
    return int(round(severity * 100))


def _adjust_saturation(image: np.ndarray, saturation: int | float = 0) -> np.ndarray:
    """Adjust saturation for an RGB image using HSV color space."""
    image_rgb = np.clip(image, 0, 255).astype(np.uint8)
    saturation_scale = 1.0 + (float(saturation) / 100.0)

    hsv = cv2.cvtColor(image_rgb, cv2.COLOR_RGB2HSV).astype(np.float32)
    hsv[:, :, 1] = np.clip(hsv[:, :, 1] * saturation_scale, 0, 255)

    return cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2RGB)


def _blend_stage_light(original: np.ndarray, corrected: np.ndarray, preserve_stage_light: int | float) -> np.ndarray:
    """Blend some original stage-light mood back into the corrected image."""
    preserve = _to_strength(preserve_stage_light)
    original_float = original.astype(np.float32)
    corrected_float = corrected.astype(np.float32)
    blended = corrected_float * (1.0 - preserve) + original_float * preserve
    return np.clip(blended, 0, 255).astype(np.uint8)


def _auto_strength(base_strength: int | float, severity: float) -> float:
    """Increase correction strength automatically when the detected cast is strong."""
    base = _to_strength(base_strength)
    if base <= 0:
        return 0.0
    return float(np.clip(base * (1.0 + severity * 0.85), 0.0, 1.0))


def _auto_preserve_stage_light(preserve_stage_light: int | float, severity: float) -> int:
    """Reduce original-image blending when auto mode detects a strong color cast."""
    preserve = float(np.clip(preserve_stage_light, 0, 100))
    adjusted = preserve * (1.0 - severity * 0.45)
    return int(round(np.clip(adjusted, 0, 100)))


def _apply_mode_correction(image: np.ndarray, mode: str, correction_strength: int | float) -> np.ndarray:
    """Apply the color correction strategy selected by mode."""
    normalized_mode = mode.lower().strip()

    if normalized_mode not in SUPPORTED_MODES:
        raise ValueError(f"Unsupported enhancement mode: {mode}")

    if normalized_mode == "auto":
        selected_mode, severity = _analyze_color_cast(image)
        strength = _auto_strength(correction_strength, severity)
    else:
        selected_mode = normalized_mode
        strength = _to_strength(correction_strength)

    if selected_mode == "purple":
        corrected = correct_purple_cast(image, strength=strength)
        return gray_world_white_balance(corrected, strength=min(strength * 0.25, 0.22))

    if selected_mode == "yellow":
        return correct_yellow_cast(image, strength=strength)

    if selected_mode == "cyan":
        return correct_cyan_cast(image, strength=min(strength * 0.65, 0.65))

    if selected_mode == "red":
        return correct_red_cast(image, strength=strength)

    if selected_mode == "low_light":
        balanced = gray_world_white_balance(image, strength=strength * 0.75)
        return adjust_brightness_contrast(balanced, brightness=14 * strength, contrast=10 * strength)

    return gray_world_white_balance(image, strength=strength * 0.85)


def enhance_image(
    image: Image.Image | np.ndarray,
    mode: str = "auto",
    brightness: int | float = 0,
    contrast: int | float = 0,
    saturation: int | float = 0,
    use_clahe: bool = True,
    use_denoise: bool = False,
    use_sharpen: bool = True,
    use_quality_restore: bool = True,
    use_highlight_recovery: bool = True,
    highlight_strength: int | float = 50,
    quality_strength: int | float = 35,
    correction_strength: int | float = 70,
    preserve_stage_light: int | float = 10,
) -> np.ndarray:
    """Enhance a single RGB image with color, tone, and optional detail corrections."""
    original = ensure_rgb_array(image)
    result = original.copy()

    result = _apply_mode_correction(result, mode, correction_strength)
    result = adjust_brightness_contrast(result, brightness=brightness, contrast=contrast)
    result = _adjust_saturation(result, saturation=saturation)

    if use_clahe:
        result = apply_clahe(result, clip_limit=1.35)

    if use_denoise:
        result = denoise_image(result, strength=5)

    if use_highlight_recovery:
        result = recover_highlights(result, strength=highlight_strength)

    if use_quality_restore:
        result = restore_image_quality(result, strength=quality_strength)

    if use_sharpen:
        result = sharpen_image(result, amount=0.22, sigma=1.1)

    if mode.lower().strip() == "auto":
        _, severity = _analyze_color_cast(original)
        preserve_stage_light = _auto_preserve_stage_light(preserve_stage_light, severity)

    result = _blend_stage_light(original, result, preserve_stage_light)
    return np.clip(result, 0, 255).astype(np.uint8)
