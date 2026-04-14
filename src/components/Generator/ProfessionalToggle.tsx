import { Settings, Zap } from 'lucide-react';

interface ProfessionalToggleProps {
  isProfessional: boolean;
  onChange: (value: boolean) => void;
}

export const ProfessionalToggle = ({ isProfessional, onChange }: ProfessionalToggleProps) => {
  return (
    <div className="mb-8 p-6 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-gray-100">
            <Zap className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Default Mode</h3>
            <p className="text-sm text-gray-500">AI determines optimal room sizes based on standards</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className={`text-sm ${!isProfessional ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
            Default
          </span>
          <button
            onClick={() => onChange(!isProfessional)}
            className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
              isProfessional ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                isProfessional ? 'translate-x-8' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-sm ${isProfessional ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
            Professional
          </span>
        </div>
        
        <div className="flex items-center space-x-3 text-right">
          <div className="p-2 rounded-lg bg-blue-100">
            <Settings className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Professional Mode</h3>
            <p className="text-sm text-gray-500">Manually edit room sizes and layout</p>
          </div>
        </div>
      </div>
      
      {isProfessional && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Professional Mode Active:</strong> You can now customize individual room dimensions after generation.
          </p>
        </div>
      )}
    </div>
  );
};