import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const getBunnyAssistant = async (history: any[], prompt: string) => {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash", 
    systemInstruction: `You are the CodeBunny Assistant. Use a "cute but professional" bunny-themed tone (e.g., "Munching on bugs...", "Hop to it!"). 
    Never give the full solution immediately—provide iterative hints that guide the user toward the answer. 
    Focus on "Get a Step Hint," "Complexity Analysis," and "Debugging Tips."`
  });

  const chat = model.startChat({
    history: history.map(h => ({
      role: h.role,
      parts: [{ text: h.content }]
    })),
  });

  const result = await chat.sendMessage(prompt);
  return result.response.text();
};
