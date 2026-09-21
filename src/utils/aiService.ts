// AI Service - Connects to backend with Agent Router (gpt-5.6-sol)

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const generateBlueprintWithAI = async (
  buildingType: string,
  country: string,
  professionalMode: boolean = false,
  roomCount?: any,
  landSize?: any,
  description?: string,
  guestToilet?: any,
  customizations?: any
): Promise<any> => {
  
  console.log('🤖 Calling backend API at:', API_URL);
  
  try {
    const response = await fetch(`${API_URL}/api/generate-blueprint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        buildingData: {
          buildingType,
          roomCount,
          landSize,
          description,
          guestToilet,
          soilType: 'not-sure'
        },
        country,
        professionalMode,
        customizations
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Generation failed');
    }

    const result = await response.json();
    console.log(`✅ Blueprint source: ${result.source}`);
    return result.data;

  } catch (error: any) {
    console.error('❌ Backend error:', error);
    throw new Error(error.message || 'Failed to connect to backend');
  }
};