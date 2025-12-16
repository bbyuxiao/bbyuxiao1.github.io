
import React, { useState } from 'react';
import { AppSection } from '../types';
import { ChevronDown, Edit2, Check, Type } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { DEFAULT_HERO } from '../data/defaults';

interface HeroProps {
  onNavigate: (section: AppSection) => void;
}

export const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useLocalStorage('hero_content', DEFAULT_HERO);

  const handleChange = (key: keyof typeof content, value: string) => {
    setContent(prev => ({ ...prev, [key]: value }));
  };

  const safeStr = (val: any) => typeof val === 'string' ? val : String(val || '');
  
  const titleSizeClass = typeof content.titleSize === 'string' ? content.titleSize : 'text-6xl md:text-8xl';

  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden bg-slate-900 text-white group/hero">
      <div className="absolute top-24 right-6 z-50 opacity-0 group-hover/hero:opacity-100 transition-opacity">
         <button
            onClick={() => setIsEditing(!isEditing)}
            className={`p-2 rounded-full ${isEditing ? 'bg-brand-orange text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
         >
            {isEditing ? <Check size={20} /> : <Edit2 size={20} />}
         </button>
      </div>

      <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-orange via-slate-900 to-black"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
      </div>
      
      <div className="z-10 text-center px-4 max-w-5xl w-full">
        <div className="mb-4 inline-block">
            {isEditing ? (
                <input
                    className="bg-transparent border border-brand-orange text-brand-orange font-mono text-xs tracking-widest uppercase px-3 py-1 text-center w-64 outline-none"
                    value={safeStr(content.tag)}
                    onChange={(e) => handleChange('tag', e.target.value)}
                />
            ) : (
                <span className="px-3 py-1 border border-brand-orange text-brand-orange font-mono text-xs tracking-widest uppercase">
                    {safeStr(content.tag)}
                </span>
            )}
        </div>

        <div className="mb-2">
             {isEditing ? (
                <div className="flex flex-col gap-2 items-center">
                    <input
                        className={`bg-slate-800/50 text-white font-black italic tracking-tighter text-center outline-none border-b border-brand-orange ${titleSizeClass} w-full`}
                        value={safeStr(content.line1)}
                        onChange={(e) => handleChange('line1', e.target.value)}
                    />
                    <input
                        className={`bg-slate-800/50 text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-red-600 font-black italic tracking-tighter text-center outline-none border-b border-brand-orange ${titleSizeClass} w-full`}
                        style={{ WebkitTextFillColor: 'inherit' }} 
                        value={safeStr(content.line2)}
                        onChange={(e) => handleChange('line2', e.target.value)}
                    />
                    <div className="flex gap-2 mt-2">
                        {['text-4xl md:text-6xl', 'text-6xl md:text-8xl', 'text-7xl md:text-9xl'].map((size, idx) => (
                             <button
                                key={idx}
                                onClick={() => handleChange('titleSize', size)}
                                className={`p-1 rounded text-xs border ${titleSizeClass === size ? 'border-brand-orange text-brand-orange' : 'border-slate-600 text-slate-400'}`}
                             >
                                <Type size={14} /> {idx + 1}x
                             </button>
                        ))}
                    </div>
                </div>
            ) : (
                <h1 className={`${titleSizeClass} font-black italic tracking-tighter leading-none`}>
                    {safeStr(content.line1)} <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-red-600 pr-4 pb-2">{safeStr(content.line2)}</span>
                </h1>
            )}
        </div>

        <div className="mb-12">
            {isEditing ? (
                 <input
                    className="bg-transparent border-b border-slate-600 text-xl md:text-2xl font-mono text-slate-400 text-center w-full outline-none focus:border-brand-orange"
                    value={safeStr(content.subtitle)}
                    onChange={(e) => handleChange('subtitle', e.target.value)}
                />
            ) : (
                <p className="text-xl md:text-2xl font-mono text-slate-400 tracking-wider">
                    {safeStr(content.subtitle)}
                </p>
            )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl mx-auto">
            <button onClick={() => onNavigate(AppSection.PORTFOLIO)} className="border border-slate-700 hover:border-brand-orange hover:bg-brand-orange/10 py-4 transition-all clip-tech group">
                <span className="block text-2xl font-bold group-hover:text-brand-orange">01</span>
                <span className="text-xs uppercase text-slate-400">作品展示</span>
            </button>
             <button onClick={() => onNavigate(AppSection.TALENT)} className="border border-slate-700 hover:border-brand-orange hover:bg-brand-orange/10 py-4 transition-all clip-tech group">
                <span className="block text-2xl font-bold group-hover:text-brand-orange">02</span>
                <span className="text-xs uppercase text-slate-400">人才培养</span>
            </button>
             <button onClick={() => onNavigate(AppSection.AI_ERA)} className="border border-slate-700 hover:border-brand-orange hover:bg-brand-orange/10 py-4 transition-all clip-tech group">
                <span className="block text-2xl font-bold group-hover:text-brand-orange">03</span>
                <span className="text-xs uppercase text-slate-400">AI 时代</span>
            </button>
             <button onClick={() => onNavigate(AppSection.FUTURE)} className="border border-slate-700 hover:border-brand-orange hover:bg-brand-orange/10 py-4 transition-all clip-tech group">
                <span className="block text-2xl font-bold group-hover:text-brand-orange">04</span>
                <span className="text-xs uppercase text-slate-400">未来展望</span>
            </button>
        </div>
      </div>

      <div className="absolute bottom-8 animate-bounce">
        <ChevronDown className="text-slate-500" />
      </div>
    </div>
  );
};
