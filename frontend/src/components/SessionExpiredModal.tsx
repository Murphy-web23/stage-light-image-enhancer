import React from 'react';
import { AlertTriangle, UploadCloud } from 'lucide-react';

interface SessionExpiredModalProps {
  isOpen: boolean;
  onReupload: () => void;
}

export const SessionExpiredModal: React.FC<SessionExpiredModalProps> = ({
  isOpen,
  onReupload,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-6 sm:p-8 text-center shadow-2xl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
          <AlertTriangle className="h-7 w-7" />
        </div>

        <h3 className="text-lg font-bold text-[#0F172A]">
          暫存已過期
        </h3>

        <p className="mt-2 text-xs sm:text-sm text-[#475569] leading-relaxed">
          由於瀏覽器暫存過期或停留時間較長，請重新上傳照片以繼續進行光影修復。
        </p>

        <div className="mt-6 flex justify-center">
          <button
            id="session-reupload-btn"
            onClick={onReupload}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#4B94E6] to-[#FA84A0] hover:from-[#3B82F6] hover:to-[#F472B6] px-5 py-2.5 text-xs font-bold text-white shadow-sm active:scale-95 transition-all"
          >
            <UploadCloud className="h-4 w-4" />
            <span>重新上傳照片</span>
          </button>
        </div>
      </div>
    </div>
  );
};
