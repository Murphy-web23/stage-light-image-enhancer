import React, { useState } from 'react';
import {
  Sparkles,
  Sun,
  Sliders,
  Maximize,
  RotateCcw,
  Info,
  Check,
  CheckCircle2,
} from 'lucide-react';
import { ColorMode, EnhanceParams, UploadedImageInfo } from '../types';
import { COLOR_MODES } from '../constants/presets';
import { CuteSparkle } from './CuteElements';

interface ControlPanelProps {
  params: EnhanceParams;
  onChange: (newParams: EnhanceParams) => void;
  imageInfo: UploadedImageInfo;
  isSuperResAvailable: boolean;
}

type TabType = 'color' | 'light' | 'detail' | 'output';

export const ControlPanel: React.FC<ControlPanelProps> = ({
  params,
  onChange,
  imageInfo,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('color');

  const updateParam = <K extends keyof EnhanceParams>(key: K, value: EnhanceParams[K]) => {
    onChange({
      ...params,
      [key]: value,
    });
  };

  // Quick preset handlers
  const applyPreset = (name: string) => {
    if (name === 'auto_balance') {
      onChange({
        ...params,
        mode: 'auto',
        correction_strength: 70,
        preserve_stage_light: 10,
        brightness: 0,
        contrast: 0,
        saturation: 0,
        use_clahe: true,
        use_highlight_recovery: true,
      });
    } else if (name === 'deep_purple') {
      onChange({
        ...params,
        mode: 'purple',
        correction_strength: 85,
        preserve_stage_light: 5,
        saturation: -5,
        contrast: 10,
        use_clahe: true,
        use_quality_restore: true,
      });
    } else if (name === 'yellow_clear') {
      onChange({
        ...params,
        mode: 'yellow',
        correction_strength: 80,
        preserve_stage_light: 10,
        brightness: -5,
        contrast: 5,
        use_highlight_recovery: true,
      });
    } else if (name === 'low_light_boost') {
      onChange({
        ...params,
        mode: 'low_light',
        correction_strength: 85,
        preserve_stage_light: 15,
        brightness: 18,
        contrast: 12,
        use_clahe: true,
        use_denoise: true,
        use_quality_restore: true,
      });
    } else if (name === 'portrait_glow') {
      onChange({
        ...params,
        correction_strength: 65,
        preserve_stage_light: 25,
        brightness: 5,
        contrast: 5,
        saturation: 5,
        use_quality_restore: true,
        quality_strength: 45,
        use_sharpen: true,
      });
    }
  };

  const finalWidth = params.upscale_2x ? imageInfo.width * 2 : imageInfo.width;
  const finalHeight = params.upscale_2x ? imageInfo.height * 2 : imageInfo.height;

  return (
    <aside className="w-full lg:w-80 xl:w-88 bg-[#FFFFFF] border border-[#E5EDF4] rounded-2xl flex flex-col shadow-2xs">
      {/* Detection Insight Card */}
      <div className="p-4 sm:p-5 border-b border-[#E5EDF4]">
        <div className="flex items-center gap-3 mb-2.5">
          <div className="w-9 h-9 bg-[#F0F5FA] rounded-xl flex items-center justify-center text-[#4A6D8C] flex-shrink-0 border border-[#D5E3EE]">
            <Sparkles className="w-4 h-4 text-[#7BA8CE]" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-[#4A6D8C] uppercase tracking-wider flex items-center gap-1">
              <span>舞台光譜診斷</span>
              <CuteSparkle size={10} color="#E5A1B0" />
            </div>
            <div className="text-sm font-bold text-[#2D3B48]">
              {imageInfo.detected_label}
            </div>
          </div>
        </div>

        <div className="bg-[#F8FAFC] rounded-xl p-2.5 px-3 flex justify-between items-center border border-[#E5EDF4]">
          <span className="text-xs text-[#5B6D7E] font-medium">偏色辨識強度</span>
          <span className="text-xs font-bold text-[#4A6D8C] bg-white px-2 py-0.5 rounded shadow-2xs border border-[#D5E3EE]">
            {imageInfo.detected_strength}%
          </span>
        </div>
      </div>

      {/* Quick One-Click Presets Bar */}
      <div className="border-b border-[#E5EDF4] bg-[#F8FAFC] px-3.5 py-2.5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6E8092]">
            常用快速情境
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => applyPreset('auto_balance')}
            className="rounded-lg bg-white px-2 py-1 text-xs font-medium text-[#2D3B48] shadow-2xs border border-[#E5EDF4] hover:border-[#B8CCE0] hover:text-[#4A6D8C] transition-colors"
          >
            ✨ 自動平衡
          </button>
          <button
            onClick={() => applyPreset('deep_purple')}
            className="rounded-lg bg-white px-2 py-1 text-xs font-medium text-[#2D3B48] shadow-2xs border border-[#E5EDF4] hover:border-[#B8CCE0] hover:text-[#4A6D8C] transition-colors"
          >
            💜 去除紫光
          </button>
          <button
            onClick={() => applyPreset('yellow_clear')}
            className="rounded-lg bg-white px-2 py-1 text-xs font-medium text-[#2D3B48] shadow-2xs border border-[#E5EDF4] hover:border-[#B8CCE0] hover:text-[#4A6D8C] transition-colors"
          >
            💛 去除黃光
          </button>
          <button
            onClick={() => applyPreset('low_light_boost')}
            className="rounded-lg bg-white px-2 py-1 text-xs font-medium text-[#2D3B48] shadow-2xs border border-[#E5EDF4] hover:border-[#B8CCE0] hover:text-[#4A6D8C] transition-colors"
          >
            🌙 暗光增益
          </button>
          <button
            onClick={() => applyPreset('portrait_glow')}
            className="rounded-lg bg-white px-2 py-1 text-xs font-medium text-[#2D3B48] shadow-2xs border border-[#E5EDF4] hover:border-[#F5D5DE] hover:text-[#B86B7E] transition-colors"
          >
            🌸 柔美膚色
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="grid grid-cols-4 border-b border-[#E5EDF4] bg-[#FFFFFF] p-1 text-xs font-semibold">
        <button
          id="tab-color"
          onClick={() => setActiveTab('color')}
          className={`flex flex-col items-center gap-1 rounded-xl py-2 transition-all ${
            activeTab === 'color'
              ? 'bg-[#F0F5FA] text-[#4A6D8C] font-bold border border-[#D5E3EE]'
              : 'text-[#6E8092] hover:text-[#2D3B48]'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5 text-[#7BA8CE]" />
          <span>色偏修復</span>
        </button>

        <button
          id="tab-light"
          onClick={() => setActiveTab('light')}
          className={`flex flex-col items-center gap-1 rounded-xl py-2 transition-all ${
            activeTab === 'light'
              ? 'bg-[#F0F5FA] text-[#4A6D8C] font-bold border border-[#D5E3EE]'
              : 'text-[#6E8092] hover:text-[#2D3B48]'
          }`}
        >
          <Sun className="h-3.5 w-3.5 text-[#7BA8CE]" />
          <span>光影色調</span>
        </button>

        <button
          id="tab-detail"
          onClick={() => setActiveTab('detail')}
          className={`flex flex-col items-center gap-1 rounded-xl py-2 transition-all ${
            activeTab === 'detail'
              ? 'bg-[#F0F5FA] text-[#4A6D8C] font-bold border border-[#D5E3EE]'
              : 'text-[#6E8092] hover:text-[#2D3B48]'
          }`}
        >
          <Sliders className="h-3.5 w-3.5 text-[#7BA8CE]" />
          <span>細節畫質</span>
        </button>

        <button
          id="tab-output"
          onClick={() => setActiveTab('output')}
          className={`flex flex-col items-center gap-1 rounded-xl py-2 transition-all ${
            activeTab === 'output'
              ? 'bg-[#F0F5FA] text-[#4A6D8C] font-bold border border-[#D5E3EE]'
              : 'text-[#6E8092] hover:text-[#2D3B48]'
          }`}
        >
          <Maximize className="h-3.5 w-3.5 text-[#7BA8CE]" />
          <span>輸出規格</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 max-h-[50vh] lg:max-h-[58vh]">
        {/* TAB 1: Color Correction */}
        {activeTab === 'color' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#6E8092] uppercase tracking-wider">
                選擇校正色彩光譜
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {COLOR_MODES.map((mode) => {
                const isSelected = params.mode === mode.id;
                return (
                  <button
                    key={mode.id}
                    id={`mode-btn-${mode.id}`}
                    onClick={() => updateParam('mode', mode.id)}
                    className={`flex items-center gap-2 rounded-xl p-2.5 text-left text-xs transition-all border ${
                      isSelected
                        ? 'border-[#B8CCE0] bg-[#F0F5FA] text-[#2D3B48] font-bold shadow-2xs'
                        : 'border-[#E5EDF4] bg-white text-[#5B6D7E] hover:border-[#D5E3EE]'
                    }`}
                  >
                    <span className="text-base">{mode.emoji}</span>
                    <div className="flex-1 truncate">
                      <p className="truncate">{mode.shortLabel}</p>
                    </div>
                    {isSelected && <Check className="h-3.5 w-3.5 text-[#4A6D8C] flex-shrink-0" />}
                  </button>
                );
              })}
            </div>

            <p className="text-[11px] text-[#5B6D7E] bg-[#F8FAFC] p-2.5 rounded-xl border border-[#E5EDF4] leading-relaxed">
              {COLOR_MODES.find((m) => m.id === params.mode)?.description}
            </p>

            {/* Sliders */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-[#2D3B48]">
                  <label>修復強度 (Correction Strength)</label>
                  <span className="text-[#4A6D8C] font-mono font-bold">{params.correction_strength}%</span>
                </div>
                <input
                  id="param-correction-strength"
                  type="range"
                  min="0"
                  max="100"
                  value={params.correction_strength}
                  onChange={(e) => updateParam('correction_strength', Number(e.target.value))}
                  className="w-full accent-[#7BA8CE] cursor-pointer h-1.5 bg-[#E5EDF4] rounded-lg appearance-none"
                />
                <div className="flex justify-between text-[10px] text-[#6E8092]">
                  <span>自然微調 (0%)</span>
                  <span>強力校正 (100%)</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-[#2D3B48]">
                  <label className="flex items-center gap-1">
                    <span>保留現場光影 (Atmosphere)</span>
                    <span title="保留背景舞台射燈光暈與演唱會現場氛圍">
                      <Info className="h-3 w-3 text-[#6E8092]" />
                    </span>
                  </label>
                  <span className="text-[#4A6D8C] font-mono font-bold">{params.preserve_stage_light}%</span>
                </div>
                <input
                  id="param-preserve-stage-light"
                  type="range"
                  min="0"
                  max="100"
                  value={params.preserve_stage_light}
                  onChange={(e) => updateParam('preserve_stage_light', Number(e.target.value))}
                  className="w-full accent-[#7BA8CE] cursor-pointer h-1.5 bg-[#E5EDF4] rounded-lg appearance-none"
                />
                <p className="text-[10px] text-[#6E8092] leading-normal">
                  數值越高，越保留背景射燈光暈與演唱會現場氣氛。
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Light & Contrast Adjustments */}
        {activeTab === 'light' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#6E8092] uppercase tracking-wider">
                光影與明暗層次
              </h3>
            </div>

            <div className="space-y-4">
              {/* Brightness */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-[#2D3B48]">
                  <span>亮度 (Brightness)</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[#4A6D8C] text-xs font-bold">
                      {params.brightness > 0 ? `+${params.brightness}` : params.brightness}
                    </span>
                    {params.brightness !== 0 && (
                      <button
                        onClick={() => updateParam('brightness', 0)}
                        className="text-[#6E8092] hover:text-[#2D3B48]"
                        title="重設"
                      >
                        <RotateCcw className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
                <input
                  id="param-brightness"
                  type="range"
                  min="-100"
                  max="100"
                  value={params.brightness}
                  onChange={(e) => updateParam('brightness', Number(e.target.value))}
                  className="w-full accent-[#7BA8CE] cursor-pointer h-1.5 bg-[#E5EDF4] rounded-lg appearance-none"
                />
              </div>

              {/* Contrast */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-[#2D3B48]">
                  <span>對比度 (Contrast)</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[#4A6D8C] text-xs font-bold">
                      {params.contrast > 0 ? `+${params.contrast}` : params.contrast}
                    </span>
                    {params.contrast !== 0 && (
                      <button
                        onClick={() => updateParam('contrast', 0)}
                        className="text-[#6E8092] hover:text-[#2D3B48]"
                        title="重設"
                      >
                        <RotateCcw className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
                <input
                  id="param-contrast"
                  type="range"
                  min="-100"
                  max="100"
                  value={params.contrast}
                  onChange={(e) => updateParam('contrast', Number(e.target.value))}
                  className="w-full accent-[#7BA8CE] cursor-pointer h-1.5 bg-[#E5EDF4] rounded-lg appearance-none"
                />
              </div>

              {/* Saturation */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-[#2D3B48]">
                  <span>飽和度 (Saturation)</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[#4A6D8C] text-xs font-bold">
                      {params.saturation > 0 ? `+${params.saturation}` : params.saturation}
                    </span>
                    {params.saturation !== 0 && (
                      <button
                        onClick={() => updateParam('saturation', 0)}
                        className="text-[#6E8092] hover:text-[#2D3B48]"
                        title="重設"
                      >
                        <RotateCcw className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
                <input
                  id="param-saturation"
                  type="range"
                  min="-100"
                  max="100"
                  value={params.saturation}
                  onChange={(e) => updateParam('saturation', Number(e.target.value))}
                  className="w-full accent-[#7BA8CE] cursor-pointer h-1.5 bg-[#E5EDF4] rounded-lg appearance-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Detail & Enhancement */}
        {activeTab === 'detail' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#6E8092] uppercase tracking-wider">
                畫面細節與畫質增強
              </h3>
            </div>

            <div className="space-y-3.5">
              {/* CLAHE Local Detail Toggle */}
              <label className="flex items-center justify-between cursor-pointer group p-1">
                <div>
                  <span className="text-xs font-semibold text-[#2D3B48] block">局部動態層次增強</span>
                  <span className="text-[10px] text-[#6E8092]">增強暗部與立體紋理</span>
                </div>
                <input
                  id="param-use-clahe"
                  type="checkbox"
                  checked={params.use_clahe}
                  onChange={(e) => updateParam('use_clahe', e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-8 h-4 rounded-full relative p-0.5 transition-colors ${
                    params.use_clahe ? 'bg-[#7BA8CE]' : 'bg-[#D5E3EE]'
                  }`}
                >
                  <div
                    className={`aspect-square h-full bg-white rounded-full shadow-2xs transition-transform ${
                      params.use_clahe ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </div>
              </label>

              {/* Denoise Toggle */}
              <label className="flex items-center justify-between cursor-pointer group p-1">
                <div>
                  <span className="text-xs font-semibold text-[#2D3B48] block">舞台數位降噪</span>
                  <span className="text-[10px] text-[#6E8092]">消除高感光度暗部噪點</span>
                </div>
                <input
                  id="param-use-denoise"
                  type="checkbox"
                  checked={params.use_denoise}
                  onChange={(e) => updateParam('use_denoise', e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-8 h-4 rounded-full relative p-0.5 transition-colors ${
                    params.use_denoise ? 'bg-[#7BA8CE]' : 'bg-[#D5E3EE]'
                  }`}
                >
                  <div
                    className={`aspect-square h-full bg-white rounded-full shadow-2xs transition-transform ${
                      params.use_denoise ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </div>
              </label>

              {/* Highlight Recovery Toggle */}
              <div className="p-1 space-y-2">
                <label className="flex items-center justify-between cursor-pointer group">
                  <div>
                    <span className="text-xs font-semibold text-[#2D3B48] block">過曝高光細節還原</span>
                    <span className="text-[10px] text-[#6E8092]">拯救被強光打死的臉部五官</span>
                  </div>
                  <input
                    id="param-use-highlight-recovery"
                    type="checkbox"
                    checked={params.use_highlight_recovery}
                    onChange={(e) => updateParam('use_highlight_recovery', e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`w-8 h-4 rounded-full relative p-0.5 transition-colors ${
                      params.use_highlight_recovery ? 'bg-[#7BA8CE]' : 'bg-[#D5E3EE]'
                    }`}
                  >
                    <div
                      className={`aspect-square h-full bg-white rounded-full shadow-2xs transition-transform ${
                        params.use_highlight_recovery ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </label>

                {params.use_highlight_recovery && (
                  <div className="pt-1 pl-2">
                    <div className="flex justify-between text-[11px] font-medium text-[#5B6D7E] mb-1">
                      <span>還原強度</span>
                      <span className="font-mono text-[#4A6D8C] font-bold">{params.highlight_strength}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={params.highlight_strength}
                      onChange={(e) => updateParam('highlight_strength', Number(e.target.value))}
                      className="w-full accent-[#7BA8CE] cursor-pointer h-1.5 bg-[#E5EDF4] rounded-lg appearance-none"
                    />
                  </div>
                )}
              </div>

              {/* Quality Restore Toggle (Gentle Sakura Pink accent for soft skin tone) */}
              <div className="p-1 space-y-2">
                <label className="flex items-center justify-between cursor-pointer group">
                  <div>
                    <span className="text-xs font-semibold text-[#2D3B48] block">髮絲與膚質微紋理重構</span>
                    <span className="text-[10px] text-[#B86B7E] font-medium">🌸 提升本命臉龐自然精緻度</span>
                  </div>
                  <input
                    id="param-use-quality-restore"
                    type="checkbox"
                    checked={params.use_quality_restore}
                    onChange={(e) => updateParam('use_quality_restore', e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`w-8 h-4 rounded-full relative p-0.5 transition-colors ${
                      params.use_quality_restore ? 'bg-[#E5A1B0]' : 'bg-[#D5E3EE]'
                    }`}
                  >
                    <div
                      className={`aspect-square h-full bg-white rounded-full shadow-2xs transition-transform ${
                        params.use_quality_restore ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </label>

                {params.use_quality_restore && (
                  <div className="pt-1 pl-2">
                    <div className="flex justify-between text-[11px] font-medium text-[#5B6D7E] mb-1">
                      <span>重構強度</span>
                      <span className="font-mono text-[#B86B7E] font-bold">{params.quality_strength}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={params.quality_strength}
                      onChange={(e) => updateParam('quality_strength', Number(e.target.value))}
                      className="w-full accent-[#E5A1B0] cursor-pointer h-1.5 bg-[#E5EDF4] rounded-lg appearance-none"
                    />
                  </div>
                )}
              </div>

              {/* Sharpen Toggle */}
              <label className="flex items-center justify-between cursor-pointer group p-1">
                <div>
                  <span className="text-xs font-semibold text-[#2D3B48] block">輪廓邊緣清晰化</span>
                  <span className="text-[10px] text-[#6E8092]">增強人物線條與立體感</span>
                </div>
                <input
                  id="param-use-sharpen"
                  type="checkbox"
                  checked={params.use_sharpen}
                  onChange={(e) => updateParam('use_sharpen', e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-8 h-4 rounded-full relative p-0.5 transition-colors ${
                    params.use_sharpen ? 'bg-[#7BA8CE]' : 'bg-[#D5E3EE]'
                  }`}
                >
                  <div
                    className={`aspect-square h-full bg-white rounded-full shadow-2xs transition-transform ${
                      params.use_sharpen ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </div>
              </label>
            </div>
          </div>
        )}

        {/* TAB 4: Output & 2x Upscale */}
        {activeTab === 'output' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-[#6E8092] uppercase tracking-wider">
              照片輸出尺寸與解析度
            </h3>

            {/* 2x Upscale Box */}
            <label className="flex items-center gap-3 p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E5EDF4] cursor-pointer hover:border-[#B8CCE0] transition-all shadow-2xs block">
              <div className="flex-1">
                <div className="text-xs font-bold text-[#2D3B48]">2× 超高解析度放大</div>
                <div className="text-[10px] text-[#5B6D7E] font-mono mt-0.5">
                  輸出尺寸：{finalWidth} × {finalHeight} px
                </div>
              </div>
              <input
                id="param-upscale-2x"
                type="checkbox"
                checked={params.upscale_2x}
                onChange={(e) => updateParam('upscale_2x', e.target.checked)}
                className="sr-only"
              />
              <div
                className={`w-10 h-5 rounded-full relative p-0.5 transition-colors ${
                  params.upscale_2x ? 'bg-[#7BA8CE]' : 'bg-[#D5E3EE]'
                }`}
              >
                <div
                  className={`aspect-square h-full bg-white rounded-full shadow-2xs transition-transform ${
                    params.upscale_2x ? 'translate-x-5' : 'translate-x-0'
                  }`}
                >
                  </div>
              </div>
            </label>

            <div className="rounded-xl border border-[#F5D5DE] bg-[#FDF0F4] p-3 text-xs text-[#B86B7E] space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[#8A4557]">
                <CheckCircle2 className="h-4 w-4 text-[#B86B7E]" />
                <span>無損 PNG 高品質輸出</span>
              </div>
              <p className="text-[11px] text-[#B86B7E] leading-relaxed">
                系統輸出時將以 100% 原始像素進行色彩修復，保留最精緻的照片質感。
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
