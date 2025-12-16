
import React, { useState } from 'react';
import { TechCard } from './ui/TechCard';
import { Rocket, Flag, Globe, Wand2, Edit2, Check, Plus, X } from 'lucide-react';
import { suggestIdeas } from '../services/geminiService';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { DEFAULT_GOALS, DEFAULT_FUTURE_CONTENT } from '../data/defaults';

export const Future: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [goals, setGoals] = useLocalStorage('future_goals_v2', DEFAULT_GOALS);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useLocalStorage('future_content_v2', DEFAULT_FUTURE_CONTENT);

  const handleAISuggestion = async () => {
    setLoading(true);
    const ideas = await suggestIdeas("旨在提高效率和质量的3A游戏美术团队的未来目标");
    if (ideas && Array.isArray(ideas)) {
        const cleanIdeas = ideas.map(item => {
            if (typeof item === 'string') return item;
            if (typeof item === 'object' && item !== null) return JSON.stringify(item);
            return String(item);
        });
        setGoals(prev => [...prev, ...cleanIdeas]);
    }
    setLoading(false);
  };

  const updateGoal = (index: number, val: string) => {
      const newGoals = [...goals];
      newGoals[index] = val;
      setGoals(newGoals);
  };

  const removeGoal = (index: number) => {
      setGoals(goals.filter((_, i) => i !== index));
  };
  
  const addGoal = () => {
      setGoals([...goals, "新目标..."]);
  }

  const handleContentChange = (key: keyof typeof content, val: string) => {
      setContent(prev => ({...prev, [key]: val}));
  }

  const safeGoals = Array.isArray(goals) ? goals : DEFAULT_GOALS;
  const safeStr = (val: any) => typeof val === 'string' ? val : String(val || '');

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 mb-20">
         <div className="mb-10 flex flex-col items-center relative">
            {isEditing ? (
                <>
                    <input 
                        className="text-5xl font-black uppercase italic tracking-tighter text-slate-900 text-center border-b border-slate-300 outline-none bg-transparent"
                        value={safeStr(content.title)}
                        onChange={(e) => handleContentChange('title', e.target.value)}
                    />
                    <input 
                        className="text-slate-500 font-mono mt-2 text-center border-b border-slate-200 outline-none bg-transparent w-full max-w-md"
                        value={safeStr(content.subtitle)}
                        onChange={(e) => handleContentChange('subtitle', e.target.value)}
                    />
                </>
            ) : (
                <>
                    <h2 className="text-5xl font-black uppercase italic tracking-tighter text-slate-900">
                        <span className="text-brand-orange">04.</span> {safeStr(content.title)}
                    </h2>
                    <p className="text-slate-500 font-mono mt-2">{safeStr(content.subtitle)}</p>
                </>
            )}
            
            <button 
                onClick={() => setIsEditing(!isEditing)}
                className={`absolute right-0 top-0 flex items-center gap-2 px-3 py-2 rounded font-bold uppercase text-xs tracking-wider transition-colors ${
                    isEditing ? 'bg-brand-orange text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                }`}
            >
                {isEditing ? <Check size={14}/> : <Edit2 size={14}/>}
            </button>
        </div>

        <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-brand-orange to-slate-200 -translate-x-1/2 hidden md:block"></div>

            <div className="space-y-12">
                <div className="relative flex flex-col md:flex-row items-center justify-between gap-8 group">
                    <div className="w-full md:w-5/12 text-right">
                         {isEditing ? (
                             <div className="flex flex-col items-end gap-2">
                                 <input 
                                     className="text-3xl font-black text-slate-800 uppercase text-right border-b border-slate-300 outline-none bg-transparent w-full"
                                     value={safeStr(content.visionTitle)}
                                     onChange={(e) => handleContentChange('visionTitle', e.target.value)}
                                 />
                                 <textarea 
                                     className="text-slate-500 text-right w-full h-24 border rounded p-2 text-sm bg-slate-50"
                                     value={safeStr(content.visionDesc)}
                                     onChange={(e) => handleContentChange('visionDesc', e.target.value)}
                                 />
                             </div>
                         ) : (
                            <>
                                <h3 className="text-3xl font-black text-slate-800 uppercase">{safeStr(content.visionTitle)}</h3>
                                <p className="text-slate-500">{safeStr(content.visionDesc)}</p>
                            </>
                         )}
                    </div>
                    <div className="relative z-10 w-16 h-16 bg-slate-900 border-4 border-brand-orange rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,85,0,0.5)]">
                        <Rocket className="text-white" />
                    </div>
                    <div className="w-full md:w-5/12">
                         <TechCard className="bg-white">
                            <ul className="space-y-3">
                                {safeGoals.map((goal, i) => {
                                    const goalText = safeStr(typeof goal === 'object' ? JSON.stringify(goal).replace(/['"]+/g, '') : goal);
                                    
                                    return (
                                    <li key={i} className="flex items-start gap-2 text-slate-700 font-medium group/item">
                                        <span className="text-brand-orange mt-1">▹</span> 
                                        {isEditing ? (
                                            <div className="flex-1 flex gap-2">
                                                <input 
                                                    className="flex-1 border-b border-slate-300 outline-none bg-transparent text-sm"
                                                    value={goalText}
                                                    onChange={(e) => updateGoal(i, e.target.value)}
                                                />
                                                <button onClick={() => removeGoal(i)} className="text-red-400 hover:text-red-600"><X size={14} /></button>
                                            </div>
                                        ) : (
                                            <span>{goalText}</span>
                                        )}
                                    </li>
                                )})}
                            </ul>
                            {isEditing && (
                                <button onClick={addGoal} className="mt-2 text-xs font-bold text-slate-400 hover:text-brand-orange flex items-center gap-1">
                                    <Plus size={12}/> 添加条目
                                </button>
                            )}
                            <button 
                                onClick={handleAISuggestion}
                                disabled={loading}
                                className="mt-4 w-full border border-dashed border-brand-orange text-brand-orange py-2 text-sm uppercase font-bold hover:bg-brand-orange hover:text-white transition-colors flex items-center justify-center gap-2"
                            >
                                <Wand2 size={16} /> {loading ? 'AI 生成中...' : 'AI 建议目标'}
                            </button>
                         </TechCard>
                    </div>
                </div>

                <div className="relative flex flex-col md:flex-row-reverse items-center justify-between gap-8">
                     <div className="w-full md:w-5/12 text-left">
                        {isEditing ? (
                             <div className="flex flex-col gap-2">
                                 <input 
                                     className="text-3xl font-black text-slate-800 uppercase border-b border-slate-300 outline-none bg-transparent w-full"
                                     value={safeStr(content.ultimateTitle)}
                                     onChange={(e) => handleContentChange('ultimateTitle', e.target.value)}
                                 />
                                 <textarea 
                                     className="text-slate-500 w-full h-24 border rounded p-2 text-sm bg-slate-50"
                                     value={safeStr(content.ultimateDesc)}
                                     onChange={(e) => handleContentChange('ultimateDesc', e.target.value)}
                                 />
                             </div>
                         ) : (
                             <>
                                <h3 className="text-3xl font-black text-slate-800 uppercase">{safeStr(content.ultimateTitle)}</h3>
                                <p className="text-slate-500">{safeStr(content.ultimateDesc)}</p>
                            </>
                         )}
                    </div>
                    <div className="relative z-10 w-12 h-12 bg-white border-4 border-slate-300 rounded-full flex items-center justify-center">
                        <Flag className="text-slate-400" />
                    </div>
                    <div className="w-full md:w-5/12">
                        {isEditing ? (
                            <textarea
                                className="w-full bg-slate-100 p-6 border-l-4 border-slate-300 italic text-slate-600 outline-none focus:border-brand-orange"
                                value={safeStr(content.quote)}
                                onChange={(e) => handleContentChange('quote', e.target.value)}
                            />
                        ) : (
                            <div className="bg-slate-100 p-6 border-l-4 border-slate-300 italic text-slate-600">
                                "{safeStr(content.quote)}"
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};
