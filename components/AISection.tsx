
import React, { useState } from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TechCard } from './ui/TechCard';
import { Cpu, BrainCircuit, Paintbrush, Layers, Zap, PenTool, Edit2, Check, Target, ArrowRight as ArrowIcon } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const ICON_MAP: Record<string, React.ElementType> = {
    Paintbrush, Layers, Zap, PenTool, Cpu, BrainCircuit
};

const INITIAL_MODULE_STATS = [
  { 
    name: '原画设计', 
    en: 'CONCEPT ART',
    icon: "Paintbrush",
    percentage: 80, // Updated to 80% per image
    color: 'bg-brand-orange',
    description: 'AI 辅助生成底图、材质与光影细节。',
    breakdown: 'AI生成 80% / 手绘修饰 20%'
  },
  { 
    name: 'UI 界面设计', 
    en: 'USER INTERFACE',
    icon: "Layers",
    percentage: 70, // Updated to 70% per request
    color: 'bg-blue-500',
    description: '图标资产批量生成，风格化界面布局快速迭代。',
    breakdown: 'AI生成 60% / 设计师排版 40%'
  },
  { 
    name: '动效与特效', 
    en: 'VFX & MOTION',
    icon: "Zap",
    percentage: 50,
    color: 'bg-green-500',
    description: '粒子贴图生成，关键帧 AI 补帧，流体模拟辅助。',
    breakdown: 'AI生成 50% / 引擎调整 50%'
  },
];

const INITIAL_SKILL_BEFORE = [
  { subject: '审美', value: 110, fullMark: 150 },
  { subject: '创意', value: 110, fullMark: 150 },
  { subject: '工具', value: 110, fullMark: 150 },
  { subject: '技法', value: 110, fullMark: 150 },
  { subject: '沟通', value: 110, fullMark: 150 },
  { subject: '洞察', value: 110, fullMark: 150 },
];

const INITIAL_SKILL_AFTER = [
  { subject: '审美', value: 150, fullMark: 150 }, // 顶格
  { subject: '创意', value: 110, fullMark: 150 }, // 不变
  { subject: '工具', value: 150, fullMark: 150 }, // 顶格
  { subject: '技法', value: 60, fullMark: 150 },  // 变低
  { subject: '沟通', value: 110, fullMark: 150 }, // 不变
  { subject: '洞察', value: 110, fullMark: 150 }, // 不变
];

const INITIAL_PRACTICAL_APPS = [
    'Midjourney 情绪板设计', 
    'Stable Diffusion 纹理生成', 
    'Nanobanana 图片编辑', // Updated per image
    'Runway 动态分镜'
];

const INITIAL_FEATURES = [
  {
    icon: "PenTool",
    title: '从执行者到鉴赏者',
    desc: '重心从繁重的手工绘制转移到审美判断、风格筛选以及对生成资产的精修润色。'
  },
  {
    icon: "Cpu",
    title: '提示词工程 (Prompt)',
    desc: '能够将抽象的艺术愿景转化为 AI 模型可理解的精确技术语言与参数组合。'
  },
  {
    icon: "BrainCircuit",
    title: '技术合成能力',
    desc: '将 AI 产出无缝集成到引擎中，打通资产落地的“最后一公里”。' // Updated text removing specific engine names
  }
];

export const AISection: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  // Updated keys to v3 to ensure new content is loaded
  const [moduleStats, setModuleStats] = useLocalStorage('ai_stats_v3', INITIAL_MODULE_STATS);
  const [skillBefore, setSkillBefore] = useLocalStorage('ai_skillBefore', INITIAL_SKILL_BEFORE);
  const [skillAfter, setSkillAfter] = useLocalStorage('ai_skillAfter', INITIAL_SKILL_AFTER);
  const [practicalApps, setPracticalApps] = useLocalStorage('ai_apps_v2', INITIAL_PRACTICAL_APPS);
  const [features, setFeatures] = useLocalStorage('ai_features_v2', INITIAL_FEATURES);

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

  const safeModuleStats = Array.isArray(moduleStats) ? moduleStats : INITIAL_MODULE_STATS;
  const safeFeatures = Array.isArray(features) ? features : INITIAL_FEATURES;
  const safePracticalApps = Array.isArray(practicalApps) ? practicalApps : INITIAL_PRACTICAL_APPS;
  
  // Safe Chart Data Construction
  const safeSkillBefore = Array.isArray(skillBefore) 
    ? skillBefore.map(s => ({ ...s, subject: String(s.subject), value: Number(s.value) })) 
    : INITIAL_SKILL_BEFORE;

  const safeSkillAfter = Array.isArray(skillAfter) 
    ? skillAfter.map(s => ({ ...s, subject: String(s.subject), value: Number(s.value) })) 
    : INITIAL_SKILL_AFTER;

  const averagePercentage = Math.round(safeModuleStats.reduce((acc, curr) => acc + (Number(curr.percentage) || 0), 0) / (safeModuleStats.length || 1));

  // Helper
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
                    {isEditing ? <Check size={14}/> : <Edit2 size={14}/>}
                </button>
            </div>
        </div>

        <div className="flex flex-col gap-8">
            
            {/* 1. AI Usage Stats (Full Width) */}
            <div>
                <TechCard title="各模块 AI 使用占比">
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
                                                        className="font-bold text-slate-800 text-base border-b border-slate-300 outline-none w-full"
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
                                                        className="text-2xl font-black italic text-slate-900 w-16 text-right border-b border-slate-300 outline-none"
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
                                    
                                    {/* Progress Bar */}
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

                                    {/* Description */}
                                    <div className="text-sm">
                                        {isEditing ? (
                                            <input 
                                                className="text-slate-500 w-full border-b border-slate-300 outline-none mb-2"
                                                value={safeStr(item.description)}
                                                onChange={(e) => handleUpdate(idx, 'description', e.target.value)}
                                            />
                                        ) : (
                                            <p className="text-slate-500 min-h-[40px]">{safeStr(item.description)}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Breakdown */}
                                <div className="mt-3">
                                    {isEditing ? (
                                         <input 
                                            className="text-slate-600 text-xs font-mono w-full border border-slate-200 rounded p-1"
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

            {/* 2. Capability Model (Radar Charts & Insights) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Radar Charts Comparison */}
                <TechCard title="能力素质模型演变" className="h-full flex flex-col">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                            {/* Chart 1: Before AI */}
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

                        {/* Arrow Indicator (Desktop) */}
                        <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-brand-orange bg-white rounded-full p-1 shadow-sm border border-brand-orange/20">
                            <ArrowIcon size={24} />
                        </div>

                            {/* Chart 2: AI Era */}
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

                {/* Right: New Era Model Insights */}
                <div className="bg-slate-900 text-white p-6 clip-tech-inv h-full flex flex-col justify-center relative overflow-hidden">
                    {/* Background Decoration */}
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
        </div>

        {/* Practical Application Banner */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
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
  );
};
