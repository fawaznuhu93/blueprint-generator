import { countries } from '../../config/countries';

interface CountrySelectorProps {
  selectedCountry: string;
  onChange: (country: string) => void;
}

export const CountrySelector = ({ selectedCountry, onChange }: CountrySelectorProps) => {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Select Country</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {countries.map((country) => (
          <button
            key={country.code}
            onClick={() => onChange(country.code)}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedCountry === country.code
                ? 'border-green-600 bg-green-50'
                : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
            }`}
          >
            <div className="font-medium text-gray-800">{country.name}</div>
            <div className="text-sm text-gray-500 mt-1">
              Units: {country.unit}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};