
import { GoogleGenAI } from "@google/genai";

// Initialize the Google GenAI client using the environment variable for the API key directly.
// Always use the named parameter for API key and assume it's available in process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const refineText = async (text: string, context: string): Promise<string> => {
  try {
    // Using 'gemini-3-flash-preview' for text refinement tasks as recommended for Basic Text Tasks.
    const model = 'gemini-3-flash-preview';
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

    // Directly access the text property as it is a getter, not a method.
    return response.text?.trim() || text;
  } catch (error) {
    console.error("Gemini Refine Error:", error);
    return text;
  }
};

export const suggestIdeas = async (topic: string): Promise<string[]> => {
    try {
        // Using 'gemini-3-flash-preview' for generating structured ideas.
        const model = 'gemini-3-flash-preview';
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
        
        // response.text is a property, not a method.
        const text = response.text;
        if (text) {
             // Handle potential markdown formatting and parse JSON response.
             const cleanText = text.replace(/```json|```/g, '').trim();
             return JSON.parse(cleanText);
        }
        return [];
    } catch (e) {
        console.error(e);
        return [];
    }
}
