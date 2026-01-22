
import { GoogleGenAI, Type } from "@google/genai";
import { SubtitleEntry } from "../types";

const API_KEY = process.env.API_KEY || "";

export const translateVideoToMyanmar = async (
  videoBase64: string,
  onProgressUpdate: (msg: string, progress: number) => void,
  mimeType: string = 'video/mp4'
): Promise<SubtitleEntry[]> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });

  try {
    onProgressUpdate("Gemini AI is analyzing the video content (Large File)...", 30);
    
    const prompt = `
      Watch this video which contains Chinese speech. 
      Your task is to:
      1. Transcribe the Chinese dialogue accurately with precise timestamps.
      2. Translate the Chinese dialogue into NATURAL Myanmar (Burmese) language. 
         - The translation must sound like a native Myanmar person is speaking (colloquial, natural expressions, appropriate particles like 'ဗျာ', 'ရှင့်', 'နော်', 'လေ').
         - Avoid literal/machine translation.
      3. Return the results as a JSON array of objects.
      
      Each object must have:
      - id: integer
      - startTime: string in format "HH:MM:SS,mmm" (e.g., "00:00:01,200")
      - endTime: string in format "HH:MM:SS,mmm"
      - text: the natural Myanmar translation string.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: mimeType,
                data: videoBase64,
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.INTEGER },
              startTime: { type: Type.STRING },
              endTime: { type: Type.STRING },
              text: { type: Type.STRING },
            },
            required: ["id", "startTime", "endTime", "text"],
          },
        },
      },
    });

    onProgressUpdate("Finalizing translations...", 90);

    const jsonStr = response.text?.trim() || "[]";
    const subtitles: SubtitleEntry[] = JSON.parse(jsonStr);
    
    return subtitles;
  } catch (error: any) {
    console.error("Gemini Translation Error:", error);
    if (error.message?.includes("413") || error.message?.includes("too large")) {
      throw new Error("ဗီဒီယိုဖိုင် အရွယ်အစား ကြီးမားလွန်းသဖြင့် AI မှ လက်မခံနိုင်ပါ။ ကျေးဇူးပြု၍ ဗီဒီယိုကို compress လုပ်ပြီး ပြန်တင်ပေးပါ။");
    }
    throw new Error("AI ဘာသာပြန်ခြင်းတွင် အမှားအယွင်းရှိနေပါသည်။ ကျေးဇူးပြု၍ ပြန်လည်ကြိုးစားကြည့်ပါ။");
  }
};

export const generateSrtContent = (subtitles: SubtitleEntry[]): string => {
  return subtitles
    .map((sub) => {
      const startTime = sub.startTime.replace('.', ',');
      const endTime = sub.endTime.replace('.', ',');
      return `${sub.id}\n${startTime} --> ${endTime}\n${sub.text}\n`;
    })
    .join("\n");
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64String = result.split(',')[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
};
