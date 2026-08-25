import React from 'react';

/**
 * Cute Mini Camera SVG with soft low-saturation sky blue & sakura pink charm
 */
export const CuteCamera: React.FC<{
  className?: string;
  isWorking?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}> = ({ className = '', isWorking = false, size = 'md' }) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
    xl: 'w-28 h-28',
  };

  return (
    <div className={`relative inline-flex items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 100 90"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${sizeMap[size]} transition-all duration-300 drop-shadow-xs`}
      >
        {/* Soft Ground Shadow */}
        <ellipse cx="50" cy="85" rx="38" ry="4" fill="#2D3B48" fillOpacity="0.06" />

        {/* Camera Top Dial */}
        <rect x="23" y="8" width="14" height="8" rx="3" fill="#B3CCE3" />
        <rect x="26" y="5" width="8" height="4" rx="2" fill="#98BBD6" />

        {/* Shutter Button with soft gentle accent */}
        <rect
          x="65"
          y="9"
          width="13"
          height="7"
          rx="3"
          fill="#E5A1B0"
          className={isWorking ? 'animate-bounce-gentle' : ''}
        />

        {/* Main Body (Soft Sky Blue) */}
        <rect x="10" y="16" width="80" height="62" rx="14" fill="#7BA8CE" />

        {/* Top Accent Band (Delicate Sakura Pink) */}
        <path
          d="M10 28C10 20.268 16.268 14 24 14H76C83.732 14 90 20.268 90 28V34H10V28Z"
          fill="#FDEEF2"
        />

        {/* Mini Flash Light */}
        <rect x="69" y="21" width="12" height="8" rx="3" fill="#FAF5E8" />
        <circle cx="75" cy="25" r="2.5" fill="#E2BA76" />

        {/* Viewfinder Window */}
        <rect x="21" y="21" width="11" height="8" rx="2.5" fill="#33424E" />
        <rect x="23.5" y="23.5" width="6" height="3" rx="1" fill="#B3CCE3" />

        {/* Outer Lens Ring */}
        <circle cx="50" cy="48" r="22" fill="#F4F8FB" />
        <circle cx="50" cy="48" r="18.5" fill="#6B9CC4" />
        <circle cx="50" cy="48" r="14" fill="#3D5F7C" />

        {/* Lens Glass Highlight */}
        <circle cx="50" cy="48" r="10" fill="#253542" />
        <ellipse cx="46" cy="43.5" rx="3.2" ry="2.2" fill="#FFFFFF" fillOpacity="0.85" />
        <circle cx="53.5" cy="51.5" r="1.6" fill="#CCE2F2" fillOpacity="0.85" />

        {/* Cute decorative little dots on side (Sakura Pink) */}
        <circle cx="16" cy="42" r="1.5" fill="#E5A1B0" />
        <circle cx="16" cy="48" r="1.5" fill="#E5A1B0" />
      </svg>

      {/* Floating ✦ sparkle when camera is working */}
      {isWorking && (
        <span className="absolute -top-1 -right-1 text-xs text-[#E5A1B0] animate-twinkle">
          ✦
        </span>
      )}
    </div>
  );
};

/**
 * Cute Floating Sparkles in Low-Saturation Sky Blue / Sakura Pink
 */
export const CuteSparkle: React.FC<{
  className?: string;
  size?: number;
  color?: string;
}> = ({ className = '', size = 14, color = '#7BA8CE' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block select-none ${className}`}
  >
    <path
      d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z"
      fill={color}
    />
  </svg>
);

/**
 * Cute Leaf / Flower Micro Accent
 */
export const CuteLeaf: React.FC<{ className?: string; color?: string }> = ({
  className = '',
  color = '#E5A1B0',
}) => (
  <svg
    width={18}
    height={18}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block select-none ${className}`}
  >
    <path
      d="M20.5 3.5C12.5 3.5 4 10.5 4 18.5C4 19.328 4.672 20 5.5 20C13.5 20 20.5 11.5 20.5 3.5Z"
      fill={color}
      fillOpacity="0.85"
    />
    <path
      d="M4.5 19.5L14 10"
      stroke="#FAF9F5"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

/**
 * Cute Hand-Drawn Wavy Underline for highlighting key text (Sakura Pink)
 */
export const CuteWavyUnderline: React.FC<{
  className?: string;
  color?: string;
}> = ({ className = '', color = '#E5A1B0' }) => (
  <svg
    viewBox="0 0 160 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`w-full h-2.5 sm:h-3 ${className}`}
    preserveAspectRatio="none"
  >
    <path
      d="M3 7C22 2.5 45 10 68 6C91 2 114 9.5 137 5.5C146 4 153 6 157 7.5"
      stroke={color}
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      opacity="0.85"
    />
  </svg>
);

/**
 * Cute Double Curved Line (Sky Blue)
 */
export const CuteCurvedUnderline: React.FC<{
  className?: string;
  color?: string;
}> = ({ className = '', color = '#7BA8CE' }) => (
  <svg
    viewBox="0 0 120 8"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`w-full h-2 ${className}`}
    preserveAspectRatio="none"
  >
    <path
      d="M2 6C35 1.5 85 1.5 118 6"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
      opacity="0.85"
    />
  </svg>
);

/**
 * Charming Mini Floating Polaroid with Stage Photo
 */
export const CuteMiniPolaroid: React.FC<{
  className?: string;
  type?: 'purple' | 'yellow';
  label?: string;
}> = ({ className = '', type = 'purple', label = 'LIVE' }) => {
  const isPurple = type === 'purple';
  return (
    <div
      className={`inline-flex flex-col items-center bg-white p-1.5 pb-2.5 rounded-xl shadow-2xs border border-[#E2EAF0] transition-transform duration-300 ${className}`}
    >
      {/* Mini Masking Tape on Top (Sakura Pink) */}
      <div className="w-6 h-2 bg-[#FCEEF2] rounded-xs mb-1 -mt-2.5 rotate-1 border-t border-b border-[#F7D6DF]" />

      {/* Image Thumbnail Window */}
      <div
        className={`w-14 h-14 rounded-lg overflow-hidden relative flex items-center justify-center ${
          isPurple
            ? 'bg-linear-to-b from-[#4A3D59] to-[#251E2E]'
            : 'bg-linear-to-b from-[#594E3A] to-[#2B2418]'
        }`}
      >
        {/* Spotlight Beam */}
        <div
          className={`absolute inset-0 opacity-40 ${
            isPurple
              ? 'bg-linear-to-tr from-transparent via-[#9B6ABF] to-transparent'
              : 'bg-linear-to-tr from-transparent via-[#D4A759] to-transparent'
          }`}
        />
        {/* Stage silhouette */}
        <div className="text-center z-10">
          <span className="text-[10px] font-bold text-white/90 drop-shadow-xs">
            {isPurple ? '💜' : '💛'}
          </span>
        </div>
        {/* Stage floor light */}
        <div className="absolute bottom-0 inset-x-0 h-1.5 bg-white/20 blur-[1px]" />
      </div>

      {/* Polaroid Caption */}
      <div className="mt-1.5 flex items-center justify-between w-full px-0.5">
        <span className="text-[9px] font-mono font-bold tracking-tight text-[#5B6D7E]">
          {label}
        </span>
        <span className="text-[8px] text-[#E5A1B0]">✦</span>
      </div>
    </div>
  );
};

/**
 * Tiny Polaroid Photo Decoration Tag
 */
export const CutePhotoTag: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={`inline-flex flex-col items-center bg-white p-1 pb-2 rounded-md shadow-2xs border border-[#E2E8F0] ${className}`}
    style={{ transform: 'rotate(-4deg)' }}
  >
    <div className="w-6 h-6 rounded bg-[#F0F5FA] flex items-center justify-center text-[10px]">
      ✨
    </div>
    <div className="w-4 h-0.5 bg-[#CBD5E1] rounded mt-1" />
  </div>
);

/**
 * Gentle celebration burst for export completion
 */
export const CelebrationParticles: React.FC = () => {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute top-1/4 left-1/4 animate-float text-[#7BA8CE] text-sm">✦</div>
      <div className="absolute top-1/3 right-1/4 animate-float-slow text-[#E5A1B0] text-xs">★</div>
      <div className="absolute bottom-1/3 left-1/5 animate-twinkle text-[#6B9CC4] text-xs">✦</div>
      <div className="absolute top-1/5 right-1/3 animate-float-gentle text-[#E5A1B0] text-base">✦</div>
      <div className="absolute bottom-1/4 right-1/5 animate-twinkle text-[#D4A759] text-sm">★</div>
    </div>
  );
};


