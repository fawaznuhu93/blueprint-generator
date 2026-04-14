// AI Service - Now using Google Gemini (Free Tier)
// To switch back to OpenAI, simply change the import below

import { generateBlueprintWithGemini } from './geminiService';
// import { generateBlueprintWithChatGPT } from './chatGPTService'; // Uncomment when you have OpenAI budget

import { BlueprintEngine } from './blueprintEngine';

export const generateBlueprintWithAI = async (
  buildingType: string,
  country: string,
  professionalMode: boolean = false,
  roomCount?: any,
  landSize?: { width: number; depth: number; unit: string },
  description?: string,
  guestToilet?: { hasGuestToilet: boolean; count: number }
): Promise<any> => {
  
  console.log('🤖 Starting AI blueprint generation with Google Gemini (Free Tier)...');
  
  // Prepare user input for AI
  const userInput = {
    buildingType,
    country,
    landSize: landSize || { width: 50, depth: 60, unit: 'feet' },
    bedrooms: roomCount?.bedrooms || 3,
    guestToilet: guestToilet || { hasGuestToilet: false, count: 1 },
    description: description || '',
    professionalMode
  };
  
  console.log('📤 Sending to Gemini:', {
    buildingType: userInput.buildingType,
    country: userInput.country,
    bedrooms: userInput.bedrooms,
    landSize: userInput.landSize
  });
  
  // Call Gemini (FREE - 1,500 requests/day)
  const result = await generateBlueprintWithGemini(userInput);
  
  if (!result.success) {
    console.error('Gemini generation failed:', result.error);
    throw new Error(result.error);
  }
  
  const aiBlueprint = result.data;
  console.log('✅ Gemini response received:', aiBlueprint);
  
  // Apply deterministic layout using our engine
  const engine = new BlueprintEngine(aiBlueprint);
  const laidOutRooms = engine.generateLayout();
  
  return {
    ...aiBlueprint,
    rooms: laidOutRooms,
    totalArea: engine.calculateTotalArea()
  };
};