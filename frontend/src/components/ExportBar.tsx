import React from 'react';
import { Download, ArrowRight, Sparkles } from 'lucide-react';
import { EnhanceParams, UploadedImageInfo } from '../types';
import { COLOR_MODES } from '../constants/presets';

interface ExportBarProps {
  imageInfo: UploadedImageInfo;
  params: EnhanceParams;
  onExport: () => void;
  isRendering: boolean;
  onReset: () => void;
}

export const ExportBar: React.FC<ExportBarProps> = ({
  imageInfo,
  params,
  onExport,
  isRendering,
  onReset,
}) => {
  const outputWidth = params.upscale_2x ? imageInfo.width * 2 : imageInfo.width;
  const outputHeight = params.upscale_2x ? imageInfo.height * 2 : imageInfo.height;

  const modeObj = COLOR_MODES.find((m) => m.id === params.mode) || COLOR_MODES[0];

  return (
    <div className="w-full border-t border-[#E5EDF4] bg-[#FFFFFF] px-4 sm:px-6 py-3.5 sticky bottom-0 z-20 shadow-2xs">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
        {/* Left: Resolution & Settings summary */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6E8092]">
              最終輸出規格
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-[#2D3B48]">
                {outputWidth} × {outputHeight} px
              </span>
              {params.upscale_2x && (
                <span className="inline-flex items-center gap-1 rounded-md bg-[#FDF0F4] px-2 py-0.5 text-[10px] font-bold text-[#B86B7E] border border-[#F5D5DE]">
                  <Sparkles className="h-3 w-3 text-[#E5A1B0]" />
                  2× 超高解析度
                </span>
              )}
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2 border-l border-[#E5EDF4] pl-4 text-xs text-[#6E8092]">
            <span>
              模式：
              <strong className="text-[#2D3B48] font-semibold">
                {modeObj.shortLabel}
              </strong>
            </span>
            <span>•</span>
            <span>
              修復強度：
              <strong className="text-[#2D3B48] font-semibold">{params.correction_strength}%</strong>
            </span>
          </div>
        </div>

        {/* Right: Primary Export Action Button */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            id="export-reset-btn"
            onClick={onReset}
            disabled={isRendering}
            className="rounded-xl border border-[#E5EDF4] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#5B6D7E] hover:bg-[#F0F5FA] hover:text-[#4A6D8C] transition-all disabled:opacity-50"
          >
            重設
          </button>

          <button
            id="primary-export-btn"
            onClick={onExport}
            disabled={isRendering}
            className="group inline-flex flex-1 sm:flex-initial items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7BA8CE] to-[#E5A1B0] hover:from-[#6B9CC4] hover:to-[#D98F9F] px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-2xs active:scale-98 transition-all disabled:opacity-50"
          >
            {isRendering ? (
              <>
                <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>正在以無損畫質算圖中…</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span>輸出高畫質照片</span>
                <ArrowRight className="h-4 w-4 transform group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
