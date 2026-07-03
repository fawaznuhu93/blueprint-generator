import { useState, useRef } from 'react';
import { AdvancedBuildingForm } from '../components/Generator/AdvancedBuildingForm';
import { CountrySelector } from '../components/Generator/CountrySelector';
import { ProfessionalToggle } from '../components/Generator/ProfessionalToggle';
import { BlueprintViewer } from '../components/Blueprint/BlueprintViewer';
import { FeedbackForm } from '../components/Feedback/FeedbackForm';
import { generateBlueprintWithAI } from '../utils/aiService';
import { BlueprintEngine } from '../utils/blueprintEngine';
import { exportBlueprintAsPDF, exportBlueprintAsSVG } from '../components/Blueprint/BlueprintExporter';
import { AlertCircle, CheckCircle, Download, FileJson, FileImage, Loader2, Zap } from 'lucide-react';

// Define types
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

const trackBlueprintGenerated = (type: string, country: string) => {
  console.log(`📊 Blueprint generated: ${type} in ${country}`);
};

const trackExport = (format: string) => {
  console.log(`📊 Export: ${format}`);
};

export function GeneratorPage() {
  const [step, setStep] = useState(1);
  const [buildingData, setBuildingData] = useState<any>(null);
  const [country, setCountry] = useState<string>('US');
  const [professionalMode, setProfessionalMode] = useState<boolean>(false);
  const [blueprint, setBlueprint] = useState<BlueprintSpec | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  
  // Refs for scrolling to blueprint
  const blueprintRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  
  // Professional customizations state
  const [professionalCustomizations, setProfessionalCustomizations] = useState({
    roomSizes: {},
    wallThickness: 6,
    ceilingHeight: 9,
    doorTypes: 'standard',
    windowTypes: 'standard',
    layoutStyle: 'open',
    floorPlan: 'single',
    roofType: 'gable',
    exteriorFinish: 'brick'
  });
  
  const handleBuildingSubmit = (data: any) => {
    console.log('📋 Building data received:', data);
    setBuildingData(data);
    if (!professionalMode) {
      handleGenerateWithData(data);
    }
  };
  
  const handleGenerateWithData = async (data: any, customizationsData?: any) => {
    setIsGenerating(true);
    setWarnings([]);
    setApiError(null);
    
    try {
      const finalCustomizations = professionalMode ? professionalCustomizations : customizationsData;
      
      const aiSpec = await generateBlueprintWithAI(
        data.buildingType,
        country,
        professionalMode,
        data.roomCount,
        data.landSize,
        data.description,
        data.guestToilet,
        finalCustomizations
      );
      
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
      trackBlueprintGenerated(data.buildingType, country);
      setStep(3);
      
      // 🔥 AUTO-SCROLL TO BLUEPRINT AFTER GENERATION
      setTimeout(() => {
        if (blueprintRef.current) {
          blueprintRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 500);
      
    } catch (error: any) {
      console.error('❌ Generation failed:', error);
      setApiError(error.message || 'Failed to generate blueprint.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleGenerateClick = () => {
    if (buildingData) {
      handleGenerateWithData(buildingData, professionalCustomizations);
    }
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
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex-1 min-w-0">
              <h1 className="text-sm sm:text-xl md:text-2xl font-bold text-gray-900 truncate">🏗️ Blueprint Pro</h1>
              <p className="text-xs sm:text-sm text-gray-500 hidden xs:block">AI-Powered Architectural Plans</p>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
              <span className="text-[10px] sm:text-xs bg-green-100 text-green-800 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full truncate max-w-[80px] sm:max-w-none">
                {buildingData?.buildingType ? '✅ Configured' : 'Ready'}
              </span>
              <ProfessionalToggle 
                isProfessional={professionalMode} 
                onChange={setProfessionalMode}
                isInline={true}
              />
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
          {/* Left Column - Form */}
          <div className="w-full lg:w-1/3 space-y-4 sm:space-y-6" ref={formRef}>
            {/* Main Building Form */}
            <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 md:p-6 shadow-sm">
              <AdvancedBuildingForm 
                onSubmit={handleBuildingSubmit}
                professionalMode={professionalMode}
                professionalCustomizations={professionalCustomizations}
                onProfessionalChange={setProfessionalCustomizations}
              />
            </div>
            
            {/* Generate Button - Shown after form is filled */}
            {buildingData && (
              <button
                onClick={handleGenerateClick}
                disabled={isGenerating}
                className="w-full py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-sm sm:text-base md:text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    <span>Generating Blueprint...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Generate Blueprint</span>
                  </>
                )}
              </button>
            )}
            
            {/* Export Options - After generation */}
            {step === 3 && blueprint && (
              <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 md:p-6 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-3 sm:mb-4 text-sm sm:text-base">Export Options</h3>
                <div className="space-y-2 sm:space-y-3">
                  <button
                    onClick={handleExportPDF}
                    className="w-full py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg font-medium text-sm sm:text-base hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF</span>
                  </button>
                  <button
                    onClick={handleExportSVG}
                    className="w-full py-2.5 sm:py-3 bg-gray-100 text-gray-800 rounded-lg font-medium text-sm sm:text-base hover:bg-gray-200 transition-colors border border-gray-300 flex items-center justify-center space-x-2"
                  >
                    <FileImage className="w-4 h-4" />
                    <span>Download SVG</span>
                  </button>
                  <button
                    onClick={handleCopyJSON}
                    className="w-full py-2.5 sm:py-3 bg-gray-100 text-gray-800 rounded-lg font-medium text-sm sm:text-base hover:bg-gray-200 transition-colors border border-gray-300 flex items-center justify-center space-x-2"
                  >
                    <FileJson className="w-4 h-4" />
                    <span>Copy JSON</span>
                  </button>
                </div>
                
                <button
                  onClick={() => {
                    setStep(1);
                    setBlueprint(null);
                    setBuildingData(null);
                  }}
                  className="w-full mt-3 py-2.5 sm:py-3 bg-gray-100 text-gray-800 rounded-lg font-medium text-sm sm:text-base hover:bg-gray-200 transition-colors"
                >
                  Start New Project
                </button>
              </div>
            )}
            
            <FeedbackForm />
          </div>
          
          {/* Right Column - Blueprint Display */}
          <div className="w-full lg:w-2/3 space-y-4 sm:space-y-6">
            {/* Scroll target ref for blueprint */}
            <div ref={blueprintRef} className="scroll-mt-20">
              {apiError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-800 text-sm">Error</h4>
                      <p className="text-xs sm:text-sm text-red-700 mt-1">{apiError}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {warnings.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800 text-sm">Layout Warnings</h4>
                      <ul className="mt-1 text-xs sm:text-sm text-yellow-700 space-y-0.5">
                        {warnings.slice(0, 3).map((warning, index) => (
                          <li key={index}>• {warning}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              
              {isGenerating ? (
                <div className="bg-white rounded-xl border border-gray-200 p-8 sm:p-12 text-center">
                  <Loader2 className="w-12 h-12 sm:w-16 sm:h-16 text-blue-600 animate-spin mx-auto mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800">Generating Your Blueprint...</h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-2">AI is creating your professional architectural plan.</p>
                </div>
              ) : blueprint ? (
                <BlueprintViewer blueprint={blueprint} onExportPDF={handleExportPDF} />
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 p-8 sm:p-12 text-center">
                  <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <div className="text-3xl sm:text-4xl">🏗️</div>
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 mb-2">Ready to Create Your Blueprint</h3>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 max-w-md mx-auto">
                    Fill out the form to generate your professional architectural blueprint.
                  </p>
                  {professionalMode && (
                    <div className="mt-4 p-3 sm:p-4 bg-blue-50 rounded-lg">
                      <p className="text-xs sm:text-sm text-blue-800">
                        <strong>Professional Mode Active:</strong> Customize room sizes, layout, and structural details in the form above.
                      </p>
                    </div>
                  )}
                  {!professionalMode && (
                    <div className="mt-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs sm:text-sm text-gray-600">
                        💡 Toggle <strong>"Pro"</strong> mode in the top-right for advanced customization.
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {blueprint && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 mt-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-800 text-sm">Blueprint Generated Successfully!</h4>
                      <p className="mt-1 text-xs sm:text-sm text-green-700">
                        {buildingData?.buildingType?.toUpperCase()} • {blueprint.totalArea.toFixed(0)} sq ft • {blueprint.rooms.length} rooms
                      </p>
                      <p className="mt-1 text-xs text-green-600">
                        📱 Scroll down to view the full blueprint. Pinch to zoom on mobile.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <footer className="mt-8 sm:mt-12 border-t border-gray-200 bg-white py-4 sm:py-6">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 text-center">
          <p className="text-xs sm:text-sm text-gray-600">Blueprint Generator Pro • Powered by AI</p>
        </div>
      </footer>
    </div>
  );
}