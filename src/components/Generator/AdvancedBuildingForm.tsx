import { useState } from 'react';
import { buildingTypes } from '../../config/buildingTypes';
import { Home, Plus, Minus, MapPin, Bath, MessageSquare, Ruler } from 'lucide-react';

interface AdvancedBuildingFormProps {
  onSubmit: (data: any) => void;
}

export const AdvancedBuildingForm = ({ onSubmit }: AdvancedBuildingFormProps) => {
  const [formData, setFormData] = useState({
    buildingType: 'bungalow',
    bedrooms: 3,
    guestToilet: { hasGuestToilet: false, count: 1 },
    landSize: { width: 50, depth: 60, unit: 'feet' },
    description: ''
  });

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

  const handleSubmit = () => {
    onSubmit(formData);
  };

  const totalRooms = formData.bedrooms * 2 + 2 + (formData.guestToilet.hasGuestToilet ? 1 : 0);
  const landArea = formData.landSize.width * formData.landSize.depth;

  return (
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
            <p className="text-xs text-gray-500 mt-3">
              Guest toilets are powder rooms accessible from living areas
            </p>
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
          rows={5}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          placeholder="Example: Modern open-concept home with large windows for natural light. Prefer an L-shaped layout with the master bedroom separated from other bedrooms. Need a home office space and large kitchen island. Outdoor patio for entertaining..."
        />
        <p className="text-xs text-gray-500 mt-2">
          Be specific about your preferences: layout style, special rooms, architectural features
        </p>
      </div>

      {/* Summary */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
        <h4 className="font-semibold text-gray-800 mb-2">Project Summary</h4>
        <div className="space-y-1 text-sm">
          <p>🏠 Type: {formData.buildingType}</p>
          <p>🛏️ Bedrooms: {formData.bedrooms} (each with bathroom)</p>
          <p>🚽 Guest Toilet: {formData.guestToilet.hasGuestToilet ? `${formData.guestToilet.count} unit(s)` : 'None'}</p>
          <p>📏 Land: {formData.landSize.width}ft x {formData.landSize.depth}ft = {landArea} sq ft</p>
          <p>🚪 Total Rooms: {totalRooms}</p>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-lg hover:shadow-lg transition-all"
      >
        Generate Blueprint with AI
      </button>
    </div>
  );
};