
import React, { useState, useEffect, DragEvent, useRef, useMemo } from 'react';
import { Project } from '../types';
import { TechCard } from './ui/TechCard';
import { Plus, Trash2, Edit2, Check, Wand2, Maximize2, X, Image as ImageIcon, ZoomIn, Upload, Type, ChevronLeft, ChevronRight, CloudUpload, Loader2, AlertTriangle, Play, Film, Video, VideoOff, Monitor, Maximize, Layers } from 'lucide-react';
import { refineText } from '../services/geminiService';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { DEFAULT_PROJECTS } from '../data/defaults';

// Image Compression Helper
const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 1600; 
                const MAX_HEIGHT = 1200;
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
                resolve(canvas.toDataURL('image/jpeg', 0.8));
            };
            img.onerror = () => {
                resolve(event.target?.result as string);
            }
        };
        reader.onerror = () => resolve('');
    });
};

// Video Processing Helper
const processVideoFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(file);
    });
};

type MediaAsset = {
    type: 'video' | 'image';
    url: string;
    label?: string;
};

export const Portfolio: React.FC = () => {
  const [projects, setProjects] = useLocalStorage<Project[]>('portfolio_projects_v2', DEFAULT_PROJECTS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isRefining, setIsRefining] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeAssetIndex, setActiveAssetIndex] = useState(0);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [isManageMode, setIsManageMode] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [theaterMode, setTheaterMode] = useState(false);
  
  // Drag and Drop State
  const [dragTarget, setDragTarget] = useState<{id: string, zone: 'cover' | 'gallery' | 'video_hero' | 'video_gallery'} | null>(null);
  const [processingState, setProcessingState] = useState<{id: string, zone: string} | null>(null);

  // Compile all project assets into a single array for the carousel
  const projectAssets = useMemo((): MediaAsset[] => {
    if (!selectedProject) return [];
    const assets: MediaAsset[] = [];
    
    if (selectedProject.videoUrl) assets.push({ type: 'video', url: selectedProject.videoUrl, label: 'Hero' });
    (selectedProject.videoGallery || []).forEach((v, i) => assets.push({ type: 'video', url: v, label: `Clip ${i + 1}` }));
    assets.push({ type: 'image', url: selectedProject.imageUrl, label: 'Cover' });
    (selectedProject.gallery || []).forEach((img, i) => assets.push({ type: 'image', url: img, label: `Asset ${i + 1}` }));
    
    return assets;
  }, [selectedProject]);

  const handleDelete = (e: React.MouseEvent | undefined, id: string) => {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    setDeleteConfirmId(id);
  };

  const executeDelete = () => {
    if (deleteConfirmId) {
        setProjects(prev => prev.filter(p => p.id !== deleteConfirmId));
        if (selectedProject?.id === deleteConfirmId) setSelectedProject(null);
        setDeleteConfirmId(null);
    }
  };

  const handleUpdate = (id: string, field: keyof Project, value: any) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleRefine = async (id: string) => {
    const project = projects.find(p => p.id === id);
    if (!project) return;
    
    setIsRefining(true);
    const newDesc = await refineText(project.description, "游戏美术项目介绍");
    handleUpdate(id, 'description', newDesc);
    setIsRefining(false);
  };

  const processFiles = (files: FileList, id: string, zone: 'cover' | 'gallery' | 'video_hero' | 'video_gallery') => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    setProcessingState({ id, zone });

    if (zone === 'cover') {
        const file = fileArray.find(f => f.type.startsWith('image/'));
        if (file) {
            compressImage(file).then(compressed => {
                handleUpdate(id, 'imageUrl', compressed);
                setProcessingState(null);
            });
        } else setProcessingState(null);
    } else if (zone === 'video_hero') {
        const file = fileArray.find(f => f.type.startsWith('video/'));
        if (file) {
            processVideoFile(file).then(data => {
                handleUpdate(id, 'videoUrl', data);
                setProcessingState(null);
            }).catch(() => setProcessingState(null));
        } else setProcessingState(null);
    } else if (zone === 'video_gallery') {
        const promises = fileArray.filter(f => f.type.startsWith('video/')).map(processVideoFile);
        Promise.all(promises).then(results => {
            setProjects(prev => prev.map(p => {
                if (p.id !== id) return p;
                return { ...p, videoGallery: [...(p.videoGallery || []), ...results] };
            }));
            setProcessingState(null);
        }).catch(() => setProcessingState(null));
    } else if (zone === 'gallery') {
        const promises = fileArray.filter(f => f.type.startsWith('image/')).map(compressImage);
        Promise.all(promises).then(results => {
            setProjects(prev => prev.map(p => {
                if (p.id !== id) return p;
                return { ...p, gallery: [...(p.gallery || []), ...results] };
            }));
            setProcessingState(null);
        });
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>, id: string, zone: 'cover' | 'gallery' | 'video_hero' | 'video_gallery') => {
    if (e.target.files && e.target.files.length > 0) {
        processFiles(e.target.files, id, zone);
    }
  };

  const onDragEnterOver = (e: DragEvent, id: string, zone: 'cover' | 'gallery' | 'video_hero' | 'video_gallery') => {
      e.preventDefault();
      e.stopPropagation();
      setDragTarget({ id, zone });
  };

  const onDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragTarget(null);
  };

  const onDrop = (e: DragEvent, id: string, zone: 'cover' | 'gallery' | 'video_hero' | 'video_gallery') => {
      e.preventDefault();
      e.stopPropagation();
      setDragTarget(null);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          processFiles(e.dataTransfer.files, id, zone);
      }
  };

  const addNew = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: '新项目标题',
      description: '在此输入项目描述...',
      descriptionSize: 'text-sm',
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1000',
      videoUrl: '',
      videoGallery: [],
      gallery: []
    };
    setProjects([newProject, ...projects]);
    setEditingId(newProject.id);
    setIsManageMode(true);
  };

  const openProject = (project: Project) => {
      setSelectedProject(project);
      setTheaterMode(false);
      setActiveAssetIndex(0);
  };

  const handleNextAsset = () => {
    if (projectAssets.length <= 1) return;
    setActiveAssetIndex((prev) => (prev + 1) % projectAssets.length);
  };

  const handlePrevAsset = () => {
    if (projectAssets.length <= 1) return;
    setActiveAssetIndex((prev) => (prev - 1 + projectAssets.length) % projectAssets.length);
  };

  const safeStr = (val: any) => typeof val === 'string' ? val : String(val || '');
  const safeProjects = Array.isArray(projects) ? projects : DEFAULT_PROJECTS;

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-8">
            <div>
                <h2 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900">
                    <span className="text-brand-orange">01.</span> 作品展示
                </h2>
                <p className="text-slate-500 font-mono mt-2">年度交付 // 绝密档案 (DELIVERABLES)</p>
            </div>
            <div className="flex items-center gap-3">
                {isManageMode && (
                    <button 
                        onClick={addNew}
                        className="bg-slate-900 text-white px-4 py-2 clip-tech hover:bg-brand-orange transition-colors flex items-center gap-2 font-bold uppercase text-xs tracking-wider shadow-lg"
                    >
                        <Plus size={14} /> 添加项目
                    </button>
                )}
                <button 
                    onClick={() => setIsManageMode(!isManageMode)}
                    className={`flex items-center gap-2 px-4 py-2 rounded font-bold uppercase text-xs tracking-wider transition-colors ${
                        isManageMode ? 'bg-brand-orange text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                >
                    {isManageMode ? <><Check size={14}/> 完成编辑</> : <><Edit2 size={14}/> 管理内容</>}
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {safeProjects.map((project) => {
                const descSizeClass = typeof project.descriptionSize === 'string' ? project.descriptionSize : 'text-sm';
                const videoCount = (project.videoUrl ? 1 : 0) + (project.videoGallery?.length || 0);

                return (
                <TechCard 
                    key={project.id} 
                    className={`h-full flex flex-col transition-all duration-300 group ${editingId === project.id ? 'ring-2 ring-brand-orange shadow-2xl scale-[1.01] z-10' : 'hover:scale-[1.02] hover:shadow-2xl hover:shadow-brand-orange/15'}`}
                >
                    <div className="relative group/image overflow-hidden mb-4 border-b-2 border-brand-orange/20 pb-4">
                        {isManageMode && !editingId && (
                            <button
                                onClick={(e) => handleDelete(e, project.id)}
                                className="absolute top-2 right-2 z-20 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg backdrop-blur-sm transition-transform hover:scale-110 flex items-center justify-center"
                            >
                                <Trash2 size={16} />
                            </button>
                        )}

                        {editingId === project.id ? (
                            <div 
                                className={`relative w-full h-48 bg-slate-50 flex flex-col items-center justify-center border-2 border-dashed rounded transition-all
                                    ${dragTarget?.id === project.id && dragTarget?.zone === 'cover' ? 'border-brand-orange bg-brand-orange/10' : 'border-slate-300 hover:border-brand-orange'}
                                `}
                                onDragEnter={(e) => onDragEnterOver(e, project.id, 'cover')}
                                onDragOver={(e) => onDragEnterOver(e, project.id, 'cover')}
                                onDragLeave={onDragLeave}
                                onDrop={(e) => onDrop(e, project.id, 'cover')}
                            >
                                <img src={project.imageUrl} className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none" alt="preview" />
                                <label className="cursor-pointer bg-slate-900/90 text-white px-4 py-2 text-xs font-bold rounded-full flex items-center justify-center gap-2 hover:bg-brand-orange transition-all shadow-xl hover:scale-105 z-10">
                                    <Upload size={14} /> 
                                    <span>更换封面</span>
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUpload(e, project.id, 'cover')} />
                                </label>
                            </div>
                        ) : (
                            <div className="relative cursor-pointer" onClick={() => openProject(project)}>
                                <img 
                                    src={project.imageUrl} 
                                    alt={project.name} 
                                    className="w-full h-48 object-cover transition-transform duration-500 group-hover/image:scale-105"
                                />
                                {videoCount > 0 && (
                                    <div className="absolute top-2 right-2 z-10">
                                        <div className="bg-brand-orange text-white text-[9px] font-black px-2 py-0.5 rounded flex items-center gap-1 shadow-lg animate-pulse">
                                            <Play size={10} fill="currentColor" /> {videoCount > 1 ? `${videoCount} VIDEOS` : 'VIDEO'}
                                        </div>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="bg-brand-orange/90 text-white px-3 py-1 text-sm font-bold uppercase flex items-center gap-2 clip-tech">
                                        <Maximize2 size={14} /> 查看详情
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 space-y-3">
                        {editingId === project.id ? (
                            <div className="space-y-4">
                                <div className="bg-slate-900 p-3 rounded border border-slate-700">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] font-black text-brand-orange uppercase tracking-widest flex items-center gap-1">
                                            <Film size={12} /> 主视频 (Hero Video)
                                        </span>
                                        {project.videoUrl && (
                                            <button onClick={() => handleUpdate(project.id, 'videoUrl', '')} className="text-red-400 hover:text-red-500"><X size={14} /></button>
                                        )}
                                    </div>
                                    <div 
                                        className={`h-20 border-2 border-dashed rounded flex flex-col items-center justify-center transition-all ${dragTarget?.id === project.id && dragTarget?.zone === 'video_hero' ? 'border-brand-orange bg-brand-orange/5' : 'border-slate-700 hover:border-slate-500'}`}
                                        onDragEnter={(e) => onDragEnterOver(e, project.id, 'video_hero')}
                                        onDragOver={(e) => onDragEnterOver(e, project.id, 'video_hero')}
                                        onDragLeave={onDragLeave}
                                        onDrop={(e) => onDrop(e, project.id, 'video_hero')}
                                    >
                                        <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer text-slate-500 hover:text-brand-orange">
                                            {project.videoUrl ? <Check size={20} className="text-green-500"/> : <CloudUpload size={24} />}
                                            <span className="text-[10px] font-bold mt-1">{project.videoUrl ? '已上传，点击更换' : '上传视频'}</span>
                                            {/* Fixed: Added missing 'e' argument to handleUpload call to resolve "Expected 3 arguments, but got 2" error */}
                                            <input type="file" className="hidden" accept="video/*" onChange={(e) => handleUpload(e, project.id, 'video_hero')} />
                                        </label>
                                    </div>
                                </div>

                                <div className="bg-slate-100 p-3 rounded border border-slate-200">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1 mb-2">
                                        <Video size={12} /> 更多视频资产 ({project.videoGallery?.length || 0})
                                    </span>
                                    <div className="grid grid-cols-4 gap-2">
                                        {project.videoGallery?.map((vid, idx) => (
                                            <div key={idx} className="relative aspect-square bg-slate-900 rounded overflow-hidden group/viditem">
                                                <video src={vid} className="w-full h-full object-cover opacity-50" muted />
                                                <Play size={16} className="absolute inset-0 m-auto text-white opacity-40" />
                                                <button 
                                                    onClick={() => {
                                                        const newGallery = project.videoGallery?.filter((_, i) => i !== idx);
                                                        handleUpdate(project.id, 'videoGallery', newGallery);
                                                    }}
                                                    className="absolute top-1 right-1 bg-red-500 text-white p-0.5 rounded-full opacity-0 group-hover/viditem:opacity-100"
                                                >
                                                    <X size={10} />
                                                </button>
                                            </div>
                                        ))}
                                        <div 
                                            className={`aspect-square border-2 border-dashed rounded flex items-center justify-center cursor-pointer transition-all ${dragTarget?.id === project.id && dragTarget?.zone === 'video_gallery' ? 'border-brand-orange bg-brand-orange/5' : 'border-slate-300 hover:border-brand-orange'}`}
                                            onDragEnter={(e) => onDragEnterOver(e, project.id, 'video_gallery')}
                                            onDragOver={(e) => onDragEnterOver(e, project.id, 'video_gallery')}
                                            onDragLeave={onDragLeave}
                                            onDrop={(e) => onDrop(e, project.id, 'video_gallery')}
                                        >
                                            <label className="w-full h-full flex items-center justify-center cursor-pointer text-slate-400">
                                                <Plus size={16} />
                                                <input type="file" className="hidden" accept="video/*" multiple onChange={(e) => handleUpload(e, project.id, 'video_gallery')} />
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <input 
                                        className="w-full bg-white border border-slate-300 p-2 font-bold uppercase text-sm focus:border-brand-orange outline-none rounded"
                                        value={safeStr(project.name)}
                                        onChange={(e) => handleUpdate(project.id, 'name', e.target.value)}
                                    />
                                    <textarea 
                                        className={`w-full bg-white border border-slate-300 p-2 min-h-[100px] ${descSizeClass} focus:border-brand-orange outline-none rounded resize-y`}
                                        value={safeStr(project.description)}
                                        onChange={(e) => handleUpdate(project.id, 'description', e.target.value)}
                                    />
                                </div>

                                <div className="flex justify-between pt-2 border-t border-slate-100">
                                    <button onClick={(e) => handleDelete(e, project.id)} className="text-red-400 hover:text-red-600 text-xs flex items-center gap-1"><Trash2 size={14} /> 删除</button>
                                    <button onClick={() => setEditingId(null)} className="bg-green-600 text-white px-4 py-1.5 rounded font-bold uppercase text-xs hover:bg-green-700 flex items-center gap-1 shadow-md">
                                        <Check size={14} /> 保存并关闭
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col h-full">
                                <h3 className="text-2xl font-bold uppercase text-slate-800 hover:text-brand-orange cursor-pointer transition-colors" onClick={() => openProject(project)}>{safeStr(project.name)}</h3>
                                <p className={`text-slate-600 mt-2 leading-relaxed line-clamp-3 ${descSizeClass}`}>{safeStr(project.description)}</p>
                                
                                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                                     <div className="flex gap-1.5">
                                        {project.videoUrl && <Film size={14} className="text-brand-orange" />}
                                        {project.videoGallery && project.videoGallery.length > 0 && <Video size={14} className="text-slate-400" />}
                                        {project.gallery && project.gallery.length > 0 && <ImageIcon size={14} className="text-slate-400" />}
                                     </div>
                                     <button onClick={() => setEditingId(project.id)} className="text-slate-400 hover:text-brand-orange transition-colors">
                                        <Edit2 size={14} />
                                     </button>
                                </div>
                            </div>
                        )}
                    </div>
                </TechCard>
            )})}
        </div>
        
        {/* Detail Modal */}
        {selectedProject && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-slate-900/98 backdrop-blur-xl animate-in fade-in duration-200" onClick={() => setSelectedProject(null)}>
                <div className="relative w-full max-w-7xl h-full md:h-[92vh] bg-slate-950 border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden transition-all duration-500" onClick={e => e.stopPropagation()}>
                    
                    {/* Top Bar Navigation */}
                    <div className="flex items-center justify-between p-4 md:px-8 border-b border-white/5 bg-black/40 backdrop-blur-sm z-50">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-brand-orange/10 rounded border border-brand-orange/30">
                                <Monitor size={20} className="text-brand-orange" />
                            </div>
                            <div>
                                <h3 className="text-xl md:text-2xl font-black italic uppercase text-white tracking-tighter leading-none">{safeStr(selectedProject.name)}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-brand-orange font-mono text-[10px] uppercase tracking-widest">Live Preview Node</span>
                                    <div className="w-1.5 h-1.5 bg-brand-orange rounded-full animate-ping"></div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                             <button 
                                onClick={() => setTheaterMode(!theaterMode)} 
                                className={`hidden md:flex p-2 rounded-full transition-all ${theaterMode ? 'bg-brand-orange text-white' : 'text-slate-500 hover:text-white hover:bg-white/10'}`}
                                title="切换影院模式"
                            >
                                <Maximize size={24} />
                            </button>
                            <button onClick={() => setSelectedProject(null)} className="text-slate-500 hover:text-brand-orange transition-all p-2 hover:bg-white/5 rounded-full">
                                <X size={32} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
                        {/* Unified Asset Player Area */}
                        <div className={`flex-1 bg-black relative flex flex-col items-center justify-center transition-all duration-500 overflow-hidden ${theaterMode ? 'z-40' : ''}`}>
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-black to-black opacity-60"></div>
                            
                            {/* The Asset Container */}
                            <div className="relative w-full h-full flex items-center justify-center p-2 md:p-6 group/player">
                                {projectAssets[activeAssetIndex]?.type === 'video' ? (
                                    <div className="relative w-full h-full flex items-center justify-center">
                                        <video 
                                            key={projectAssets[activeAssetIndex].url} 
                                            src={projectAssets[activeAssetIndex].url} 
                                            className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,1)] rounded-sm" 
                                            controls 
                                            autoPlay 
                                            loop 
                                        />
                                    </div>
                                ) : (
                                    <div className="relative w-full h-full flex items-center justify-center">
                                        <img 
                                            key={projectAssets[activeAssetIndex].url}
                                            src={projectAssets[activeAssetIndex].url} 
                                            className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,1)] rounded-sm" 
                                        />
                                    </div>
                                )}

                                {/* Navigation Arrows */}
                                {projectAssets.length > 1 && (
                                    <>
                                        <button 
                                            onClick={handlePrevAsset}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 p-4 bg-black/40 hover:bg-brand-orange/80 text-white rounded-full transition-all opacity-0 group-hover/player:opacity-100 z-50 border border-white/10"
                                        >
                                            <ChevronLeft size={32} />
                                        </button>
                                        <button 
                                            onClick={handleNextAsset}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-black/40 hover:bg-brand-orange/80 text-white rounded-full transition-all opacity-0 group-hover/player:opacity-100 z-50 border border-white/10"
                                        >
                                            <ChevronRight size={32} />
                                        </button>
                                    </>
                                )}

                                {/* HUD Overlay Decoration */}
                                <div className="absolute top-4 left-4 pointer-events-none hidden md:block">
                                    <div className="text-[10px] font-mono text-brand-orange/50 uppercase tracking-tighter leading-tight bg-black/40 p-2 border-l border-brand-orange/40 backdrop-blur-sm">
                                        Node: {activeAssetIndex + 1} / {projectAssets.length}<br/>
                                        Type: {projectAssets[activeAssetIndex]?.type.toUpperCase()}<br/>
                                        Buffer: 100%
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Assets */}
                        <div className={`w-full lg:w-[380px] border-l border-white/5 bg-slate-900/40 backdrop-blur-xl flex flex-col overflow-y-auto transition-transform duration-500 ${theaterMode ? 'translate-x-full lg:translate-x-0' : ''}`}>
                            <div className="p-6 space-y-8">
                                {/* All Assets Combined Sidebar */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        {/* Fixed: Added missing 'Layers' icon component which was not imported */}
                                        <span className="text-xs font-black text-brand-orange uppercase tracking-[0.2em] flex items-center gap-2">
                                            <Layers size={14} /> 项目资产图谱
                                        </span>
                                        <span className="text-[10px] font-mono text-slate-500">{projectAssets.length} 节点</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        {projectAssets.map((asset, i) => (
                                            <button 
                                                key={i}
                                                onClick={() => setActiveAssetIndex(i)}
                                                className={`group relative aspect-video rounded-sm overflow-hidden border-2 transition-all duration-300 shadow-xl ${activeAssetIndex === i ? 'border-brand-orange ring-4 ring-brand-orange/10' : 'border-white/5 hover:border-white/20'}`}
                                            >
                                                {asset.type === 'video' ? (
                                                    <div className="w-full h-full relative">
                                                        <video src={asset.url} className={`w-full h-full object-cover transition-opacity duration-500 ${activeAssetIndex === i ? 'opacity-100' : 'opacity-40 group-hover:opacity-70'}`} muted />
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                                            <Play size={20} className={`text-white transition-transform ${activeAssetIndex === i ? 'scale-110' : 'group-hover:scale-125'}`} fill={activeAssetIndex === i ? "currentColor" : "none"} />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="w-full h-full relative">
                                                        <img src={asset.url} className={`w-full h-full object-cover transition-opacity duration-500 ${activeAssetIndex === i ? 'opacity-100' : 'opacity-40 group-hover:opacity-70'}`} />
                                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                                                            <ImageIcon size={20} className="text-white" />
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="absolute top-0 left-0 bg-black/60 text-[7px] font-black px-1 py-0.5 uppercase tracking-tighter text-white/70">{asset.label}</div>
                                                {activeAssetIndex === i && (
                                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-orange"></div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Fullscreen Overlay */}
        {fullscreenImage && (
            <div className="fixed inset-0 z-[200] bg-black/98 flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setFullscreenImage(null)}>
                <button className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors p-4 hover:bg-white/5 rounded-full"><X size={48} /></button>
                <div className="relative w-full h-full flex items-center justify-center p-4">
                    <img 
                        src={fullscreenImage} 
                        className="max-w-full max-h-full object-contain shadow-[0_0_100px_rgba(255,85,0,0.15)] select-none" 
                        onClick={e => e.stopPropagation()} 
                    />
                </div>
            </div>
        )}

        {/* Delete Confirm */}
        {deleteConfirmId && (
            <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setDeleteConfirmId(null)}>
                <div className="bg-slate-900 w-full max-w-md p-8 rounded border border-white/10 shadow-2xl overflow-hidden relative" onClick={e => e.stopPropagation()}>
                    <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
                    <div className="flex items-center gap-3 mb-4">
                        <AlertTriangle className="text-red-500" size={24} />
                        <h3 className="text-xl font-bold text-white uppercase italic tracking-tighter">删除核心资产？</h3>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed mb-8">
                        此操作将永久移除该项目的所有美术资产，包括所有上传的视频片段和高保真图集。此过程不可逆。
                    </p>
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setDeleteConfirmId(null)} className="px-5 py-2 text-xs font-bold text-slate-400 hover:text-white uppercase transition-colors tracking-widest">
                            保持激活
                        </button>
                        <button onClick={executeDelete} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-red-900/20">
                            <Trash2 size={14} /> 确认销毁
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
