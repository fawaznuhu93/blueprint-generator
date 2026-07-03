import { Zap } from 'lucide-react';

interface ProfessionalToggleProps {
  isProfessional: boolean;
  onChange: (value: boolean) => void;
  isInline?: boolean;
}

export const ProfessionalToggle = ({ 
  isProfessional, 
  onChange, 
  isInline = false
}: ProfessionalToggleProps) => {
  
  if (isInline) {
    return (
      <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-100 rounded-full shadow-sm">
        <span className={`text-xs font-medium transition-colors ${!isProfessional ? 'text-blue-600' : 'text-gray-500'}`}>
          Default
        </span>
        <button
          onClick={() => onChange(!isProfessional)}
          className={`relative inline-flex h-5 w-10 items-center rounded-full transition-all duration-300 ${
            isProfessional ? 'bg-blue-600' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-all duration-300 shadow-md ${
              isProfessional ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </button>
        <span className={`text-xs font-medium transition-colors ${isProfessional ? 'text-blue-600' : 'text-gray-500'}`}>
          Pro
        </span>
      </div>
    );
  }

  return (
    <div className="mb-8 p-6 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-gray-100">
            <Zap className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Default Mode</h3>
            <p className="text-sm text-gray-500">AI determines optimal room sizes and layout based on standards</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-sm text-blue-600 font-semibold">Default</span>
          <button
            onClick={() => onChange(true)}
            className="relative inline-flex h-7 w-14 items-center rounded-full bg-gray-300"
          >
            <span className="inline-block h-5 w-5 transform rounded-full bg-white translate-x-1" />
          </button>
          <span className="text-sm text-gray-400">Professional</span>
        </div>
      </div>
    </div>
  );
};