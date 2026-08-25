import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Columns,
  Split,
  Eye,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
} from 'lucide-react';
import { ComparisonMode } from '../types';

interface ImageComparisonProps {
  originalUrl: string;
  previewUrl: string | null;
  isLoadingPreview: boolean;
  previewError: string | null;
  onRetryPreview: () => void;
  detectedLabel: string;
  detectedStrength: number;
}

export const ImageComparison: React.FC<ImageComparisonProps> = ({
  originalUrl,
  previewUrl,
  isLoadingPreview,
  previewError,
  onRetryPreview,
}) => {
  const [mode, setMode] = useState<ComparisonMode>('slider');
  const [sliderPosition, setSliderPosition] = useState(50); // percentage 0-100
  const [isDragging, setIsDragging] = useState(false);
  const [isHoldingOriginal, setIsHoldingOriginal] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut listener: Hold Space to view original
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        setIsHoldingOriginal(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsHoldingOriginal(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handlePointerMove = useCallback(
    (e: PointerEvent | React.PointerEvent) => {
      if (isDragging && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.min(100, Math.max(0, (x / rect.width) * 100));
        setSliderPosition(percentage);
      } else if (isPanning && zoom > 1) {
        setPan({
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y,
        });
      }
    },
    [isDragging, isPanning, zoom, panStart]
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    setIsPanning(false);
  }, []);

  useEffect(() => {
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => {
    setZoom((prev) => {
      const next = Math.max(prev - 0.25, 1);
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleStartPan = (e: React.PointerEvent) => {
    if (zoom > 1 && !isDragging) {
      setIsPanning(true);
      setPanStart({
        x: e.clientX - pan.x,
        y: e.clientY - pan.y,
      });
    }
  };

  const currentEnhancedUrl = previewUrl || originalUrl;

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Top stage controls bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 mb-3">
        {/* Left: View Mode Switches */}
        <div className="flex items-center gap-1 rounded-xl bg-[#FFFFFF] p-1 border border-[#E5EDF4] shadow-2xs">
          <button
            id="view-mode-slider"
            onClick={() => setMode('slider')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              mode === 'slider'
                ? 'bg-[#7BA8CE] text-white shadow-2xs'
                : 'text-[#6E8092] hover:text-[#2D3B48]'
            }`}
          >
            <Split className="h-3.5 w-3.5" />
            <span>滑桿分割對比</span>
          </button>

          <button
            id="view-mode-side-by-side"
            onClick={() => setMode('side-by-side')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              mode === 'side-by-side'
                ? 'bg-[#7BA8CE] text-white shadow-2xs'
                : 'text-[#6E8092] hover:text-[#2D3B48]'
            }`}
          >
            <Columns className="h-3.5 w-3.5" />
            <span>左右並排檢視</span>
          </button>
        </div>

        {/* Center: Live status indicator */}
        <div className="hidden sm:flex items-center gap-2">
          {isLoadingPreview ? (
            <span className="flex items-center gap-1.5 rounded-full bg-[#F0F5FA] px-3 py-1 text-xs font-semibold text-[#4A6D8C] border border-[#D5E3EE]">
              <span className="h-2 w-2 rounded-full bg-[#7BA8CE] animate-pulse" />
              <span>正在即時同步修復預覽…</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 rounded-full bg-[#FFFFFF] px-3 py-1 text-xs font-medium text-[#6E8092] border border-[#E5EDF4] shadow-2xs">
              <span className="h-1.5 w-1.5 rounded-full bg-[#7BA8CE]" />
              <span>預覽已同步完成 (1400px)</span>
            </span>
          )}
        </div>

        {/* Right Controls: Hold to View Original & Zoom */}
        <div className="flex items-center gap-2">
          <button
            id="hold-original-btn"
            onPointerDown={() => setIsHoldingOriginal(true)}
            onPointerUp={() => setIsHoldingOriginal(false)}
            onPointerLeave={() => setIsHoldingOriginal(false)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              isHoldingOriginal
                ? 'bg-[#2D3B48] text-white shadow-xs'
                : 'bg-[#FFFFFF] text-[#5B6D7E] hover:bg-[#F0F5FA] border border-[#E5EDF4] shadow-2xs'
            }`}
            title="按住此按鈕或鍵盤空白鍵 (Space) 可即時查看修復前原圖"
          >
            <Eye className="h-3.5 w-3.5 text-[#7BA8CE]" />
            <span>按住查看原圖</span>
            <kbd className="hidden md:inline rounded bg-[#F8FAFC] px-1 py-0.5 text-[10px] text-[#5B6D7E] font-mono border border-[#E5EDF4]">
              Space
            </kbd>
          </button>

          <div className="flex items-center rounded-lg bg-[#FFFFFF] p-0.5 border border-[#E5EDF4] shadow-2xs">
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 1}
              className="p-1.5 text-[#6E8092] hover:text-[#2D3B48] disabled:opacity-30 transition-colors"
              title="縮小"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="px-1.5 text-[11px] font-mono font-semibold text-[#5B6D7E]">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              disabled={zoom >= 3}
              className="p-1.5 text-[#6E8092] hover:text-[#2D3B48] disabled:opacity-30 transition-colors"
              title="放大"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            {zoom > 1 && (
              <button
                onClick={handleResetZoom}
                className="p-1.5 text-[#6E8092] hover:text-[#4A6D8C] border-l border-[#E5EDF4] transition-colors"
                title="還原縮放"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Image Stage Container */}
      <div className="flex-1 bg-[#0F1722] rounded-2xl shadow-sm border border-[#E5EDF4] overflow-hidden relative group flex flex-col">
        <div
          ref={containerRef}
          onPointerDown={handleStartPan}
          className={`relative flex flex-1 items-center justify-center overflow-hidden p-2 sm:p-4 select-none bg-[#0F1722] ${
            zoom > 1 ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') : ''
          }`}
          style={{ minHeight: '460px' }}
        >
          {/* Error Overlay */}
          {previewError && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/75 p-6 text-center backdrop-blur-sm">
              <div className="rounded-2xl border border-[#F5D5DE] bg-[#FFFFFF] p-6 max-w-sm text-[#2D3B48] shadow-xl">
                <p className="font-bold text-sm text-[#8A4557]">預覽更新失敗</p>
                <p className="mt-1 text-xs text-[#6E8092]">{previewError}</p>
                <p className="mt-2 text-[11px] text-[#94A3B8]">已妥善保留您的調色參數</p>
                <button
                  onClick={onRetryPreview}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#7BA8CE] to-[#E5A1B0] px-4 py-2 text-xs font-semibold text-white shadow-2xs"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>重新整理預覽</span>
                </button>
              </div>
            </div>
          )}

          {/* Subtle loading spinner in Sky Blue */}
          {isLoadingPreview && (
            <div className="absolute top-4 right-4 z-30 flex items-center gap-2 rounded-full bg-white/95 backdrop-blur-md px-3 py-1 text-xs font-semibold text-[#4A6D8C] shadow-md border border-[#D5E3EE]">
              <div className="h-3 w-3 rounded-full border-2 border-[#7BA8CE] border-t-transparent animate-spin" />
              <span>同步計算中…</span>
            </div>
          )}

          {/* Mode 1: Slider Split Comparison */}
          {mode === 'slider' && !isHoldingOriginal && (
            <div
              className="relative h-full w-full max-h-[72vh] flex items-center justify-center"
              style={{
                transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                transition: isPanning ? 'none' : 'transform 0.15s ease-out',
              }}
            >
              <div className="relative max-h-full max-w-full flex items-center justify-center">
                {/* Enhanced Image (Underneath) */}
                <img
                  src={currentEnhancedUrl}
                  alt="修復後"
                  className="max-h-[68vh] max-w-full rounded-xl object-contain shadow-2xl"
                  draggable={false}
                />

                {/* After Label */}
                <div className="pointer-events-none absolute top-4 right-4 z-10 px-3 py-1 bg-[#4A6D8C]/90 backdrop-blur-md text-white text-xs font-bold rounded-md uppercase tracking-wider shadow-sm border border-white/20">
                  修復後 (After)
                </div>

                {/* Original Image (Clipped on the left) */}
                <div
                  className="absolute inset-0 overflow-hidden rounded-xl"
                  style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                >
                  <img
                    src={originalUrl}
                    alt="原圖"
                    className="h-full w-full object-contain"
                    draggable={false}
                  />

                  {/* Before Label */}
                  <div className="pointer-events-none absolute top-4 left-4 z-10 px-3 py-1 bg-black/60 backdrop-blur-md text-white text-xs font-bold rounded-md uppercase tracking-wider shadow-sm border border-white/10">
                    原圖 (Before)
                  </div>
                </div>

                {/* Draggable Divider Handle Line */}
                <div
                  className="absolute inset-y-0 z-20 cursor-ew-resize select-none"
                  style={{ left: `${sliderPosition}%` }}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    setIsDragging(true);
                  }}
                >
                  {/* Vertical Line */}
                  <div className="absolute inset-y-0 -left-[1px] w-0.5 bg-white/90 shadow-md" />

                  {/* Center Handle Knob */}
                  <div className="absolute top-1/2 -left-4 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border border-[#D5E3EE] transition-transform hover:scale-110 active:scale-95">
                    <div className="flex gap-0.5">
                      <div className="w-0.5 h-3 bg-[#7BA8CE] rounded-full" />
                      <div className="w-0.5 h-3 bg-[#E5A1B0] rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mode 2: Side-by-Side Comparison */}
          {mode === 'side-by-side' && !isHoldingOriginal && (
            <div
              className="grid h-full w-full max-h-[72vh] grid-cols-1 sm:grid-cols-2 gap-3"
              style={{
                transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                transition: isPanning ? 'none' : 'transform 0.15s ease-out',
              }}
            >
              {/* Left: Before */}
              <div className="relative flex items-center justify-center overflow-hidden rounded-xl bg-black/40 border border-white/10">
                <img
                  src={originalUrl}
                  alt="原圖"
                  className="max-h-[65vh] max-w-full object-contain"
                  draggable={false}
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-md text-white text-xs font-bold rounded-md">
                  原圖 (Before)
                </div>
              </div>

              {/* Right: After */}
              <div className="relative flex items-center justify-center overflow-hidden rounded-xl bg-black/40 border border-white/10">
                <img
                  src={currentEnhancedUrl}
                  alt="修復後"
                  className="max-h-[65vh] max-w-full object-contain"
                  draggable={false}
                />
                <div className="absolute top-3 right-3 px-2.5 py-1 bg-[#4A6D8C]/90 backdrop-blur-md text-white text-xs font-bold rounded-md">
                  修復後 (After)
                </div>
              </div>
            </div>
          )}

          {/* Hold to View Original Overlay */}
          {isHoldingOriginal && (
            <div
              className="relative h-full w-full max-h-[72vh] flex items-center justify-center"
              style={{
                transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
              }}
            >
              <img
                src={originalUrl}
                alt="原圖"
                className="max-h-[68vh] max-w-full rounded-xl object-contain"
                draggable={false}
              />
              <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-black/70 backdrop-blur-md text-white text-xs font-bold rounded-full uppercase tracking-wider shadow-lg border border-white/10">
                正在檢視修復前原圖
              </div>
            </div>
          )}

          {/* Floating Bottom View Toggle */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10 pointer-events-auto">
            <button
              onClick={() => setIsHoldingOriginal(!isHoldingOriginal)}
              className={`px-3.5 py-1.5 backdrop-blur-xl rounded-full text-xs font-semibold transition-all ${
                isHoldingOriginal
                  ? 'bg-white text-[#2D3B48] border border-white shadow-md'
                  : 'bg-black/60 text-white/90 border border-white/15 hover:bg-black/80'
              }`}
            >
              原圖檢視
            </button>
            <button
              onClick={() => {
                setIsHoldingOriginal(false);
                setMode(mode === 'slider' ? 'side-by-side' : 'slider');
              }}
              className={`px-3.5 py-1.5 backdrop-blur-xl rounded-full text-xs font-semibold transition-all ${
                !isHoldingOriginal
                  ? 'bg-white/95 text-[#2D3B48] border border-white shadow-md'
                  : 'bg-black/60 text-white/90 border border-white/15 hover:bg-black/80'
              }`}
            >
              {mode === 'slider' ? '切換並排' : '切換滑桿'}
            </button>
          </div>
        </div>
      </div>

      {/* Stage Bottom Footer */}
      <div className="mt-2.5 flex flex-wrap justify-between items-center px-1 text-xs text-[#6E8092] gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[#7BA8CE]">✦</span>
          <span>即時預覽為 1400px 高畫質演算；點擊下方輸出將以 100% 原始像素進行無損算圖。</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#7BA8CE]" />
          <span className="text-xs font-medium text-[#5B6D7E]">舞台光影修復引擎運作中</span>
        </div>
      </div>
    </div>
  );
};
