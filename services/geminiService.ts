
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

// Nano Banana Model for Image Generation & Editing
const IMAGE_MODEL = 'gemini-2.5-flash-image';

/**
 * توليد صورة باستخدام نموذج Gemini
 */
export const generateImage = async (prompt: string, base64Image?: string, mimeType?: string) => {
  // Always create a new instance right before making an API call to ensure it uses the latest API key.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const contents: any[] = [{ text: prompt }];
  if (base64Image && mimeType) {
    contents.push({
      inlineData: {
        data: base64Image,
        mimeType: mimeType
      }
    });
  }

  const response = await ai.models.generateContent({
    model: IMAGE_MODEL,
    contents: { parts: contents },
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    }
  });

  const parts = response.candidates?.[0]?.content?.parts;
  if (!parts) throw new Error("استجابة فارغة من النموذج");

  for (const part of parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("لم يتم العثور على صورة في الاستجابة");
};

/**
 * وظيفة تحسين الصور وإزالة البكسلات
 */
export const enhanceImage = async (base64Image: string, mimeType: string) => {
  // Always create a new instance right before making an API call.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const enhancementPrompt = "Please enhance this image. Improve the resolution, remove pixelation and compression artifacts, make the details sharp and clear while preserving the original artistic style and content. The final output should be high definition and professional.";

  const response = await ai.models.generateContent({
    model: IMAGE_MODEL,
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: mimeType } },
        { text: enhancementPrompt }
      ]
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    }
  });

  const parts = response.candidates?.[0]?.content?.parts;
  if (!parts) throw new Error("فشل تحسين الصورة");

  for (const part of parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("لم يتم العثور على صورة محسنة");
};

/**
 * وظيفة توليد الفيديو باستخدام نموذج Veo
 */
export const generateVideo = async (
  prompt: string,
  config: { aspectRatio: '16:9' | '9:16'; resolution: '720p' | '1080p' },
  base64Image?: string,
  mimeType?: string
) => {
  // MANDATORY: Create a new GoogleGenAI instance right before making an API call.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const operationParams: any = {
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    config: {
      numberOfVideos: 1,
      resolution: config.resolution,
      aspectRatio: config.aspectRatio
    }
  };

  if (base64Image && mimeType) {
    operationParams.image = {
      imageBytes: base64Image,
      mimeType: mimeType
    };
  }

  let operation = await ai.models.generateVideos(operationParams);
  
  // Poll for operation completion every 10 seconds
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) throw new Error("فشل توليد الفيديو: الرابط غير متوفر");

  // Fetching video bytes requires appending the API key to the URI as per guidelines.
  const fetchUrl = `${downloadLink}&key=${process.env.API_KEY}`;
  const response = await fetch(fetchUrl);
  
  if (!response.ok) {
    const text = await response.text();
    // Special error handling for Veo as per guidelines
    if (text.includes("Requested entity was not found")) {
      throw new Error("API_KEY_REQUIRED");
    }
    throw new Error(`فشل تحميل الفيديو: ${response.statusText}`);
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
};

export const downloadMedia = async (url: string, filename: string) => {
  const response = await fetch(url);
  const blob = await response.blob();
  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(blobUrl);
};
