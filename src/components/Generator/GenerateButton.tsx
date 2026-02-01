import { Zap, Loader2 } from 'lucide-react';

interface GenerateButtonProps {
  isLoading: boolean;
  onClick: () => void;
  disabled: boolean;
}

export const GenerateButton = ({ isLoading, onClick, disabled }: GenerateButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all ${
        disabled
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-200'
      }`}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          Generating Blueprint...
        </div>
      ) : (
        <div className="flex items-center justify-center">
          <Zap className="w-5 h-5 mr-2" />
          Generate Blueprint
        </div>
      )}
    </button>
  );
};