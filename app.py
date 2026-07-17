from io import BytesIO

import streamlit as st
from PIL import Image, UnidentifiedImageError

from src.pipeline import detect_color_cast, detect_color_cast_strength, enhance_image
from src.utils import pil_to_png_bytes


st.set_page_config(
    page_title="演唱會影像修復工具",
    page_icon="🎤",
    layout="wide",
)


MODE_OPTIONS = {
    "auto": "自動修復",
    "purple": "紫色燈偏",
    "yellow": "黃光偏色",
    "red": "紅光偏色",
    "cyan": "藍綠光偏色",
    "low_light": "低光源照片",
}

DETECTED_MODE_LABELS = {
    "auto": "整體白平衡",
    "purple": "紫色燈偏",
    "yellow": "黃光偏色",
    "red": "紅光偏色",
    "cyan": "藍綠光偏色",
    "low_light": "低光源照片",
}

DEFAULT_SETTINGS = {
    "mode": "auto",
    "correction_strength": 70,
    "preserve_stage_light": 10,
    "brightness": 0,
    "contrast": 0,
    "saturation": 0,
    "use_clahe": True,
    "use_denoise": False,
    "use_highlight_recovery": True,
    "highlight_strength": 35,
    "use_quality_restore": True,
    "quality_strength": 35,
    "use_sharpen": True,
}


def initialize_settings() -> None:
    """Initialize Streamlit widget state with recommended defaults."""
    for key, value in DEFAULT_SETTINGS.items():
        st.session_state.setdefault(key, value)


def reset_settings() -> None:
    """Reset all enhancement controls to recommended defaults."""
    for key, value in DEFAULT_SETTINGS.items():
        st.session_state[key] = value


def show_current_parameters(
    detected_mode: str | None = None,
    detected_strength: int | None = None,
) -> None:
    """Show the currently selected enhancement parameters."""
    labels = [
        "修復模式",
        "修復強度",
        "保留舞台氛圍",
        "亮度",
        "對比",
        "飽和度",
        "CLAHE 局部對比增強",
        "降噪",
        "高光修復",
        "高光修復強度",
        "畫質修復",
        "畫質修復強度",
        "銳化",
    ]
    values = [
        MODE_OPTIONS[st.session_state.mode],
        f"{st.session_state.correction_strength}%",
        f"{st.session_state.preserve_stage_light}%",
        st.session_state.brightness,
        st.session_state.contrast,
        st.session_state.saturation,
        "開啟" if st.session_state.use_clahe else "關閉",
        "開啟" if st.session_state.use_denoise else "關閉",
        "開啟" if st.session_state.use_highlight_recovery else "關閉",
        f"{st.session_state.highlight_strength}%",
        "開啟" if st.session_state.use_quality_restore else "關閉",
        f"{st.session_state.quality_strength}%",
        "開啟" if st.session_state.use_sharpen else "關閉",
    ]

    if detected_mode is not None:
        labels.insert(1, "自動偵測結果")
        values.insert(1, DETECTED_MODE_LABELS.get(detected_mode, "整體白平衡"))

    if detected_strength is not None:
        insert_index = 2 if detected_mode is not None else 1
        labels.insert(insert_index, "偵測偏色程度")
        values.insert(insert_index, f"{detected_strength}%")

    st.subheader("目前使用的參數")
    st.table({"項目": labels, "設定值": values})


def main() -> None:
    initialize_settings()

    st.title("演唱會影像修復工具")
    st.caption("舞台燈 / 演唱會照片修復工具")

    with st.sidebar:
        st.header("修復設定")
        st.button("一鍵回到預設值", on_click=reset_settings, use_container_width=True)
        st.caption("預設值是建議起點。上傳後，自動修復會依圖片判斷偏色類型與偏色程度，再動態加強修復。")

        st.selectbox(
            "修復模式",
            options=list(MODE_OPTIONS.keys()),
            format_func=lambda key: MODE_OPTIONS[key],
            key="mode",
        )
        st.slider("修復強度", min_value=0, max_value=100, step=1, key="correction_strength")
        st.slider("保留舞台氛圍", min_value=0, max_value=100, step=1, key="preserve_stage_light")
        st.slider("亮度", min_value=-100, max_value=100, step=1, key="brightness")
        st.slider("對比", min_value=-100, max_value=100, step=1, key="contrast")
        st.slider("飽和度", min_value=-100, max_value=100, step=1, key="saturation")
        st.checkbox("CLAHE 局部對比增強", key="use_clahe")
        st.checkbox("降噪", key="use_denoise")
        st.checkbox("高光修復", key="use_highlight_recovery")
        st.slider("高光修復強度", min_value=0, max_value=100, step=1, key="highlight_strength")
        st.checkbox("畫質修復", key="use_quality_restore")
        st.slider("畫質修復強度", min_value=0, max_value=100, step=1, key="quality_strength")
        st.checkbox("銳化", key="use_sharpen")

    uploaded_file = st.file_uploader(
        "上傳一張 JPG 或 PNG 圖片",
        type=["jpg", "jpeg", "png"],
        accept_multiple_files=False,
    )

    if uploaded_file is None:
        st.info("請先上傳一張 JPG 或 PNG 圖片開始修復。")
        show_current_parameters()
        return

    try:
        image = Image.open(BytesIO(uploaded_file.getvalue())).convert("RGB")
    except UnidentifiedImageError:
        st.error("無法讀取上傳的檔案。請上傳有效的 JPG 或 PNG 圖片。")
        return

    detected_mode = detect_color_cast(image) if st.session_state.mode == "auto" else None
    detected_strength = detect_color_cast_strength(image) if st.session_state.mode == "auto" else None
    if detected_mode is not None:
        st.info(
            f"自動修復判斷：{DETECTED_MODE_LABELS.get(detected_mode, '整體白平衡')}，"
            f"偏色程度約 {detected_strength}%"
        )

    try:
        with st.spinner("正在修復圖片..."):
            enhanced_array = enhance_image(
                image=image,
                mode=st.session_state.mode,
                brightness=st.session_state.brightness,
                contrast=st.session_state.contrast,
                saturation=st.session_state.saturation,
                use_clahe=st.session_state.use_clahe,
                use_denoise=st.session_state.use_denoise,
                use_highlight_recovery=st.session_state.use_highlight_recovery,
                highlight_strength=st.session_state.highlight_strength,
                use_quality_restore=st.session_state.use_quality_restore,
                quality_strength=st.session_state.quality_strength,
                use_sharpen=st.session_state.use_sharpen,
                correction_strength=st.session_state.correction_strength,
                preserve_stage_light=st.session_state.preserve_stage_light,
            )
            enhanced_image = Image.fromarray(enhanced_array)
    except Exception as error:
        st.error(f"圖片修復失敗：{error}")
        return

    before_col, after_col = st.columns(2)

    with before_col:
        st.subheader("修復前")
        st.image(image, use_container_width=True)

    with after_col:
        st.subheader("修復後")
        st.image(enhanced_array, use_container_width=True)
        st.download_button(
            label="下載修復後圖片",
            data=pil_to_png_bytes(enhanced_image),
            file_name="enhanced_stage_light_image.png",
            mime="image/png",
        )

    show_current_parameters(detected_mode=detected_mode, detected_strength=detected_strength)


if __name__ == "__main__":
    main()
