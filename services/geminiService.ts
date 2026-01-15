
import { GoogleGenAI, Type } from "@google/genai";
import { StrategicPriority } from "../types";

// The API key must be obtained exclusively from the environment variable process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const GeminiService = {
  analyzeDump: async (items: string[], priorities: StrategicPriority[]) => {
    const priorityList = priorities.map(p => p.name).join(", ");
    const prompt = `
      You are an expert personal productivity assistant. 
      I have a list of brain dump items and a list of strategic priorities.
      
      Strategic Priorities: ${priorityList}
      
      For each item in the dump, decide:
      1. Is it worth keeping (true) or is it noise (false)?
      2. If keeping, which priority does it best align with? (Use one of the names above, or "None")
      3. What is the suggested commitment type? (task, event, idea, note, waiting_on)
      4. What is the estimated duration in minutes? (15, 30, 60, 120, etc.)
      5. What is the suggested energy level? (low, medium, high)
      6. A concise, professional title.
      7. A short description if needed.

      Return the result as a JSON array of objects matching the schema.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          { parts: [{ text: prompt }, { text: `Dump items: ${JSON.stringify(items)}` }] }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                rawText: { type: Type.STRING },
                keep: { type: Type.BOOLEAN },
                priorityName: { type: Type.STRING },
                type: { type: Type.STRING },
                durationMinutes: { type: Type.NUMBER },
                energy: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
              },
              required: ["rawText", "keep", "priorityName", "type", "durationMinutes", "energy", "title"]
            }
          }
        }
      });

      // Use response.text directly (not as a method)
      const text = response.text;
      if (!text) return [];
      return JSON.parse(text.trim());
    } catch (e) {
      console.error("Gemini Analysis failed:", e);
      return [];
    }
  }
};
