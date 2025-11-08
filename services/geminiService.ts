import { GoogleGenAI, Type, Chat } from "@google/genai";
import { ExtractedData } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const imageAnalysisModel = 'gemini-2.5-flash';
const chatModel = 'gemini-2.5-flash';

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

const personSchema = {
    type: Type.OBJECT,
    properties: {
        nombreCompleto: { type: Type.STRING, description: "Full name of the person, including first name and surnames." },
        fechaNacimiento: { type: Type.STRING, description: "Date of birth (e.g., YYYY-MM-DD). Null if not found." },
        fechaBautismo: { type: Type.STRING, description: "Date of baptism (e.g., YYYY-MM-DD). Null if not found." },
        nombrePadre: { type: Type.STRING, description: "Full name of the father. Null if not found." },
        nombreMadre: { type: Type.STRING, description: "Full name of the mother. Null if not found." },
        abuelosPaternos: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Names of paternal grandparents. Null if not found." },
        abuelosMaternos: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Names of maternal grandparents. Null if not found." },
    },
    required: ["nombreCompleto", "fechaNacimiento", "fechaBautismo", "nombrePadre", "nombreMadre", "abuelosPaternos", "abuelosMaternos"],
};

const documentSchema = {
    type: Type.ARRAY,
    items: personSchema
};


export const analyzeDocumentImage = async (imageFile: File): Promise<ExtractedData[]> => {
    const imagePart = await fileToGenerativePart(imageFile);
    const prompt = `Analyze this document image, which is likely a baptism or birth certificate. Extract the key information for all individuals found based on the provided JSON schema. The document may be in Spanish. Be precise and return a JSON array of objects. If a value is not found, return null. The names for grandparents should be an array of strings.`;

    const response = await ai.models.generateContent({
        model: imageAnalysisModel,
        contents: { parts: [imagePart, { text: prompt }] },
        config: {
            responseMimeType: 'application/json',
            responseSchema: documentSchema,
        },
    });

    const text = response.text.trim();
    // The model might return a single object if only one person is found.
    // We'll ensure it's always an array.
    try {
        const parsed = JSON.parse(text);
        return Array.isArray(parsed) ? parsed : [parsed];
    } catch(e) {
        console.error("Failed to parse JSON response:", text);
        throw new Error("Could not parse AI response.");
    }
};


export const createChat = (): Chat => {
    return ai.chats.create({
        model: chatModel,
        config: {
            systemInstruction: 'You are a friendly and helpful AI assistant. Answer questions clearly and concisely.',
        },
    });
};