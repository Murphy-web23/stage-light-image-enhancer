/* Stage light image enhancer — frontend controller. */

const DEFAULTS = {
  mode: "auto",
  correction_strength: 70,
  preserve_stage_light: 10,
  brightness: 0,
  contrast: 0,
  saturation: 0,
  use_clahe: true,
  use_denoise: false,
  use_highlight_recovery: true,
  highlight_strength: 35,
  use_quality_restore: true,
  quality_strength: 35,
  use_sharpen: true,
  upscale_2x: false,
};

const PERCENT_FIELDS = new Set([
  "correction_strength",
  "preserve_stage_light",
  "highlight_strength",
  "quality_strength",
]);

const $ = (id) => document.getElementById(id);

const el = {
  dropzone: $("dropzone"),
  fileInput: $("file-input"),
  browseBtn: $("browse-btn"),
  editor: $("editor"),
  resetBtn: $("reset-btn"),
  changeBtn: $("change-btn"),
  downloadBtn: $("download-btn"),
  downloadLabel: $("download-label"),
  chip: $("detection-chip"),
  compare: $("compare"),
  imgBefore: $("img-before"),
  imgAfter: $("img-after"),
  busy: $("compare-busy"),
  fileMeta: $("file-meta"),
  toast: $("toast"),
  modeBtn: $("mode-btn"),
  modeMenu: $("mode-menu"),
  modeLabel: $("mode-label"),
  modeSelect: $("mode"),
  upscale: $("upscale_2x"),
  upscaleHint: $("upscale-hint"),
};

const state = {
  imageId: null,
  fileName: "",
  previewUrl: null,
  detection: null,
  size: null,
  hasSuperres: null,
  renderToken: 0,
  pending: false,
  queued: false,
};

/* ── Settings ──────────────────────────────────────────────────── */

function readSettings() {
  const settings = {};
  for (const [key, fallback] of Object.entries(DEFAULTS)) {
    const input = $(key);
    if (typeof fallback === "boolean") settings[key] = input.checked;
    else if (typeof fallback === "number") settings[key] = Number(input.value);
    else settings[key] = input.value;
  }
  return settings;
}

function applySettings(settings) {
  for (const [key, value] of Object.entries(settings)) {
    const input = $(key);
    if (typeof value === "boolean") input.checked = value;
    else input.value = value;
  }
  syncModeLabel();
  syncOutputs();
}

function syncOutputs() {
  for (const key of Object.keys(DEFAULTS)) {
    const input = $(key);
    if (input.type !== "range") continue;

    const value = Number(input.value);
    const min = Number(input.min);
    const max = Number(input.max);
    const percent = ((value - min) / (max - min)) * 100;

    // Bipolar controls (-100…100) fill outward from the centre detent.
    const origin = min < 0 ? 50 : 0;
    input.style.setProperty("--fill-a", `${Math.min(origin, percent)}%`);
    input.style.setProperty("--fill-b", `${Math.max(origin, percent)}%`);

    const out = $(`${key}-out`);
    if (out) out.textContent = PERCENT_FIELDS.has(key) ? `${value}%` : value;
  }
}

function formatSize(bytes) {
  return bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.round(bytes / 1024)} KB`;
}

/* The chip reports the auto analysis, and steps aside when the user picks a
   mode by hand — returning if they switch back to auto. */
function updateDetectionChip() {
  if (!state.detection) return;

  if (el.modeSelect.value === "auto") {
    el.chip.classList.remove("is-manual");
    el.chip.innerHTML =
      `自動判斷：${state.detection.label}　<span class="chip-num">偏色 ${state.detection.strength}%</span>`;
  } else {
    el.chip.classList.add("is-manual");
    el.chip.textContent = `手動指定：${modeLabelFor(el.modeSelect.value)}`;
  }
}

/* Upscaling only touches the downloaded file, so the hint has to say what the
   user will actually get — the preview cannot show it. */
function updateUpscaleHint() {
  if (!el.upscale.checked) {
    el.upscaleHint.textContent = "只影響下載的檔案，預覽不變。";
    return;
  }

  const method = state.hasSuperres === false ? "以傳統插值放大" : "以 FSRCNN 模型放大";
  const target = state.size
    ? `下載檔為 ${state.size.width * 2} × ${state.size.height * 2}，`
    : "";

  el.upscaleHint.textContent = `${target}${method}，處理會多花幾秒。`;
}

function modeLabelFor(value) {
  const option = [...el.modeMenu.children].find((li) => li.dataset.value === value);
  return option ? option.textContent : value;
}

/* ── Custom select ─────────────────────────────────────────────── */

function syncModeLabel() {
  el.modeLabel.textContent = modeLabelFor(el.modeSelect.value);
  for (const option of el.modeMenu.children) {
    option.setAttribute("aria-selected", option.dataset.value === el.modeSelect.value);
    option.classList.remove("is-active");
  }
}

function openMenu() {
  el.modeMenu.hidden = false;
  el.modeBtn.setAttribute("aria-expanded", "true");
  const selected = el.modeMenu.querySelector('[aria-selected="true"]');
  if (selected) selected.classList.add("is-active");
}

function closeMenu() {
  el.modeMenu.hidden = true;
  el.modeBtn.setAttribute("aria-expanded", "false");
}

function chooseMode(value) {
  el.modeSelect.value = value;
  syncModeLabel();
  closeMenu();
  updateDetectionChip();
  renderPreview();
}

function moveActive(step) {
  const options = [...el.modeMenu.children];
  const current = options.findIndex((o) => o.classList.contains("is-active"));
  const next = Math.min(options.length - 1, Math.max(0, (current < 0 ? 0 : current) + step));
  options.forEach((o) => o.classList.remove("is-active"));
  options[next].classList.add("is-active");
  options[next].scrollIntoView({ block: "nearest" });
}

function initSelect() {
  el.modeBtn.addEventListener("click", () => {
    el.modeMenu.hidden ? openMenu() : closeMenu();
  });

  for (const option of el.modeMenu.children) {
    option.addEventListener("click", () => chooseMode(option.dataset.value));
  }

  el.modeBtn.addEventListener("keydown", (event) => {
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
      event.preventDefault();
      if (el.modeMenu.hidden) openMenu();
      else if (event.key === "ArrowDown") moveActive(1);
      else if (event.key === "ArrowUp") moveActive(-1);
      else {
        const active = el.modeMenu.querySelector(".is-active");
        if (active) chooseMode(active.dataset.value);
      }
    } else if (event.key === "Escape") {
      closeMenu();
    }
  });

  document.addEventListener("click", (event) => {
    if (!$("mode-select").contains(event.target)) closeMenu();
  });
}

/* ── Networking ────────────────────────────────────────────────── */

async function readError(response, fallback) {
  try {
    const data = await response.json();
    return typeof data.detail === "string" ? data.detail : fallback;
  } catch {
    return fallback;
  }
}

async function uploadImage(file) {
  const body = new FormData();
  body.append("file", file);

  const response = await fetch("/api/images", { method: "POST", body });
  if (!response.ok) throw new Error(await readError(response, "上傳失敗，請再試一次。"));
  return response.json();
}

async function requestRender(kind, settings) {
  const response = await fetch(`/api/images/${state.imageId}/${kind}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
  if (!response.ok) throw new Error(await readError(response, "修復失敗，請再試一次。"));
  return response.blob();
}

/* ── Preview rendering ─────────────────────────────────────────── */

/* One render at a time. Changes made while a render is in flight only raise a
   flag, so dragging a slider collapses into a single trailing run instead of
   queueing work the server has to chew through in order. */
async function renderPreview() {
  if (!state.imageId) return;

  if (state.pending) {
    state.queued = true;
    return;
  }

  state.pending = true;
  const token = ++state.renderToken;
  const busyTimer = setTimeout(() => el.busy.classList.add("is-active"), 220);

  try {
    const blob = await requestRender("preview", readSettings());
    if (token === state.renderToken) setPreviewImage(blob);
  } catch (error) {
    if (token === state.renderToken) showToast(error.message, true);
  } finally {
    clearTimeout(busyTimer);
    state.pending = false;

    if (state.queued) {
      state.queued = false;
      renderPreview();
    } else {
      el.busy.classList.remove("is-active");
    }
  }
}

function setPreviewImage(blob) {
  const url = URL.createObjectURL(blob);
  el.imgAfter.src = url;
  if (state.previewUrl) URL.revokeObjectURL(state.previewUrl);
  state.previewUrl = url;
}

/* ── Upload flow ───────────────────────────────────────────────── */

async function handleFile(file) {
  if (!file) return;

  if (!/^image\/(jpeg|png)$/.test(file.type)) {
    showToast("請上傳 JPG 或 PNG 照片。", true);
    return;
  }
  if (file.size > 20 * 1024 * 1024) {
    showToast("照片超過 20 MB 上限。", true);
    return;
  }

  el.dropzone.hidden = true;
  el.editor.hidden = false;
  el.busy.classList.add("is-active");
  el.chip.classList.remove("is-manual");
  el.chip.textContent = "分析中";

  try {
    const info = await uploadImage(file);

    state.imageId = info.image_id;
    state.fileName = file.name;
    state.detection = { label: info.detected_label, strength: info.detected_strength };
    state.size = { width: info.width, height: info.height };
    updateUpscaleHint();

    el.imgBefore.src = `/api/images/${info.image_id}/original`;
    el.imgAfter.src = `/api/images/${info.image_id}/original`;
    setSplit(50);

    updateDetectionChip();
    el.fileMeta.textContent =
      `${file.name}　${info.width} × ${info.height}　${formatSize(file.size)}`;

    await renderPreview();
  } catch (error) {
    showToast(error.message, true);
    resetToDropzone();
  } finally {
    el.busy.classList.remove("is-active");
  }
}

function resetToDropzone() {
  state.imageId = null;
  state.detection = null;
  if (state.previewUrl) {
    URL.revokeObjectURL(state.previewUrl);
    state.previewUrl = null;
  }
  el.fileInput.value = "";
  el.editor.hidden = true;
  el.dropzone.hidden = false;
}

/* ── Download ──────────────────────────────────────────────────── */

async function downloadResult() {
  if (!state.imageId) return;

  el.downloadBtn.disabled = true;
  el.downloadLabel.textContent = "處理原始解析度…";

  try {
    const blob = await requestRender("render", readSettings());
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const stem = state.fileName.replace(/\.[^.]+$/, "") || "image";

    link.href = url;
    link.download = `${stem}_修復.png`;
    link.click();
    URL.revokeObjectURL(url);

    showToast("已下載修復後照片。");
  } catch (error) {
    showToast(error.message, true);
  } finally {
    el.downloadBtn.disabled = false;
    el.downloadLabel.textContent = "下載修復後照片";
  }
}

/* ── Compare slider ────────────────────────────────────────────── */

function setSplit(percent) {
  el.compare.style.setProperty("--split", `${Math.min(100, Math.max(0, percent))}%`);
}

function splitFromEvent(event) {
  const rect = el.compare.getBoundingClientRect();
  return ((event.clientX - rect.left) / rect.width) * 100;
}

function initCompare() {
  let dragging = false;

  // Shape the frame to the photo so the well hugs it, portrait or landscape.
  el.imgBefore.addEventListener("load", () => {
    const { naturalWidth: w, naturalHeight: h } = el.imgBefore;
    if (!w || !h) return;
    // Width is capped by both the column and the height budget; aspect-ratio
    // then derives the height, so neither orientation letterboxes.
    el.compare.style.setProperty("--frame-ar", `${w} / ${h}`);
    el.compare.style.setProperty("--frame-ratio", `${w / h}`);
  });

  el.compare.addEventListener("pointerdown", (event) => {
    dragging = true;
    el.compare.setPointerCapture(event.pointerId);
    setSplit(splitFromEvent(event));
  });

  el.compare.addEventListener("pointermove", (event) => {
    if (dragging) setSplit(splitFromEvent(event));
  });

  for (const type of ["pointerup", "pointercancel"]) {
    el.compare.addEventListener(type, () => { dragging = false; });
  }
}

/* ── Toast ─────────────────────────────────────────────────────── */

let toastTimer;

function showToast(message, isError = false) {
  clearTimeout(toastTimer);
  el.toast.textContent = message;
  el.toast.classList.toggle("is-error", isError);
  el.toast.hidden = false;

  requestAnimationFrame(() => el.toast.classList.add("is-visible"));

  toastTimer = setTimeout(() => {
    el.toast.classList.remove("is-visible");
    setTimeout(() => { el.toast.hidden = true; }, 280);
  }, 3200);
}

/* ── Wiring ────────────────────────────────────────────────────── */

function debounce(fn, wait) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

function initControls() {
  const scheduleRender = debounce(renderPreview, 200);

  for (const key of Object.keys(DEFAULTS)) {
    if (key === "mode") continue;

    const input = $(key);
    if (key === "upscale_2x") {
      // Render-only: re-running the preview would cost time and change nothing.
      input.addEventListener("change", updateUpscaleHint);
    } else if (input.type === "range") {
      input.addEventListener("input", () => { syncOutputs(); scheduleRender(); });
    } else {
      input.addEventListener("change", renderPreview);
    }
  }

  el.resetBtn.addEventListener("click", () => {
    applySettings(DEFAULTS);
    updateDetectionChip();
    renderPreview();
    showToast("已回到預設值。");
  });

  el.downloadBtn.addEventListener("click", downloadResult);
  el.changeBtn.addEventListener("click", () => el.fileInput.click());
}

function initDropzone() {
  el.dropzone.addEventListener("click", () => el.fileInput.click());

  el.browseBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    el.fileInput.click();
  });

  el.fileInput.addEventListener("change", () => handleFile(el.fileInput.files[0]));

  for (const type of ["dragenter", "dragover"]) {
    el.dropzone.addEventListener(type, (event) => {
      event.preventDefault();
      el.dropzone.classList.add("is-dragging");
    });
  }

  for (const type of ["dragleave", "drop"]) {
    el.dropzone.addEventListener(type, (event) => {
      event.preventDefault();
      el.dropzone.classList.remove("is-dragging");
    });
  }

  el.dropzone.addEventListener("drop", (event) => handleFile(event.dataTransfer.files[0]));

  // Once a photo is loaded, dropping anywhere on the page swaps it out.
  window.addEventListener("dragover", (event) => event.preventDefault());
  window.addEventListener("drop", (event) => {
    event.preventDefault();
    if (!el.editor.hidden) handleFile(event.dataTransfer.files[0]);
  });
}

/* Ask the server whether the learned upscaler is really installed, so the hint
   promises what this deployment can deliver rather than what the code supports. */
async function initCapabilities() {
  try {
    const response = await fetch("/api/capabilities");
    if (response.ok) state.hasSuperres = (await response.json()).superres;
  } catch {
    state.hasSuperres = null;
  }
  updateUpscaleHint();
}

applySettings(DEFAULTS);
initControls();
initSelect();
initDropzone();
initCompare();
initCapabilities();
