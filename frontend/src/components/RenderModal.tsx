import React from 'react';
import {
  Download,
  CheckCircle2,
  X,
  RefreshCw,
  Image as ImageIcon,
  Sliders,
} from 'lucide-react';
import { EnhanceParams, UploadedImageInfo } from '../types';
import { CuteCamera, CelebrationParticles } from './CuteElements';

interface RenderModalProps {
  isOpen: boolean;
  isRendering: boolean;
  renderResult: { url: string; size: number } | null;
  renderError: string | null;
  onClose: () => void;
  onRetry: () => void;
  onChangePhoto: () => void;
  imageInfo: UploadedImageInfo;
  params: EnhanceParams;
}

export const RenderModal: React.FC<RenderModalProps> = ({
  isOpen,
  isRendering,
  renderResult,
  renderError,
  onClose,
  onRetry,
  onChangePhoto,
  imageInfo,
  params,
}) => {
  if (!isOpen) return null;

  const outputWidth = params.upscale_2x ? imageInfo.width * 2 : imageInfo.width;
  const outputHeight = params.upscale_2x ? imageInfo.height * 2 : imageInfo.height;

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleDownload = () => {
    if (!renderResult) return;
    const a = document.createElement('a');
    a.href = renderResult.url;
    a.download = `stagelens_${params.mode}_${outputWidth}x${outputHeight}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 sm:p-6 animate-in fade-in">
      <div className="relative flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] shadow-2xl">
        {/* Close Button */}
        {!isRendering && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-xl text-[#64748B] hover:bg-[#EFF6FF] hover:text-[#0F172A] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* STATE 1: RENDERING PROCESSING STATE (CUTE ANIMATED LOADER) */}
        {isRendering && (
          <div className="flex flex-col items-center p-8 sm:p-12 text-center relative">
            <div className="relative mb-5 flex items-center justify-center">
              <div className="animate-float">
                <CuteCamera isWorking size="lg" />
              </div>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-[#0F172A]">
              正在幫你調整舞台燈光…
            </h3>
            <p className="mt-1.5 text-xs sm:text-sm text-[#475569] max-w-md">
              照片正在變得更漂亮，正在以原始無損像素演算細膩膚色與光影…
            </p>

            <div className="mt-6 w-full max-w-md rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] p-4 text-left space-y-2 text-xs text-[#1E40AF]">
              <div className="flex items-center gap-2.5">
                <div className="h-2 w-2 rounded-full bg-[#3B82F6] animate-ping" />
                <span>執行全解析度光譜校準（{params.mode}）</span>
              </div>
              <div className="flex items-center gap-2.5 text-[#64748B]">
                <span className="h-2 w-2 rounded-full bg-[#FA84A0]" />
                <span>重建局部明暗對比與高光還原曲線</span>
              </div>
              {params.upscale_2x && (
                <div className="flex items-center gap-2.5 text-[#64748B]">
                  <span className="h-2 w-2 rounded-full bg-[#3B82F6]" />
                  <span>執行 2× 超高畫質無損超解析度放大</span>
                </div>
              )}
            </div>

            <p className="mt-5 text-xs text-[#64748B]">
              ✦ 約需 1~2 秒即可完成輸出…
            </p>
          </div>
        )}

        {/* STATE 2: RENDER ERROR */}
        {!isRendering && renderError && (
          <div className="flex flex-col items-center p-8 sm:p-10 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF1F5] text-[#E11D48] border border-[#FECDD3]">
              <X className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-bold text-[#0F172A]">算圖時發生問題</h3>
            <p className="mt-2 text-xs text-[#E11D48]">{renderError}</p>
            <p className="mt-1 text-xs text-[#64748B]">已為您保留調色參數，請點擊重試。</p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={onClose}
                className="rounded-xl border border-[#E2E8F0] bg-white px-4 py-2 text-xs font-semibold text-[#475569] hover:bg-[#EFF6FF]"
              >
                返回調整
              </button>
              <button
                onClick={onRetry}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#4B94E6] to-[#FA84A0] px-5 py-2 text-xs font-bold text-white shadow-sm"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>重新算圖</span>
              </button>
            </div>
          </div>
        )}

        {/* STATE 3: RENDER SUCCESS STATE (WITH GENTLE CELEBRATION) */}
        {!isRendering && renderResult && (
          <div className="flex flex-col p-6 sm:p-8 relative">
            {/* Celebration particles */}
            <CelebrationParticles />

            {/* Header */}
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-full bg-[#EFF6FF] flex items-center justify-center text-[#2563EB]">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0F172A]">
                  完成！你的照片準備好了。
                </h3>
                <p className="text-xs text-[#64748B]">
                  已成功還原自然膚色與現場光影氛圍。
                </p>
              </div>
            </div>

            {/* High-res Image Preview */}
            <div className="relative max-h-72 w-full overflow-hidden rounded-xl bg-[#0F172A] border border-[#E2E8F0] flex items-center justify-center">
              <img
                src={renderResult.url}
                alt="修復成果"
                className="h-full max-h-72 w-full object-contain"
              />
              <div className="absolute bottom-3 right-3 rounded-lg bg-black/75 px-2.5 py-1 font-mono text-xs font-bold text-white backdrop-blur-sm border border-white/10">
                {outputWidth} × {outputHeight} px
              </div>
            </div>

            {/* Output Specs Banner */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 text-xs">
              <div>
                <span className="text-[#64748B] block text-[10px] font-bold">輸出解析度</span>
                <span className="font-mono font-bold text-[#0F172A]">
                  {outputWidth} × {outputHeight}
                </span>
              </div>
              <div>
                <span className="text-[#64748B] block text-[10px] font-bold">檔案大小</span>
                <span className="font-mono font-bold text-[#0F172A]">
                  {formatFileSize(renderResult.size)}
                </span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-[#64748B] block text-[10px] font-bold">格式規格</span>
                <span className="font-bold text-[#2563EB]">
                  無損 PNG {params.upscale_2x ? '（2× 超解析度）' : ''}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
              <button
                id="download-final-btn"
                onClick={handleDownload}
                className="inline-flex w-full sm:flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#4B94E6] to-[#FA84A0] hover:from-[#3B82F6] hover:to-[#F472B6] py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm active:scale-98 transition-all"
              >
                <Download className="h-4 w-4" />
                <span>下載修復照片</span>
              </button>

              <button
                onClick={onClose}
                className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-4 py-2.5 text-xs font-semibold text-[#475569] hover:bg-[#EFF6FF] hover:text-[#2563EB] transition-all"
              >
                <Sliders className="h-3.5 w-3.5 text-[#3B82F6]" />
                <span>繼續微調</span>
              </button>

              <button
                onClick={onChangePhoto}
                className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-4 py-2.5 text-xs font-semibold text-[#475569] hover:bg-[#EFF6FF] hover:text-[#2563EB] transition-all"
              >
                <ImageIcon className="h-3.5 w-3.5 text-[#3B82F6]" />
                <span>換下一張</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
