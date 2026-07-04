# Stage Light Image Enhancer

## 專案簡介

Stage Light Image Enhancer 是一個使用 Python、Streamlit 和 OpenCV 製作的演唱會 / 舞台燈照片修復工具。這個專案目前支援單張 JPG / PNG 圖片上傳，使用者可以選擇不同的色偏修正模式，調整亮度、對比與飽和度，並套用 CLAHE、降噪與銳化處理，最後下載修復後的圖片。

這是一個初學者作品集專案，重點放在把影像處理流程拆成清楚的模組，並透過簡單的 Web UI 讓非工程使用者也能操作。

## 專案動機

演唱會或舞台照片常會受到強烈燈光影響，例如紫光、紅光、黃光、低光源、高 ISO 雜訊與對比不足。這些照片雖然有現場感，但有時會讓人物膚色失真、細節變暗，或整張照片偏色嚴重。

我建立這個專案的目標是練習：

- 使用 OpenCV 處理真實影像問題
- 將影像處理邏輯模組化
- 使用 Streamlit 快速建立互動式工具
- 設計一個可以展示在 GitHub 作品集上的完整小型專案

## 功能特色

- 單張 JPG / PNG 圖片上傳
- Before / After 雙欄比較
- 支援多種修復模式：Auto、Purple cast、Yellow cast、Red cast、Low light
- 可調整亮度、對比與飽和度
- 可選擇是否套用 CLAHE 局部對比增強、Denoise 降噪、Sharpen 銳化
- 顯示目前使用的修復參數
- 下載修復後圖片
- 基本錯誤處理，未上傳圖片時不會報錯

## 使用技術

- Python
- Streamlit
- OpenCV
- NumPy
- Pillow

## 專案架構

```text
stage-light-image-enhancer/
├── app.py                  # Streamlit UI 入口
├── README.md               # 專案說明文件
├── requirements.txt        # Python 套件需求
├── .gitignore
├── src/
│   ├── __init__.py
│   ├── enhancement.py      # 亮度、對比、CLAHE、降噪、銳化
│   ├── color_correction.py # 白平衡與色偏修正
│   ├── pipeline.py         # 整體修復流程
│   └── utils.py            # 圖片格式轉換工具
├── sample_images/          # 範例圖片，可自行放入測試照片
├── assets/                 # README 圖片或其他素材
└── outputs/                # 輸出圖片暫存資料夾
```

## 安裝方式

建議先建立虛擬環境：

```bash
python -m venv .venv
```

啟用虛擬環境：

Windows PowerShell:

```bash
.venv\Scripts\Activate.ps1
```

macOS / Linux:

```bash
source .venv/bin/activate
```

安裝套件：

```bash
pip install -r requirements.txt
```

## 執行方式

在專案根目錄執行：

```bash
streamlit run app.py
```

開啟 Streamlit 頁面後，上傳一張 JPG 或 PNG 圖片，調整側邊欄參數，即可查看修復前後比較並下載結果。

## Demo Screenshots

目前可將截圖放在 `assets/` 資料夾，並在 README 中更新圖片路徑。

```md
![App screenshot](assets/demo_app.png)
![Before and after result](assets/demo_before_after.png)
```

預計展示內容：

- Streamlit 主畫面
- Before / After 比較
- 側邊欄修復參數
- 不同色偏模式的修復結果

## 方法說明

### White Balance

`gray_world_white_balance` 使用 gray-world assumption 的概念。它假設一張自然影像中 RGB 三個通道的平均值應該接近灰色，當某個通道明顯過強時，就調整各通道比例，降低整體色偏。

在演唱會照片中，這可以用來處理整張照片偏紫、偏紅或偏黃的情況。不過舞台燈本身有強烈風格，所以這裡使用保守的混合強度，避免把現場光感完全消除。

### CLAHE

CLAHE 是 Contrast Limited Adaptive Histogram Equalization。它會針對局部區域提升對比，而不是直接拉整張圖的對比。

這對舞台照片很有幫助，因為人物可能在暗部，背景燈光卻很亮。CLAHE 可以讓暗部細節更明顯，同時用 clip limit 限制過度增強，減少雜訊被放大的問題。

### Brightness / Contrast

亮度與對比調整使用 NumPy 對 RGB array 做像素值轉換：

- Brightness 控制整體明暗
- Contrast 控制像素與中間灰階的距離

這是最基礎但實用的影像修復功能，適合用來快速修正照片過暗、過灰或對比不足的問題。

### Color Cast Correction

專案目前提供紫色、黃色與紅色色偏修正。這些功能會偵測特定通道過強的情況，並以較保守的比例降低偏色通道，同時補回相對不足的通道。

例如：

- Purple cast：降低紅色與藍色相對於綠色的過度優勢
- Yellow cast：降低紅色與綠色相對於藍色的過度優勢
- Red cast：降低紅色通道過強的情況

這些方法不是深度學習模型，而是以 OpenCV 和 NumPy 實作的基礎規則式修正，優點是簡單、快速、容易理解，也適合作為影像處理入門作品。

## 限制與未來改進

目前限制：

- 只支援單張圖片
- 色偏修正是規則式方法，遇到複雜燈光時可能不夠準確
- 沒有做人臉或膚色保護
- 沒有針對過曝區域做 highlight recovery
- 降噪與銳化參數目前是固定值
- 尚未加入測試與效能評估

未來改進方向：

- 加入批次處理
- 加入參數 preset 與自訂儲存
- 加入膚色偵測，避免修正後人物膚色不自然
- 加入曝光保護與高光壓制
- 加入前後差異圖或直方圖分析
- 加入單元測試與範例圖片
- 支援影片逐幀處理或短影片色彩修正

## 面試時可以說明的重點

這個專案雖然是初學者等級，但可以在面試中說明幾個重點：

- 我把 UI、pipeline、影像增強與色彩修正拆成不同模組，讓程式比較容易維護。
- 我使用 Streamlit 建立互動式工具，讓使用者不用寫程式也能測試不同修復參數。
- 我使用 OpenCV 的 LAB / HSV / RGB 色彩空間，針對不同任務選擇適合的表示方式。
- 我知道規則式影像處理有其限制，所以 README 中有清楚列出目前限制與未來改進方向。
- 我在 pipeline 中設計 mode 與選項參數，讓之後新增新的修復模式或 UI 控制項更容易。
- 我重視使用者體驗，包含 before / after 比較、參數顯示、下載按鈕與基本錯誤處理。

## Requirements

```txt
streamlit
opencv-python-headless
numpy
Pillow
```

## License

This project is currently for learning and portfolio demonstration purposes.
