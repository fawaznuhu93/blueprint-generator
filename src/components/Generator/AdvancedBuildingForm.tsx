import { useState } from 'react';
import { buildingTypes } from '../../config/buildingTypes';
import { Home, Plus, Minus, Bath, MessageSquare, Ruler, Settings, Grid, Waves, RotateCcw, Zap, Mountain } from 'lucide-react';

interface AdvancedBuildingFormProps {
  onSubmit: (data: any) => void;
  professionalMode?: boolean;
  professionalCustomizations?: any;
  onProfessionalChange?: (customizations: any) => void;
}

export const AdvancedBuildingForm = ({ 
  onSubmit, 
  professionalMode = false,
  professionalCustomizations = {},
  onProfessionalChange 
}: AdvancedBuildingFormProps) => {
  const [formData, setFormData] = useState({
    buildingType: 'bungalow',
    bedrooms: 3,
    guestToilet: { hasGuestToilet: false, count: 1 },
    landSize: { width: 50, depth: 60, unit: 'feet' },
    description: '',
    soilType: 'not-sure'
  });

  const [activeTab, setActiveTab] = useState('basic');

  // Soil types with descriptions
  const soilTypes = [
    { 
      id: 'sandy', 
      name: 'Sandy Soil', 
      icon: '🏖️',
      description: 'Light, coarse, and drains water quickly. Low in nutrients.',
      foundationAdvice: 'Requires deeper foundations (4-6 ft). Excellent drainage but may shift. Consider pile or raft foundation.',
      color: 'bg-amber-100',
      borderColor: 'border-amber-400'
    },
    { 
      id: 'clay', 
      name: 'Clay Soil', 
      icon: '🧱',
      description: 'Heavy, fine particles. Holds water well but drains poorly. Expands when wet, shrinks when dry.',
      foundationAdvice: 'Requires reinforced foundations (deep strip or raft). Critical to dig below active zone (min 4 ft).',
      color: 'bg-orange-100',
      borderColor: 'border-orange-400'
    },
    { 
      id: 'silt', 
      name: 'Silt Soil', 
      icon: '🌾',
      description: 'Smooth and fertile. Retains moisture better than sand. Moderate drainage.',
      foundationAdvice: 'Good bearing capacity. Standard foundations work well (3-4 ft depth).',
      color: 'bg-yellow-100',
      borderColor: 'border-yellow-400'
    },
    { 
      id: 'loamy', 
      name: 'Loamy Soil', 
      icon: '🌱',
      description: 'Perfect mixture of sand, silt, and clay. Very fertile and ideal for construction.',
      foundationAdvice: 'Excellent for building. Standard shallow foundations (2.5-3.5 ft) are sufficient.',
      color: 'bg-green-100',
      borderColor: 'border-green-400'
    },
    { 
      id: 'peaty', 
      name: 'Peaty Soil', 
      icon: '🥔',
      description: 'Rich in organic matter. Dark color. Retains a lot of moisture. Compressible.',
      foundationAdvice: '⚠️ Challenging. Requires soil improvement or deep piles (6-10 ft). Professional geotech survey recommended.',
      color: 'bg-brown-100',
      borderColor: 'border-amber-700'
    },
    { 
      id: 'chalky', 
      name: 'Chalky Soil', 
      icon: '🪨',
      description: 'Alkaline and stony. Often free-draining but low in nutrients.',
      foundationAdvice: 'Generally stable. Standard foundations (3-4 ft) work. Watch for hollows/fissures.',
      color: 'bg-gray-100',
      borderColor: 'border-gray-400'
    },
    { 
      id: 'rocky', 
      name: 'Rocky Soil', 
      icon: '⛰️',
      description: 'Hard, rocky terrain. Excellent load-bearing capacity but difficult to excavate.',
      foundationAdvice: 'Excellent bearing capacity. Shallow foundations (1-2 ft) often sufficient. Blasting/excavation costs higher.',
      color: 'bg-slate-100',
      borderColor: 'border-slate-400'
    },
    { 
      id: 'laterite', 
      name: 'Laterite Soil', 
      icon: '🟤',
      description: 'Reddish, iron-rich soil. Hardens when exposed to air. Common in tropical regions.',
      foundationAdvice: 'Good bearing capacity when dry. Standard foundations (3-4 ft) work well. Avoid rainy season construction.',
      color: 'bg-red-100',
      borderColor: 'border-red-400'
    },
    { 
      id: 'not-sure', 
      name: 'Not Sure Yet', 
      icon: '❓',
      description: 'Unsure about your soil type. We\'ll use standard recommendations.',
      foundationAdvice: 'Using conservative estimates. Recommend professional soil test before construction.',
      color: 'bg-gray-50',
      borderColor: 'border-gray-300'
    }
  ];

  const updateBedrooms = (delta: number) => {
    setFormData(prev => ({
      ...prev,
      bedrooms: Math.max(1, Math.min(10, prev.bedrooms + delta))
    }));
  };

  const updateGuestToiletCount = (delta: number) => {
    setFormData(prev => ({
      ...prev,
      guestToilet: {
        ...prev.guestToilet,
        count: Math.max(1, Math.min(3, prev.guestToilet.count + delta))
      }
    }));
  };

  // NEW: Update land size with increment/decrement
  const updateLandSize = (dimension: 'width' | 'depth', delta: number) => {
    setFormData(prev => ({
      ...prev,
      landSize: {
        ...prev.landSize,
        [dimension]: Math.max(10, Math.min(200, prev.landSize[dimension] + delta))
      }
    }));
  };

  // NEW: Direct set for land size (from input)
  const setLandSize = (dimension: 'width' | 'depth', value: number) => {
    setFormData(prev => ({
      ...prev,
      landSize: {
        ...prev.landSize,
        [dimension]: Math.max(10, Math.min(200, value))
      }
    }));
  };

  const updateRoomDimension = (roomType: string, dimension: 'width' | 'depth', value: number) => {
    if (!onProfessionalChange) return;
    onProfessionalChange({
      ...professionalCustomizations,
      roomSizes: {
        ...professionalCustomizations.roomSizes,
        [roomType]: {
          ...professionalCustomizations.roomSizes?.[roomType],
          [dimension]: Math.max(5, Math.min(50, value))
        }
      }
    });
  };

  const updateProfessionalSetting = (key: string, value: any) => {
    if (!onProfessionalChange) return;
    onProfessionalChange({
      ...professionalCustomizations,
      [key]: value
    });
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  const totalRooms = formData.bedrooms * 2 + 2 + (formData.guestToilet.hasGuestToilet ? 1 : 0);
  const landArea = formData.landSize.width * formData.landSize.depth;

  const currentSoil = soilTypes.find(s => s.id === formData.soilType) || soilTypes[8];

  return (
    <div className="space-y-6">
      {/* Professional Mode Indicator at top */}
      {professionalMode && (
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2">
            <Settings className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Professional Mode Active</span>
          </div>
          <span className="text-xs text-blue-600">Additional customization tabs available below</span>
        </div>
      )}

      {/* Tab Navigation - ONLY visible in Professional Mode */}
      {professionalMode && (
        <div className="flex flex-wrap border-b border-gray-200">
          <button
            onClick={() => setActiveTab('basic')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'basic' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Home className="w-4 h-4 inline mr-2" />
            Basic Info
          </button>
          <button
            onClick={() => setActiveTab('rooms')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'rooms' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Ruler className="w-4 h-4 inline mr-2" />
            Room Sizes
          </button>
          <button
            onClick={() => setActiveTab('layout')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'layout' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Grid className="w-4 h-4 inline mr-2" />
            Layout
          </button>
          <button
            onClick={() => setActiveTab('structural')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'structural' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Settings className="w-4 h-4 inline mr-2" />
            Structural
          </button>
          <button
            onClick={() => setActiveTab('exterior')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'exterior' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Waves className="w-4 h-4 inline mr-2" />
            Exterior
          </button>
        </div>
      )}

      {/* BASIC INFO TAB - Always visible */}
      {(activeTab === 'basic' || !professionalMode) && (
        <div className="space-y-6">
          {/* Building Type Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Home className="w-5 h-5 mr-2 text-blue-600" />
              Select Building Type
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {buildingTypes.slice(0, 6).map((type) => (
                <button
                  key={type.id}
                  onClick={() => setFormData(prev => ({ ...prev, buildingType: type.id }))}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    formData.buildingType === type.id
                      ? 'border-blue-600 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-2xl mb-2">{type.icon}</div>
                  <div className="font-semibold text-gray-800 text-sm">{type.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{type.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* SOIL TYPE SELECTION */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Mountain className="w-5 h-5 mr-2 text-blue-600" />
              Soil Type
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {soilTypes.map((soil) => (
                <button
                  key={soil.id}
                  onClick={() => setFormData(prev => ({ ...prev, soilType: soil.id }))}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    formData.soilType === soil.id
                      ? `${soil.borderColor} bg-blue-50 shadow-md border-2`
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  } ${soil.color}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">{soil.icon}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800 text-sm">{soil.name}</div>
                      <div className="text-xs text-gray-600 mt-1 line-clamp-2">{soil.description}</div>
                    </div>
                    {formData.soilType === soil.id && (
                      <div className="text-blue-600 text-lg">✓</div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Soil Description and Foundation Advice */}
            <div className={`p-4 rounded-xl border-2 ${currentSoil.borderColor} ${currentSoil.color} mt-2`}>
              <div className="flex items-start space-x-3">
                <div className="text-2xl">{currentSoil.icon}</div>
                <div className="flex-1">
                  <div className="font-bold text-gray-800">{currentSoil.name}</div>
                  <p className="text-sm text-gray-700 mt-1">{currentSoil.description}</p>
                  <div className="mt-3 pt-2 border-t border-gray-300">
                    <div className="flex items-start space-x-2">
                      <span className="text-sm font-semibold text-gray-800">🏗️ Foundation Advice:</span>
                      <span className="text-sm text-gray-700">{currentSoil.foundationAdvice}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bedrooms */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Bath className="w-5 h-5 mr-2 text-blue-600" />
              Bedrooms (Each with attached bathroom)
            </h3>
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Number of Bedrooms</span>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => updateBedrooms(-1)}
                    className="w-10 h-10 bg-white rounded-lg border border-gray-300 hover:bg-gray-100 flex items-center justify-center"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="font-bold text-2xl w-12 text-center">{formData.bedrooms}</span>
                  <button
                    onClick={() => updateBedrooms(1)}
                    className="w-10 h-10 bg-white rounded-lg border border-gray-300 hover:bg-gray-100 flex items-center justify-center"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Each bedroom includes an attached bathroom with shower, toilet, and sink
              </p>
            </div>
          </div>

          {/* Guest Toilet */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <Bath className="w-5 h-5 mr-2 text-blue-600" />
                Guest Toilet
              </h3>
              <button
                onClick={() => setFormData(prev => ({
                  ...prev,
                  guestToilet: { ...prev.guestToilet, hasGuestToilet: !prev.guestToilet.hasGuestToilet }
                }))}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  formData.guestToilet.hasGuestToilet
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {formData.guestToilet.hasGuestToilet ? '✓ Included' : '+ Add Guest Toilet'}
              </button>
            </div>

            {formData.guestToilet.hasGuestToilet && (
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Number of Guest Toilets</span>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => updateGuestToiletCount(-1)}
                      className="w-10 h-10 bg-white rounded-lg border border-gray-300 hover:bg-gray-100 flex items-center justify-center"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="font-bold text-2xl w-12 text-center">{formData.guestToilet.count}</span>
                    <button
                      onClick={() => updateGuestToiletCount(1)}
                      className="w-10 h-10 bg-white rounded-lg border border-gray-300 hover:bg-gray-100 flex items-center justify-center"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* LAND SIZE - WITH + AND - BUTTONS */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Ruler className="w-5 h-5 mr-2 text-blue-600" />
              Land Size
            </h3>
            
            {/* Width Control */}
            <div className="mb-4 p-4 bg-gray-50 rounded-xl">
              <label className="block text-sm font-medium text-gray-700 mb-3">Width</label>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => updateLandSize('width', -5)}
                  className="w-12 h-12 bg-white rounded-xl border border-gray-300 hover:bg-gray-100 flex items-center justify-center transition-colors shadow-sm"
                  aria-label="Decrease width by 5"
                >
                  <Minus className="w-5 h-5 text-gray-600" />
                </button>
                
                <div className="flex-1 flex items-center space-x-4">
                  <input
                    type="number"
                    value={formData.landSize.width}
                    onChange={(e) => setLandSize('width', parseInt(e.target.value) || 50)}
                    className="w-full px-4 py-3 text-center text-xl font-bold border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="10"
                    max="200"
                  />
                  <span className="text-sm font-semibold text-gray-600 min-w-[40px]">ft</span>
                </div>
                
                <button
                  onClick={() => updateLandSize('width', 5)}
                  className="w-12 h-12 bg-white rounded-xl border border-gray-300 hover:bg-gray-100 flex items-center justify-center transition-colors shadow-sm"
                  aria-label="Increase width by 5"
                >
                  <Plus className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>Min: 10 ft</span>
                <span>Max: 200 ft</span>
                <span>Current: {formData.landSize.width} ft</span>
              </div>
            </div>

            {/* Depth Control */}
            <div className="p-4 bg-gray-50 rounded-xl">
              <label className="block text-sm font-medium text-gray-700 mb-3">Depth</label>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => updateLandSize('depth', -5)}
                  className="w-12 h-12 bg-white rounded-xl border border-gray-300 hover:bg-gray-100 flex items-center justify-center transition-colors shadow-sm"
                  aria-label="Decrease depth by 5"
                >
                  <Minus className="w-5 h-5 text-gray-600" />
                </button>
                
                <div className="flex-1 flex items-center space-x-4">
                  <input
                    type="number"
                    value={formData.landSize.depth}
                    onChange={(e) => setLandSize('depth', parseInt(e.target.value) || 60)}
                    className="w-full px-4 py-3 text-center text-xl font-bold border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="10"
                    max="200"
                  />
                  <span className="text-sm font-semibold text-gray-600 min-w-[40px]">ft</span>
                </div>
                
                <button
                  onClick={() => updateLandSize('depth', 5)}
                  className="w-12 h-12 bg-white rounded-xl border border-gray-300 hover:bg-gray-100 flex items-center justify-center transition-colors shadow-sm"
                  aria-label="Increase depth by 5"
                >
                  <Plus className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>Min: 10 ft</span>
                <span>Max: 200 ft</span>
                <span>Current: {formData.landSize.depth} ft</span>
              </div>
            </div>

            {/* Land Area Display */}
            <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-blue-800">Total Land Area:</span>
                <span className="text-lg font-bold text-blue-900">{landArea.toLocaleString()} sq ft</span>
              </div>
              <div className="text-xs text-blue-600 mt-1">
                {formData.landSize.width} ft × {formData.landSize.depth} ft
              </div>
            </div>
          </div>

          {/* Project Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-blue-600" />
              Describe Your Vision
            </h3>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Example: Modern open-concept home with large windows for natural light. Prefer an L-shaped layout with the master bedroom separated..."
            />
          </div>
        </div>
      )}

      {/* ROOM SIZES TAB - ONLY in Professional Mode */}
      {professionalMode && activeTab === 'rooms' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-800">Customize Room Dimensions</h3>
            <button
              onClick={() => updateProfessionalSetting('roomSizes', {})}
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Reset All Rooms
            </button>
          </div>
          
          {/* Living Room */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold text-gray-800">Living Room</span>
              <span className="text-xs text-gray-500">Recommended: 16' x 20' (320 sq ft)</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-600 block mb-1">Width (ft)</label>
                <input
                  type="number"
                  value={professionalCustomizations?.roomSizes?.living?.width || 16}
                  onChange={(e) => updateRoomDimension('living', 'width', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  min="10"
                  max="40"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">Depth (ft)</label>
                <input
                  type="number"
                  value={professionalCustomizations?.roomSizes?.living?.depth || 20}
                  onChange={(e) => updateRoomDimension('living', 'depth', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  min="10"
                  max="40"
                />
              </div>
            </div>
          </div>

          {/* Kitchen */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold text-gray-800">Kitchen</span>
              <span className="text-xs text-gray-500">Recommended: 12' x 15' (180 sq ft)</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-600 block mb-1">Width (ft)</label>
                <input
                  type="number"
                  value={professionalCustomizations?.roomSizes?.kitchen?.width || 12}
                  onChange={(e) => updateRoomDimension('kitchen', 'width', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  min="8"
                  max="30"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">Depth (ft)</label>
                <input
                  type="number"
                  value={professionalCustomizations?.roomSizes?.kitchen?.depth || 15}
                  onChange={(e) => updateRoomDimension('kitchen', 'depth', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  min="8"
                  max="30"
                />
              </div>
            </div>
          </div>

          {/* Master Bedroom */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold text-gray-800">Master Bedroom</span>
              <span className="text-xs text-gray-500">Recommended: 14' x 16' (224 sq ft)</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-600 block mb-1">Width (ft)</label>
                <input
                  type="number"
                  value={professionalCustomizations?.roomSizes?.masterBedroom?.width || 14}
                  onChange={(e) => updateRoomDimension('masterBedroom', 'width', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  min="10"
                  max="30"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">Depth (ft)</label>
                <input
                  type="number"
                  value={professionalCustomizations?.roomSizes?.masterBedroom?.depth || 16}
                  onChange={(e) => updateRoomDimension('masterBedroom', 'depth', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  min="10"
                  max="30"
                />
              </div>
            </div>
          </div>

          {/* Standard Bedroom */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold text-gray-800">Standard Bedroom</span>
              <span className="text-xs text-gray-500">Recommended: 12' x 12' (144 sq ft)</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-600 block mb-1">Width (ft)</label>
                <input
                  type="number"
                  value={professionalCustomizations?.roomSizes?.bedroom?.width || 12}
                  onChange={(e) => updateRoomDimension('bedroom', 'width', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  min="8"
                  max="25"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">Depth (ft)</label>
                <input
                  type="number"
                  value={professionalCustomizations?.roomSizes?.bedroom?.depth || 12}
                  onChange={(e) => updateRoomDimension('bedroom', 'depth', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  min="8"
                  max="25"
                />
              </div>
            </div>
          </div>

          {/* Bathroom */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold text-gray-800">Bathroom</span>
              <span className="text-xs text-gray-500">Recommended: 8' x 10' (80 sq ft)</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-600 block mb-1">Width (ft)</label>
                <input
                  type="number"
                  value={professionalCustomizations?.roomSizes?.bathroom?.width || 8}
                  onChange={(e) => updateRoomDimension('bathroom', 'width', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  min="5"
                  max="20"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">Depth (ft)</label>
                <input
                  type="number"
                  value={professionalCustomizations?.roomSizes?.bathroom?.depth || 10}
                  onChange={(e) => updateRoomDimension('bathroom', 'depth', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  min="5"
                  max="20"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LAYOUT TAB - ONLY in Professional Mode */}
      {professionalMode && activeTab === 'layout' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Layout Style</label>
            <select
              value={professionalCustomizations?.layoutStyle || 'open'}
              onChange={(e) => updateProfessionalSetting('layoutStyle', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="open">Open - Connected spaces</option>
              <option value="closed">Closed - Separate rooms</option>
              <option value="split">Split - Divided wings</option>
              <option value="L-shaped">L-Shaped - Two wings at angle</option>
              <option value="U-shaped">U-Shaped - Courtyard style</option>
              <option value="courtyard">Courtyard - Central open space</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Open: Connected spaces | Closed: Separate rooms | Split: Divided wings
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Floor Plan</label>
            <select
              value={professionalCustomizations?.floorPlan || 'single'}
              onChange={(e) => updateProfessionalSetting('floorPlan', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="single">Single Story (Ranch)</option>
              <option value="two">Two Story</option>
              <option value="split">Split Level</option>
              <option value="multi">Multi-Level</option>
            </select>
          </div>
        </div>
      )}

      {/* STRUCTURAL TAB - ONLY in Professional Mode */}
      {professionalMode && activeTab === 'structural' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Wall Thickness (inches)</label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="4"
                max="12"
                value={professionalCustomizations?.wallThickness || 6}
                onChange={(e) => updateProfessionalSetting('wallThickness', parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg"
              />
              <span className="font-mono w-12 text-center">{professionalCustomizations?.wallThickness || 6}"</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Standard: 6" | Heavy: 8-12" for load-bearing</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ceiling Height (feet)</label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="8"
                max="14"
                value={professionalCustomizations?.ceilingHeight || 9}
                onChange={(e) => updateProfessionalSetting('ceilingHeight', parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg"
              />
              <span className="font-mono w-12 text-center">{professionalCustomizations?.ceilingHeight || 9}'</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Standard: 9' | Vaulted: 12-14' for grand rooms</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Door Type</label>
            <select
              value={professionalCustomizations?.doorTypes || 'standard'}
              onChange={(e) => updateProfessionalSetting('doorTypes', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="standard">Standard (36")</option>
              <option value="french">French Doors</option>
              <option value="sliding">Sliding Doors</option>
              <option value="pocket">Pocket Doors</option>
              <option value="barn">Barn Doors</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Window Type</label>
            <select
              value={professionalCustomizations?.windowTypes || 'standard'}
              onChange={(e) => updateProfessionalSetting('windowTypes', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="standard">Standard Double Hung</option>
              <option value="casement">Casement Windows</option>
              <option value="picture">Picture Windows</option>
              <option value="bay">Bay Windows</option>
              <option value="awning">Awning Windows</option>
            </select>
          </div>

          {/* Foundation advice based on soil type */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-semibold text-blue-800 mb-2">Foundation Recommendation</h4>
            <p className="text-sm text-blue-700">{currentSoil.foundationAdvice}</p>
            <p className="text-xs text-blue-600 mt-2">
              Based on selected soil type: {currentSoil.name}
            </p>
          </div>
        </div>
      )}

      {/* EXTERIOR TAB - ONLY in Professional Mode */}
      {professionalMode && activeTab === 'exterior' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Roof Type</label>
            <select
              value={professionalCustomizations?.roofType || 'gable'}
              onChange={(e) => updateProfessionalSetting('roofType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="gable">Gable - Classic A-frame</option>
              <option value="hip">Hip - Sloped on all sides</option>
              <option value="flat">Flat - Modern minimalist</option>
              <option value="shed">Shed - Single slope</option>
              <option value="gambrel">Gambrel - Barn style</option>
              <option value="mansard">Mansard - French style</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Exterior Finish</label>
            <select
              value={professionalCustomizations?.exteriorFinish || 'brick'}
              onChange={(e) => updateProfessionalSetting('exteriorFinish', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="brick">Brick - Traditional durable</option>
              <option value="wood">Wood - Natural warm look</option>
              <option value="stucco">Stucco - Mediterranean style</option>
              <option value="stone">Stone - Premium rustic</option>
              <option value="vinyl">Vinyl - Low maintenance</option>
              <option value="fiber">Fiber Cement - Modern durable</option>
            </select>
          </div>
        </div>
      )}

      {/* Summary Section */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
        <h4 className="font-semibold text-gray-800 mb-2">Project Summary</h4>
        <div className="space-y-1 text-sm">
          <p>🏠 Type: {formData.buildingType}</p>
          <p>🛏️ Bedrooms: {formData.bedrooms} (each with bathroom)</p>
          <p>🚽 Guest Toilet: {formData.guestToilet.hasGuestToilet ? `${formData.guestToilet.count} unit(s)` : 'None'}</p>
          <p>📏 Land: {formData.landSize.width}ft x {formData.landSize.depth}ft = {landArea.toLocaleString()} sq ft</p>
          <p>🌱 Soil: {currentSoil.name}</p>
          <p>🚪 Total Rooms: {totalRooms}</p>
          {professionalMode && (
            <p className="text-blue-600 text-xs mt-2 flex items-center">
              <Settings className="w-3 h-3 mr-1" />
              Professional Mode: Custom dimensions and settings will be applied
            </p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-lg hover:shadow-lg transition-all flex items-center justify-center space-x-2"
      >
        <Zap className="w-5 h-5" />
        <span>Continue to Generate</span>
      </button>
    </div>
  );
};