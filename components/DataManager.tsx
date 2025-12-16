
import React, { useRef, useState, useEffect } from 'react';
import { Save, Upload, CheckCircle2, RefreshCw, AlertCircle, Code, Copy, X } from 'lucide-react';
import { get, set } from 'idb-keyval';

const STORAGE_KEYS = [
    'hero_content',
    'portfolio_projects_v2', 
    'talent_pipeline_v2', 
    'talent_coreFunctions_v3', 
    'talent_allocation_v4',
    'talent_tools_v1', 
    'ai_stats_v3', 
    'ai_skillBefore',
    'ai_skillAfter',
    'ai_apps_v2', 
    'ai_features_v2', 
    'future_goals_v2', 
    'future_content_v2'
];

export const DataManager: React.FC = () => {
    const fileRef = useRef<HTMLInputElement>(null);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('saved');
    const [showCode, setShowCode] = useState(false);
    const [generatedCode, setGeneratedCode] = useState('');

    useEffect(() => {
        const handleUpdate = () => {
            setSaveStatus('saving');
            const timer = setTimeout(() => setSaveStatus('saved'), 800);
            return () => clearTimeout(timer);
        };

        const handleError = () => {
            setSaveStatus('error');
        };

        window.addEventListener('local-storage-update', handleUpdate);
        window.addEventListener('local-storage-error', handleError);
        
        return () => {
            window.removeEventListener('local-storage-update', handleUpdate);
            window.removeEventListener('local-storage-error', handleError);
        };
    }, []);

    const backup = async () => {
        const data: Record<string, any> = {};
        await Promise.all(STORAGE_KEYS.map(async (key) => {
            try {
                const val = await get(key);
                if (val !== undefined) data[key] = val;
            } catch (e) { console.error(`Backup failed for ${key}`, e); }
        }));
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `GameArt_FullBackup_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const restore = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (ev) => {
            try {
                const data = JSON.parse(ev.target?.result as string);
                const restorePromises = Object.entries(data).map(([key, val]) => {
                    if (STORAGE_KEYS.includes(key)) return set(key, val);
                    return Promise.resolve();
                });
                await Promise.all(restorePromises);
                alert('数据已成功导入！页面将刷新以应用更改。');
                window.location.reload();
            } catch (err) {
                alert('恢复失败：文件格式错误或已损坏');
                console.error(err);
            }
        };
        reader.readAsText(file);
        if (fileRef.current) fileRef.current.value = '';
    };

    const generateStaticCode = async () => {
        const data: Record<string, any> = {};
        await Promise.all(STORAGE_KEYS.map(async (key) => {
            try {
                const val = await get(key);
                if (val !== undefined) data[key] = val;
            } catch (e) {}
        }));

        // Generate the TS content matching data/defaults.ts structure
        const code = `
import { Project } from '../types';

// COPY THIS CONTENT INTO data/defaults.ts TO MAKE YOUR CHANGES PERMANENT FOR EVERYONE

export const DEFAULT_HERO = ${JSON.stringify(data['hero_content'] || {}, null, 4)};

export const DEFAULT_PROJECTS: Project[] = ${JSON.stringify(data['portfolio_projects_v2'] || [], null, 4)};

export const DEFAULT_PIPELINE_STEPS = ${JSON.stringify(data['talent_pipeline_v2'] || [], null, 4)};

export const DEFAULT_CORE_FUNCTIONS = ${JSON.stringify(data['talent_coreFunctions_v3'] || [], null, 4)};

export const DEFAULT_ALLOCATION = ${JSON.stringify(data['talent_allocation_v4'] || {}, null, 4)};

export const DEFAULT_TOOLS = ${JSON.stringify(data['talent_tools_v1'] || [], null, 4)};

export const DEFAULT_MODULE_STATS = ${JSON.stringify(data['ai_stats_v3'] || [], null, 4)};

export const DEFAULT_SKILL_BEFORE = ${JSON.stringify(data['ai_skillBefore'] || [], null, 4)};

export const DEFAULT_SKILL_AFTER = ${JSON.stringify(data['ai_skillAfter'] || [], null, 4)};

export const DEFAULT_PRACTICAL_APPS = ${JSON.stringify(data['ai_apps_v2'] || [], null, 4)};

export const DEFAULT_FEATURES = ${JSON.stringify(data['ai_features_v2'] || [], null, 4)};

export const DEFAULT_GOALS = ${JSON.stringify(data['future_goals_v2'] || [], null, 4)};

export const DEFAULT_FUTURE_CONTENT = ${JSON.stringify(data['future_content_v2'] || {}, null, 4)};
        `.trim();

        setGeneratedCode(code);
        setShowCode(true);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedCode);
        alert("代码已复制！请覆盖 data/defaults.ts 的内容。");
    };

    return (
        <>
            <div className="flex items-center gap-2 mr-2 border-r border-slate-700 pr-4">
                 <div className={`flex items-center gap-1.5 text-[10px] font-mono uppercase mr-3 transition-colors px-2 py-1 rounded border 
                    ${saveStatus === 'error' ? 'bg-red-900/50 border-red-500/50 text-red-400' : 'bg-slate-800/50 border-slate-700/50 text-slate-500'}
                 `} title="自动保存状态">
                    {saveStatus === 'saved' ? (
                        <>
                            <CheckCircle2 size={12} className="text-green-500" />
                            <span className="hidden md:inline text-slate-400">已自动保存</span>
                        </>
                    ) : saveStatus === 'error' ? (
                        <>
                            <AlertCircle size={12} className="text-red-500" />
                            <span className="hidden md:inline font-bold">保存失败</span>
                        </>
                    ) : (
                        <>
                            <RefreshCw size={12} className="text-brand-orange animate-spin" />
                            <span className="hidden md:inline text-brand-orange font-bold">保存中...</span>
                        </>
                    )}
                </div>

                <button onClick={backup} className="flex items-center gap-1 text-[10px] font-bold uppercase bg-brand-orange text-white hover:bg-orange-600 px-3 py-2 rounded transition-colors shadow-lg shadow-brand-orange/20 hover:scale-105 transform duration-200" title="下载全站数据备份 (JSON)">
                    <Save size={14} /> 保存数据
                </button>
                
                <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1 text-[10px] font-bold uppercase bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 px-3 py-2 rounded transition-colors" title="导入 .json 数据备份">
                    <Upload size={14} /> 导入
                    <input type="file" ref={fileRef} className="hidden" accept=".json" onChange={restore} />
                </button>
                
                 <button onClick={generateStaticCode} className="flex items-center gap-1 text-[10px] font-bold uppercase bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 px-3 py-2 rounded transition-colors" title="导出为开发代码 (defaults.ts)">
                    <Code size={14} /> 导出代码
                </button>
            </div>

            {/* Code Export Modal */}
            {showCode && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-brand-orange w-full max-w-4xl h-[80vh] flex flex-col rounded-lg shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900 rounded-t-lg">
                            <div>
                                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                                    <Code className="text-brand-orange" /> 导出静态配置代码
                                </h3>
                                <p className="text-slate-400 text-xs mt-1">
                                    此功能用于开发人员。复制下方代码覆盖 <code>data/defaults.ts</code> 可将当前数据固化为默认数据。
                                </p>
                            </div>
                            <button onClick={() => setShowCode(false)} className="text-slate-500 hover:text-white p-2">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-auto p-4 bg-slate-950 font-mono text-xs text-slate-300">
                            <pre className="whitespace-pre-wrap break-all">{generatedCode}</pre>
                        </div>
                        <div className="p-4 border-t border-slate-800 bg-slate-900 rounded-b-lg flex justify-end">
                            <button onClick={copyToClipboard} className="bg-brand-orange text-white px-6 py-3 rounded font-bold uppercase hover:bg-white hover:text-brand-orange transition-colors flex items-center gap-2">
                                <Copy size={16} /> 复制代码
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
