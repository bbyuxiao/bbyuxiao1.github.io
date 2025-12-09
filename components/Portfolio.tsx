
import React, { useState, useEffect, DragEvent } from 'react';
import { Project } from '../types';
import { TechCard } from './ui/TechCard';
import { Plus, Trash2, Edit2, Check, Wand2, Maximize2, X, Image as ImageIcon, ZoomIn, Upload, Type, ChevronLeft, ChevronRight, CloudUpload, Loader2, RefreshCw } from 'lucide-react';
import { refineText } from '../services/geminiService';
import { useLocalStorage } from '../hooks/useLocalStorage';

const INITIAL_PROJECTS: Project[] = [
  {
    id: 'zhen-infirmary',
    name: '阿珍医务室 (ZHEN\'S INFIRMARY)',
    description: '这是一个充满生活气息与叙事细节的独立场景设计。灵感来源于九龙城寨与赛博朋克的结合。重点打磨了医疗器械的做旧材质与环境光遮蔽（AO）效果，通过散落的药瓶、贴纸和暖色台灯营造出有人居住的温情与外界冷酷科技的对比。采用了 UE5 Lumen 进行实时光照渲染。',
    descriptionSize: 'text-sm',
    imageUrl: 'https://images.unsplash.com/photo-1519638831568-d9897f54ed69?auto=format&fit=crop&q=80&w=1000',
    gallery: [
        'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1592188663002-239611649988?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1615870216519-2f9fa575fa5c?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1515462277126-2dd0c162007a?auto=format&fit=crop&q=80&w=800'
    ]
  }
];

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
                const MAX_WIDTH = 1600; // Increased quality slightly
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
                // Quality 0.8 for better visual fidelity
                resolve(canvas.toDataURL('image/jpeg', 0.8));
            };
            img.onerror = () => {
                resolve(event.target?.result as string);
            }
        };
        reader.onerror = () => resolve('');
    });
};

export const Portfolio: React.FC = () => {
  const [projects, setProjects] = useLocalStorage<Project[]>('portfolio_projects_v2', INITIAL_PROJECTS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isRefining, setIsRefining] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  
  // Drag and Drop State
  const [dragTarget, setDragTarget] = useState<{id: string, zone: 'cover' | 'gallery'} | null>(null);
  const [processingState, setProcessingState] = useState<{id: string, zone: 'cover' | 'gallery'} | null>(null);

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个项目吗？此操作无法撤销。')) {
        setProjects(projects.filter(p => p.id !== id));
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

  const processFiles = (files: FileList, id: string, isGallery: boolean) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    const zone = isGallery ? 'gallery' : 'cover';
    setProcessingState({ id, zone });

    setTimeout(() => {
        if (!isGallery) {
            const file = fileArray.find(f => f.type.startsWith('image/'));
            if (file) {
                compressImage(file).then(compressed => {
                    handleUpdate(id, 'imageUrl', compressed);
                    setProcessingState(null);
                });
            } else {
                setProcessingState(null);
            }
        } else {
            const promises = fileArray.map(file => {
                if (!file.type.startsWith('image/')) return Promise.resolve('');
                return compressImage(file);
            });

            Promise.all(promises).then(results => {
                const validResults = results.filter(r => r !== '');
                if (validResults.length > 0) {
                    setProjects(prev => prev.map(p => {
                        if (p.id !== id) return p;
                        return { ...p, gallery: [...(p.gallery || []), ...validResults] };
                    }));
                }
                setProcessingState(null);
            });
        }
    }, 100); 
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, id: string, isGallery: boolean = false) => {
    if (e.target.files && e.target.files.length > 0) {
        processFiles(e.target.files, id, isGallery);
    }
  };

  // --- Drag and Drop Handlers ---
  const onDragEnterOver = (e: DragEvent, id: string, zone: 'cover' | 'gallery') => {
      e.preventDefault();
      e.stopPropagation();
      if (dragTarget?.id !== id || dragTarget?.zone !== zone) {
          setDragTarget({ id, zone });
      }
  };

  const onDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.currentTarget.contains(e.relatedTarget as Node)) return;
      setDragTarget(null);
  };

  const onDrop = (e: DragEvent, id: string, zone: 'cover' | 'gallery') => {
      e.preventDefault();
      e.stopPropagation();
      setDragTarget(null);
      
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          processFiles(e.dataTransfer.files, id, zone === 'gallery');
      }
  };

  const addNew = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: '新项目标题',
      description: '在此输入项目描述...',
      descriptionSize: 'text-sm',
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1000',
      gallery: []
    };
    // Add new project to the START of the list
    setProjects([newProject, ...projects]);
    setEditingId(newProject.id);
  };

  // --- Image Navigation Logic ---
  const handleNextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!selectedProject || !fullscreenImage) return;
    
    const allImages = [selectedProject.imageUrl, ...(selectedProject.gallery || [])];
    if (allImages.length <= 1) return;

    const currentIndex = allImages.indexOf(fullscreenImage);
    const nextIndex = (currentIndex + 1) % allImages.length;
    setFullscreenImage(allImages[nextIndex]);
  };

  const handlePrevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!selectedProject || !fullscreenImage) return;

    const allImages = [selectedProject.imageUrl, ...(selectedProject.gallery || [])];
    if (allImages.length <= 1) return;

    const currentIndex = allImages.indexOf(fullscreenImage);
    if (currentIndex === -1) {
        setFullscreenImage(allImages[0]);
        return;
    }
    const prevIndex = (currentIndex - 1 + allImages.length) % allImages.length;
    setFullscreenImage(allImages[prevIndex]);
  };

  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if (!fullscreenImage) return;
          if (e.key === 'ArrowRight') handleNextImage();
          if (e.key === 'ArrowLeft') handlePrevImage();
          if (e.key === 'Escape') setFullscreenImage(null);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fullscreenImage, selectedProject]);

  const safeStr = (val: any) => typeof val === 'string' ? val : String(val || '');
  const safeProjects = Array.isArray(projects) ? projects : INITIAL_PROJECTS;

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-8">
            <div>
                <h2 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900">
                    <span className="text-brand-orange">01.</span> 作品展示
                </h2>
                <p className="text-slate-500 font-mono mt-2">年度交付 // 绝密档案 (DELIVERABLES)</p>
            </div>
            <button 
                onClick={addNew}
                className="bg-slate-900 text-white px-6 py-2 clip-tech hover:bg-brand-orange transition-colors flex items-center gap-2 font-bold uppercase tracking-wider shadow-lg"
            >
                <Plus size={18} /> 添加项目
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {safeProjects.map((project) => {
                const descSizeClass = typeof project.descriptionSize === 'string' ? project.descriptionSize : 'text-sm';
                const isProcessingCover = processingState?.id === project.id && processingState?.zone === 'cover';
                const isDragOverCover = dragTarget?.id === project.id && dragTarget?.zone === 'cover';
                
                const isProcessingGallery = processingState?.id === project.id && processingState?.zone === 'gallery';
                const isDragOverGallery = dragTarget?.id === project.id && dragTarget?.zone === 'gallery';

                return (
                <TechCard 
                    key={project.id} 
                    className={`h-full flex flex-col transition-all duration-300 ${editingId === project.id ? 'ring-2 ring-brand-orange shadow-2xl scale-[1.01] z-10' : 'hover:scale-[1.02] hover:shadow-2xl hover:shadow-brand-orange/15'}`}
                >
                    {/* Image Area */}
                    <div className="relative group/image overflow-hidden mb-4 border-b-2 border-brand-orange/20 pb-4">
                        {editingId === project.id ? (
                            <div 
                                className={`relative w-full h-48 bg-slate-50 flex flex-col items-center justify-center border-2 border-dashed transition-all duration-300 rounded
                                    ${isDragOverCover ? 'border-brand-orange bg-brand-orange/10' : 'border-slate-300 hover:border-brand-orange hover:bg-white'}
                                    ${isProcessingCover ? 'opacity-80 pointer-events-none' : ''}
                                `}
                                onDragEnter={(e) => onDragEnterOver(e, project.id, 'cover')}
                                onDragOver={(e) => onDragEnterOver(e, project.id, 'cover')}
                                onDragLeave={onDragLeave}
                                onDrop={(e) => onDrop(e, project.id, 'cover')}
                            >
                                <img src={project.imageUrl} className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none" alt="preview" />
                                
                                <div className="z-10 text-center p-2 relative pointer-events-none w-full h-full flex items-center justify-center">
                                    {isProcessingCover ? (
                                        <div className="flex flex-col items-center text-brand-orange bg-white/80 p-4 rounded-xl backdrop-blur-sm">
                                            <Loader2 size={32} className="animate-spin mb-2" />
                                            <span className="font-bold text-xs uppercase tracking-wider">处理中...</span>
                                        </div>
                                    ) : isDragOverCover ? (
                                        <div className="flex flex-col items-center text-brand-orange bg-white/90 p-4 rounded-xl backdrop-blur-sm animate-bounce">
                                            <CloudUpload size={32} className="mb-2" />
                                            <span className="font-bold text-xs uppercase tracking-wider">松开上传</span>
                                        </div>
                                    ) : (
                                        <div className="pointer-events-auto">
                                            <label className="cursor-pointer bg-slate-900/90 text-white px-4 py-2 text-xs font-bold rounded-full flex items-center justify-center gap-2 hover:bg-brand-orange transition-all shadow-xl hover:scale-105">
                                                <Upload size={14} /> 
                                                <span>更换封面</span>
                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, project.id)} />
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="relative cursor-pointer" onClick={() => setSelectedProject(project)}>
                                <img 
                                    src={project.imageUrl} 
                                    alt={project.name} 
                                    className="w-full h-48 object-cover transition-transform duration-500 group-hover/image:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="bg-brand-orange/90 text-white px-3 py-1 text-sm font-bold uppercase flex items-center gap-2 clip-tech">
                                        <Maximize2 size={14} /> 查看详情
                                    </span>
                                </div>
                                {project.gallery && project.gallery.length > 0 && (
                                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 flex items-center gap-1 rounded font-mono border border-white/20">
                                        <ImageIcon size={10} /> {project.gallery.length} ASSETS
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex-1 space-y-3">
                        {editingId === project.id ? (
                            <div className="space-y-3">
                                {/* Name Input */}
                                <div className="flex gap-2">
                                    <input 
                                        className="flex-1 bg-white border border-slate-300 p-2 font-bold uppercase text-sm focus:border-brand-orange outline-none rounded"
                                        value={safeStr(project.name)}
                                        placeholder="项目名称"
                                        onChange={(e) => handleUpdate(project.id, 'name', e.target.value)}
                                    />
                                </div>
                                
                                {/* Description Input */}
                                <div className="relative">
                                    <textarea 
                                        className={`w-full bg-white border border-slate-300 p-2 min-h-[120px] ${descSizeClass} focus:border-brand-orange outline-none rounded resize-y`}
                                        value={safeStr(project.description)}
                                        placeholder="项目描述..."
                                        onChange={(e) => handleUpdate(project.id, 'description', e.target.value)}
                                    />
                                     <button 
                                        onClick={() => handleRefine(project.id)}
                                        disabled={isRefining}
                                        className="absolute right-2 bottom-2 text-brand-orange text-xs flex items-center gap-1 hover:bg-brand-orange/10 px-2 py-1 rounded transition-colors"
                                        title="AI 润色文案"
                                    >
                                        <Wand2 size={12} className={isRefining ? "animate-spin" : ""} /> {isRefining ? 'AI...' : '润色'}
                                    </button>
                                </div>
                                
                                {/* Controls */}
                                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded">
                                        <Type size={14} className="text-slate-400 ml-1" />
                                        {(['text-xs', 'text-sm', 'text-base', 'text-lg'] as const).map(size => (
                                            <button
                                                key={size}
                                                onClick={() => handleUpdate(project.id, 'descriptionSize', size)}
                                                className={`w-6 h-6 flex items-center justify-center text-[10px] font-bold rounded transition-colors ${
                                                    descSizeClass === size ? 'bg-brand-orange text-white shadow-sm' : 'text-slate-500 hover:bg-slate-200'
                                                }`}
                                                title={`Size: ${size}`}
                                            >
                                                {size.replace('text-', '').substring(0, 1).toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                
                                {/* Gallery Grid Layout - REDESIGNED */}
                                <div className="pt-2 mt-2 border-t border-slate-100">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-xs font-bold text-slate-700 flex items-center gap-2">
                                            <ImageIcon size={14} className="text-brand-orange"/>
                                            图集 ({project.gallery?.length || 0})
                                        </label>
                                        {project.gallery && project.gallery.length > 0 && (
                                            <button 
                                                onClick={() => {
                                                    if(confirm('确定清空图集吗？')) handleUpdate(project.id, 'gallery', []);
                                                }}
                                                className="text-[10px] text-red-400 hover:text-red-600 underline"
                                            >
                                                清空
                                            </button>
                                        )}
                                    </div>
                                    
                                    <div className="grid grid-cols-4 gap-2">
                                        {/* Existing Images */}
                                        {project.gallery?.map((img, idx) => (
                                            <div key={idx} className="relative aspect-square bg-slate-100 rounded-lg overflow-hidden group/thumb border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                                <img src={img} className="w-full h-full object-cover" alt="thumb" />
                                                
                                                {/* Delete Button */}
                                                <button 
                                                    onClick={() => {
                                                        const newGallery = project.gallery?.filter((_, i) => i !== idx);
                                                        handleUpdate(project.id, 'gallery', newGallery);
                                                    }}
                                                    className="absolute top-1 right-1 bg-white/90 text-red-500 p-1 rounded-full shadow-sm hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover/thumb:opacity-100 z-10 transform scale-90 hover:scale-100"
                                                    title="删除这张图片"
                                                >
                                                    <X size={10} strokeWidth={3} />
                                                </button>
                                            </div>
                                        ))}

                                        {/* Upload Button Card */}
                                        <div 
                                            className={`relative aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-200 group/add
                                                ${isDragOverGallery ? 'border-brand-orange bg-brand-orange/10 scale-105' : 'border-slate-300 bg-slate-50 hover:border-brand-orange hover:bg-white'}
                                            `}
                                            onDragEnter={(e) => onDragEnterOver(e, project.id, 'gallery')}
                                            onDragOver={(e) => onDragEnterOver(e, project.id, 'gallery')}
                                            onDragLeave={onDragLeave}
                                            onDrop={(e) => onDrop(e, project.id, 'gallery')}
                                        >
                                            {isProcessingGallery ? (
                                                <Loader2 size={20} className="animate-spin text-brand-orange" />
                                            ) : (
                                                <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center gap-1 text-slate-400 group-hover/add:text-brand-orange transition-colors">
                                                    <Plus size={24} className="group-hover/add:scale-110 transition-transform" />
                                                    <span className="text-[10px] font-bold uppercase">添加</span>
                                                    <input type="file" className="hidden" accept="image/*" multiple onChange={(e) => handleImageUpload(e, project.id, true)} />
                                                </label>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 mt-4 border-t border-slate-200 flex justify-between items-center">
                                    <button 
                                        onClick={() => handleDelete(project.id)}
                                        className="text-red-400 hover:text-red-600 text-xs flex items-center gap-1 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                                    >
                                        <Trash2 size={14} /> 删除项目
                                    </button>
                                    <button 
                                        onClick={() => setEditingId(null)} 
                                        className="bg-green-600 text-white px-6 py-2 rounded font-bold uppercase hover:bg-green-700 flex items-center gap-2 shadow-lg hover:shadow-green-600/30 transition-all"
                                    >
                                        <Check size={16} /> 完成
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col h-full">
                                <div>
                                    <h3 className="text-2xl font-bold uppercase text-slate-800 hover:text-brand-orange cursor-pointer transition-colors" onClick={() => setSelectedProject(project)}>{safeStr(project.name)}</h3>
                                    <p className={`text-slate-600 mt-2 leading-relaxed line-clamp-3 ${descSizeClass}`}>{safeStr(project.description)}</p>
                                </div>
                                {/* Works Preview Strip */}
                                {project.gallery && project.gallery.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2">
                                        {project.gallery.slice(0, 3).map((img, i) => (
                                            <div key={i} className="aspect-video bg-slate-100 rounded overflow-hidden cursor-pointer hover:opacity-80 transition-opacity relative border border-slate-200" onClick={() => { setSelectedProject(project); setFullscreenImage(img); }}>
                                                <img src={img} alt="" className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                        {project.gallery.length > 3 && (
                                            <div 
                                                className="absolute bottom-20 right-8 bg-slate-900 text-white text-[10px] px-3 py-1.5 rounded-full shadow-lg cursor-pointer hover:bg-brand-orange transition-colors font-bold z-10"
                                                onClick={() => setSelectedProject(project)}
                                            >
                                                +{project.gallery.length - 3} MORE
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {!editingId && (
                        <div className="mt-4 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button 
                                onClick={() => setEditingId(project.id)}
                                className="p-2 text-slate-400 hover:text-brand-orange hover:bg-slate-100 rounded-full transition-colors"
                                title="编辑内容"
                            >
                                <Edit2 size={18} />
                            </button>
                        </div>
                    )}
                </TechCard>
            )})}
        </div>

        {/* Project Details Modal */}
        {selectedProject && (
            <div 
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-slate-900/95 backdrop-blur-md animate-in fade-in duration-200"
                onClick={() => setSelectedProject(null)}
            >
                <div 
                    className="relative w-full max-w-6xl h-[90vh] bg-slate-900 border-2 border-brand-orange shadow-[0_0_100px_rgba(255,85,0,0.15)] flex flex-col clip-tech-inv"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Modal Header */}
                    <div className="flex items-start justify-between p-6 border-b border-white/10 bg-black/20">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-3xl font-black italic uppercase text-white tracking-wide">{safeStr(selectedProject.name)}</h3>
                            </div>
                            {/* Safer descriptionSize check */}
                            <p className={`text-slate-400 font-mono max-w-2xl ${typeof selectedProject.descriptionSize === 'string' ? selectedProject.descriptionSize : 'text-sm'}`}>{safeStr(selectedProject.description)}</p>
                        </div>
                        <button 
                            onClick={() => setSelectedProject(null)}
                            className="text-slate-400 hover:text-brand-orange transition-colors p-2 hover:bg-white/5 rounded-full"
                        >
                            <X size={32} />
                        </button>
                    </div>

                    {/* Modal Content - Scrollable Grid */}
                    <div className="flex-1 overflow-y-auto p-6 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Main Featured Image */}
                            <div 
                                className="md:col-span-2 lg:col-span-2 row-span-2 relative group overflow-hidden border border-slate-700 bg-black cursor-zoom-in"
                                onClick={() => setFullscreenImage(selectedProject.imageUrl)}
                            >
                                <img 
                                    src={selectedProject.imageUrl} 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                                    alt="Main Visual" 
                                />
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <ZoomIn className="text-white/80 w-12 h-12" />
                                </div>
                                <div className="absolute top-4 left-4 bg-brand-orange text-white text-xs font-bold px-2 py-1">
                                    KEY VISUAL
                                </div>
                            </div>

                            {/* Gallery Grid in Modal */}
                            {selectedProject.gallery?.map((img, idx) => (
                                <div 
                                    key={idx} 
                                    className="relative aspect-video border border-slate-800 bg-slate-800 cursor-pointer overflow-hidden group/item"
                                    onClick={() => setFullscreenImage(img)}
                                >
                                    <img src={img} className="w-full h-full object-cover transition-all duration-500 group-hover/item:scale-110 group-hover/item:opacity-80" alt={`gallery-${idx}`} />
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2 transform translate-y-full group-hover/item:translate-y-0 transition-transform">
                                        <span className="text-[10px] text-brand-orange font-mono">ASSET_0{idx + 1}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Fullscreen Lightbox */}
        {fullscreenImage && selectedProject && (
            <div 
                className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center animate-in fade-in duration-300"
                onClick={() => setFullscreenImage(null)}
            >
                {/* Controls */}
                <button 
                    onClick={(e) => { e.stopPropagation(); setFullscreenImage(null); }}
                    className="absolute top-6 right-6 text-white/50 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors z-50"
                >
                    <X size={32} />
                </button>
                
                {/* Image Container */}
                <div className="relative w-full h-full flex items-center justify-center p-4 md:p-12">
                     <img 
                        src={fullscreenImage} 
                        alt="Fullscreen" 
                        className="max-w-full max-h-full object-contain shadow-2xl drop-shadow-[0_0_50px_rgba(255,85,0,0.2)]"
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking image
                    />
                    
                    {/* Navigation Buttons */}
                    <button 
                        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white/30 hover:text-brand-orange hover:bg-black/50 p-3 rounded-full transition-all"
                        onClick={handlePrevImage}
                    >
                        <ChevronLeft size={48} />
                    </button>
                    <button 
                        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white/30 hover:text-brand-orange hover:bg-black/50 p-3 rounded-full transition-all"
                        onClick={handleNextImage}
                    >
                        <ChevronRight size={48} />
                    </button>
                </div>

                {/* Caption / Counter */}
                <div className="absolute bottom-8 left-0 right-0 text-center pointer-events-none">
                     <div className="inline-block bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-white/80 font-mono text-xs">
                        {(() => {
                            const all = [selectedProject.imageUrl, ...(selectedProject.gallery || [])];
                            const idx = all.indexOf(fullscreenImage);
                            return `${idx + 1} / ${all.length}`;
                        })()}
                     </div>
                </div>
            </div>
        )}
    </div>
  );
};
