import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { UploadView } from './components/UploadView';
import { AnalyzingOverlay } from './components/AnalyzingOverlay';
import { ImageComparison } from './components/ImageComparison';
import { ControlPanel } from './components/ControlPanel';
import { ExportBar } from './components/ExportBar';
import { RenderModal } from './components/RenderModal';
import { SessionExpiredModal } from './components/SessionExpiredModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import {
  AppState,
  Capabilities,
  EnhanceParams,
  UploadedImageInfo,
} from './types';
import {
  DEFAULT_ENHANCE_PARAMS,
} from './constants/presets';
import {
  fetchCapabilities,
  fetchPreviewImage,
  renderHighResImage,
  uploadImageFile,
  SessionExpiredError,
} from './api';

export default function App() {
  const [appState, setAppState] = useState<AppState>('empty');
  const [capabilities, setCapabilities] = useState<Capabilities>({ superres: true });
  const [imageInfo, setImageInfo] = useState<UploadedImageInfo | null>(null);
  const [params, setParams] = useState<EnhanceParams>(DEFAULT_ENHANCE_PARAMS);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Render modal state
  const [isRenderModalOpen, setIsRenderModalOpen] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [renderResult, setRenderResult] = useState<{ url: string; size: number } | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);

  // Session Expired modal
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Request sequencing and abort ref to prevent race conditions during rapid slider moves
  const latestRequestIdRef = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load capabilities once on mount
  useEffect(() => {
    fetchCapabilities().then(setCapabilities);
  }, []);

  // Handle image upload
  const handleFileSelected = async (file: File) => {
    setUploadError(null);
    setAppState('uploading');

    try {
      const uploadedInfo = await uploadImageFile(file);
      setImageInfo(uploadedInfo);

      // Auto-set mode & strength from the backend's detection
      const initialParams: EnhanceParams = {
        ...DEFAULT_ENHANCE_PARAMS,
        mode: uploadedInfo.detected_mode,
        correction_strength: uploadedInfo.detected_strength || 70,
      };
      setParams(initialParams);

      // Transition to analyzing display
      setAppState('analyzing');
    } catch (err: any) {
      console.error('Upload failed:', err);
      setUploadError(err.message || '上傳失敗，請確認檔案格式是否正確。');
      setAppState('empty');
    }
  };

  // Called when the analysis overlay finishes
  const handleFinishAnalysis = () => {
    setAppState('ready');
  };

  // Debounced auto-preview fetcher with strict stale request protection
  const triggerPreviewUpdate = useCallback(
    (newParams: EnhanceParams, currentImageInfo: UploadedImageInfo) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(async () => {
        // Abort previous in-flight request
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;

        const requestId = ++latestRequestIdRef.current;
        setIsLoadingPreview(true);
        setPreviewError(null);

        try {
          const url = await fetchPreviewImage(
            currentImageInfo.image_id,
            newParams,
            controller.signal
          );

          // Discard response if a newer request has already been issued
          if (requestId === latestRequestIdRef.current) {
            setPreviewUrl((prev) => {
              if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
              return url;
            });
            setIsLoadingPreview(false);
          }
        } catch (err: any) {
          if (err.name === 'AbortError') return;

          if (err instanceof SessionExpiredError) {
            setIsSessionExpired(true);
            return;
          }

          if (requestId === latestRequestIdRef.current) {
            console.error('Preview error:', err);
            setPreviewError(err.message || '即時預覽更新失敗');
            setIsLoadingPreview(false);
          }
        }
      }, 250); // 250ms debounce
    },
    []
  );

  // Trigger preview when params change or when image enters 'ready' state
  useEffect(() => {
    if (appState === 'ready' && imageInfo) {
      triggerPreviewUpdate(params, imageInfo);
    }
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [params, imageInfo, appState, triggerPreviewUpdate]);

  // Handle Export / Render High-Res
  const handleExport = async () => {
    if (!imageInfo) return;

    setIsRenderModalOpen(true);
    setIsRendering(true);
    setRenderError(null);
    setRenderResult(null);

    try {
      const result = await renderHighResImage(imageInfo.image_id, params);
      setRenderResult({
        url: result.url,
        size: result.size,
      });
      setIsRendering(false);
    } catch (err: any) {
      if (err instanceof SessionExpiredError) {
        setIsRenderModalOpen(false);
        setIsSessionExpired(true);
        return;
      }
      setRenderError(err.message || '高畫質算圖失敗，請稍後再試。');
      setIsRendering(false);
    }
  };

  // Reset to default parameters
  const handleResetParams = () => {
    if (imageInfo) {
      setParams({
        ...DEFAULT_ENHANCE_PARAMS,
        mode: imageInfo.detected_mode,
        correction_strength: imageInfo.detected_strength || 70,
      });
    } else {
      setParams(DEFAULT_ENHANCE_PARAMS);
    }
  };

  // Change / Switch to another photo
  const handleChangePhoto = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setImageInfo(null);
    setPreviewUrl(null);
    setAppState('empty');
    setIsRenderModalOpen(false);
    setRenderResult(null);
    setIsSessionExpired(false);
  };

  const hasCustomizedParams =
    params.correction_strength !== (imageInfo?.detected_strength || 70) ||
    params.preserve_stage_light !== 10 ||
    params.brightness !== 0 ||
    params.contrast !== 0 ||
    params.saturation !== 0 ||
    params.upscale_2x;

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC] text-[#0F172A] selection:bg-[#BFDBFE] selection:text-[#1E40AF] font-sans antialiased">
      {/* Header */}
      <Header
        imageInfo={imageInfo}
        params={params}
        hasCustomizedParams={hasCustomizedParams}
        onResetParams={handleResetParams}
        onChangePhoto={handleChangePhoto}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        isSuperResEnabled={capabilities.superres}
      />

      {/* Main Content Area */}
      <main className="flex flex-1 flex-col">
        {/* State 1: Empty / Upload Screen */}
        {appState === 'empty' && (
          <UploadView
            onFileSelected={handleFileSelected}
            isUploading={false}
            uploadError={uploadError}
            onClearError={() => setUploadError(null)}
          />
        )}

        {/* State 2: Uploading state */}
        {appState === 'uploading' && (
          <UploadView
            onFileSelected={handleFileSelected}
            isUploading={true}
            uploadError={null}
            onClearError={() => {}}
          />
        )}

        {/* State 3: Analyzing Transition Overlay */}
        {appState === 'analyzing' && imageInfo && (
          <AnalyzingOverlay
            imageInfo={imageInfo}
            onFinishAnalysis={handleFinishAnalysis}
          />
        )}

        {/* State 4: Main Editor Screen */}
        {appState === 'ready' && imageInfo && (
          <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col p-3 sm:p-5 lg:p-6">
            {/* Editor Workspace: Left Preview & Right Control Panel */}
            <div className="flex flex-1 flex-col gap-4 lg:flex-row lg:items-stretch">
              {/* Left Hero: Interactive Before/After Image Stage */}
              <ImageComparison
                originalUrl={imageInfo.originalUrl}
                previewUrl={previewUrl}
                isLoadingPreview={isLoadingPreview}
                previewError={previewError}
                onRetryPreview={() => triggerPreviewUpdate(params, imageInfo)}
                detectedLabel={imageInfo.detected_label}
                detectedStrength={imageInfo.detected_strength}
              />

              {/* Right: Progressive Disclosure Controls Panel */}
              <ControlPanel
                params={params}
                onChange={setParams}
                imageInfo={imageInfo}
                isSuperResAvailable={capabilities.superres}
              />
            </div>
          </div>
        )}
      </main>

      {/* Sticky Export Action Bar (Visible when in Ready Editor State) */}
      {appState === 'ready' && imageInfo && (
        <ExportBar
          imageInfo={imageInfo}
          params={params}
          onExport={handleExport}
          isRendering={isRendering}
          onReset={handleResetParams}
        />
      )}

      {/* High-Resolution Render & Success Modal */}
      {imageInfo && (
        <RenderModal
          isOpen={isRenderModalOpen}
          isRendering={isRendering}
          renderResult={renderResult}
          renderError={renderError}
          onClose={() => setIsRenderModalOpen(false)}
          onRetry={handleExport}
          onChangePhoto={handleChangePhoto}
          imageInfo={imageInfo}
          params={params}
        />
      )}

      {/* Session Expired (404) Modal */}
      <SessionExpiredModal
        isOpen={isSessionExpired}
        onReupload={handleChangePhoto}
      />

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}
