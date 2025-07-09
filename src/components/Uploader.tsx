'use client';

import { useState } from 'react';


interface MenuItem {
  title: string;
  description: string;
}

export default function Uploader() {
  const [file, setFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [imageStates, setImageStates] = useState<Record<number, { isGenerating: boolean; isFinding: boolean; generatedUrl: string | null; foundUrl: string | null; generateError: string | null; findError: string | null; }>>({});

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setMenuItems([]);
      setError('');
      setImageStates({});
    }
  };

  const handleTextExtract = async () => {
    if (!file) return;
    setIsExtracting(true);
    setError('');
    setMenuItems([]);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to extract text from image.');
      }
      setMenuItems(data.menuItems);
        } catch (err) {
      const error = err as Error;
      setError(error.message || 'An unknown error occurred during text extraction.');
    } finally {
      setIsExtracting(false);
    }
  };

    const handleImageSearch = async (item: MenuItem, index: number) => {
    setImageStates(prev => ({ ...prev, [index]: { ...prev[index], isFinding: true, findError: null } }));
    const prompt = `${item.title}`;
    try {
      const response = await fetch('/api/search-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to find image.');
      }
      setImageStates(prev => ({ ...prev, [index]: { ...prev[index], isFinding: false, foundUrl: data.imageUrl } }));
        } catch (err) {
      const error = err as Error;
      setImageStates(prev => ({ ...prev, [index]: { ...prev[index], isFinding: false, findError: error.message || 'Unknown error' } }));
    }
  };

  const handleImageGenerate = async (item: MenuItem, index: number) => {
    setImageStates(prev => ({ ...prev, [index]: { ...prev[index], isGenerating: true, generateError: null } }));
    const prompt = `${item.title}, ${item.description}`; // Combine title and description for a better prompt
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image.');
      }
      setImageStates(prev => ({ ...prev, [index]: { ...prev[index], isGenerating: false, generatedUrl: data.imageUrl } }));
        } catch (err) {
      const error = err as Error;
      setImageStates(prev => ({ ...prev, [index]: { ...prev[index], isGenerating: false, generateError: error.message || 'Unknown error' } }));
    }
  };

  return (
    <div className="w-full max-w-4xl text-center">
      <div className="mb-4">
        <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
        <label htmlFor="file-upload" className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
          {file ? file.name : 'Select a Menu Image'}
        </label>
      </div>

      <button onClick={handleTextExtract} disabled={!file || isExtracting} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">
        {isExtracting ? 'Extracting Text...' : 'Extract Text from Menu'}
      </button>

      {error && <p className="text-red-500 mt-4">Error: {error}</p>}

      {menuItems.length > 0 && (
        <div className="mt-8 p-4 bg-gray-800 rounded-lg text-left w-full">
          <h3 className="text-xl font-semibold mb-4">Identified Menu Items:</h3>
          <ul className="space-y-6">
            {menuItems.map((item, index) => (
              <li key={index} className="flex flex-col p-4 bg-gray-700 rounded-lg gap-4">
                {/* Menu item details */}
                <div>
                  <p className="font-semibold text-lg">{item.title}</p>
                  {item.description && <p className="text-sm text-gray-300 mt-1">{item.description}</p>}
                </div>

                {/* Actions: Buttons */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-end gap-4 pt-4 border-t border-gray-600">
                  <div className="flex gap-2 w-full md:w-auto flex-shrink-0">
                    <button onClick={() => handleImageSearch(item, index)} disabled={imageStates[index]?.isGenerating || imageStates[index]?.isFinding} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed flex-1">
                      Find on Web
                    </button>
                    <button onClick={() => handleImageGenerate(item, index)} disabled={imageStates[index]?.isGenerating || imageStates[index]?.isFinding} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed flex-1">
                      Generate using AI
                    </button>
                  </div>
                </div>

                {/* Bottom part: images */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  {/* Found Image Slot */}
                  <div>
                    {imageStates[index]?.foundUrl && <h4 className="text-sm font-semibold text-gray-300 mb-2 text-center">Found Image</h4>}
                    <div className="w-full h-24 bg-gray-600 rounded-md flex justify-center items-center overflow-hidden">
                       {imageStates[index]?.isFinding ? (
                         <span>Finding...</span>
                       ) : imageStates[index]?.foundUrl ? (
                        <img src={imageStates[index].foundUrl!} alt={`Found image for ${item.title}`} className="max-w-full max-h-full object-contain" />
                       ) : (
                         <span />
                       )}
                     </div>
                  </div>

                  {/* Generated Image Slot */}
                  <div>
                    {imageStates[index]?.generatedUrl && <h4 className="text-sm font-semibold text-gray-300 mb-2 text-center">Generated Image</h4>}
                    <div className="w-full h-24 bg-gray-600 rounded-md flex justify-center items-center overflow-hidden">
                       {imageStates[index]?.isGenerating ? (
                         <span>Generating...</span>
                       ) : imageStates[index]?.generatedUrl ? (
                        <img src={imageStates[index].generatedUrl!} alt={`Generated image for ${item.title}`} className="max-w-full max-h-full object-contain" />
                       ) : (
                         <span />
                       )}
                     </div>
                  </div>
                </div>
                                {(imageStates[index]?.findError || imageStates[index]?.generateError) && (
                  <div className="text-center p-2 text-red-400 text-sm mt-2">
                    {imageStates[index]?.findError && `Find Error: ${imageStates[index]?.findError}`}
                    {imageStates[index]?.generateError && `Generate Error: ${imageStates[index]?.generateError}`}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
