import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showTagline = false, className = '' }) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <div className={`relative flex items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-md shadow-indigo-500/20 ${iconSizes[size]}`}>
        <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center relative overflow-hidden">
          {/* Subtle live sync pulse ring in background */}
          <div className="absolute inset-0 bg-indigo-500/10 animate-pulse" />
          
          <svg
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-5/6 h-5/6 relative z-10"
          >
            {/* Left node (Collaborator A) */}
            <circle cx="7" cy="18" r="3" fill="#818CF8" />
            
            {/* Right node (Collaborator B) */}
            <circle cx="29" cy="18" r="3" fill="#38BDF8" />
            
            {/* Connecting sync line */}
            <path
              d="M10 18H26"
              stroke="#6366F1"
              strokeWidth="1.5"
              strokeDasharray="2 2"
              className="animate-pulse"
            />
            
            {/* Code symbol </ > in foreground */}
            <path
              d="M14 13L9.5 18L14 23"
              stroke="#F8FAFC"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M22 13L26.5 18L22 23"
              stroke="#F8FAFC"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M20 11L16 25"
              stroke="#A5B4FC"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Live synchronization indicator badge on corner */}
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-slate-950"></span>
        </span>
      </div>

      <div>
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-black tracking-tight text-white ${textSizes[size]}`}>
            Sync<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Code</span>
          </span>
          <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            PRO
          </span>
        </div>
        {showTagline && (
          <p className="text-xs text-slate-400 font-medium mt-0.5">Code Together. Talk in Real Time.</p>
        )}
      </div>
    </div>
  );
};
