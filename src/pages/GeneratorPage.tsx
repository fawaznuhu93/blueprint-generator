import { useState } from 'react';
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
  
  // Professional customizations state - fully integrated
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
  };
  
  const handleGenerateClick = async () => {
    if (!buildingData) return;
    
    setIsGenerating(true);
    setWarnings([]);
    setApiError(null);
    
    try {
      const finalCustomizations = professionalMode ? professionalCustomizations : null;
      
      const aiSpec = await generateBlueprintWithAI(
        buildingData.buildingType,
        country,
        professionalMode,
        buildingData.roomCount,
        buildingData.landSize,
        buildingData.description,
        buildingData.guestToilet,
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
      trackBlueprintGenerated(buildingData.buildingType, country);
      setStep(3);
      
    } catch (error: any) {
      console.error('❌ Generation failed:', error);
      setApiError(error.message || 'Failed to generate blueprint.');
    } finally {
      setIsGenerating(false);
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
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">🏗️ Blueprint Generator Pro</h1>
              <p className="text-xs sm:text-sm text-gray-500">AI-Powered Architectural Plans</p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full">
                {buildingData?.buildingType ? 'Project Configured' : 'Ready to Start'}
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
      
      <main className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Left Column - Form */}
          <div className="w-full lg:w-1/3 space-y-6">
            {/* Main Building Form - FULLY INTEGRATED with professional mode */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
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
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating Blueprint...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Generate Blueprint</span>
                  </>
                )}
              </button>
            )}
            
            {/* Export Options - After generation */}
            {step === 3 && blueprint && (
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
                
                <button
                  onClick={() => {
                    setStep(1);
                    setBlueprint(null);
                    setBuildingData(null);
                  }}
                  className="w-full mt-3 py-3 bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Start New Project
                </button>
              </div>
            )}
            
            <FeedbackForm />
          </div>
          
          {/* Right Column - Blueprint Display */}
          <div className="w-full lg:w-2/3 space-y-6">
            {apiError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-red-800">Error</h4>
                    <p className="text-sm text-red-700 mt-1">{apiError}</p>
                  </div>
                </div>
              </div>
            )}
            
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
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            {isGenerating ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800">Generating Your Blueprint...</h3>
                <p className="text-sm text-gray-500 mt-2">AI is creating your professional architectural plan.</p>
              </div>
            ) : blueprint ? (
              <BlueprintViewer blueprint={blueprint} onExportPDF={handleExportPDF} />
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <div className="text-4xl">🏗️</div>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Ready to Create Your Blueprint</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Fill out the form on the left to generate your professional architectural blueprint.
                </p>
                {professionalMode && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Professional Mode Active:</strong> Additional tabs for Room Sizes, Layout, Structural, and Exterior are available in the form above.
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
                    <p className="mt-1 text-sm text-green-700">
                      {buildingData?.buildingType?.toUpperCase()} • {blueprint.totalArea.toFixed(0)} sq ft • {blueprint.rooms.length} rooms
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
          <p className="text-sm text-gray-600">Blueprint Generator Pro • Powered by AI</p>
        </div>
      </footer>
    </div>
  );
}