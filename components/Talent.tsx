
import React, { useState, DragEvent } from 'react';
import { TechCard } from './ui/TechCard';
import { Users, Zap, GraduationCap, ArrowRight, BookOpen, Lightbulb, Wrench, Briefcase, Edit2, Check, Wand2, RefreshCw, Upload, Layout, Plus, Trash2, Settings, AlertTriangle, CloudUpload, Loader2 } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { refineText } from '../services/geminiService';
import { DEFAULT_PIPELINE_STEPS, DEFAULT_CORE_FUNCTIONS, DEFAULT_ALLOCATION, DEFAULT_TOOLS } from '../data/defaults';

const ICON_MAP: Record<string, React.ElementType> = {
    Users, Zap, GraduationCap, Briefcase, BookOpen, Lightbulb, Wrench, RefreshCw, Layout
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
  const [tools, setTools] = useLocalStorage('talent_tools_v1', DEFAULT_TOOLS);
  
  // State for delete confirmation modal
  const [toolDeleteIndex, setToolDeleteIndex] = useState<number | null>(null);

  // Updated refining state to support multiple sections
  const [refiningState, setRefiningState] = useState<{section: string, index: number, field: string} | null>(null);

  // Drag and Drop State for Tools
  const [dragTargetTool, setDragTargetTool] = useState<number | null>(null);
  const [processingTool, setProcessingTool] = useState<number | null>(null);

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

  const handleToolUpdate = (index: number, field: string, value: string) => {
      const newTools = [...tools];
      newTools[index] = { ...newTools[index], [field]: value };
      setTools(newTools);
  };

  const handleToolImageUpload = async (e: React.ChangeEvent<HTMLInputElement> | FileList, index: number) => {
      let file: File | null = null;
      
      if (e instanceof FileList) {
          file = e[0];
      } else if (e.target.files) {
          file = e.target.files[0];
      }

      if (file) {
          setProcessingTool(index);
          const compressed = await compressImage(file);
          handleToolUpdate(index, 'imageUrl', compressed);
          setProcessingTool(null);
      }
  };

  const addTool = () => {
      setTools([...tools, { title: "新工具", desc: "请输入工具描述", imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1000" }]);
  };

  const confirmRemoveTool = (index: number) => {
      setToolDeleteIndex(index);
  };

  const executeRemoveTool = () => {
      if (toolDeleteIndex !== null) {
          setTools(tools.filter((_, i) => i !== toolDeleteIndex));
          setToolDeleteIndex(null);
      }
  };

  const handleRefine = async (section: 'pipeline' | 'tool', index: number, field: string, currentValue: string, context: string) => {
    if (!currentValue) return;
    setRefiningState({ section, index, field });
    const refined = await refineText(currentValue, context);
    
    if (section === 'pipeline') {
        handlePipelineUpdate(index, field, refined);
    } else if (section === 'tool') {
        handleToolUpdate(index, field, refined);
    }
    
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
      e.preventDefault();
      e.stopPropagation();
      setDragTargetTool(null);
  };

  const onToolDrop = (e: DragEvent, index: number) => {
      e.preventDefault();
      e.stopPropagation();
      setDragTargetTool(null);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          handleToolImageUpload(e.dataTransfer.files, index);
      }
  };

  const safePipelineSteps = Array.isArray(pipelineSteps) ? pipelineSteps : DEFAULT_PIPELINE_STEPS;
  const safeCoreFunctions = Array.isArray(coreFunctions) ? coreFunctions : DEFAULT_CORE_FUNCTIONS;
  const safeAllocation = allocation || DEFAULT_ALLOCATION;
  const safeTools = Array.isArray(tools) ? tools : DEFAULT_TOOLS;

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
                                        <button 
                                            onClick={() => handleRefine('pipeline', idx, 'stat', safeStr(step.stat), `人才招聘流程数据统计: ${step.title}`)}
                                            className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-orange p-1"
                                            disabled={isRefining('pipeline', idx, 'stat')}
                                            title="AI 润色"
                                        >
                                            <Wand2 size={12} className={isRefining('pipeline', idx, 'stat') ? 'animate-spin' : ''} />
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

        <div className="mb-12">
            <div className="flex items-center gap-4 mb-6">
                <div className="h-8 w-1 bg-brand-orange"></div>
                <h3 className="text-2xl font-bold text-slate-800 uppercase tracking-wide">
                    第二部分：核心成员能力与职能 <span className="text-slate-400 text-sm font-normal normal-case ml-2">// Core Functions & Capabilities</span>
                </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
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

            {/* INTEGRATED TOOLS SUB-SECTION */}
            <div className="bg-slate-100/50 rounded-xl p-6 md:p-8 border border-slate-200">
                <h4 className="text-xl font-bold text-slate-700 uppercase mb-6 flex items-center gap-3">
                    <Wrench className="text-brand-orange" size={24} />
                    自研效能工具展示 <span className="text-slate-400 text-xs font-normal normal-case">// Efficiency Tools Showcase</span>
                </h4>
                
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
                                                onClick={() => confirmRemoveTool(idx)} 
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

        {/* Delete Confirmation Modal for Tools */}
        {toolDeleteIndex !== null && (
            <div 
                className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={() => setToolDeleteIndex(null)}
            >
                <div 
                    className="bg-white w-full max-w-md p-6 rounded-xl shadow-2xl border-l-4 border-red-500 transform transition-all scale-100"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="flex items-start gap-4">
                        <div className="bg-red-50 p-3 rounded-full">
                            <AlertTriangle className="text-red-500" size={24} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-slate-900 mb-2">确认删除该工具卡片？</h3>
                            <p className="text-slate-600 text-sm leading-relaxed mb-6">
                                此操作将移除 "{safeTools[toolDeleteIndex]?.title}" 的所有内容。
                            </p>
                            <div className="flex justify-end gap-3">
                                <button 
                                    onClick={() => setToolDeleteIndex(null)}
                                    className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                                >
                                    取消
                                </button>
                                <button 
                                    onClick={executeRemoveTool}
                                    className="px-4 py-2 text-sm font-bold bg-red-500 text-white rounded hover:bg-red-600 shadow-lg shadow-red-500/30 transition-all flex items-center gap-2"
                                >
                                    <Trash2 size={14} /> 确认删除
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
