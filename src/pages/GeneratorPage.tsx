import { useState } from 'react';
import { AdvancedBuildingForm } from '../components/Generator/AdvancedBuildingForm';
import { CountrySelector } from '../components/Generator/CountrySelector';
import { ProfessionalToggle } from '../components/Generator/ProfessionalToggle';
import { RoomCustomizer } from '../components/Generator/RoomCustomizer';
import { BlueprintViewer } from '../components/Blueprint/BlueprintViewer';
import { FeedbackForm } from '../components/Feedback/FeedbackForm';
import { generateBlueprintWithAI } from '../utils/aiService';
import { BlueprintEngine } from '../utils/blueprintEngine';
import { exportBlueprintAsPDF, exportBlueprintAsSVG } from '../components/Blueprint/BlueprintExporter';
import { AlertCircle, CheckCircle, Info, Download, FileJson, FileImage, Loader2 } from 'lucide-react';

// Define types inline to avoid import issues
interface Room {
  id: string;
  name: string;
  type: string;
  width: number;
  depth: number;
  area: number;
  position: { x: number; y: number };
  color: string;
  doors: Array<any>;
  windows: Array<any>;
}

interface BlueprintSpec {
  buildingType: string;
  country: string;
  totalArea: number;
  dimensions: { width: number; depth: number };
  rooms: Room[];
  layout: string;
  unit: 'feet' | 'meters';
  createdAt: string;
}

// Analytics tracking
const trackBlueprintGenerated = (type: string, country: string) => {
  console.log(`📊 Blueprint generated: ${type} in ${country}`);
};

const trackExport = (format: string) => {
  console.log(`📊 Export: ${format}`);
};

export const GeneratorPage = () => {
  const [step, setStep] = useState(1);
  const [buildingData, setBuildingData] = useState<any>(null);
  const [country, setCountry] = useState<string>('US');
  const [professionalMode, setProfessionalMode] = useState<boolean>(false);
  const [blueprint, setBlueprint] = useState<BlueprintSpec | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  
  const handleBuildingSubmit = (data: any) => {
    console.log('📋 Building data received:', data);
    setBuildingData(data);
    setStep(2);
    setApiError(null);
  };
  
  const handleGenerate = async () => {
    if (!buildingData) {
      console.error('No building data available');
      return;
    }
    
    setIsGenerating(true);
    setWarnings([]);
    setApiError(null);
    
    console.log('🚀 Starting blueprint generation with ChatGPT...');
    console.log('Building type:', buildingData.buildingType);
    console.log('Country:', country);
    console.log('Professional mode:', professionalMode);
    console.log('Room count:', buildingData.roomCount);
    console.log('Land size:', buildingData.landSize);
    console.log('Guest toilet:', buildingData.guestToilet);
    console.log('Description:', buildingData.description);
    
    try {
      // Call the AI service which now uses ChatGPT
      const aiSpec = await generateBlueprintWithAI(
        buildingData.buildingType,
        country,
        professionalMode,
        buildingData.roomCount,
        buildingData.landSize,
        buildingData.description,
        buildingData.guestToilet
      );
      
      console.log('✅ AI spec received from ChatGPT:', aiSpec);
      
      // Apply deterministic layout using our engine
      const engine = new BlueprintEngine(aiSpec);
      const laidOutRooms = engine.generateLayout();
      const validationWarnings = engine.validateLayout();
      
      setWarnings(validationWarnings);
      
      const finalSpec: BlueprintSpec = {
        ...aiSpec,
        rooms: laidOutRooms,
        totalArea: Math.round(engine.calculateTotalArea() * 10) / 10
      };
      
      setBlueprint(finalSpec);
      trackBlueprintGenerated(buildingData.buildingType, country);
      setStep(3);
      
    } catch (error: any) {
      console.error('❌ Generation failed:', error);
      setApiError(error.message || 'Failed to generate blueprint. Please check your OpenAI API key and try again.');
      alert(`Generation failed: ${error.message || 'Please check your OpenAI API key'}`);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleRoomChange = (updatedBlueprint: BlueprintSpec) => {
    if (updatedBlueprint.rooms.length === 0) {
      handleGenerate();
      return;
    }
    setBlueprint(updatedBlueprint);
  };
  
  const handleExportPDF = async () => {
    if (!blueprint) return;
    trackExport('pdf');
    await exportBlueprintAsPDF('blueprint-canvas', `blueprint-${buildingData?.buildingType}-${Date.now()}`);
  };
  
  const handleExportSVG = () => {
    if (!blueprint) return;
    trackExport('svg');
    const svgContent = exportBlueprintAsSVG(blueprint);
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blueprint-${buildingData?.buildingType}-${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const handleCopyJSON = () => {
    if (!blueprint) return;
    navigator.clipboard.writeText(JSON.stringify(blueprint, null, 2))
      .then(() => alert('Blueprint JSON copied to clipboard!'))
      .catch(err => console.error('Copy failed:', err));
    trackExport('json');
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">🏗️ Blueprint Generator Pro</h1>
              <p className="text-xs sm:text-sm text-gray-500">AI-Powered Architectural Plans • ChatGPT Integration</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full">
                {buildingData?.buildingType ? 'Project Configured' : 'Ready to Start'}
              </span>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className={`flex items-center space-x-1 sm:space-x-2 ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>1</div>
              <span className="text-xs sm:text-sm hidden sm:inline">Configure</span>
            </div>
            <div className="w-8 sm:w-12 h-0.5 bg-gray-200" />
            <div className={`flex items-center space-x-1 sm:space-x-2 ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>2</div>
              <span className="text-xs sm:text-sm hidden sm:inline">Generate</span>
            </div>
            <div className="w-8 sm:w-12 h-0.5 bg-gray-200" />
            <div className={`flex items-center space-x-1 sm:space-x-2 ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>3</div>
              <span className="text-xs sm:text-sm hidden sm:inline">Export</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Left Column - Configuration */}
          <div className="w-full lg:w-1/3 space-y-6">
            {step === 1 && (
              <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                <AdvancedBuildingForm onSubmit={handleBuildingSubmit} />
              </div>
            )}
            
            {step === 2 && (
              <>
                <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                  <CountrySelector selectedCountry={country} onChange={setCountry} />
                </div>
                
                <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                  <ProfessionalToggle isProfessional={professionalMode} onChange={setProfessionalMode} />
                </div>
                
                {apiError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-red-800">API Error</h4>
                        <p className="text-sm text-red-700 mt-1">{apiError}</p>
                        <p className="text-xs text-red-600 mt-2">
                          Make sure VITE_OPENAI_API_KEY is set in your .env file
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full py-3 sm:py-4 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl font-semibold text-base sm:text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>ChatGPT is designing your blueprint...</span>
                    </>
                  ) : (
                    <span>Generate Blueprint with ChatGPT</span>
                  )}
                </button>
                
                {isGenerating && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                      <p className="text-sm text-blue-800">
                        ChatGPT is analyzing your requirements and creating a professional architectural plan...
                      </p>
                    </div>
                  </div>
                )}
                
                {professionalMode && blueprint && (
                  <RoomCustomizer blueprint={blueprint} onRoomChange={handleRoomChange} />
                )}
              </>
            )}
            
            {step === 3 && blueprint && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                  <h3 className="font-semibold text-gray-800 mb-4">Export Options</h3>
                  <div className="space-y-3">
                    <button
                      onClick={handleExportPDF}
                      className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download as PDF</span>
                    </button>
                    <button
                      onClick={handleExportSVG}
                      className="w-full py-3 bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-200 transition-colors border border-gray-300 flex items-center justify-center space-x-2"
                    >
                      <FileImage className="w-4 h-4" />
                      <span>Download as SVG</span>
                    </button>
                    <button
                      onClick={handleCopyJSON}
                      className="w-full py-3 bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-200 transition-colors border border-gray-300 flex items-center justify-center space-x-2"
                    >
                      <FileJson className="w-4 h-4" />
                      <span>Copy JSON</span>
                    </button>
                  </div>
                </div>
                
                <button
                  onClick={() => setStep(1)}
                  className="w-full py-3 bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Start New Project
                </button>
              </div>
            )}
            
            {/* Feedback Form */}
            <FeedbackForm />
          </div>
          
          {/* Right Column - Blueprint Display */}
          <div className="w-full lg:w-2/3 space-y-6">
            {warnings.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Layout Warnings</h4>
                    <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                      {warnings.slice(0, 3).map((warning, index) => (
                        <li key={index}>• {warning}</li>
                      ))}
                      {warnings.length > 3 && <li>• And {warnings.length - 3} more...</li>}
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            {blueprint ? (
              <BlueprintViewer blueprint={blueprint} onExportPDF={handleExportPDF} />
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-8 sm:p-12 text-center">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <div className="text-3xl sm:text-4xl">🏗️</div>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">No Blueprint Generated</h3>
                <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto">
                  Complete the configuration steps on the left to generate your professional architectural blueprint using ChatGPT.
                </p>
                {step === 1 && (
                  <div className="mt-6 inline-flex items-center space-x-2 text-sm text-blue-600">
                    <span>Start by selecting your building type →</span>
                  </div>
                )}
                {step === 2 && !isGenerating && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <strong>Pro tip:</strong> Be specific in your description for better results. ChatGPT will generate a complete architectural plan based on your requirements.
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {blueprint && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-green-800">Blueprint Generated Successfully!</h4>
                    <p className="mt-1 text-xs sm:text-sm text-green-700">
                      {buildingData?.buildingType?.toUpperCase()} • {blueprint.totalArea.toFixed(1)} sq {blueprint.unit} • {blueprint.rooms.length} rooms • Based on {country} standards
                    </p>
                    <p className="mt-2 text-xs text-green-600">
                      This blueprint was generated by ChatGPT AI. Professional review recommended before construction.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <footer className="mt-12 border-t border-gray-200 bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-xs sm:text-sm text-gray-600">
            Blueprint Generator Pro v2.0 • Powered by ChatGPT AI • Professional Architectural Plans
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Generated plans follow {country} building standards. Always consult with a licensed professional before construction.
          </p>
        </div>
      </footer>
    </div>
  );
};