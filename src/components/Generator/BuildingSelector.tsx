import { buildingTypes } from '../../config/buildingTypes';

interface BuildingSelectorProps {
  selectedType: string;
  onChange: (type: string) => void;
}

export const BuildingSelector = ({ selectedType, onChange }: BuildingSelectorProps) => {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Select Building Type</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {buildingTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => onChange(type.id)}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedType === type.id
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
            }`}
          >
            <div className="text-2xl mb-2">{type.icon}</div>
            <div className="font-medium text-gray-800">{type.name}</div>
            <div className="text-sm text-gray-500 mt-1">{type.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
};