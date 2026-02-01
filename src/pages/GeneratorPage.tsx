import { useState } from 'react';
import { BuildingSelector } from '../components/Generator/BuildingSelector';
import { CountrySelector } from '../components/Generator/CountrySelector';
import { ProfessionalToggle } from '../components/Generator/ProfessionalToggle';
import { RoomCustomizer } from '../components/Generator/RoomCustomizer';
import { GenerateButton } from '../components/Generator/GenerateButton';
import { BlueprintViewer } from '../components/Blueprint/BlueprintViewer';
import { generateBlueprintWithAI } from '../utils/aiService';
import { BlueprintEngine } from '../utils/blueprintEngine';
import { trackBlueprintGenerated, trackExport } from '../utils/analytics';
import { exportBlueprintAsPDF, exportBlueprintAsSVG } from '../components/Blueprint/BlueprintExporter';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

// Define types inline
type RoomType = 'living' | 'kitchen' | 'bedroom' | 'bathroom' | 'office' | 'storage' | 'dining' | 'hallway' | 'storefront' | 'reception' | 'workspace' | 'meeting' | 'break';

interface Room {
  id: string;
  name: string;
  type: RoomType;
  width: number;
  depth: number;
  area: number;
  position: { x: number; y: number };
  color: string;
  doors: Array<{
    wall: 'north' | 'south' | 'east' | 'west';
    position: number;
    width: number;
  }>;
  windows: Array<{
    wall: 'north' | 'south' | 'east' | 'west';
    position: number;
    width: number;
  }>;
}

interface BlueprintSpec {
  buildingType: 'house' | 'shop' | 'office' | 'restaurant';
  country: string;
  totalArea: number;
  dimensions: { width: number; depth: number };
  rooms: Room[];
  layout: 'linear' | 'central' | 'clustered' | 'open';
  unit: 'feet' | 'meters';
  createdAt: string;
}

export const GeneratorPage = () => {
  const [buildingType, setBuildingType] = useState<string>('house');
  const [country, setCountry] = useState<string>('US');
  const [professionalMode, setProfessionalMode] = useState<boolean>(false);
  const [blueprint, setBlueprint] = useState<BlueprintSpec | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [warnings, setWarnings] = useState<string[]>([]);
  
  const handleGenerate = async () => {
    setIsGenerating(true);
    setWarnings([]);
    
    try {
      const aiSpec = await generateBlueprintWithAI(buildingType, country, professionalMode);
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
      trackBlueprintGenerated(buildingType, country);
      
    } catch (error) {
      console.error('Generation failed:', error);
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
    await exportBlueprintAsPDF('blueprint-canvas', `blueprint-${buildingType}-${Date.now()}`);
  };
  
  const handleExportSVG = () => {
    if (!blueprint) return;
    
    trackExport('svg');
    const svgContent = exportBlueprintAsSVG(blueprint);
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blueprint-${buildingType}-${Date.now()}.svg`;
    a.click();
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
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Blueprint Generator MVP</h1>
          <p className="text-gray-600 mt-2">
            Generate professional blueprints in seconds. Perfect for civil engineers and architects.
          </p>
        </div>
      </header>
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <BuildingSelector selectedType={buildingType} onChange={setBuildingType} />
            <CountrySelector selectedCountry={country} onChange={setCountry} />
            <ProfessionalToggle 
              isProfessional={professionalMode} 
              onChange={setProfessionalMode} 
            />
            
            {professionalMode && blueprint && (
              <RoomCustomizer 
                blueprint={blueprint}
                onRoomChange={handleRoomChange}
              />
            )}
            
            <GenerateButton 
              isLoading={isGenerating}
              onClick={handleGenerate}
              disabled={!buildingType || !country}
            />
            
            {warnings.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Layout Warnings</h4>
                    <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                      {warnings.map((warning, index) => (
                        <li key={index}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            {blueprint && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-green-800">Blueprint Generated Successfully!</h4>
                    <p className="mt-1 text-sm text-green-700">
                      Total area: {blueprint.totalArea.toFixed(1)} sq {blueprint.unit}. Based on {blueprint.country} standards.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-800">Country Standards Applied</h4>
                  <p className="mt-1 text-sm text-blue-700">
                    Room sizes are adjusted based on {country} building standards and minimum requirements.
                    Professional mode allows customization beyond these minimums.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-8">
            {blueprint ? (
              <>
                <BlueprintViewer 
                  blueprint={blueprint}
                  onExportPDF={handleExportPDF}
                />
                
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-800 mb-4">Export Options</h3>
                  <div className="space-y-3">
                    <button
                      onClick={handleExportPDF}
                      className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      Download as PDF (Print-Ready)
                    </button>
                    <button
                      onClick={handleExportSVG}
                      className="w-full py-3 bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-200 transition-colors border border-gray-300"
                    >
                      Download as SVG (Editable)
                    </button>
                    <button
                      onClick={handleCopyJSON}
                      className="w-full py-3 bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-200 transition-colors border border-gray-300"
                    >
                      Copy JSON Specification
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="text-2xl">🏗️</div>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">No Blueprint Generated</h3>
                <p className="text-gray-600 text-sm">
                  Select building type and country, then click "Generate Blueprint" to create your first plan.
                </p>
              </div>
            )}
            
            {blueprint && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  {blueprint.rooms.map(room => (
                    <div key={room.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: room.color }}
                        />
                        <span className="text-gray-700">{room.name}</span>
                      </div>
                      <span className="font-mono text-gray-900">
                        {room.width}×{room.depth}{blueprint.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <footer className="mt-12 border-t border-gray-200 bg-white py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-600">
            Blueprint Generator MVP v1.0.1 • Ready for Civil Engineer Testing
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Generated plans follow {country} architectural standards. Always consult with a professional engineer before construction.
          </p>
        </div>
      </footer>
    </div>
  );
};