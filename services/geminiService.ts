import { GoogleGenAI } from "@google/genai";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getSmartReply = async (lastMessages: string[]): Promise<string> => {
  if (!process.env.API_KEY) return "مرحباً بكم في VoiceGalaxy! 🚀";

  try {
    const prompt = `
      You are a friendly and helpful chat assistant in an Arabic voice chat room called "VoiceGalaxy" (جالاكسي الصوت).
      The users are chatting in Arabic.
      
      Context:
      - This is a premium social audio app with a galaxy/space theme.
      - Users love gifts like Meteors, Dragons, and space Rockets.
      - There are VIP levels and Frames.
      
      Here are the last few messages:
      ${lastMessages.join('\n')}

      Please provide a short, engaging, and culturally appropriate response or welcome message in Arabic to liven up the chat.
      Keep it under 20 words. Use space-themed emojis if appropriate (🚀, 🪐, ✨).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "أهلاً بنجوم المجرة! ✨";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "منورين يا أبطال! 🌟";
  }
};