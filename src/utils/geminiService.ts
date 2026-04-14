// Google Gemini API Service - 100% Free Tier
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
let genAI: GoogleGenerativeAI | null = null;

if (GEMINI_API_KEY && GEMINI_API_KEY !== 'your-gemini-api-key-here') {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
}

interface BlueprintResponse {
  success: boolean;
  data?: any;
  error?: string;
}

// ✅ MAKE SURE THIS FUNCTION NAME IS EXACTLY: generateBlueprintWithGemini
export const generateBlueprintWithGemini = async (userInput: {
  buildingType: string;
  country: string;
  landSize: { width: number; depth: number; unit: string };
  bedrooms: number;
  guestToilet: { hasGuestToilet: boolean; count: number };
  description: string;
  professionalMode: boolean;
}): Promise<BlueprintResponse> => {
  
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your-gemini-api-key-here' || GEMINI_API_KEY === '') {
    console.error('❌ Gemini API key is missing');
    return {
      success: false,
      error: 'Gemini API key is required. Get your free key from aistudio.google.com/apikey'
    };
  }

  if (!genAI) {
    return {
      success: false,
      error: 'Gemini client initialization failed'
    };
  }

  console.log('🚀 Sending to Gemini...');

  const prompt = `You are a professional architect. Generate a blueprint in JSON format.

PROJECT:
- Type: ${userInput.buildingType}
- Country: ${userInput.country}
- Land: ${userInput.landSize.width} x ${userInput.landSize.depth} ft
- Bedrooms: ${userInput.bedrooms} (each with bathroom)
- Guest toilet: ${userInput.guestToilet.hasGuestToilet ? 'Yes' : 'No'}
- Description: ${userInput.description}

Return ONLY this JSON format:
{
  "buildingType": "${userInput.buildingType}",
  "country": "${userInput.country}",
  "totalArea": 2500,
  "dimensions": { "width": 50, "depth": 50 },
  "rooms": [
    {
      "id": "room-0",
      "name": "Living Room",
      "type": "living",
      "width": 16,
      "depth": 20,
      "area": 320,
      "position": { "x": 10, "y": 10 },
      "color": "#3b82f6",
      "doors": [{ "wall": "south", "position": 0.5, "width": 3 }],
      "windows": [{ "wall": "north", "position": 0.5, "width": 6 }]
    }
  ],
  "layout": "professional",
  "unit": "feet"
}`;

  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig: { temperature: 0.3, maxOutputTokens: 4096 }
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const blueprintText = response.text();
    
    const jsonMatch = blueprintText.match(/\{[\s\S]*\}/);
    const blueprint = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(blueprintText);
    
    if (!blueprint.rooms) {
      blueprint.rooms = [];
    }
    
    if (!blueprint.totalArea) {
      blueprint.totalArea = blueprint.rooms.reduce((sum: number, room: any) => sum + (room.area || room.width * room.depth), 0);
    }
    
    return { success: true, data: blueprint };
    
  } catch (error: any) {
    console.error('Gemini failed:', error);
    return { success: false, error: error.message };
  }
};