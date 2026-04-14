// Professional ChatGPT Prompt Templates
// These prompts are engineered for maximum architectural accuracy

export const buildBlueprintPrompt = (userInput: {
  buildingType: string;
  country: string;
  landSize: { width: number; depth: number; unit: string };
  bedrooms: number;
  guestToilet: { hasGuestToilet: boolean; count: number };
  description: string;
  professionalMode: boolean;
}) => {
  return `You are a professional architect with 30 years of experience in residential and commercial design. Your task is to generate a COMPLETE, CONSTRUCTION-READY architectural blueprint specification.

## BUILDING REQUIREMENTS:
- Building Type: ${userInput.buildingType}
- Location: ${userInput.country}
- Land Size: ${userInput.landSize.width} × ${userInput.landSize.depth} ${userInput.landSize.unit}
- Bedrooms: ${userInput.bedrooms} (Each bedroom includes an attached bathroom)
- Guest Toilet: ${userInput.guestToilet.hasGuestToilet ? `Yes, ${userInput.guestToilet.count} unit(s)` : 'No'}
- Client Description: "${userInput.description}"

## ARCHITECTURAL STANDARDS TO FOLLOW:
1. Minimum room sizes based on ${userInput.country} building codes
2. Proper circulation flow (hallways minimum 36" width)
3. Natural light optimization (windows placement)
4. Functional adjacency (kitchen near dining, bedrooms private)
5. Proper door placement and swing directions
6. Scale accuracy (1/4" = 1'-0" standard)

## OUTPUT FORMAT - STRICT JSON ONLY:
Return ONLY valid JSON with this exact structure, no additional text:

{
  "buildingType": "${userInput.buildingType}",
  "country": "${userInput.country}",
  "totalArea": number,
  "dimensions": { "width": number, "depth": number },
  "rooms": [
    {
      "id": "room-0",
      "name": "Master Bedroom",
      "type": "bedroom",
      "width": number,
      "depth": number,
      "area": number,
      "position": { "x": number, "y": number },
      "color": "#8b5cf6",
      "doors": [{ "wall": "south", "position": 0.5, "width": 3 }],
      "windows": [{ "wall": "north", "position": 0.5, "width": 4 }]
    }
  ],
  "layout": "professional",
  "unit": "${userInput.landSize.unit === 'feet' ? 'feet' : 'meters'}",
  "createdAt": "timestamp"
}

## CRITICAL RULES:
1. Each bedroom MUST have an attached bathroom
2. Guest toilet placement should be accessible from living areas
3. All dimensions must be realistic and proportional
4. Total building area must fit within land size (leave 10% for setbacks)
5. Include at least: Living Room, Kitchen, Dining Area, Hallway
6. Position rooms logically on grid (x: 0-100, y: 0-80)
7. No overlapping rooms
8. Use proper colors for room types

Generate the blueprint now based on the client's description and requirements.`;
};

export const refineBlueprintPrompt = (currentBlueprint: any, userChanges: any) => {
  return `As an architect, refine this blueprint based on the following changes:
  
Current Blueprint: ${JSON.stringify(currentBlueprint, null, 2)}
Requested Changes: ${JSON.stringify(userChanges, null, 2)}

Return ONLY the updated JSON with the same structure. Ensure all dimensions remain realistic and no rooms overlap.`;
};