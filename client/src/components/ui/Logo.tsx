import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', showSubtitle = false }) => {
  const imgSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl',
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <img
        src="/logo.png"
        alt="BreatheWise Logo"
        className={`${imgSizes[size]} object-contain rounded-xl shadow-xs`}
      />
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-heading font-extrabold ${textSizes[size]} text-forest tracking-tight`}>
            Breathe<span className="text-forest-light">Wise</span>
          </span>
          <span className="text-[10px] bg-sage/20 text-forest px-1.5 py-0.5 rounded-full font-semibold">
            India
          </span>
        </div>
        {showSubtitle && (
          <span className="text-[10px] text-charcoal/60 font-medium tracking-wide mt-0.5">
            Breathe Better. Live Healthier.
          </span>
        )}
      </div>
    </div>
  );
};
