import React from 'react';
import {
  RotateCcw,
  Image as ImageIcon,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { UploadedImageInfo, EnhanceParams } from '../types';
import { CuteCamera, CuteSparkle } from './CuteElements';

interface HeaderProps {
  imageInfo: UploadedImageInfo | null;
  params: EnhanceParams;
  hasCustomizedParams: boolean;
  onResetParams: () => void;
  onChangePhoto: () => void;
  onOpenShortcuts: () => void;
  isSuperResEnabled: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  imageInfo,
  hasCustomizedParams,
  onResetParams,
  onChangePhoto,
  onOpenShortcuts,
  isSuperResEnabled,
}) => {
  return (
    <nav className="h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between bg-[#FFFFFF] border-b border-[#E5EDF4] sticky top-0 z-30 shadow-2xs">
      {/* Brand Logo & Title */}
      <div
        className="flex items-center gap-2.5 cursor-pointer group select-none"
        onClick={() => {
          if (imageInfo) onChangePhoto();
        }}
      >
        <div className="relative group-hover:scale-105 group-hover:-rotate-3 transition-transform duration-300">
          <CuteCamera size="sm" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-black text-base sm:text-lg tracking-tight text-[#2D3B48] group-hover:text-[#6B9CC4] transition-colors">
              StageLens
            </span>
            <span className="text-[11px] font-bold text-[#4A6D8C] bg-[#F0F5FA] px-2 py-0.5 rounded-md border border-[#D5E3EE] shadow-2xs flex items-center gap-1">
              <span>光影修復</span>
              <CuteSparkle size={9} color="#E5A1B0" />
            </span>
          </div>
        </div>
      </div>

      {/* Center Image Session Active */}
      {imageInfo && (
        <div className="hidden md:flex items-center gap-2 text-xs text-[#5B6D7E] font-medium bg-[#F8FAFC] px-3 py-1.5 rounded-full border border-[#E5EDF4]">
          <span className="w-1.5 h-1.5 bg-[#7BA8CE] rounded-full animate-pulse" />
          <span className="text-[#2D3B48] font-semibold truncate max-w-[170px]">
            {imageInfo.fileName || '舞台照片.jpg'}
          </span>
          <span className="text-[#CBD5E1]">•</span>
          <span className="font-mono text-[#6E8092]">
            {imageInfo.width} × {imageInfo.height}
          </span>
          {isSuperResEnabled && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#FDF0F4] text-[#B86B7E] rounded text-[10px] font-bold border border-[#F5D5DE]">
              <Sparkles className="h-2.5 w-2.5 text-[#E5A1B0]" />
              2× 超解析度
            </span>
          )}
        </div>
      )}

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {imageInfo ? (
          <>
            {hasCustomizedParams && (
              <button
                id="header-reset-btn"
                onClick={onResetParams}
                className="px-2.5 py-1.5 text-xs font-medium text-[#6E8092] hover:text-[#2D3B48] hover:bg-[#F0F5FA] rounded-lg transition-colors flex items-center gap-1"
                title="將所有參數還原為系統預設值"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">重設參數</span>
              </button>
            )}

            <button
              id="header-change-photo-btn"
              onClick={onChangePhoto}
              className="px-3 py-1.5 text-[#4A6D8C] font-semibold hover:bg-[#F0F5FA] bg-[#F8FAFC] rounded-xl text-xs border border-[#D5E3EE] transition-all flex items-center gap-1.5 shadow-2xs hover:border-[#B8CCE0] active:scale-95"
            >
              <ImageIcon className="h-3.5 w-3.5 text-[#7BA8CE]" />
              <span>更換照片</span>
            </button>
          </>
        ) : null}

        <button
          id="header-shortcuts-btn"
          onClick={onOpenShortcuts}
          className="flex h-8 w-8 items-center justify-center rounded-xl text-[#6E8092] hover:bg-[#F0F5FA] hover:text-[#2D3B48] transition-colors border border-transparent hover:border-[#D5E3EE]"
          title="快捷鍵與操作說明"
        >
          <HelpCircle className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
};



