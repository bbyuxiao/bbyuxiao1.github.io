
import { get } from 'idb-keyval';

// Helper to safely get data from IndexedDB (Async)
const getData = async (key: string, defaultVal: any) => {
    try {
        const item = await get(key);
        return item !== undefined ? item : defaultVal;
    } catch (e) {
        console.warn(`Failed to load ${key} for PPT generation`, e);
        return defaultVal;
    }
};

export const exportToPPT = async () => {
    // 1. Load Library
    let PptxGenJS;
    try {
        const module = await import("pptxgenjs");
        PptxGenJS = module.default || module;
    } catch (e) {
        console.error("Failed to load pptxgenjs library", e);
        alert("导出功能暂时不可用 (Failed to load PPT library)");
        return;
    }

    // 2. Fetch ALL Data Async (Pre-fetch for simpler logic)
    const [
        heroData,
        projects,
        pipeline,
        coreFuncs,
        allocation,
        tools,
        aiStats,
        aiApps,
        futureData,
        futureGoals
    ] = await Promise.all([
        getData('hero_content', {
            tag: '内部绝密 // Internal Confidential',
            line1: '年终',
            line2: '总结汇报',
            subtitle: '摩西科技美术中心 // 2025'
        }),
        getData('portfolio_projects_v2', []),
        getData('talent_pipeline_v2', []),
        getData('talent_coreFunctions_v3', []),
        getData('talent_allocation_v4', null),
        getData('talent_tools_v1', []),
        getData('ai_stats_v3', []),
        getData('ai_apps_v2', []),
        getData('future_content_v2', {
            title: '未来展望',
            visionTitle: '2026 愿景',
            visionDesc: '标准化程序化工作流程...',
            ultimateTitle: '终极目标',
            ultimateDesc: '健康生活，快乐工作！！！',
            quote: '成为艺术与技术融合的行业标杆...'
        }),
        getData('future_goals_v2', [])
    ]);

    const pptx = new PptxGenJS();
    pptx.layout = "LAYOUT_16x9";

    // --- Colors & Styles ---
    const BG_DARK = "0F172A"; // Slate 900
    const TEXT_MAIN = "FFFFFF";
    const ACCENT = "FF5500"; // Brand Orange
    const TEXT_MUTED = "94A3B8"; // Slate 400

    // Master Slide Definition (Theme)
    pptx.defineSlideMaster({
        title: "DARK_THEME",
        background: { color: BG_DARK },
        objects: [
            { rect: { x: 0, y: 0, w: "100%", h: 0.1, fill: { color: ACCENT } } }, // Top Orange Bar
            { text: { text: "CONFIDENTIAL // INTERNAL USE ONLY", x: 0.5, y: 7.2, w: "90%", fontSize: 8, color: "334155", align: "center" } } // Footer
        ]
    });

    // --- 1. HERO SLIDE ---
    const slideHero = pptx.addSlide({ masterName: "DARK_THEME" });
    
    // Tag
    slideHero.addText(heroData.tag, {
        x: 4, y: 1.5, w: 5.33, h: 0.4,
        align: 'center', fontSize: 10, color: ACCENT,
        line: { color: ACCENT, width: 1 },
        charSpacing: 3
    });

    // Title
    slideHero.addText(heroData.line1, {
        x: 0, y: 2.2, w: '100%', h: 1.5,
        align: 'center', fontSize: 60, fontFace: "Arial Black", color: TEXT_MAIN,
        isTextBox: true
    });
    slideHero.addText(heroData.line2, {
        x: 0, y: 3.5, w: '100%', h: 1.5,
        align: 'center', fontSize: 60, fontFace: "Arial Black", color: ACCENT,
        isTextBox: true
    });

    // Subtitle
    slideHero.addText(heroData.subtitle, {
        x: 0, y: 5.0, w: '100%', h: 0.5,
        align: 'center', fontSize: 18, color: TEXT_MUTED, fontFace: "Courier New"
    });

    // --- 2. PORTFOLIO SLIDES ---
    const slidePortTitle = pptx.addSlide({ masterName: "DARK_THEME" });
    slidePortTitle.addText("01. 作品展示", { x: 1, y: 2.5, fontSize: 44, color: TEXT_MAIN, bold: true, italic: true });
    slidePortTitle.addText("年度交付 // DELIVERABLES", { x: 1, y: 3.3, fontSize: 14, color: TEXT_MUTED, fontFace: "Courier New" });

    // Individual Project Slides
    projects.forEach((proj: any) => {
        const slide = pptx.addSlide({ masterName: "DARK_THEME" });
        
        // Header
        slide.addText(proj.name, { x: 0.5, y: 0.5, fontSize: 24, bold: true, color: ACCENT });
        
        // Main Image
        if (proj.imageUrl) {
            slide.addImage({ 
                path: proj.imageUrl, 
                x: 0.5, y: 1.2, w: 6, h: 3.5,
                sizing: { type: 'contain', w: 6, h: 3.5 }
            });
        }

        // Description
        slide.addText(proj.description, { 
            x: 0.5, y: 5.0, w: 6, h: 1.5, 
            fontSize: 14, color: TEXT_MUTED, valign: 'top' 
        });

        // Gallery Grid
        if (proj.gallery && proj.gallery.length > 0) {
            slide.addText("ASSETS PREVIEW", { x: 7, y: 1.2, fontSize: 10, color: ACCENT, bold: true });
            
            proj.gallery.slice(0, 4).forEach((img: string, idx: number) => {
                const row = Math.floor(idx / 2);
                const col = idx % 2;
                slide.addImage({
                    path: img,
                    x: 7 + (col * 2.8),
                    y: 1.5 + (row * 1.8),
                    w: 2.6,
                    h: 1.6,
                    sizing: { type: 'cover', w: 2.6, h: 1.6 }
                });
            });
        }
    });

    // --- 3. TALENT SLIDES ---
    const slideTalentTitle = pptx.addSlide({ masterName: "DARK_THEME" });
    slideTalentTitle.addText("02. 人才培养", { x: 1, y: 2.5, fontSize: 44, color: TEXT_MAIN, bold: true, italic: true });
    slideTalentTitle.addText("核心竞争力 // HUMAN CAPITAL", { x: 1, y: 3.3, fontSize: 14, color: TEXT_MUTED, fontFace: "Courier New" });

    // Pipeline
    const slidePipeline = pptx.addSlide({ masterName: "DARK_THEME" });
    slidePipeline.addText("人才输送管道", { x: 0.5, y: 0.5, fontSize: 20, color: TEXT_MAIN, bold: true });

    pipeline.forEach((step: any, idx: number) => {
        const xPos = 0.5 + (idx * 3.2);
        slidePipeline.addShape(pptx.ShapeType.ellipse, { 
            x: xPos + 0.8, y: 2, w: 1, h: 1, 
            fill: { color: "FFFFFF" }, line: { color: ACCENT, width: 2 } 
        });
        slidePipeline.addText(step.title, { 
            x: xPos, y: 3.2, w: 2.6, h: 0.4, 
            align: 'center', fontSize: 14, bold: true, color: TEXT_MAIN 
        });
        slidePipeline.addText(step.desc, { 
            x: xPos, y: 3.6, w: 2.6, h: 1, 
            align: 'center', fontSize: 10, color: TEXT_MUTED 
        });
        slidePipeline.addText(step.stat, { 
            x: xPos, y: 4.8, w: 2.6, h: 0.3, 
            align: 'center', fontSize: 10, bold: true, color: "1E293B", fill: { color: "E2E8F0" }
        });
        if (idx < pipeline.length - 1) {
             slidePipeline.addShape(pptx.ShapeType.rightArrow, { 
                x: xPos + 2.4, y: 2.4, w: 0.5, h: 0.2, 
                fill: { color: TEXT_MUTED }
            });
        }
    });

    // Core Functions
    const slideFuncs = pptx.addSlide({ masterName: "DARK_THEME" });
    slideFuncs.addText("核心成员职能", { x: 0.5, y: 0.5, fontSize: 20, color: TEXT_MAIN, bold: true });

    coreFuncs.forEach((func: any, idx: number) => {
        const xPos = 0.5 + (idx * 4.2);
        slideFuncs.addShape(pptx.ShapeType.rect, {
            x: xPos, y: 1.5, w: 4, h: 4.5,
            fill: { color: "1E293B" }, line: { color: "334155" }
        });
        slideFuncs.addText(func.title, {
            x: xPos + 0.2, y: 1.7, w: 3.6, h: 0.5,
            fontSize: 16, bold: true, color: ACCENT
        });
        slideFuncs.addText(func.subtitle, {
            x: xPos + 0.2, y: 2.2, w: 3.6, h: 0.3,
            fontSize: 10, color: "64748B", fontFace: "Courier New"
        });
        slideFuncs.addText(func.desc, {
            x: xPos + 0.2, y: 2.7, w: 3.6, h: 3,
            fontSize: 12, color: "CBD5E1", valign: "top"
        });
    });

    // Allocation
    if (allocation) {
        const slideAlloc = pptx.addSlide({ masterName: "DARK_THEME" });
        slideAlloc.addText("02-3. 人员动态调配", { x: 0.5, y: 0.5, fontSize: 20, color: TEXT_MAIN, bold: true });
        slideAlloc.addText(allocation.title, { x: 0.5, y: 1.5, w: 6, fontSize: 32, color: ACCENT, bold: true, italic: true });
        slideAlloc.addText(allocation.subtitle, { x: 0.5, y: 2.3, w: 6, fontSize: 10, color: TEXT_MUTED });
        slideAlloc.addText(allocation.desc, { x: 0.5, y: 3.0, w: 6, h: 2, fontSize: 14, color: TEXT_MAIN });

        if (allocation.imageUrl) {
            slideAlloc.addImage({ 
                path: allocation.imageUrl, 
                x: 7, y: 1.5, w: 5.5, h: 3.5,
                sizing: { type: 'cover', w: 5.5, h: 3.5 }
            });
        }
    }

    // Tools
    if (tools && tools.length > 0) {
        const slideTools = pptx.addSlide({ masterName: "DARK_THEME" });
        slideTools.addText("02+. 自研效能工具", { x: 0.5, y: 0.5, fontSize: 20, color: TEXT_MAIN, bold: true });
        
        tools.forEach((tool: any, idx: number) => {
            if (idx > 1) return; // Limit to 2 per slide for simplicity or make layout dynamic
            const yOffset = 1.5 + (idx * 2.8);
            
            if (tool.imageUrl) {
                slideTools.addImage({
                    path: tool.imageUrl,
                    x: 0.5, y: yOffset, w: 3, h: 2,
                    sizing: { type: 'cover', w: 3, h: 2 }
                });
            }
            
            slideTools.addText(tool.title, {
                x: 3.8, y: yOffset, w: 8, h: 0.5,
                fontSize: 18, color: ACCENT, bold: true
            });
            
            slideTools.addText(tool.desc, {
                x: 3.8, y: yOffset + 0.6, w: 8, h: 1.4,
                fontSize: 12, color: TEXT_MUTED, valign: 'top'
            });
        });
    }

    // --- 4. AI SECTION ---
    const slideAITitle = pptx.addSlide({ masterName: "DARK_THEME" });
    slideAITitle.addText("03. AI 普及应用", { x: 1, y: 2.5, fontSize: 44, color: TEXT_MAIN, bold: true, italic: true });
    slideAITitle.addText("生成式工作流 // GENERATIVE EVOLUTION", { x: 1, y: 3.3, fontSize: 14, color: TEXT_MUTED, fontFace: "Courier New" });

    const slideAIStats = pptx.addSlide({ masterName: "DARK_THEME" });
    slideAIStats.addText("各模块 AI 渗透率", { x: 0.5, y: 0.5, fontSize: 20, color: TEXT_MAIN, bold: true });

    aiStats.forEach((stat: any, idx: number) => {
        const yPos = 1.5 + (idx * 1.5);
        slideAIStats.addText(stat.name, { x: 0.5, y: yPos, fontSize: 14, bold: true, color: TEXT_MAIN });
        slideAIStats.addText(stat.breakdown, { x: 0.5, y: yPos + 0.4, fontSize: 10, color: TEXT_MUTED });
        
        slideAIStats.addShape(pptx.ShapeType.rect, { x: 3, y: yPos + 0.1, w: 8, h: 0.3, fill: { color: "334155" } });
        const barWidth = (stat.percentage / 100) * 8;
        slideAIStats.addShape(pptx.ShapeType.rect, { x: 3, y: yPos + 0.1, w: barWidth, h: 0.3, fill: { color: ACCENT } });
        slideAIStats.addText(`${stat.percentage}%`, { x: 11.2, y: yPos + 0.1, fontSize: 18, bold: true, color: ACCENT });
    });

    if (aiApps.length > 0) {
        slideAIStats.addText("实际应用工具链:", { x: 0.5, y: 6.2, fontSize: 12, color: TEXT_MUTED });
        aiApps.forEach((app: string, i: number) => {
            slideAIStats.addShape(pptx.ShapeType.roundRect, {
                x: 0.5 + (i * 3.1), y: 6.5, w: 2.8, h: 0.6,
                fill: { color: "FFFFFF" }, line: { color: ACCENT }
            });
            slideAIStats.addText(app, {
                x: 0.5 + (i * 3.1), y: 6.5, w: 2.8, h: 0.6,
                align: 'center', fontSize: 10, color: "334155", bold: true
            });
        });
    }

    // --- 5. FUTURE SLIDES ---
    const slideFuture = pptx.addSlide({ masterName: "DARK_THEME" });
    slideFuture.addText(`04. ${futureData.title}`, { x: 0.5, y: 0.5, fontSize: 32, color: ACCENT, bold: true, italic: true });

    slideFuture.addText(futureData.visionTitle, { x: 0.5, y: 1.5, fontSize: 18, color: TEXT_MAIN, bold: true });
    slideFuture.addText(futureData.visionDesc, { x: 0.5, y: 2.0, w: 5, fontSize: 12, color: TEXT_MUTED });

    slideFuture.addText("核心目标:", { x: 7, y: 1.5, fontSize: 14, color: ACCENT, bold: true });
    futureGoals.forEach((goal: string, i: number) => {
        slideFuture.addText(`• ${goal}`, { x: 7, y: 2.0 + (i * 0.5), fontSize: 12, color: TEXT_MAIN });
    });

    slideFuture.addShape(pptx.ShapeType.rect, { x: 0.5, y: 4.5, w: 12.33, h: 0.05, fill: { color: "334155" } });
    slideFuture.addText(futureData.ultimateTitle, { x: 0.5, y: 5.0, fontSize: 18, color: TEXT_MAIN, bold: true });
    slideFuture.addText(futureData.ultimateDesc, { x: 0.5, y: 5.5, w: 10, fontSize: 12, color: TEXT_MUTED });

    slideFuture.addShape(pptx.ShapeType.rect, { x: 0.5, y: 6.2, w: 12.33, h: 1, fill: { color: "1E293B" }, line: {color: "334155"} });
    slideFuture.addText(`"${futureData.quote}"`, { 
        x: 0.7, y: 6.2, w: 12, h: 1, 
        fontSize: 14, italic: true, color: ACCENT, align: 'center' 
    });

    // Save
    pptx.writeFile({ fileName: `GameArt_YearEnd_Summary_${new Date().getFullYear()}.pptx` });
};