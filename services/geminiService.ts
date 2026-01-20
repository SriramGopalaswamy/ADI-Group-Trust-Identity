import { GoogleGenAI } from "@google/genai";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const editImageWithGemini = async (
  base64Image: string,
  prompt: string
): Promise<string> => {
  try {
    // Clean base64 string if it contains metadata prefix
    const cleanBase64 = base64Image.split(',')[1] || base64Image;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg', // Assuming JPEG for simplicity from canvas
              data: cleanBase64
            }
          },
          {
            text: `Edit this image: ${prompt}. Return ONLY the edited image.`
          }
        ]
      }
    });

    // Extract the image from the response
    // The model returns the image in the candidates
    const parts = response.candidates?.[0]?.content?.parts;
    
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error("No image generated.");

  } catch (error) {
    console.error("Gemini Image Generation Error:", error);
    throw error;
  }
};

export const extractBatchCodeFromImage = async (base64Image: string): Promise<string> => {
  try {
    const cleanBase64 = base64Image.split(',')[1] || base64Image;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64
            }
          },
          {
            text: "Locate and extract the product batch code printed on the packaging. It is typically a short alphanumeric string like 'ADIF5HW825' or 'ADIT28WS25'. Return ONLY the code text. If no code is clearly visible, return 'NOT_FOUND'."
          }
        ]
      }
    });

    const text = response.text?.trim();
    if (!text || text.includes("NOT_FOUND")) {
      throw new Error("Could not find a valid batch code.");
    }

    // Clean up potential markdown formatting or quotes
    return text.replace(/[`'"]/g, '').trim();

  } catch (error) {
    console.error("Gemini Batch Extraction Error:", error);
    throw error;
  }
};