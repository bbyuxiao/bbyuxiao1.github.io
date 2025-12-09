
import React, { useRef, useState, useEffect } from 'react';
import { Save, Upload, CheckCircle2, RefreshCw, AlertCircle } from 'lucide-react';

const STORAGE_KEYS = [
    'portfolio_projects_v2', // Updated to v2
    'talent_pipeline_v2', 
    'talent_coreFunctions_v3', 
    'talent_allocation_v4', 
    'ai_stats_v3', 
    'ai_skillBefore',
    'ai_skillAfter',
    'ai_apps_v2', 
    'ai_features_v2', 
    'future_goals_v2', 
    'future_content_v2', 
    'hero_content'
];

export const DataManager: React.FC = () => {
    const fileRef = useRef<HTMLInputElement>(null);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('saved');

    // Listen for local updates to show "Saving..." state
    useEffect(() => {
        const handleUpdate = () => {
            setSaveStatus('saving');
            // Debounce the "Saved" state for better UX
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

    const backup = () => {
        const data: Record<string, any> = {};
        STORAGE_KEYS.forEach(key => {
            const val = localStorage.getItem(key);
            if (val) {
                try {
                    data[key] = JSON.parse(val);
                } catch (e) { console.error(e); }
            }
        });
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `GameArt_Backup_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const restore = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const data = JSON.parse(ev.target?.result as string);
                Object.entries(data).forEach(([key, val]) => {
                    if (STORAGE_KEYS.includes(key)) {
                        localStorage.setItem(key, JSON.stringify(val));
                    }
                });
                alert('数据已恢复，页面将刷新');
                window.location.reload();
            } catch (err) {
                alert('恢复失败：文件格式错误');
            }
        };
        reader.readAsText(file);
        // Reset input
        if (fileRef.current) fileRef.current.value = '';
    };

    return (
        <div className="flex items-center gap-2 mr-2 border-r border-slate-700 pr-4">
             {/* Autosave Status Indicator */}
             <div className={`flex items-center gap-1.5 text-[10px] font-mono uppercase mr-3 transition-colors px-2 py-1 rounded border 
                ${saveStatus === 'error' ? 'bg-red-900/50 border-red-500/50 text-red-400' : 'bg-slate-800/50 border-slate-700/50 text-slate-500'}
             `}>
                {saveStatus === 'saved' ? (
                    <>
                        <CheckCircle2 size={12} className="text-green-500" />
                        <span className="hidden md:inline text-slate-400">已同步 / Saved</span>
                    </>
                ) : saveStatus === 'error' ? (
                    <>
                        <AlertCircle size={12} className="text-red-500" />
                        <span className="hidden md:inline font-bold">空间已满 / Full</span>
                    </>
                ) : (
                    <>
                        <RefreshCw size={12} className="text-brand-orange animate-spin" />
                        <span className="hidden md:inline text-brand-orange font-bold">保存中...</span>
                    </>
                )}
            </div>

            <button onClick={backup} className="flex items-center gap-1 text-[10px] font-bold uppercase bg-slate-800 text-slate-400 hover:text-brand-orange hover:bg-slate-700 px-3 py-2 rounded transition-colors" title="下载数据备份">
                <Save size={14} /> 备份
            </button>
            <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1 text-[10px] font-bold uppercase bg-slate-800 text-slate-400 hover:text-green-500 hover:bg-slate-700 px-3 py-2 rounded transition-colors" title="导入数据备份">
                <Upload size={14} /> 恢复
                <input type="file" ref={fileRef} className="hidden" accept=".json" onChange={restore} />
            </button>
        </div>
    );
};
