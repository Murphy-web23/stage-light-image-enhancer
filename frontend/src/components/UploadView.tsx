import React, { useState, useRef } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Sliders,
  AlertCircle,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';
import {
  CuteCamera,
  CuteSparkle,
  CuteLeaf,
  CuteWavyUnderline,
  CuteMiniPolaroid,
} from './CuteElements';

interface UploadViewProps {
  onFileSelected: (file: File) => void;
  isUploading: boolean;
  uploadError: string | null;
  onClearError: () => void;
}

export const UploadView: React.FC<UploadViewProps> = ({
  onFileSelected,
  isUploading,
  uploadError,
  onClearError,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    onClearError();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onClearError();
    if (e.target.files && e.target.files.length > 0) {
      validateAndUpload(e.target.files[0]);
    }
  };

  const validateAndUpload = (file: File) => {
    // Kept in sync with the backend's real limits (api.py): JPG/PNG only, 20MB max.
    if (!/^image\/(jpeg|png)$/.test(file.type)) {
      alert('請上傳 JPG 或 PNG 格式的圖片檔案。');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      alert('圖片檔案大小不可超過 20MB。');
      return;
    }
    onFileSelected(file);
  };

  return (
    <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center px-4 py-8 sm:px-6 lg:py-14 overflow-hidden">
      {/* Background Micro Accents & Lively Floaties */}
      <div className="pointer-events-none absolute top-12 left-6 hidden xl:block animate-float-slow opacity-85">
        <CuteMiniPolaroid type="purple" label="紫光修正" className="rotate-[-6deg] hover:rotate-0 transition-transform" />
      </div>

      <div className="pointer-events-none absolute top-16 right-8 hidden xl:block animate-float opacity-85">
        <CuteMiniPolaroid type="yellow" label="黃光還原" className="rotate-[5deg] hover:rotate-0 transition-transform" />
      </div>

      <div className="pointer-events-none absolute top-32 left-28 hidden lg:block animate-twinkle opacity-85">
        <CuteSparkle size={18} color="#3B82F6" />
      </div>

      <div className="pointer-events-none absolute top-28 right-32 hidden lg:block animate-twinkle opacity-85">
        <CuteSparkle size={16} color="#FA84A0" />
      </div>

      <div className="pointer-events-none absolute top-2/5 left-10 hidden lg:block animate-sway opacity-75">
        <CuteLeaf color="#FA84A0" />
      </div>

      <div className="pointer-events-none absolute top-1/2 right-12 hidden lg:block animate-float-gentle opacity-75">
        <CuteSparkle size={14} color="#60A5FA" />
      </div>

      {/* ========================================================================= */}
      {/* HERO SECTION: Rich Typographic Hierarchy & Visual Focal Point */}
      {/* ========================================================================= */}
      <div className="relative mb-8 sm:mb-10 text-center flex flex-col items-center max-w-3xl">
        {/* Soft Pastel Blue Badge */}
        <div className="inline-flex items-center gap-2 rounded-full bg-[#F0F5FA] px-4 py-1.5 text-xs font-bold text-[#4A6D8C] border border-[#D5E3EE] mb-4 shadow-2xs transition-all hover:scale-102">
          <span className="flex h-2 w-2 rounded-full bg-[#7BA8CE] animate-pulse" />
          <span className="tracking-wide">舞台燈光偏色濾除 · 自動光譜修復小幫手</span>
          <CuteSparkle size={11} color="#E5A1B0" />
        </div>

        {/* Dynamic & Expressive Headline */}
        <h1 className="relative text-3xl sm:text-4xl lg:text-[44px] font-black tracking-tight text-[#2D3B48] leading-[1.3] sm:leading-[1.25]">
          <span className="block text-2xl sm:text-3xl lg:text-3xl font-extrabold text-[#475569] mb-1">
            去除演唱會照片的
          </span>
          <span className="inline-flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1">
            {/* Key Phrase 1: 強烈舞台偏光 with soft sky blue highlight */}
            <span className="relative inline-block px-1">
              <span className="relative z-10 text-[#2D3B48]">刺眼偏光</span>
              <span className="absolute inset-x-0 bottom-1.5 -z-0 h-3 bg-[#EAF2F8] rounded-md -rotate-1" />
              <span className="absolute -bottom-1 inset-x-0">
                <CuteWavyUnderline color="#7BA8CE" />
              </span>
            </span>

            <span className="text-[#64748B] font-medium text-2xl sm:text-3xl lg:text-3xl">與</span>

            {/* Key Phrase 2: 雜色射燈 with Gentle Sakura Pink pill & spark */}
            <span className="relative inline-flex items-center gap-1 bg-[#FDF0F4] px-3.5 py-0.5 rounded-2xl border border-[#F5D5DE] text-[#B86B7E] shadow-2xs font-extrabold">
              <span className="relative z-10">雜色射燈</span>
              <CuteSparkle size={14} color="#E5A1B0" className="animate-twinkle -mr-0.5" />
            </span>
          </span>
        </h1>

        {/* Reassuring, warm descriptive subtitle */}
        <p className="mt-4 max-w-xl text-xs sm:text-sm lg:text-base leading-relaxed text-[#5B6D7E] font-normal">
          精準過濾掉破壞畫面的強烈紫光、泛黃射燈與面部死白過曝，淨化色彩光譜，讓人物肌膚與舞台主角清晰呈現。
        </p>

        {/* Decorative mini badge row */}
        <div className="mt-3.5 flex flex-wrap items-center justify-center gap-3 text-[11px] font-semibold text-[#6E8092]">
          <span className="inline-flex items-center gap-1">
            <span className="text-sm">✨</span> 自動光譜診斷
          </span>
          <span>•</span>
          <span className="inline-flex items-center gap-1">
            <span className="text-sm">🌸</span> 濾除射燈偏光
          </span>
          <span>•</span>
          <span className="inline-flex items-center gap-1">
            <span className="text-sm">🌟</span> 自然通透膚質
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* UPLOAD ERROR BANNER */}
      {/* ========================================================================= */}
      {uploadError && (
        <div className="mb-6 flex w-full max-w-2xl items-center gap-3 rounded-2xl border border-[#F5D5DE] bg-[#FDF0F4] p-4 text-xs text-[#B86B7E] shadow-2xs animate-in fade-in">
          <AlertCircle className="h-4 w-4 flex-shrink-0 text-[#B86B7E]" />
          <div className="flex-1">
            <p className="font-bold text-xs text-[#8A4557]">上傳遇到一點小狀況</p>
            <p className="text-xs text-[#B86B7E] mt-0.5">{uploadError}</p>
          </div>
          <button
            onClick={onClearError}
            className="rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-[#8A4557] hover:bg-[#FAF0F3] border border-[#F5D5DE] transition-colors"
          >
            我知道了
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PRIMARY DROPZONE: Friendly, Organic & Interactive */}
      {/* ========================================================================= */}
      <div
        id="upload-dropzone"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`group relative flex w-full max-w-2xl flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 sm:p-12 text-center transition-all duration-300 cursor-pointer overflow-hidden ${
          isDragOver
            ? 'border-[#7BA8CE] bg-[#F0F5FA] scale-[1.015] shadow-md ring-4 ring-[#7BA8CE]/15'
            : 'border-[#D5E3EE] bg-[#FFFFFF] hover:border-[#98BBD6] hover:bg-[#F8FAFC] hover:shadow-sm shadow-2xs'
        }`}
      >
        {/* Soft ambient background radial highlight */}
        <div className="pointer-events-none absolute inset-0 bg-radial from-[#F0F5FA] via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg"
          className="hidden"
          onChange={handleFileInputChange}
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="relative z-10 flex flex-col items-center py-4">
            <div className="relative mb-4 flex items-center justify-center">
              <div className="animate-float">
                <CuteCamera isWorking size="lg" />
              </div>
            </div>
            <h3 className="text-base font-bold text-[#2D3B48] mt-1">
              正在細心分析照片中的舞台光影…
            </h3>
            <p className="mt-1 text-xs text-[#5B6D7E] max-w-xs leading-relaxed">
              計算色溫直方圖、識別射燈偏色光譜與高光過曝區域
            </p>
          </div>
        ) : (
          <div className="relative z-10 flex flex-col items-center">
            {/* Interactive Cute Camera Illustration with Hover State */}
            <div className="mb-4 relative">
              <div className="animate-float-gentle group-hover:scale-108 group-hover:-rotate-2 transition-transform duration-300">
                <CuteCamera size="lg" />
              </div>
              <span className="absolute -top-1.5 -right-2.5 text-xs text-[#E5A1B0] animate-twinkle">
                ✦
              </span>
              <span className="absolute -bottom-1 -left-2 text-[10px] text-[#7BA8CE] animate-twinkle">
                ★
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-extrabold text-[#2D3B48] group-hover:text-[#4A6D8C] transition-colors">
              把你的演唱會照片放進來吧
            </h3>
            <p className="mt-1.5 text-xs sm:text-sm text-[#5B6D7E] max-w-sm">
              輕輕拖曳照片至此處，或點擊瀏覽電腦照片
            </p>

            {/* Primary Action Button with gentle spring hover and low-saturation pastel gradient */}
            <div className="mt-5 flex items-center justify-center">
              <button
                type="button"
                id="browse-file-btn"
                className="group/btn inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#7BA8CE] to-[#E5A1B0] hover:from-[#6B9CC4] hover:to-[#D98F9F] px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-2xs active:scale-95 transition-all"
              >
                <ImageIcon className="h-4 w-4 text-white/90" />
                <span>選擇照片開始修復</span>
                <ArrowRight className="h-3.5 w-3.5 transform group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Safe specs footer note */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 text-[11px] font-medium text-[#6E8092]">
              <span className="bg-[#F0F5FA] px-2 py-0.5 rounded-md text-[#4A6D8C]">JPG / PNG</span>
              <span>•</span>
              <span>最高支援 20MB</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 text-[#4A6D8C] font-semibold">
                <ShieldCheck className="h-3.5 w-3.5 text-[#7BA8CE]" />
                僅暫存於本次工作階段，不會留存
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* THREE PILLARS / VALUE PROPS FOOTER */}
      {/* ========================================================================= */}
      <div className="mt-14 grid w-full max-w-3xl grid-cols-1 gap-6 border-t border-[#E5EDF4] pt-8 sm:grid-cols-3">
        <div className="flex items-start gap-3.5 p-2 rounded-xl hover:bg-white/70 transition-colors">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#F0F5FA] text-[#4A6D8C] border border-[#D5E3EE]">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#2D3B48]">自動辨識舞台光譜</h4>
            <p className="mt-0.5 text-xs text-[#6E8092] leading-relaxed">
              自動精準解析紫色、黃光與各類射燈，撫平色彩斷層還原自然好氣色。
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3.5 p-2 rounded-xl hover:bg-white/70 transition-colors">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#FDF0F4] text-[#B86B7E] border border-[#F5D5DE]">
            <Sliders className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#2D3B48]">保留現場感動氛圍</h4>
            <p className="mt-0.5 text-xs text-[#6E8092] leading-relaxed">
              自由微調舞台燈光保留程度，在自然美顏與震撼光感之間取得最佳平衡。
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3.5 p-2 rounded-xl hover:bg-white/70 transition-colors">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#F0F5FA] text-[#4A6D8C] border border-[#D5E3EE]">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#2D3B48]">高畫質無損算圖輸出</h4>
            <p className="mt-0.5 text-xs text-[#6E8092] leading-relaxed">
              以 100% 原始像素精準演算，亦可啟用 2× 超高解析度無損放大。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
