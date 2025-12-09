
import React, { useState } from 'react';
import { TechCard } from './ui/TechCard';
import { Users, Zap, GraduationCap, ArrowRight, BookOpen, Lightbulb, Wrench, Briefcase, Edit2, Check, Wand2, RefreshCw, Upload, Layout } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { refineText } from '../services/geminiService';

const ICON_MAP: Record<string, React.ElementType> = {
    Users, Zap, GraduationCap, Briefcase, BookOpen, Lightbulb, Wrench, RefreshCw, Layout
};

// Image Compression Helper (Kept consistent with Portfolio)
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

const INITIAL_PIPELINE_STEPS = [
    { 
        title: "精准招聘", 
        en: "Recruitment",
        icon: "Users", 
        desc: "画像匹配 / 美术测试 / 价值观对齐",
        stat: "数百份简历筛选"
    },
    { 
        title: "入职特训", 
        en: "Onboarding",
        icon: "GraduationCap", 
        desc: "3个月项目实战 / 导师制 / 规范培训",
        stat: "针对项目进行专项训练"
    },
    { 
        title: "定点输送", 
        en: "Deployment",
        icon: "Briefcase", 
        desc: "根据项目实际人力缺口进行定点输送",
        stat: "100% 匹配率"
    },
    { 
        title: "实战产出", 
        en: "Production",
        icon: "Zap", 
        desc: "独当一面，承担核心资产制作",
        stat: "美术中心辅助"
    },
];

const INITIAL_CORE_FUNCTIONS = [
    {
        title: "持续学习",
        subtitle: "LEARNING",
        icon: "BookOpen",
        color: "text-blue-500",
        desc: "打造学习型组织；\n举办“美术大讲堂”；\n保持对前沿技术的饥渴感，确保团队技能栈不掉队。"
    },
    {
        title: "技术创新",
        subtitle: "INNOVATION",
        icon: "Lightbulb",
        color: "text-brand-orange",
        desc: "突破舒适区。\n探索AI动捕技术在项目中的应用；\n引入 AIGC 工作流，在动效设计阶段提升效率和品质；\n通过agent制作小工具，提升美术工作时的效率。"
    },
    {
        title: "解决问题",
        subtitle: "PROBLEM SOLVING",
        icon: "Wrench",
        color: "text-green-500",
        desc: "俄罗斯方块中的最小单位；\n重点解决美术设计的疑难杂症，确保团队创作无阻碍；\n和甲方积极沟通最终达成一致目标。"
    }
];

const INITIAL_ALLOCATION = {
    title: "树挪死，人挪活",
    subtitle: "RESOURCE OPTIMIZATION",
    desc: "打破项目壁垒，建立人才活水机制。我们深入分析每位美术师的个人能力模型与审美倾向，将其与项目的美术风格（写实/卡通/二次元）进行精准双向匹配，确保每一位成员都能在最适合的战场发挥最大价值。",
    imageUrl: "https://images.unsplash.com/photo-1578321272176-b7bbc0679853?auto=format&fit=crop&q=80&w=2666", // Cartoon/Lego style image
};

export const Talent: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [pipelineSteps, setPipelineSteps] = useLocalStorage('talent_pipeline_v2', INITIAL_PIPELINE_STEPS);
  const [coreFunctions, setCoreFunctions] = useLocalStorage('talent_coreFunctions_v3', INITIAL_CORE_FUNCTIONS);
  // Updated key to v4 to ensure clean state
  const [allocation, setAllocation] = useLocalStorage('talent_allocation_v4', INITIAL_ALLOCATION);
  const [refiningState, setRefiningState] = useState<{index: number, field: string} | null>(null);

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

  const handleRefine = async (index: number, field: string, currentValue: string, context: string) => {
    if (!currentValue) return;
    setRefiningState({ index, field });
    const refined = await refineText(currentValue, context);
    handlePipelineUpdate(index, field, refined);
    setRefiningState(null);
  };

  const safePipelineSteps = Array.isArray(pipelineSteps) ? pipelineSteps : INITIAL_PIPELINE_STEPS;
  const safeCoreFunctions = Array.isArray(coreFunctions) ? coreFunctions : INITIAL_CORE_FUNCTIONS;
  const safeAllocation = allocation || INITIAL_ALLOCATION;

  // Helper to ensure rendering strings
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

        {/* Part 1: Talent Supply Pipeline */}
        <div className="mb-12">
            <div className="flex items-center gap-4 mb-6">
                <div className="h-8 w-1 bg-brand-orange"></div>
                <h3 className="text-2xl font-bold text-slate-800 uppercase tracking-wide">
                    第一部分：为项目输送人才 <span className="text-slate-400 text-sm font-normal normal-case ml-2">// Talent Supply Pipeline</span>
                </h3>
            </div>
            
            <TechCard className="[&>div]:!p-5">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-10 left-0 right-0 h-0.5 bg-slate-200 -z-10 transform -translate-y-1/2"></div>
                    
                    {safePipelineSteps.map((step, idx) => {
                        // Safe icon retrieval
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
                                            onClick={() => handleRefine(idx, 'title', safeStr(step.title), `人才招聘流程步骤标题: ${step.title}`)}
                                            className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-300 hover:text-brand-orange p-1"
                                            disabled={refiningState?.index === idx && refiningState?.field === 'title'}
                                            title="AI 润色"
                                        >
                                            <Wand2 size={12} className={refiningState?.index === idx && refiningState?.field === 'title' ? 'animate-spin' : ''} />
                                        </button>
                                    </div>
                                    <div className="relative w-full">
                                        <textarea 
                                            className="w-full text-xs text-slate-500 border rounded p-1 h-14 bg-slate-50 resize-none focus:border-brand-orange outline-none pr-6"
                                            value={safeStr(step.desc)}
                                            onChange={(e) => handlePipelineUpdate(idx, 'desc', e.target.value)}
                                        />
                                        <button 
                                            onClick={() => handleRefine(idx, 'desc', safeStr(step.desc), `人才招聘流程步骤描述: ${step.title}`)}
                                            className="absolute right-1 top-1 text-slate-300 hover:text-brand-orange p-1"
                                            disabled={refiningState?.index === idx && refiningState?.field === 'desc'}
                                            title="AI 润色"
                                        >
                                            <Wand2 size={12} className={refiningState?.index === idx && refiningState?.field === 'desc' ? 'animate-spin' : ''} />
                                        </button>
                                    </div>
                                    <div className="relative w-full">
                                        <input 
                                            className="w-full text-center text-xs font-bold text-slate-600 bg-slate-100 rounded py-1 focus:ring-1 focus:ring-brand-orange outline-none pr-6"
                                            value={safeStr(step.stat)}
                                            onChange={(e) => handlePipelineUpdate(idx, 'stat', e.target.value)}
                                        />
                                        <button 
                                            onClick={() => handleRefine(idx, 'stat', safeStr(step.stat), `人才招聘流程数据统计: ${step.title}`)}
                                            className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-orange p-1"
                                            disabled={refiningState?.index === idx && refiningState?.field === 'stat'}
                                            title="AI 润色"
                                        >
                                            <Wand2 size={12} className={refiningState?.index === idx && refiningState?.field === 'stat' ? 'animate-spin' : ''} />
                                        </button>
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

        {/* Part 2: Core Competencies */}
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

        {/* Part 3: Dynamic Allocation */}
        <div>
            <div className="flex items-center gap-4 mb-6">
                <div className="h-8 w-1 bg-brand-orange"></div>
                <h3 className="text-2xl font-bold text-slate-800 uppercase tracking-wide">
                    第三部分：人员动态调配 <span className="text-slate-400 text-sm font-normal normal-case ml-2">// Dynamic Resource Allocation</span>
                </h3>
            </div>

            <TechCard className="!p-0 overflow-hidden">
                <div className="flex flex-col md:flex-row min-h-[300px]">
                    {/* Left: Content */}
                    <div className="w-full md:w-1/2 p-8 flex flex-col justify-center bg-white z-10 relative">
                        {isEditing ? (
                            <div className="space-y-4">
                                <input 
                                    className="w-full text-4xl font-black italic tracking-tighter text-brand-orange border-b border-slate-200 outline-none"
                                    value={safeStr(safeAllocation.title)}
                                    onChange={(e) => handleAllocationUpdate('title', e.target.value)}
                                />
                                <input 
                                    className="w-full text-xs font-mono text-slate-400 uppercase tracking-widest border-b border-slate-100 outline-none"
                                    value={safeStr(safeAllocation.subtitle)}
                                    onChange={(e) => handleAllocationUpdate('subtitle', e.target.value)}
                                />
                                <textarea 
                                    className="w-full h-32 text-slate-600 leading-relaxed border rounded p-2 text-sm resize-none bg-slate-50"
                                    value={safeStr(safeAllocation.desc)}
                                    onChange={(e) => handleAllocationUpdate('desc', e.target.value)}
                                />
                            </div>
                        ) : (
                            <>
                                <h3 className="text-4xl font-black italic tracking-tighter text-brand-orange mb-2">
                                    {safeStr(safeAllocation.title)}
                                </h3>
                                <div className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <RefreshCw size={12} className="animate-spin-slow" />
                                    {safeStr(safeAllocation.subtitle)}
                                </div>
                                <p className="text-slate-600 leading-relaxed mb-8 border-l-4 border-slate-200 pl-4">
                                    {safeStr(safeAllocation.desc)}
                                </p>
                            </>
                        )}
                        {/* Decorative Background Element */}
                        <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none">
                            <Layout size={200} />
                        </div>
                    </div>

                    {/* Right: Image */}
                    <div className="w-full md:w-1/2 relative group bg-slate-900 overflow-hidden">
                        <img 
                            src={safeAllocation.imageUrl} 
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100" 
                            alt="Team Collaboration" 
                        />
                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/10"></div>
                        
                        {/* Decoration */}
                        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white text-[10px] font-mono px-2 py-1 border border-white/20">
                            IMG_SOURCE: INTERNAL
                        </div>

                        {/* Upload Button */}
                        <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-20">
                            <div className="bg-brand-orange text-white px-6 py-3 rounded-full font-bold uppercase flex items-center gap-2 transform hover:scale-105 transition-transform shadow-xl">
                                <Upload size={18} />
                                更换展示图片
                            </div>
                            <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*" 
                                onChange={handleAllocationImageUpload} 
                            />
                        </label>
                    </div>
                </div>
            </TechCard>
        </div>
    </div>
  );
};
