
import React, { useState, DragEvent } from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TechCard } from './ui/TechCard';
import { Cpu, BrainCircuit, Paintbrush, Layers, Zap, PenTool, Edit2, Check, Target, ArrowRight as ArrowIcon, Wrench, Settings, Trash2, Plus, Upload, Wand2, CloudUpload, Loader2, AlertTriangle, Quote } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { refineText } from '../services/geminiService';
import { DEFAULT_MODULE_STATS, DEFAULT_SKILL_BEFORE, DEFAULT_SKILL_AFTER, DEFAULT_PRACTICAL_APPS, DEFAULT_FEATURES, DEFAULT_TOOLS, DEFAULT_AI_INTRO } from '../data/defaults';

const ICON_MAP: Record<string, React.ElementType> = {
    Paintbrush, Layers, Zap, PenTool, Cpu, BrainCircuit, Settings, Wrench
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

export const AISection: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [moduleStats, setModuleStats] = useLocalStorage('ai_stats_v3', DEFAULT_MODULE_STATS);
  const [skillBefore, setSkillBefore] = useLocalStorage('ai_skillBefore', DEFAULT_SKILL_BEFORE);
  const [skillAfter, setSkillAfter] = useLocalStorage('ai_skillAfter', DEFAULT_SKILL_AFTER);
  const [practicalApps, setPracticalApps] = useLocalStorage('ai_apps_v2', DEFAULT_PRACTICAL_APPS);
  const [features, setFeatures] = useLocalStorage('ai_features_v2', DEFAULT_FEATURES);
  const [tools, setTools] = useLocalStorage('talent_tools_v1', DEFAULT_TOOLS);
  const [aiIntro, setAiIntro] = useLocalStorage('ai_intro_v1', DEFAULT_AI_INTRO);

  // Tools Specific State
  const [toolDeleteIndex, setToolDeleteIndex] = useState<number | null>(null);
  const [dragTargetTool, setDragTargetTool] = useState<number | null>(null);
  const [processingTool, setProcessingTool] = useState<number | null>(null);
  const [refiningState, setRefiningState] = useState<{section: string, index: number, field: string} | null>(null);

  const handleUpdate = (index: number, field: string, value: string | number) => {
    const newStats = [...moduleStats];
    newStats[index] = { ...newStats[index], [field]: value };
    setModuleStats(newStats);
  };

  const handleSkillUpdate = (isAfter: boolean, index: number, value: number) => {
    const newSkills = isAfter ? [...skillAfter] : [...skillBefore];
    newSkills[index] = { ...newSkills[index], value: value };
    if (isAfter) setSkillAfter(newSkills);
    else setSkillBefore(newSkills);
  };

  const handleAppUpdate = (index: number, value: string) => {
    const newApps = [...practicalApps];
    newApps[index] = value;
    setPracticalApps(newApps);
  };

  const handleFeatureUpdate = (index: number, field: 'title' | 'desc', value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    setFeatures(newFeatures);
  };

  // Tools Logic
  const handleToolUpdate = (index: number, field: string, value: string) => {
      const newTools = [...tools];
      newTools[index] = { ...newTools[index], [field]: value };
      setTools(newTools);
  };

  const handleToolImageUpload = async (e: React.ChangeEvent<HTMLInputElement> | FileList, index: number) => {
      let file: File | null = null;
      if (e instanceof FileList) file = e[0];
      else if (e.target.files) file = e.target.files[0];

      if (file) {
          setProcessingTool(index);
          const compressed = await compressImage(file);
          handleToolUpdate(index, 'imageUrl', compressed);
          setProcessingTool(null);
      }
  };

  const addTool = () => {
      setTools([...tools, { title: "新效能工具", desc: "请输入工具描述", imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1000" }]);
  };

  const executeRemoveTool = () => {
      if (toolDeleteIndex !== null) {
          setTools(tools.filter((_, i) => i !== toolDeleteIndex));
          setToolDeleteIndex(null);
      }
  };

  const handleRefine = async (section: string, index: number, field: string, currentValue: string, context: string) => {
    if (!currentValue) return;
    setRefiningState({ section, index, field });
    const refined = await refineText(currentValue, context);
    if (section === 'tool') handleToolUpdate(index, field, refined);
    if (section === 'intro') setAiIntro(refined);
    setRefiningState(null);
  };

  const isRefining = (section: string, index: number, field: string) => {
      return refiningState?.section === section && refiningState?.index === index && refiningState?.field === field;
  };

  // Drag handlers for tools
  const onToolDragEnterOver = (e: DragEvent, index: number) => {
      e.preventDefault();
      e.stopPropagation();
      setDragTargetTool(index);
  };
  const onToolDragLeave = (e: DragEvent) => {
      e.preventDefault(); e.stopPropagation();
      setDragTargetTool(null);
  };
  const onToolDrop = (e: DragEvent, index: number) => {
      e.preventDefault(); e.stopPropagation();
      setDragTargetTool(null);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          handleToolImageUpload(e.dataTransfer.files, index);
      }
  };

  const safeModuleStats = Array.isArray(moduleStats) ? moduleStats : DEFAULT_MODULE_STATS;
  const safeFeatures = Array.isArray(features) ? features : DEFAULT_FEATURES;
  const safePracticalApps = Array.isArray(practicalApps) ? practicalApps : DEFAULT_PRACTICAL_APPS;
  const safeTools = Array.isArray(tools) ? tools : DEFAULT_TOOLS;
  
  const safeSkillBefore = Array.isArray(skillBefore) 
    ? skillBefore.map(s => ({ ...s, subject: String(s.subject), value: Number(s.value) })) 
    : DEFAULT_SKILL_BEFORE;

  const safeSkillAfter = Array.isArray(skillAfter) 
    ? skillAfter.map(s => ({ ...s, subject: String(s.subject), value: Number(s.value) })) 
    : DEFAULT_SKILL_AFTER;

  const averagePercentage = Math.round(safeModuleStats.reduce((acc, curr) => acc + (Number(curr.percentage) || 0), 0) / (safeModuleStats.length || 1));
  const safeStr = (val: any) => typeof val === 'string' ? val : String(val || '');

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8">
         <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between">
            <div>
                <h2 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900">
                    <span className="text-brand-orange">03.</span> AI 普及应用
                </h2>
                <p className="text-slate-500 font-mono mt-2">生成式工作流 // 进化 (GENERATIVE EVOLUTION)</p>
            </div>
             <div className="flex items-center gap-4 mt-4 md:mt-0">
                <div className="bg-slate-900 text-white px-6 py-2 font-mono text-sm clip-tech border-l-4 border-brand-orange">
                    全流程平均渗透率: <span className="text-brand-orange font-bold text-lg">{averagePercentage}%</span>
                </div>
                <button 
                    onClick={() => setIsEditing(!isEditing)}
                    className={`flex items-center gap-2 px-3 py-2 rounded font-bold uppercase text-xs tracking-wider transition-colors ${
                        isEditing ? 'bg-brand-orange text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                >
                    {isEditing ? <><Check size={14}/> 完成编辑</> : <><Edit2 size={14}/> 编辑内容</>}
                </button>
            </div>
        </div>

        <div className="flex flex-col gap-12">
            
            {/* INTRO MANIFESTO */}
            <div className="relative group/intro">
                <div className="absolute -top-6 -left-6 opacity-10 text-brand-orange pointer-events-none group-hover/intro:opacity-20 transition-opacity">
                    <Quote size={80} />
                </div>
                <div className="bg-slate-900 text-white p-8 md:p-12 clip-tech-inv border-l-8 border-brand-orange shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-48 bg-brand-orange/5 blur-[100px] rounded-full pointer-events-none"></div>
                    
                    {isEditing ? (
                        <div className="relative z-10">
                            <textarea 
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-6 text-lg md:text-xl font-medium leading-relaxed italic outline-none focus:border-brand-orange min-h-[200px] resize-y"
                                value={safeStr(aiIntro)}
                                onChange={(e) => setAiIntro(e.target.value)}
                            />
                             <button 
                                onClick={() => handleRefine('intro', 0, 'text', safeStr(aiIntro), "AI 普及应用的深度行业洞察引言")}
                                className="absolute right-4 bottom-4 bg-brand-orange text-white px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-white hover:text-brand-orange transition-all shadow-lg"
                                disabled={isRefining('intro', 0, 'text')}
                            >
                                <Wand2 size={16} className={isRefining('intro', 0, 'text') ? 'animate-spin' : ''} />
                                AI 润色引言
                            </button>
                        </div>
                    ) : (
                        <p className="text-xl md:text-2xl font-medium leading-relaxed italic relative z-10 text-slate-100">
                             {safeStr(aiIntro)}
                        </p>
                    )}
                    
                    <div className="mt-6 flex justify-end relative z-10">
                        <div className="h-px w-24 bg-brand-orange/50 mt-4"></div>
                    </div>
                </div>
            </div>

            {/* PART 1: MODULE STATS */}
            <div>
                <div className="flex items-center gap-4 mb-6">
                    <div className="h-6 w-1 bg-brand-orange"></div>
                    <h3 className="text-xl font-bold text-slate-700 uppercase">第一部分：各模块 AI 使用占比</h3>
                </div>
                <TechCard>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-4">
                        {safeModuleStats.map((item, idx) => {
                            const iconKey = typeof item.icon === 'string' ? item.icon : 'Paintbrush';
                            const IconComponent = ICON_MAP[iconKey] || Paintbrush;
                            const percentage = Number(item.percentage) || 0;
                            const colorClass = typeof item.color === 'string' ? item.color : 'bg-brand-orange';

                            return (
                            <div key={idx} className="relative flex flex-col h-full justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded bg-slate-100 ${colorClass.replace('bg-', 'text-')}`}>
                                                <IconComponent size={20} />
                                            </div>
                                            <div className="flex-1">
                                                {isEditing ? (
                                                    <input 
                                                        className="font-bold text-slate-800 text-base border-b border-slate-300 outline-none w-full bg-transparent"
                                                        value={safeStr(item.name)}
                                                        onChange={(e) => handleUpdate(idx, 'name', e.target.value)}
                                                    />
                                                ) : (
                                                    <h4 className="font-bold text-slate-800 text-lg leading-none mb-1">{safeStr(item.name)}</h4>
                                                )}
                                                <span className="text-[10px] font-mono text-slate-400 tracking-wider uppercase">{safeStr(item.en)}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            {isEditing ? (
                                                <div className="flex items-center justify-end gap-1">
                                                    <input 
                                                        type="number" 
                                                        className="text-2xl font-black italic text-slate-900 w-16 text-right border-b border-slate-300 outline-none bg-transparent"
                                                        value={percentage}
                                                        onChange={(e) => handleUpdate(idx, 'percentage', Number(e.target.value))}
                                                    />
                                                    <span className="text-2xl font-black italic text-slate-900">%</span>
                                                </div>
                                            ) : (
                                                <span className="text-3xl font-black italic text-slate-900">{percentage}%</span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="h-3 w-full bg-slate-100 rounded-sm overflow-hidden relative skew-x-[-12deg] mb-4">
                                        <div className="absolute inset-0 z-10 flex justify-between px-1">
                                            {[...Array(10)].map((_, i) => (
                                                <div key={i} className="w-[1px] h-full bg-white/50"></div>
                                            ))}
                                        </div>
                                        <div 
                                            className={`h-full ${colorClass} relative transition-all duration-1000 ease-out`}
                                            style={{ width: `${percentage}%` }}
                                        >
                                            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] opacity-30"></div>
                                        </div>
                                    </div>

                                    <div className="text-sm">
                                        {isEditing ? (
                                            <input 
                                                className="text-slate-500 w-full border-b border-slate-300 outline-none mb-2 bg-transparent"
                                                value={safeStr(item.description)}
                                                onChange={(e) => handleUpdate(idx, 'description', e.target.value)}
                                            />
                                        ) : (
                                            <p className="text-slate-500 min-h-[40px]">{safeStr(item.description)}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-3">
                                    {isEditing ? (
                                         <input 
                                            className="text-slate-600 text-xs font-mono w-full border border-slate-200 rounded p-1 bg-transparent"
                                            value={safeStr(item.breakdown)}
                                            onChange={(e) => handleUpdate(idx, 'breakdown', e.target.value)}
                                        />
                                    ) : (
                                        <div className="bg-slate-50 px-3 py-2 border border-slate-200 rounded text-xs font-mono text-slate-600">
                                            <span className="text-brand-orange font-bold">▶</span> {safeStr(item.breakdown)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )})}
                    </div>
                </TechCard>
            </div>

            {/* PART 2: MODELS & FEATURES */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                     <div className="flex items-center gap-4 mb-6">
                        <div className="h-6 w-1 bg-brand-orange"></div>
                        <h3 className="text-xl font-bold text-slate-700 uppercase">第二部分：能力素质模型演变</h3>
                    </div>
                    <TechCard className="h-full flex flex-col">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                            <div className="flex flex-col items-center">
                                <h5 className="font-bold text-slate-500 mb-2 text-sm uppercase tracking-wider">传统设计师模型</h5>
                                <div className="w-full h-[250px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart cx="50%" cy="50%" outerRadius="65%" data={safeSkillBefore}>
                                            <PolarGrid stroke="#e2e8f0" />
                                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} />
                                            <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                                            <Radar
                                                name="传统能力"
                                                dataKey="value"
                                                stroke="#94a3b8"
                                                strokeWidth={2}
                                                fill="#94a3b8"
                                                fillOpacity={0.3}
                                            />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                                {isEditing && (
                                        <div className="p-2 bg-slate-50 w-full text-[10px] grid grid-cols-3 gap-1">
                                        {safeSkillBefore.map((s, i) => (
                                            <div key={i} className="flex flex-col items-center">
                                                <span className="text-slate-500 scale-90">{safeStr(s.subject)}</span>
                                                <input 
                                                    type="number" 
                                                    className="w-10 border rounded px-1 text-center" 
                                                    value={Number(s.value) || 0} 
                                                    onChange={(e) => handleSkillUpdate(false, i, parseInt(e.target.value))}
                                                />
                                            </div>
                                        ))}
                                        </div>
                                )}
                            </div>

                            <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-brand-orange bg-white rounded-full p-1 shadow-sm border border-brand-orange/20">
                                <ArrowIcon size={24} />
                            </div>

                            <div className="flex flex-col items-center relative">
                                <h5 className="font-bold text-brand-orange mb-2 text-sm uppercase tracking-wider flex items-center gap-1">
                                    <Zap size={14} className="fill-brand-orange" /> AI 时代设计师模型
                                </h5>
                                <div className="w-full h-[250px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart cx="50%" cy="50%" outerRadius="65%" data={safeSkillAfter}>
                                            <PolarGrid stroke="#e2e8f0" />
                                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#FF5500', fontSize: 10, fontWeight: 'bold' }} />
                                            <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                                            <Radar
                                                name="AI时代能力"
                                                dataKey="value"
                                                stroke="#FF5500"
                                                strokeWidth={3}
                                                fill="#FF5500"
                                                fillOpacity={0.4}
                                            />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                                    {isEditing && (
                                        <div className="p-2 bg-slate-50 w-full text-[10px] grid grid-cols-3 gap-1">
                                        {safeSkillAfter.map((s, i) => (
                                            <div key={i} className="flex flex-col items-center">
                                                <span className="text-slate-500 scale-90">{safeStr(s.subject)}</span>
                                                <input 
                                                    type="number" 
                                                    className="w-10 border rounded px-1 text-center" 
                                                    value={Number(s.value) || 0} 
                                                    onChange={(e) => handleSkillUpdate(true, i, parseInt(e.target.value))}
                                                />
                                            </div>
                                        ))}
                                        </div>
                                )}
                            </div>
                        </div>

                        {!isEditing && (
                            <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 mt-4">
                                <p className="flex items-center gap-2">
                                    <Target size={14} className="text-brand-orange"/>
                                    <strong>核心洞察：</strong> 技法权重下降，审美与工具驾驭能力成为新的核心竞争力。
                                </p>
                            </div>
                        )}
                    </TechCard>
                </div>

                <div className="bg-slate-900 text-white p-6 clip-tech-inv h-full flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-32 bg-brand-orange/10 blur-[80px] rounded-full pointer-events-none"></div>

                    <h3 className="text-xl font-bold uppercase mb-8 border-b border-gray-700 pb-4 flex items-center gap-2">
                        <BrainCircuit className="text-brand-orange" />
                        新时代设计师特征
                    </h3>
                    
                    <div className="space-y-8 relative z-10">
                        {safeFeatures.map((feature, idx) => {
                             const iconKey = typeof feature.icon === 'string' ? feature.icon : 'PenTool';
                             const IconComponent = ICON_MAP[iconKey] || PenTool;
                             return (
                            <div key={idx} className="flex gap-4 group">
                                <div className="mt-1 p-2 bg-white/5 rounded group-hover:bg-brand-orange/20 transition-colors">
                                    <IconComponent className="text-slate-400 group-hover:text-brand-orange" size={20}/>
                                </div>
                                <div className="flex-1">
                                    {isEditing ? (
                                        <div className="flex flex-col gap-2">
                                            <input 
                                                className="font-bold text-brand-orange text-lg bg-transparent border-b border-slate-600 focus:border-brand-orange outline-none w-full"
                                                value={safeStr(feature.title)}
                                                onChange={(e) => handleFeatureUpdate(idx, 'title', e.target.value)}
                                            />
                                            <textarea 
                                                className="text-sm text-gray-300 bg-white/5 border border-white/10 rounded p-2 outline-none focus:border-brand-orange w-full h-20 resize-none"
                                                value={safeStr(feature.desc)}
                                                onChange={(e) => handleFeatureUpdate(idx, 'desc', e.target.value)}
                                            />
                                        </div>
                                    ) : (
                                        <div>
                                            <h4 className="font-bold text-brand-orange text-lg">{safeStr(feature.title)}</h4>
                                            <p className="text-sm text-gray-400 mt-2 leading-relaxed">{safeStr(feature.desc)}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )})}
                    </div>
                </div>
            </div>

            {/* PART 3: EFFICIENCY TOOLS SHOWCASE */}
            <div>
                 <div className="flex items-center gap-4 mb-6">
                    <div className="h-6 w-1 bg-brand-orange"></div>
                    <h3 className="text-xl font-bold text-slate-700 uppercase">第三部分：自研效能工具展示</h3>
                </div>
                <div className="bg-slate-100/50 rounded-xl p-6 md:p-8 border border-slate-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {safeTools.map((tool, idx) => {
                            const isDragOver = dragTargetTool === idx;
                            const isProcessing = processingTool === idx;
                            return (
                            <TechCard key={idx} className={`!p-0 overflow-hidden flex flex-col h-full bg-white shadow-sm transition-all ${isDragOver ? 'ring-2 ring-brand-orange ring-offset-2' : ''}`}>
                                <div 
                                    className="relative h-48 group/img bg-slate-200 border-b border-slate-100 transition-colors"
                                    onDragEnter={(e) => onToolDragEnterOver(e, idx)}
                                    onDragOver={(e) => onToolDragEnterOver(e, idx)}
                                    onDragLeave={onToolDragLeave}
                                    onDrop={(e) => onToolDrop(e, idx)}
                                >
                                    <img src={tool.imageUrl} className={`w-full h-full object-cover transition-opacity ${isDragOver || isProcessing ? 'opacity-50' : 'opacity-100'}`} alt={tool.title} />
                                    {isProcessing && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-20">
                                            <Loader2 size={32} className="animate-spin text-brand-orange mb-2" />
                                            <span className="text-xs font-bold text-brand-orange uppercase">Processing...</span>
                                        </div>
                                    )}
                                    {isEditing && !isProcessing && (
                                        <div className={`absolute inset-0 bg-black/50 flex flex-col items-center justify-center transition-opacity z-10 ${isDragOver ? 'opacity-100' : 'opacity-0 group-hover/img:opacity-100'}`}>
                                            {isDragOver ? (
                                                <div className="text-white flex flex-col items-center animate-bounce">
                                                    <CloudUpload size={32} />
                                                    <span className="text-xs font-bold mt-1">松开上传</span>
                                                </div>
                                            ) : (
                                                <label className="bg-brand-orange text-white px-4 py-2 rounded font-bold cursor-pointer text-xs flex items-center gap-2 hover:bg-orange-600 shadow-lg transform hover:scale-105 transition-all">
                                                    <Upload size={14} /> 更换截图
                                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleToolImageUpload(e, idx)} />
                                                </label>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    {isEditing ? (
                                        <div className="flex-1 space-y-3">
                                            <div className="flex items-center justify-between gap-2">
                                                <input 
                                                    className="text-lg font-bold border-b border-slate-300 w-full outline-none focus:border-brand-orange bg-transparent"
                                                    value={safeStr(tool.title)}
                                                    onChange={(e) => handleToolUpdate(idx, 'title', e.target.value)}
                                                    placeholder="工具名称"
                                                />
                                                <button 
                                                    onClick={() => setToolDeleteIndex(idx)} 
                                                    className="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded transition-colors"
                                                    title="删除该卡片"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                            <div className="relative">
                                                <textarea 
                                                    className="w-full text-sm text-slate-600 border rounded p-2 h-24 bg-slate-50 outline-none focus:border-brand-orange resize-none pr-8"
                                                    value={safeStr(tool.desc)}
                                                    onChange={(e) => handleToolUpdate(idx, 'desc', e.target.value)}
                                                    placeholder="工具功能描述..."
                                                />
                                                <button 
                                                    onClick={() => handleRefine('tool', idx, 'desc', safeStr(tool.desc), `效率工具描述: ${tool.title}`)}
                                                    className="absolute right-2 bottom-2 text-slate-300 hover:text-brand-orange p-1 hover:bg-slate-200 rounded transition-colors"
                                                    disabled={isRefining('tool', idx, 'desc')}
                                                    title="AI 润色文案"
                                                >
                                                    <Wand2 size={14} className={isRefining('tool', idx, 'desc') ? 'animate-spin' : ''} />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex-1">
                                            <h4 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
                                                <Settings size={18} className="text-brand-orange" />
                                                {safeStr(tool.title)}
                                            </h4>
                                            <p className="text-sm text-slate-600 leading-relaxed">{safeStr(tool.desc)}</p>
                                        </div>
                                    )}
                                </div>
                            </TechCard>
                        )})}
                        {isEditing && (
                            <button 
                                onClick={addTool}
                                className="h-full border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:text-brand-orange hover:border-brand-orange hover:bg-brand-orange/5 transition-all group min-h-[300px]"
                            >
                                <Plus size={48} className="mb-2 group-hover:scale-110 transition-transform" />
                                <span className="font-bold text-sm uppercase tracking-wider">添加新工具</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* PRACTICAL APP CHIPS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {safePracticalApps.map((tool, i) => (
                    <div key={i} className="bg-white border border-slate-200 p-4 text-center font-bold text-slate-700 hover:border-brand-orange hover:text-brand-orange transition-colors cursor-default clip-tech shadow-sm flex items-center justify-center">
                        {isEditing ? (
                            <input 
                                className="w-full text-center bg-transparent border-b border-slate-300 outline-none focus:border-brand-orange"
                                value={safeStr(tool)}
                                onChange={(e) => handleAppUpdate(i, e.target.value)}
                            />
                        ) : (
                            safeStr(tool)
                        )}
                    </div>
                ))}
            </div>
        </div>

        {/* Tool Delete Confirmation */}
        {toolDeleteIndex !== null && (
            <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setToolDeleteIndex(null)}>
                <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-2xl border-l-4 border-red-500 animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                    <div className="flex items-start gap-4">
                        <div className="bg-red-50 p-3 rounded-full"><AlertTriangle className="text-red-500" size={24} /></div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-slate-900 mb-2">确认删除该工具卡片？</h3>
                            <p className="text-slate-600 text-sm leading-relaxed mb-6">此操作将移除 "{safeTools[toolDeleteIndex]?.title}" 的所有内容。</p>
                            <div className="flex justify-end gap-3">
                                <button onClick={() => setToolDeleteIndex(null)} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700">取消</button>
                                <button onClick={executeRemoveTool} className="px-4 py-2 text-sm font-bold bg-red-500 text-white rounded hover:bg-red-600 shadow-lg shadow-red-500/30 flex items-center gap-2"><Trash2 size={14} /> 确认删除</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
