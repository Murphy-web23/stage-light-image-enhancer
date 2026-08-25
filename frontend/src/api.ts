import { Capabilities, EnhanceParams, UploadedImageInfo } from './types';

/**
 * Thin client for the real FastAPI backend (see ../../api.py).
 * Every call here maps 1:1 to a backend endpoint — no client-side image
 * processing happens in this app; the Python/OpenCV pipeline is the only
 * place enhancement logic lives.
 */

export class SessionExpiredError extends Error {
  constructor(message = '圖片工作階段已過期，請重新上傳。') {
    super(message);
    this.name = 'SessionExpiredError';
  }
}

async function readErrorDetail(response: Response, fallback: string): Promise<string> {
  try {
    const data = await response.json();
    return typeof data.detail === 'string' ? data.detail : fallback;
  } catch {
    return fallback;
  }
}

export async function fetchCapabilities(): Promise<Capabilities> {
  try {
    const response = await fetch('/api/capabilities');
    if (!response.ok) return { superres: false };
    return await response.json();
  } catch {
    return { superres: false };
  }
}

export async function uploadImageFile(file: File): Promise<UploadedImageInfo> {
  if (!file) {
    throw new Error('未偵測到上傳檔案，請確認檔案格式是否正確。');
  }

  // Mirror the backend's real constraints (api.py: JPG/PNG, 20MB) so the
  // user sees an accurate error before spending time on an upload that
  // would be rejected anyway.
  if (!/^image\/(jpeg|png)$/.test(file.type)) {
    throw new Error('請上傳 JPG 或 PNG 格式的圖片檔案。');
  }
  if (file.size > 20 * 1024 * 1024) {
    throw new Error('檔案大小超過 20MB 上限，請選擇較小的圖片檔案。');
  }

  const body = new FormData();
  body.append('file', file);

  const response = await fetch('/api/images', { method: 'POST', body });
  if (!response.ok) {
    throw new Error(await readErrorDetail(response, '上傳失敗，請再試一次。'));
  }

  const info = await response.json();

  // The original file is already in the browser at full resolution, so the
  // "before" image can use it directly instead of round-tripping through
  // GET /api/images/{id}/original (which only serves a downscaled copy).
  const originalUrl = URL.createObjectURL(file);

  return {
    image_id: info.image_id,
    width: info.width,
    height: info.height,
    detected_mode: info.detected_mode,
    detected_label: info.detected_label,
    detected_strength: info.detected_strength,
    fileName: file.name,
    fileSize: file.size,
    originalUrl,
  };
}

async function requestRender(
  imageId: string,
  kind: 'preview' | 'render',
  params: EnhanceParams,
  signal?: AbortSignal
): Promise<Blob> {
  const response = await fetch(`/api/images/${imageId}/${kind}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
    signal,
  });

  if (response.status === 404) {
    throw new SessionExpiredError(
      await readErrorDetail(response, '圖片工作階段已過期，請重新上傳。')
    );
  }

  if (!response.ok) {
    const fallback = kind === 'preview' ? '預覽更新失敗，請微調參數後重試。' : '高畫質算圖失敗，請稍後再試。';
    throw new Error(await readErrorDetail(response, fallback));
  }

  return response.blob();
}

export async function fetchPreviewImage(
  imageId: string,
  params: EnhanceParams,
  signal?: AbortSignal
): Promise<string> {
  const blob = await requestRender(imageId, 'preview', params, signal);
  return URL.createObjectURL(blob);
}

export async function renderHighResImage(
  imageId: string,
  params: EnhanceParams
): Promise<{ blob: Blob; url: string; size: number }> {
  const blob = await requestRender(imageId, 'render', params);
  return { blob, url: URL.createObjectURL(blob), size: blob.size };
}
