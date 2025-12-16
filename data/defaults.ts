
import { Project } from '../types';

// --- HERO SECTION ---
export const DEFAULT_HERO = {
    tag: '内部绝密 // Internal Confidential',
    line1: '年终',
    line2: '总结汇报',
    subtitle: '摩西科技美术中心 // 2025',
    titleSize: 'text-6xl md:text-8xl'
};

// --- PORTFOLIO SECTION ---
export const DEFAULT_PROJECTS: Project[] = [
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

// --- TALENT SECTION ---
export const DEFAULT_PIPELINE_STEPS = [
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

export const DEFAULT_CORE_FUNCTIONS = [
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

export const DEFAULT_ALLOCATION = {
    title: "树挪死，人挪活",
    subtitle: "RESOURCE OPTIMIZATION",
    desc: "打破项目壁垒，建立人才活水机制。我们深入分析每位美术师的个人能力模型与审美倾向，将其与项目的美术风格、团队风格，进行精准双向匹配，确保每一位成员都能在最适合的战场发挥最大价值。",
    imageUrl: "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?auto=format&fit=crop&q=80&w=2517",
};

export const DEFAULT_TOOLS = [
    {
        title: "资源命名检查工具",
        desc: "一键扫描项目工程，自动识别不符合命名规范的资产，支持批量重命名，减少人工Check时间约 40%。",
        imageUrl: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&q=80&w=1000"
    },
    {
        title: "自动LOD生成器",
        desc: "基于Houdini流程，根据预设面数阈值自动生成多级LOD模型，极大提升优化效率，解放美术人力。",
        imageUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=1000"
    }
];

// --- AI SECTION ---
export const DEFAULT_MODULE_STATS = [
  { 
    name: '原画设计', 
    en: 'CONCEPT ART',
    icon: "Paintbrush",
    percentage: 80,
    color: 'bg-brand-orange',
    description: 'AI 辅助生成底图、材质与光影细节。',
    breakdown: 'AI生成 80% / 手绘修饰 20%'
  },
  { 
    name: 'UI 界面设计', 
    en: 'USER INTERFACE',
    icon: "Layers",
    percentage: 70,
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

export const DEFAULT_SKILL_BEFORE = [
  { subject: '审美', value: 110, fullMark: 150 },
  { subject: '创意', value: 110, fullMark: 150 },
  { subject: '工具', value: 110, fullMark: 150 },
  { subject: '技法', value: 110, fullMark: 150 },
  { subject: '沟通', value: 110, fullMark: 150 },
  { subject: '洞察', value: 110, fullMark: 150 },
];

export const DEFAULT_SKILL_AFTER = [
  { subject: '审美', value: 150, fullMark: 150 },
  { subject: '创意', value: 110, fullMark: 150 },
  { subject: '工具', value: 150, fullMark: 150 },
  { subject: '技法', value: 60, fullMark: 150 }, 
  { subject: '沟通', value: 110, fullMark: 150 }, 
  { subject: '洞察', value: 110, fullMark: 150 }, 
];

export const DEFAULT_PRACTICAL_APPS = [
    'Midjourney 情绪板设计', 
    'Stable Diffusion 纹理生成', 
    'Nanobanana 图片编辑', 
    'Runway 动态分镜'
];

export const DEFAULT_FEATURES = [
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
    desc: '将 AI 产出无缝集成到引擎中，打通资产落地的“最后一公里”。'
  }
];

// --- FUTURE SECTION ---
export const DEFAULT_GOALS = [
    "尝试AI视频, AI漫画制作",
    "尝试3D模型资产AI流程化",
    "发扬美术内部分享"
];

export const DEFAULT_FUTURE_CONTENT = {
    title: '未来展望',
    subtitle: '下一关卡 // 路线图 (ROADMAP)',
    visionTitle: '2026 愿景',
    visionDesc: '标准化程序化工作流程，并将生成式 AI 全面整合到资产管线中。',
    ultimateTitle: '终极目标',
    ultimateDesc: '健康生活，快乐工作！！！',
    quote: '成为艺术与技术融合的行业标杆，以极致的效率交付具有丰富叙事体验的精品。'
};