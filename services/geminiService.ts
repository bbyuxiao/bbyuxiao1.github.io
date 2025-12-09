import { GoogleGenAI } from "@google/genai";

// Safe API Key retrieval handling environments where process is undefined
let apiKey = '';
try {
  if (typeof process !== 'undefined' && process.env) {
    apiKey = process.env.API_KEY || '';
  }
} catch (e) {
  console.warn("Environment variable access failed, running without API Key.");
}

// Safe initialization
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export const refineText = async (text: string, context: string): Promise<string> => {
  if (!ai) {
    console.warn("Gemini API Key not found.");
    return text + " (需配置 API Key 以使用 AI 润色功能)";
  }

  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      你是一家顶级游戏公司的资深美术总监。
      请润色以下用于年终总结演示的文案。
      上下文: ${context}.
      语调要求：专业、鼓舞人心、充满活力、简洁（电竞/游戏风格）。
      
      待润色文本: "${text}"
      
      请仅返回润色后的中文文本。
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text?.trim() || text;
  } catch (error) {
    console.error("Gemini Refine Error:", error);
    return text;
  }
};

export const suggestIdeas = async (topic: string): Promise<string[]> => {
    if (!ai) return ["提升模型面数精度", "优化纹理流送效率", "全员学习 Unreal Engine 5"];

    try {
        const model = 'gemini-2.5-flash';
        const prompt = `
          针对游戏美术部门的年终总结，关于 "${topic}" 提供3个简短有力的要点（Bullet points）。
          请用中文回答。
          请严格返回一个 JSON 字符串数组。
        `;

        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });
        
        const text = response.text;
        if (text) {
             // Handle potential markdown formatting in response
             const cleanText = text.replace(/```json|```/g, '').trim();
             return JSON.parse(cleanText);
        }
        return [];
    } catch (e) {
        console.error(e);
        return [];
    }
}