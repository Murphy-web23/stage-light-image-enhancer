import React from 'react';
import { X, Command, Eye, Split, Maximize2, Download } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    {
      key: 'Space (按住)',
      description: '長按空白鍵可即時快速查看修復前原圖',
      icon: <Eye className="h-4 w-4 text-[#3B82F6]" />,
    },
    {
      key: '拖曳滑桿',
      description: '左右拖曳可即時比對修復前後光影差異',
      icon: <Split className="h-4 w-4 text-[#3B82F6]" />,
    },
    {
      key: '+ / -',
      description: '放大或縮小畫面以檢視偶像五官與膚質細節',
      icon: <Maximize2 className="h-4 w-4 text-[#FA84A0]" />,
    },
    {
      key: 'Enter',
      description: '立即啟動原始高解析度照片算圖與下載',
      icon: <Download className="h-4 w-4 text-[#FA84A0]" />,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
          <div className="flex items-center gap-2 text-[#0F172A]">
            <Command className="h-4 w-4 text-[#3B82F6]" />
            <h3 className="text-sm font-bold">快捷操作與使用小技巧</h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#64748B] hover:bg-[#EFF6FF] hover:text-[#0F172A]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-2.5">
          {shortcuts.map((s, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-xl bg-[#F8FAFC] p-3 text-xs border border-[#E2E8F0]"
            >
              <div className="flex items-center gap-2.5">
                {s.icon}
                <span className="font-medium text-[#334155]">{s.description}</span>
              </div>
              <kbd className="rounded-md border border-[#E2E8F0] bg-white px-2 py-0.5 font-mono font-bold text-[11px] text-[#334155] shadow-2xs">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-xl bg-[#EFF6FF] p-3 text-[11px] text-[#1E40AF] border border-[#BFDBFE]">
          💡 <strong>即時自動演算</strong>：調整右側任一滑桿或切換模式時，系統將即時於預覽畫面呈現修復後的舞台色彩。
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-gradient-to-r from-[#4B94E6] to-[#FA84A0] hover:from-[#3B82F6] hover:to-[#F472B6] px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors"
          >
            我知道了
          </button>
        </div>
      </div>
    </div>
  );
};
