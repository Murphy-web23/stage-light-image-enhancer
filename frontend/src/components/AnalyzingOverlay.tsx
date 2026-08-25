import React, { useEffect, useState } from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { UploadedImageInfo } from '../types';
import { COLOR_MODES } from '../constants/presets';
import { CuteSparkle } from './CuteElements';

interface AnalyzingOverlayProps {
  imageInfo: UploadedImageInfo;
  onFinishAnalysis: () => void;
}

export const AnalyzingOverlay: React.FC<AnalyzingOverlayProps> = ({
  imageInfo,
  onFinishAnalysis,
}) => {
  const [step, setStep] = useState(1);

  const modeInfo = COLOR_MODES.find((m) => m.id === imageInfo.detected_mode) || COLOR_MODES[0];

  useEffect(() => {
    const t1 = setTimeout(() => setStep(2), 600);
    const t2 = setTimeout(() => setStep(3), 1300);
    const t3 = setTimeout(() => onFinishAnalysis(), 2000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onFinishAnalysis]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs px-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-6 shadow-2xl sm:p-8">
        {/* Thumbnail with Scanning Line */}
        <div className="relative mx-auto mb-6 h-48 w-full overflow-hidden rounded-xl border border-[#E5EDF4] bg-[#0F172A] flex items-center justify-center">
          <img
            src={imageInfo.originalUrl}
            alt="Analyzing"
            className="h-full w-full object-contain"
          />

          {/* Laser scan line in soft sky blue / sakura pink */}
          <div className="absolute inset-x-0 h-0.5 bg-[#7BA8CE] shadow-[0_0_12px_#E5A1B0] animate-[scan_1.6s_ease-in-out_infinite]" />

          {/* Live badge */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-black/75 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-xs border border-white/10">
            <span className="h-1.5 w-1.5 rounded-full bg-[#E5A1B0] animate-ping" />
            <span>光譜深度分析中</span>
          </div>

          <div className="absolute bottom-3 right-3 rounded bg-black/70 px-2 py-0.5 font-mono text-[10px] text-[#CBD5E1]">
            {imageInfo.width} × {imageInfo.height} px
          </div>
        </div>

        {/* Status Text & Diagnosis */}
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#F0F5FA] px-3 py-1 text-xs font-semibold text-[#4A6D8C] mb-3 border border-[#D5E3EE]">
            <Sparkles className="h-3.5 w-3.5 text-[#7BA8CE]" />
            <span>舞台光影光譜診斷完成</span>
            <CuteSparkle size={10} color="#E5A1B0" />
          </div>

          <h3 className="text-lg font-bold text-[#2D3B48]">
            偵測到：{imageInfo.detected_label}
          </h3>

          <div className="mt-4 rounded-xl border border-[#E5EDF4] bg-[#F8FAFC] p-3.5 text-left">
            <div className="flex items-center justify-between text-xs font-medium text-[#5B6D7E]">
              <span className="flex items-center gap-1.5">
                <span className="text-base">{modeInfo.emoji}</span>
                <span className="font-semibold text-[#2D3B48]">{modeInfo.label}</span>
              </span>
              <span className="font-semibold text-[#4A6D8C]">
                偏色強度 {imageInfo.detected_strength}%
              </span>
            </div>

            {/* Strength Bar */}
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#E5EDF4]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#7BA8CE] to-[#E5A1B0] transition-all duration-700"
                style={{ width: `${imageInfo.detected_strength}%` }}
              />
            </div>

            <p className="mt-2.5 text-xs text-[#6E8092] leading-relaxed">
              💡 系統已為你自動載入「{modeInfo.shortLabel}」最佳化還原參數，可在下一步自由微調。
            </p>
          </div>

          {/* Quick analysis step checklist */}
          <div className="mt-4 space-y-1.5 text-left text-xs text-[#6E8092]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#4A6D8C] flex-shrink-0" />
              <span>RGB 直方圖光譜與色溫比對完成</span>
            </div>
            <div className="flex items-center gap-2">
              {step >= 2 ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-[#4A6D8C] flex-shrink-0" />
              ) : (
                <div className="h-3.5 w-3.5 rounded-full border-2 border-[#7BA8CE] border-t-transparent animate-spin flex-shrink-0" />
              )}
              <span>建立動態高光抑制與膚色還原曲線</span>
            </div>
            <div className="flex items-center gap-2">
              {step >= 3 ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-[#4A6D8C] flex-shrink-0" />
              ) : (
                <div className="h-3.5 w-3.5 rounded-full border-2 border-[#E5EDF4] flex-shrink-0" />
              )}
              <span>載入即時修復預覽工作區</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
