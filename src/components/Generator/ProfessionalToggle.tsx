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
          <div className={`p-2 rounded-lg ${isProfessional ? 'bg-blue-100' : 'bg-gray-100'}`}>
            {isProfessional ? (
              <Settings className="w-5 h-5 text-blue-600" />
            ) : (
              <Zap className="w-5 h-5 text-gray-600" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">
              {isProfessional ? 'Professional Mode' : 'Auto Mode'}
            </h3>
            <p className="text-sm text-gray-500">
              {isProfessional 
                ? 'Manually edit room sizes and layout' 
                : 'AI determines optimal room sizes based on standards'}
            </p>
          </div>
        </div>
        
        <button
          onClick={() => onChange(!isProfessional)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            isProfessional ? 'bg-blue-600' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isProfessional ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
      
      {isProfessional && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> In professional mode, you can customize room dimensions 
            after the AI generates the initial layout.
          </p>
        </div>
      )}
    </div>
  );
};