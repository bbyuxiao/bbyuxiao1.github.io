import React, { ReactNode } from 'react';

interface TechCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  highlight?: boolean;
}

export const TechCard: React.FC<TechCardProps> = ({ children, className = '', title, highlight = false }) => {
  return (
    <div className={`relative group ${className}`}>
      {/* Background decoration */}
      <div className={`absolute inset-0 bg-white border border-slate-200 shadow-sm transition-all duration-300 clip-tech
        ${highlight ? 'border-brand-orange shadow-brand-orange/20' : 'hover:border-slate-300'}
      `}></div>
      
      {/* Decorative Corner */}
      <div className="absolute top-0 right-0 w-8 h-8 overflow-hidden pointer-events-none">
        <div className={`absolute top-0 right-0 w-12 h-1 bg-brand-orange transform rotate-45 translate-x-4 -translate-y-1`}></div>
      </div>

      <div className="relative p-6 z-10 h-full flex flex-col">
        {title && (
            <h3 className="text-xl font-bold font-mono uppercase tracking-wider text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-brand-orange rounded-full inline-block"></span>
                {title}
            </h3>
        )}
        <div className="flex-1">
            {children}
        </div>
      </div>
    </div>
  );
};