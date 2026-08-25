import { ColorMode, EnhanceParams, SampleImagePreset } from '../types';

export const DEFAULT_ENHANCE_PARAMS: EnhanceParams = {
  mode: 'auto',
  correction_strength: 70,
  preserve_stage_light: 10,
  brightness: 0,
  contrast: 0,
  saturation: 0,
  use_clahe: true,
  use_denoise: false,
  use_highlight_recovery: true,
  highlight_strength: 35,
  use_quality_restore: true,
  quality_strength: 35,
  use_sharpen: true,
  upscale_2x: false,
};

export const COLOR_MODES: {
  id: ColorMode;
  label: string;
  shortLabel: string;
  emoji: string;
  accentColor: string;
  description: string;
  recommendedFor: string;
}[] = [
  {
    id: 'auto',
    label: '✨ 自動舞台辨識 (Auto)',
    shortLabel: '自動辨識',
    emoji: '✨',
    accentColor: '#7BA8CE',
    description: '由系統綜合分析色溫與環境光，自動平衡多光源色偏。',
    recommendedFor: '多光源混雜、彩虹射燈或未特別偏單一顏色的舞台照',
  },
  {
    id: 'purple',
    label: '💜 紫色強光修復 (Purple)',
    shortLabel: '紫色修復',
    emoji: '💜',
    accentColor: '#8B5CF6',
    description: '針對演唱會高頻出現的紫藍色射燈，壓制過度溢色並還原膚色。',
    recommendedFor: '偶像舞台、LED 大螢幕紫光反光、螢光紫射燈',
  },
  {
    id: 'yellow',
    label: '💛 暖黃強光校正 (Yellow)',
    shortLabel: '黃光校正',
    emoji: '💛',
    accentColor: '#F59E0B',
    description: '消除舞台頂部大瓦數黃光造成的全身泛黃與高光過曝。',
    recommendedFor: '搖滾樂團、暖色鹵素聚光燈、戶外音樂祭黃昏舞台',
  },
  {
    id: 'red',
    label: '🔴 紅色射燈壓制 (Red)',
    shortLabel: '紅光壓制',
    emoji: '🔴',
    accentColor: '#EF4444',
    description: '校正強烈紅光導致的臉部細節死白或嚴重紅爆，恢復自然紅潤。',
    recommendedFor: '重金屬/熱血曲目、紅色彩帶炮或全紅雷射燈效',
  },
  {
    id: 'cyan',
    label: '🩵 青藍冷光平衡 (Cyan)',
    shortLabel: '青藍平衡',
    emoji: '🩵',
    accentColor: '#06B6D4',
    description: '校正過度冰冷死板的青綠/冰藍光，注入自然溫暖光澤。',
    recommendedFor: '抒情歌藍色海、冷色雷射燈或煙霧機青光折射',
  },
  {
    id: 'low_light',
    label: '🌙 暗光舞台提亮 (Low Light)',
    shortLabel: '暗光提亮',
    emoji: '🌙',
    accentColor: '#6366F1',
    description: '提亮深色暗部細節，並透過局部動態對比避免畫面灰白平淡。',
    recommendedFor: '看台遠距拍攝、慢歌安可曲、僅有微弱地燈的暗場',
  },
];

// Helper to create synthetic concert stage test images directly via canvas
export function createSyntheticStageImage(type: 'purple' | 'yellow' | 'red' | 'low_light'): string {
  const canvas = document.createElement('canvas');
  canvas.width = 1600;
  canvas.height = 1060;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const w = canvas.width;
  const h = canvas.height;

  // Background deep dark concert hall
  ctx.fillStyle = '#0a0d14';
  ctx.fillRect(0, 0, w, h);

  // Stage flooring & audience silhouettes
  const floorGrad = ctx.createLinearGradient(0, h * 0.65, 0, h);
  floorGrad.addColorStop(0, '#151922');
  floorGrad.addColorStop(1, '#07090e');
  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, h * 0.65, w, h * 0.35);

  // Beam lights based on type
  if (type === 'purple') {
    // Purple concert stage
    const beam1 = ctx.createRadialGradient(w * 0.25, -50, 50, w * 0.45, h * 0.7, 850);
    beam1.addColorStop(0, 'rgba(216, 110, 255, 0.95)');
    beam1.addColorStop(0.3, 'rgba(168, 85, 247, 0.75)');
    beam1.addColorStop(0.7, 'rgba(126, 34, 206, 0.3)');
    beam1.addColorStop(1, 'rgba(15, 23, 42, 0)');
    ctx.fillStyle = beam1;
    ctx.fillRect(0, 0, w, h);

    const beam2 = ctx.createRadialGradient(w * 0.75, -50, 50, w * 0.55, h * 0.7, 850);
    beam2.addColorStop(0, 'rgba(192, 132, 252, 0.9)');
    beam2.addColorStop(0.4, 'rgba(147, 51, 234, 0.6)');
    beam2.addColorStop(1, 'rgba(15, 23, 42, 0)');
    ctx.fillStyle = beam2;
    ctx.fillRect(0, 0, w, h);

    // Idol / performer silhouette in center with strong purple cast
    ctx.fillStyle = 'rgba(230, 180, 255, 0.9)';
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.42, 75, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.beginPath();
    ctx.moveTo(w * 0.42, h * 0.52);
    ctx.lineTo(w * 0.58, h * 0.52);
    ctx.lineTo(w * 0.62, h * 0.85);
    ctx.lineTo(w * 0.38, h * 0.85);
    ctx.closePath();
    ctx.fillStyle = 'rgba(210, 150, 255, 0.85)';
    ctx.fill();

    // Microphone & hands
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(w * 0.5, h * 0.46);
    ctx.lineTo(w * 0.5, h * 0.62);
    ctx.stroke();
  } else if (type === 'yellow') {
    // Yellow/Amber harsh lighting
    const beam1 = ctx.createRadialGradient(w * 0.5, 0, 80, w * 0.5, h * 0.5, 900);
    beam1.addColorStop(0, 'rgba(255, 230, 110, 0.95)');
    beam1.addColorStop(0.35, 'rgba(245, 158, 11, 0.8)');
    beam1.addColorStop(0.8, 'rgba(180, 83, 9, 0.25)');
    beam1.addColorStop(1, 'rgba(15, 23, 42, 0)');
    ctx.fillStyle = beam1;
    ctx.fillRect(0, 0, w, h);

    // Performer
    ctx.fillStyle = 'rgba(255, 225, 150, 0.95)';
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.43, 80, 0, Math.PI * 2);
    ctx.fill();

    // Guitarist pose
    ctx.fillStyle = 'rgba(240, 180, 50, 0.9)';
    ctx.fillRect(w * 0.4, h * 0.53, w * 0.2, h * 0.3);

    // Electric guitar
    ctx.fillStyle = '#ff3b30';
    ctx.beginPath();
    ctx.ellipse(w * 0.52, h * 0.68, 120, 50, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === 'red') {
    // Intense Red backlights
    const beam1 = ctx.createRadialGradient(w * 0.5, h * 0.4, 20, w * 0.5, h * 0.5, 800);
    beam1.addColorStop(0, 'rgba(255, 80, 80, 0.98)');
    beam1.addColorStop(0.4, 'rgba(239, 68, 68, 0.85)');
    beam1.addColorStop(0.8, 'rgba(153, 27, 27, 0.4)');
    beam1.addColorStop(1, 'rgba(15, 23, 42, 0)');
    ctx.fillStyle = beam1;
    ctx.fillRect(0, 0, w, h);

    // Singer silhouette in red fog
    ctx.fillStyle = 'rgba(255, 160, 160, 0.9)';
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.42, 85, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(220, 50, 50, 0.85)';
    ctx.fillRect(w * 0.42, h * 0.52, w * 0.16, h * 0.34);
  } else {
    // Low light dark stage
    const beam1 = ctx.createRadialGradient(w * 0.5, h * 0.45, 10, w * 0.5, h * 0.5, 450);
    beam1.addColorStop(0, 'rgba(100, 120, 160, 0.45)');
    beam1.addColorStop(0.5, 'rgba(40, 50, 70, 0.25)');
    beam1.addColorStop(1, 'rgba(10, 14, 20, 0.05)');
    ctx.fillStyle = beam1;
    ctx.fillRect(0, 0, w, h);

    // Faint performer
    ctx.fillStyle = 'rgba(70, 85, 110, 0.5)';
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.44, 75, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(w * 0.44, h * 0.54, w * 0.12, h * 0.28);
  }

  // Add audience silhouettes & glow sticks at the bottom
  for (let i = 0; i < 45; i++) {
    const x = (w / 45) * i + Math.random() * 20;
    const y = h * 0.9 + Math.random() * 50;
    ctx.fillStyle = '#06080d';
    ctx.beginPath();
    ctx.arc(x, y, 22 + Math.random() * 10, 0, Math.PI * 2);
    ctx.fill();

    // Glow stick
    if (Math.random() > 0.4) {
      ctx.strokeStyle = type === 'purple' ? '#c084fc' : type === 'yellow' ? '#fde047' : type === 'red' ? '#f87171' : '#38bdf8';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x + 10, y);
      ctx.lineTo(x + 18 + (Math.random() - 0.5) * 15, y - 45);
      ctx.stroke();
    }
  }

  return canvas.toDataURL('image/png');
}

export const SAMPLE_PRESETS: SampleImagePreset[] = [
  {
    id: 'sample-purple',
    title: '偶像見面會 • 紫色強光偏色',
    category: '偶像舞台 / 流行演唱會',
    detectedMode: 'purple',
    detectedLabel: '紫色舞台強光偏色',
    detectedStrength: 78,
    description: '強烈紫粉色 LED 與射燈反光，導致偶像臉部與服裝嚴重發紫。',
    thumbnail: '',
  },
  {
    id: 'sample-yellow',
    title: '搖滾樂團 • 暖黃射燈過曝',
    category: '搖滾樂團 / LiveHouse',
    detectedMode: 'yellow',
    detectedLabel: '舞台黃光過曝偏色',
    detectedStrength: 82,
    description: '大瓦數暖黃射燈照射，吉他手與主唱全身泛黃、細節損失。',
    thumbnail: '',
  },
  {
    id: 'sample-red',
    title: '熱血高潮 • 紅色彩燈爆紅',
    category: '大型體育場巡演',
    detectedMode: 'red',
    detectedLabel: '紅色強光射燈偏色',
    detectedStrength: 75,
    description: '爆破與紅色強光特效，造成歌手臉部高光死紅與邊緣失真。',
    thumbnail: '',
  },
  {
    id: 'sample-dark',
    title: '慢歌安可 • 暗光低動態舞台',
    category: '安可抒情 / 鋼琴獨唱',
    detectedMode: 'low_light',
    detectedLabel: '暗光低動態舞台環境',
    detectedStrength: 65,
    description: '僅有地燈與背景微光，照片整體過暗，放大雜訊多、人物模糊。',
    thumbnail: '',
  },
];
