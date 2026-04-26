import { useState } from 'react';
import { buildingTypes } from '../../config/buildingTypes';
import { Home, Plus, Minus, Bath, MessageSquare, Ruler, Settings, Grid, Waves, RotateCcw, Zap } from 'lucide-react';

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
    description: ''
  });

  const [activeTab, setActiveTab] = useState('basic');

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

  const updateLandSize = (dimension: 'width' | 'depth', value: number) => {
    setFormData(prev => ({
      ...prev,
      landSize: {
        ...prev.landSize,
        [dimension]: Math.max(20, Math.min(200, value))
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

  const layoutStyles = ['open', 'closed', 'split', 'L-shaped', 'U-shaped', 'courtyard'];
  const floorPlans = ['single story', 'two story', 'split level', 'multi-level'];
  const roofTypes = ['gable', 'hip', 'flat', 'shed', 'gambrel', 'mansard'];
  const exteriorFinishes = ['brick', 'wood', 'stucco', 'stone', 'vinyl', 'fiber cement'];

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

          {/* Land Size */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Ruler className="w-5 h-5 mr-2 text-blue-600" />
              Land Size
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Width</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="20"
                    max="200"
                    value={formData.landSize.width}
                    onChange={(e) => updateLandSize('width', parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg"
                  />
                  <span className="font-mono w-16 text-right">{formData.landSize.width}ft</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Depth</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="20"
                    max="200"
                    value={formData.landSize.depth}
                    onChange={(e) => updateLandSize('depth', parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg"
                  />
                  <span className="font-mono w-16 text-right">{formData.landSize.depth}ft</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Total land area: {landArea} sq ft
            </p>
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
              {layoutStyles.map(style => (
                <option key={style} value={style}>{style.charAt(0).toUpperCase() + style.slice(1)}</option>
              ))}
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
              {floorPlans.map(plan => (
                <option key={plan} value={plan}>{plan.charAt(0).toUpperCase() + plan.slice(1)}</option>
              ))}
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
              {roofTypes.map(type => (
                <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Exterior Finish</label>
            <select
              value={professionalCustomizations?.exteriorFinish || 'brick'}
              onChange={(e) => updateProfessionalSetting('exteriorFinish', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              {exteriorFinishes.map(finish => (
                <option key={finish} value={finish}>{finish.charAt(0).toUpperCase() + finish.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Summary Section - Always visible */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
        <h4 className="font-semibold text-gray-800 mb-2">Project Summary</h4>
        <div className="space-y-1 text-sm">
          <p>🏠 Type: {formData.buildingType}</p>
          <p>🛏️ Bedrooms: {formData.bedrooms} (each with bathroom)</p>
          <p>🚽 Guest Toilet: {formData.guestToilet.hasGuestToilet ? `${formData.guestToilet.count} unit(s)` : 'None'}</p>
          <p>📏 Land: {formData.landSize.width}ft x {formData.landSize.depth}ft = {landArea} sq ft</p>
          <p>🚪 Total Rooms: {totalRooms}</p>
          {professionalMode && (
            <p className="text-blue-600 text-xs mt-2 flex items-center">
              <Settings className="w-3 h-3 mr-1" />
              Professional Mode: Custom dimensions and settings will be applied
            </p>
          )}
        </div>
      </div>

      {/* Submit Button - Always at the bottom of the form */}
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