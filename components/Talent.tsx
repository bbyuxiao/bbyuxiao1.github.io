
import React, { useState } from 'react';
import { TechCard } from './ui/TechCard';
import { Users, Zap, GraduationCap, ArrowRight, BookOpen, Lightbulb, Briefcase, Edit2, Check, Wand2, RefreshCw, Upload, Layout } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { refineText } from '../services/geminiService';
import { DEFAULT_PIPELINE_STEPS, DEFAULT_CORE_FUNCTIONS, DEFAULT_ALLOCATION } from '../data/defaults';

const ICON_MAP: Record<string, React.ElementType> = {
    Users, Zap, GraduationCap, Briefcase, BookOpen, Lightbulb
};

const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 1280;
                const MAX_HEIGHT = 800;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.7));
            };
            img.onerror = () => resolve(event.target?.result as string);
        };
        reader.onerror = () => resolve('');
    });
};

export const Talent: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [pipelineSteps, setPipelineSteps] = useLocalStorage('talent_pipeline_v2', DEFAULT_PIPELINE_STEPS);
  const [coreFunctions, setCoreFunctions] = useLocalStorage('talent_coreFunctions_v3', DEFAULT_CORE_FUNCTIONS);
  const [allocation, setAllocation] = useLocalStorage('talent_allocation_v4', DEFAULT_ALLOCATION);
  
  const [refiningState, setRefiningState] = useState<{section: string, index: number, field: string} | null>(null);

  const handlePipelineUpdate = (index: number, field: string, value: string) => {
    const newSteps = [...pipelineSteps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setPipelineSteps(newSteps);
  };

  const handleFunctionUpdate = (index: number, field: string, value: string) => {
    const newFuncs = [...coreFunctions];
    newFuncs[index] = { ...newFuncs[index], [field]: value };
    setCoreFunctions(newFuncs);
  };

  const handleAllocationUpdate = (field: string, value: any) => {
      setAllocation(prev => ({ ...prev, [field]: value }));
  };
  
  const handleAllocationImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const compressed = await compressImage(e.target.files[0]);
          handleAllocationUpdate('imageUrl', compressed);
      }
  };

  const handleRefine = async (section: 'pipeline' | 'allocation', index: number, field: string, currentValue: string, context: string) => {
    if (!currentValue) return;
    setRefiningState({ section, index, field });
    const refined = await refineText(currentValue, context);
    
    if (section === 'pipeline') {
        handlePipelineUpdate(index, field, refined);
    } else if (section === 'allocation') {
        handleAllocationUpdate(field, refined);
    }
    
    setRefiningState(null);
  };

  const isRefining = (section: string, index: number, field: string) => {
      return refiningState?.section === section && refiningState?.index === index && refiningState?.field === field;
  };

  const safePipelineSteps = Array.isArray(pipelineSteps) ? pipelineSteps : DEFAULT_PIPELINE_STEPS;
  const safeCoreFunctions = Array.isArray(coreFunctions) ? coreFunctions : DEFAULT_CORE_FUNCTIONS;
  const safeAllocation = allocation || DEFAULT_ALLOCATION;

  const safeStr = (val: any) => {
      if (typeof val === 'string') return val;
      if (val === null || val === undefined) return '';
      return String(val);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 bg-slate-50">
        <div className="mb-12 flex justify-between items-end">
            <div>
                <h2 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900">
                    <span className="text-brand-orange">02.</span> 人才培养
                </h2>
                <p className="text-slate-500 font-mono mt-2">人才梯队 // 核心能力 (HUMAN CAPITAL)</p>
            </div>
            <button 
                onClick={() => setIsEditing(!isEditing)}
                className={`flex items-center gap-2 px-4 py-2 rounded font-bold uppercase text-xs tracking-wider transition-colors ${
                    isEditing ? 'bg-brand-orange text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                }`}
            >
                {isEditing ? <><Check size={14}/> 完成编辑</> : <><Edit2 size={14}/> 编辑内容</>}
            </button>
        </div>

        {/* PART 1: PIPELINE */}
        <div className="mb-12">
            <div className="flex items-center gap-4 mb-6">
                <div className="h-8 w-1 bg-brand-orange"></div>
                <h3 className="text-2xl font-bold text-slate-800 uppercase tracking-wide">
                    第一部分：为项目输送人才 <span className="text-slate-400 text-sm font-normal normal-case ml-2">// Talent Supply Pipeline</span>
                </h3>
            </div>
            
            <TechCard className="[&>div]:!p-5">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 relative">
                    <div className="hidden md:block absolute top-10 left-0 right-0 h-0.5 bg-slate-200 -z-10 transform -translate-y-1/2"></div>
                    
                    {safePipelineSteps.map((step, idx) => {
                        const iconKey = typeof step.icon === 'string' ? step.icon : 'Users';
                        const IconComponent = ICON_MAP[iconKey] || Users;
                        
                        return (
                        <div key={idx} className="relative flex flex-col items-center text-center group">
                            <div className="w-20 h-20 bg-white border-4 border-slate-100 rounded-full flex items-center justify-center mb-3 shadow-sm group-hover:border-brand-orange group-hover:shadow-lg transition-all duration-300 relative z-10">
                                <IconComponent size={28} className="text-slate-600 group-hover:text-brand-orange transition-colors" />
                                {idx < safePipelineSteps.length - 1 && (
                                    <div className="absolute -right-8 top-1/2 -translate-y-1/2 text-slate-300 md:block hidden">
                                        <ArrowRight size={16} />
                                    </div>
                                )}
                            </div>
                            
                            {isEditing ? (
                                <div className="w-full space-y-2">
                                    <div className="relative w-full">
                                        <input 
                                            className="w-full text-center font-black uppercase text-sm border-b border-slate-300 focus:border-brand-orange outline-none bg-transparent py-1 pr-6"
                                            value={safeStr(step.title)}
                                            onChange={(e) => handlePipelineUpdate(idx, 'title', e.target.value)}
                                        />
                                        <button 
                                            onClick={() => handleRefine('pipeline', idx, 'title', safeStr(step.title), `人才招聘流程步骤标题: ${step.title}`)}
                                            className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-300 hover:text-brand-orange p-1"
                                            disabled={isRefining('pipeline', idx, 'title')}
                                            title="AI 润色"
                                        >
                                            <Wand2 size={12} className={isRefining('pipeline', idx, 'title') ? 'animate-spin' : ''} />
                                        </button>
                                    </div>
                                    <div className="relative w-full">
                                        <textarea 
                                            className="w-full text-xs text-slate-500 border rounded p-1 h-14 bg-slate-50 resize-none focus:border-brand-orange outline-none pr-6"
                                            value={safeStr(step.desc)}
                                            onChange={(e) => handlePipelineUpdate(idx, 'desc', e.target.value)}
                                        />
                                        <button 
                                            onClick={() => handleRefine('pipeline', idx, 'desc', safeStr(step.desc), `人才招聘流程步骤描述: ${step.title}`)}
                                            className="absolute right-1 top-1 text-slate-300 hover:text-brand-orange p-1"
                                            disabled={isRefining('pipeline', idx, 'desc')}
                                            title="AI 润色"
                                        >
                                            <Wand2 size={12} className={isRefining('pipeline', idx, 'desc') ? 'animate-spin' : ''} />
                                        </button>
                                    </div>
                                    <div className="relative w-full">
                                        <input 
                                            className="w-full text-center text-xs font-bold text-slate-600 bg-slate-100 rounded py-1 focus:ring-1 focus:ring-brand-orange outline-none pr-6"
                                            value={safeStr(step.stat)}
                                            onChange={(e) => handlePipelineUpdate(idx, 'stat', e.target.value)}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <h4 className="text-base font-black text-slate-800 uppercase leading-tight">{safeStr(step.title)}</h4>
                                    <span className="text-[10px] font-mono text-slate-400 mb-1 block">{safeStr(step.en)}</span>
                                    <p className="text-xs text-slate-500 px-1 leading-normal h-10 line-clamp-2">{safeStr(step.desc)}</p>
                                    <div className="mt-2 bg-slate-100 text-slate-600 text-[10px] font-bold py-1 px-2 rounded-full">
                                        {safeStr(step.stat)}
                                    </div>
                                </>
                            )}
                        </div>
                    )})}
                </div>
            </TechCard>
        </div>

        {/* PART 2: CORE FUNCTIONS */}
        <div className="mb-12">
            <div className="flex items-center gap-4 mb-6">
                <div className="h-8 w-1 bg-brand-orange"></div>
                <h3 className="text-2xl font-bold text-slate-800 uppercase tracking-wide">
                    第二部分：核心成员能力与职能 <span className="text-slate-400 text-sm font-normal normal-case ml-2">// Core Functions & Capabilities</span>
                </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {safeCoreFunctions.map((func, idx) => {
                    const iconKey = typeof func.icon === 'string' ? func.icon : 'BookOpen';
                    const IconComponent = ICON_MAP[iconKey] || BookOpen;
                    return (
                    <TechCard key={idx} className="hover:border-l-4 hover:border-l-brand-orange transition-all h-full">
                        <div className="flex flex-col items-start gap-4 h-full">
                            <div className={`p-4 rounded-lg bg-slate-50 ${func.color} mb-2`}>
                                <IconComponent size={32} />
                            </div>
                            <div className="flex-1 w-full">
                                {isEditing ? (
                                    <div className="space-y-2">
                                        <input 
                                            className="w-full font-bold text-lg border-b border-slate-300 focus:border-brand-orange outline-none bg-transparent"
                                            value={safeStr(func.title)}
                                            onChange={(e) => handleFunctionUpdate(idx, 'title', e.target.value)}
                                        />
                                        <textarea 
                                            className="w-full text-slate-600 text-sm border rounded p-2 h-32 bg-slate-50"
                                            value={safeStr(func.desc)}
                                            onChange={(e) => handleFunctionUpdate(idx, 'desc', e.target.value)}
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <h4 className="text-xl font-bold text-slate-800 uppercase flex flex-col gap-1 mb-3">
                                            {safeStr(func.title)}
                                            <span className="text-xs text-slate-300 font-mono tracking-widest">{safeStr(func.subtitle)}</span>
                                        </h4>
                                        <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-line">
                                            {safeStr(func.desc)}
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    </TechCard>
                )})}
            </div>
        </div>

        {/* PART 3: ALLOCATION */}
        <div className="mb-12">
            <div className="flex items-center gap-4 mb-6">
                <div className="h-8 w-1 bg-brand-orange"></div>
                <h3 className="text-2xl font-bold text-slate-800 uppercase tracking-wide">
                    第三部分：资源优化配置 <span className="text-slate-400 text-sm font-normal normal-case ml-2">// Resource Optimization</span>
                </h3>
            </div>

            <TechCard className="!p-0 overflow-hidden border-2 border-brand-orange/20">
                <div className="flex flex-col lg:flex-row">
                    <div className="flex-1 p-8 lg:p-12 bg-white relative">
                        <div className="absolute top-0 left-0 w-2 h-full bg-brand-orange"></div>
                        
                        {isEditing ? (
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">主标题</label>
                                    <input 
                                        className="w-full text-4xl font-black italic tracking-tighter text-slate-900 border-b-2 border-brand-orange outline-none pb-2 bg-transparent"
                                        value={safeStr(safeAllocation.title)}
                                        onChange={(e) => handleAllocationUpdate('title', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">副标题</label>
                                    <input 
                                        className="w-full text-slate-500 font-mono border-b border-slate-200 outline-none pb-1 bg-transparent"
                                        value={safeStr(safeAllocation.subtitle)}
                                        onChange={(e) => handleAllocationUpdate('subtitle', e.target.value)}
                                    />
                                </div>
                                <div className="relative">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">详细描述</label>
                                    <textarea 
                                        className="w-full h-40 text-slate-600 leading-relaxed text-lg border rounded p-4 bg-slate-50 outline-none focus:border-brand-orange pr-12"
                                        value={safeStr(safeAllocation.desc)}
                                        onChange={(e) => handleAllocationUpdate('desc', e.target.value)}
                                    />
                                    <button 
                                        onClick={() => handleRefine('allocation', 0, 'desc', safeStr(safeAllocation.desc), "资源优化配置部分的深度文案")}
                                        className="absolute right-3 bottom-3 text-brand-orange hover:bg-brand-orange/10 p-2 rounded-full transition-colors"
                                        disabled={isRefining('allocation', 0, 'desc')}
                                    >
                                        <Wand2 className={isRefining('allocation', 0, 'desc') ? 'animate-spin' : ''} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col justify-center">
                                <h4 className="text-4xl md:text-5xl font-black italic tracking-tighter text-slate-900 mb-2 uppercase">
                                    {safeStr(safeAllocation.title)}
                                </h4>
                                <p className="text-brand-orange font-mono text-sm tracking-[0.3em] uppercase mb-8">
                                    {safeStr(safeAllocation.subtitle)}
                                </p>
                                <div className="space-y-4">
                                    <p className="text-slate-600 text-lg md:text-xl leading-relaxed font-medium">
                                        {safeStr(safeAllocation.desc)}
                                    </p>
                                    <div className="flex items-center gap-3 text-slate-400 font-bold text-xs uppercase italic tracking-widest pt-4">
                                        <div className="h-px flex-1 bg-slate-200"></div>
                                        适合才能双赢
                                        <div className="h-px flex-1 bg-slate-200"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="w-full lg:w-[45%] h-64 lg:h-auto relative group overflow-hidden bg-slate-900">
                        <img 
                            src={safeAllocation.imageUrl} 
                            className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-1000"
                            alt="Allocation Visual"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent pointer-events-none"></div>
                        
                        {isEditing && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity group-hover:opacity-100 opacity-0">
                                <label className="bg-white text-brand-orange px-6 py-3 rounded font-black uppercase text-sm flex items-center gap-3 cursor-pointer shadow-2xl hover:scale-105 transition-transform">
                                    <Upload size={20} /> 更换背景图
                                    <input type="file" className="hidden" accept="image/*" onChange={handleAllocationImageUpload} />
                                </label>
                            </div>
                        )}
                        
                        {/* Decorative HUD Elements */}
                        <div className="absolute bottom-4 right-4 pointer-events-none">
                            <div className="border border-white/20 p-2 font-mono text-[8px] text-white/40 uppercase tracking-tighter">
                                Target_Match_Score: 98.4%<br/>
                                Efficiency_Gain: +32%
                            </div>
                        </div>
                    </div>
                </div>
            </TechCard>
        </div>
    </div>
  );
};
