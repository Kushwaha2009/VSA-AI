import React from 'react';

export interface VsaLogoProps {
  variant?: 'mark' | 'horizontal' | 'full' | 'stacked';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'hero';
  className?: string;
  showTagline?: boolean;
  themeAdaptive?: boolean;
}

export const VsaEmblem: React.FC<{ className?: string; idPrefix?: string }> = ({
  className = 'w-10 h-10',
  idPrefix = 'vsa',
}) => {
  const gradMain = `${idPrefix}-grad-main`;
  const gradTrace = `${idPrefix}-grad-trace`;
  const gradAccent = `${idPrefix}-grad-accent`;

  return (
    <svg
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="VSA AI Logo"
    >
      <defs>
        {/* Main V-A Lettermark Gradient */}
        <linearGradient id={gradMain} x1="30" y1="40" x2="350" y2="360" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8A2BE2" />
          <stop offset="25%" stopColor="#7C3AED" />
          <stop offset="55%" stopColor="#4F46E5" />
          <stop offset="80%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>

        {/* Right Arm & A-Leg Gradient */}
        <linearGradient id={gradAccent} x1="180" y1="120" x2="360" y2="340" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="50%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>

        {/* Circuit Traces Gradient */}
        <linearGradient id={gradTrace} x1="240" y1="80" x2="380" y2="240" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="50%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#38BDF8" />
        </linearGradient>

        {/* Subtle Drop Glow for High-Res Displays */}
        <filter id={`${idPrefix}-glow`} x="-10%" y="-10%" width="120%" height="120%" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#4F46E5" floodOpacity="0.25" />
        </filter>
      </defs>

      <g filter={`url(#${idPrefix}-glow)`}>
        {/* ================= STYLIZED 'V' LEFT ARM ================= */}
        <path
          d="M 68 76 
             L 142 76 
             L 182 258 
             L 154 258 
             Z"
          fill={`url(#${gradMain})`}
        />

        {/* ================= MAIN 'V' BODY & SHARP VERTEX ================= */}
        <path
          d="M 68 76 
             L 138 76 
             L 182 256
             L 248 76 
             L 318 76 
             L 190 326 
             L 174 326 
             Z"
          fill={`url(#${gradMain})`}
        />

        {/* ================= INTEGRATED 'A' RIGHT LEG & CROSSBAR ================= */}
        {/* Right downward leg of A */}
        <path
          d="M 232 178 
             L 302 330 
             L 254 330 
             L 230 274 
             L 188 274 
             L 198 250 
             L 220 250 
             L 204 212 
             Z"
          fill={`url(#${gradAccent})`}
        />

        {/* Lower Right Stabilizer of A */}
        <path
          d="M 248 244 
             L 318 330 
             L 272 330 
             L 236 280 
             Z"
          fill={`url(#${gradMain})`}
        />

        {/* A Counter (Negative Space Triangle Cutout) */}
        <polygon
          points="208,222 232,274 192,274"
          fill="none"
        />

        {/* ================= DIGITAL CIRCUIT TRACES (RIGHT FLANK) ================= */}
        {/* Trace Line 1 (Top trace with 45-degree angle to node) */}
        <path
          d="M 276 114 L 312 114 L 332 94 L 354 94"
          stroke={`url(#${gradTrace})`}
          strokeWidth="6.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="360" cy="94" r="8.5" fill="none" stroke={`url(#${gradTrace})`} strokeWidth="5.5" />
        <circle cx="360" cy="94" r="3.5" fill="#38BDF8" />

        {/* Trace Line 2 (Upper-mid trace with middle node + outer node) */}
        <path
          d="M 268 138 L 300 138 L 314 124 L 340 124 L 362 146 L 380 146"
          stroke={`url(#${gradTrace})`}
          strokeWidth="6.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="320" cy="124" r="7.5" fill="none" stroke={`url(#${gradTrace})`} strokeWidth="5" />
        <circle cx="388" cy="146" r="8.5" fill="none" stroke={`url(#${gradTrace})`} strokeWidth="5.5" />
        <circle cx="388" cy="146" r="3.5" fill="#60A5FA" />

        {/* Trace Line 3 (Middle horizontal trace) */}
        <path
          d="M 260 162 L 342 162 L 362 182 L 378 182"
          stroke={`url(#${gradTrace})`}
          strokeWidth="6.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="386" cy="182" r="8.5" fill="none" stroke={`url(#${gradTrace})`} strokeWidth="5.5" />
        <circle cx="386" cy="182" r="3.5" fill="#38BDF8" />

        {/* Trace Line 4 (Lower-mid trace) */}
        <path
          d="M 270 188 L 302 188 L 324 210 L 356 210 L 368 222 L 374 222"
          stroke={`url(#${gradTrace})`}
          strokeWidth="6.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="382" cy="222" r="8.5" fill="none" stroke={`url(#${gradTrace})`} strokeWidth="5.5" />
        <circle cx="382" cy="222" r="3.5" fill="#3B82F6" />

        {/* Trace Line 5 (Bottom trace) */}
        <path
          d="M 284 214 L 324 214 L 348 244 L 358 244"
          stroke={`url(#${gradTrace})`}
          strokeWidth="6.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="366" cy="244" r="9.5" fill="none" stroke={`url(#${gradTrace})`} strokeWidth="6" />
        <circle cx="366" cy="244" r="4" fill="#0284C7" />
      </g>
    </svg>
  );
};

export const VsaLogo: React.FC<VsaLogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  className = '',
  showTagline = true,
  themeAdaptive = true,
}) => {
  // Size mappings
  const sizeConfig = {
    xs: { icon: 'w-6 h-6', text: 'text-sm', sub: 'text-[9px]', gap: 'gap-2' },
    sm: { icon: 'w-8 h-8', text: 'text-base', sub: 'text-[10px]', gap: 'gap-2.5' },
    md: { icon: 'w-9 h-9', text: 'text-lg', sub: 'text-[11px]', gap: 'gap-3' },
    lg: { icon: 'w-12 h-12', text: 'text-2xl', sub: 'text-xs', gap: 'gap-3.5' },
    xl: { icon: 'w-16 h-16', text: 'text-3xl', sub: 'text-sm', gap: 'gap-4' },
    '2xl': { icon: 'w-24 h-24', text: 'text-4xl', sub: 'text-base', gap: 'gap-5' },
    hero: { icon: 'w-36 h-36', text: 'text-5xl sm:text-6xl', sub: 'text-base sm:text-lg', gap: 'gap-6' },
  }[size];

  // 1. Mark Only
  if (variant === 'mark') {
    return <VsaEmblem className={`${sizeConfig.icon} ${className}`} />;
  }

  // 2. Stacked / Full Logo (Emblem on top, VSA AI in middle, Tagline below)
  if (variant === 'stacked' || variant === 'full') {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        <VsaEmblem className={`${sizeConfig.icon} mb-3`} />
        
        {/* Wordmark */}
        <div className="flex items-center justify-center gap-1.5 font-black tracking-tight leading-none">
          <span className={`font-extrabold tracking-tight ${sizeConfig.text} ${themeAdaptive ? 'text-slate-900 dark:text-white' : 'text-slate-900'}`}>
            VSA
          </span>
          <span className={`font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-400 bg-clip-text text-transparent ${sizeConfig.text}`}>
            AI
          </span>
        </div>

        {/* Tagline */}
        {showTagline && (
          <div className="flex items-center gap-2 mt-2 select-none">
            <span className="w-6 h-[1.5px] bg-gradient-to-r from-transparent to-indigo-500 rounded-full" />
            <span className={`font-medium tracking-wide ${sizeConfig.sub} ${themeAdaptive ? 'text-slate-600 dark:text-slate-300' : 'text-slate-600'}`}>
              Smart Solutions, Smarter Future
            </span>
            <span className="w-6 h-[1.5px] bg-gradient-to-l from-transparent to-indigo-500 rounded-full" />
          </div>
        )}
      </div>
    );
  }

  // 3. Horizontal Logo (Emblem on left, VSA AI + optional tagline on right)
  return (
    <div className={`flex items-center ${sizeConfig.gap} ${className}`}>
      <VsaEmblem className={`${sizeConfig.icon} shrink-0`} />
      
      <div className="flex flex-col justify-center text-left">
        <div className="flex items-center gap-1.5 font-black tracking-tight leading-tight">
          <span className={`font-extrabold tracking-tight ${sizeConfig.text} ${themeAdaptive ? 'text-slate-900 dark:text-white' : 'text-slate-900'}`}>
            VSA
          </span>
          <span className={`font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-400 bg-clip-text text-transparent ${sizeConfig.text}`}>
            AI
          </span>
        </div>

        {showTagline && (
          <span className={`font-medium tracking-normal leading-none mt-0.5 ${sizeConfig.sub} ${themeAdaptive ? 'text-slate-500 dark:text-slate-400' : 'text-slate-500'} truncate`}>
            Smart Solutions, Smarter Future
          </span>
        )}
      </div>
    </div>
  );
};
