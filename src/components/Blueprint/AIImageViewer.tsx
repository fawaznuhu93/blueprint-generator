import { useState, useEffect } from 'react';
import { Download, RefreshCw, Loader2, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface AIImageViewerProps {
  buildingData: any;
  country: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const AIImageViewer = ({ buildingData, country }: AIImageViewerProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [usedMethod, setUsedMethod] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateImage = async () => {
    if (!buildingData) return;

    setIsLoading(true);
    setError(null);
    setImageUrl(null);

    try {
      console.log('🖼️ Requesting AI image...');

      const response = await fetch(`${API_URL}/api/generate-blueprint-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buildingData, country })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Image generation failed');
      }

      const result = await response.json();

      if (result.imageBase64) {
        setImageUrl(result.imageBase64);
      } else if (result.imageUrl) {
        setImageUrl(result.imageUrl);
      } else {
        throw new Error('No image in response');
      }

      setUsedMethod(result.method || 'unknown');
      console.log(`✅ Image received via: ${result.method}`);

    } catch (err: any) {
      console.error('❌ Image failed:', err);
      setError(err.message || 'Image generation failed');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (buildingData) generateImage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildingData, country]);

  const handleDownload = () => {
    if (!imageUrl) return;
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `blueprint-${buildingData?.buildingType || 'plan'}-${Date.now()}.png`;
    a.click();
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 to-indigo-700 text-white p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm sm:text-base flex items-center">
            <ImageIcon className="w-4 h-4 mr-2" />
            AI-Generated Blueprint
          </h3>
          <p className="text-xs text-purple-200 truncate">
            {buildingData?.buildingType || 'Building'} • {country}
            {usedMethod && ` • ${usedMethod}`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={generateImage}
            disabled={isLoading}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg disabled:opacity-50 transition-colors"
            title="Regenerate"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleDownload}
            disabled={!imageUrl}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg disabled:opacity-50 transition-colors"
            title="Download PNG"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 bg-gray-900">
        <div className="bg-gray-800 rounded-lg flex items-center justify-center overflow-auto" style={{ minHeight: '600px' }}>
          {isLoading && (
            <div className="text-center py-20">
              <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
              <p className="text-sm text-purple-200">AI is drawing your blueprint...</p>
              <p className="text-xs text-gray-400 mt-1">This may take 20-60 seconds</p>
            </div>
          )}

          {error && !isLoading && (
            <div className="text-center py-20 px-4 max-w-md">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-400 mb-4 text-sm">{error}</p>
              <button
                onClick={generateImage}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {imageUrl && !isLoading && !error && (
            <img
              src={imageUrl}
              alt="AI-generated blueprint"
              className="max-w-full h-auto rounded-lg"
              style={{ maxWidth: '100%', maxHeight: '800px' }}
            />
          )}
        </div>

        <div className="mt-4 p-3 bg-purple-900/30 rounded-lg border border-purple-700">
          <p className="text-xs text-purple-200">
            <strong>AI-Generated:</strong> Drawn directly by AI image generation.
            {usedMethod && ` Path: ${usedMethod}.`}
          </p>
        </div>
      </div>
    </div>
  );
};