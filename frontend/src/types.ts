export type ColorMode = 'auto' | 'purple' | 'yellow' | 'red' | 'cyan' | 'low_light';

export interface EnhanceParams {
  mode: ColorMode;
  correction_strength: number; // 0–100
  preserve_stage_light: number; // 0–100
  brightness: number; // -100–100
  contrast: number; // -100–100
  saturation: number; // -100–100
  use_clahe: boolean;
  use_denoise: boolean;
  use_highlight_recovery: boolean;
  highlight_strength: number; // 0–100
  use_quality_restore: boolean;
  quality_strength: number; // 0–100
  use_sharpen: boolean;
  upscale_2x: boolean;
}

export interface UploadedImageInfo {
  image_id: string;
  width: number;
  height: number;
  detected_mode: ColorMode;
  detected_label: string;
  detected_strength: number;
  fileName?: string;
  fileSize?: number;
  originalUrl: string;
}

export interface Capabilities {
  superres: boolean;
}

export type ComparisonMode = 'slider' | 'side-by-side' | 'toggle';

export type AppState =
  | 'empty'
  | 'uploading'
  | 'analyzing'
  | 'ready'
  | 'previewing'
  | 'rendering'
  | 'render_success';

export interface SampleImagePreset {
  id: string;
  title: string;
  category: string;
  detectedMode: ColorMode;
  detectedLabel: string;
  detectedStrength: number;
  description: string;
  thumbnail: string;
}
