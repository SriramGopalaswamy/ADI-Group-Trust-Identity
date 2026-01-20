import React, { useState, useRef } from 'react';
import { editImageWithGemini } from '../services/geminiService';
import CameraModal from './CameraModal';

const ProductAIStudio: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setGeneratedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = (base64Image: string) => {
    setSelectedImage(base64Image);
    setGeneratedImage(null);
    setShowCamera(false);
  };

  const handleGenerate = async () => {
    if (!selectedImage || !prompt) return;

    setLoading(true);
    setGeneratedImage(null);

    try {
      const result = await editImageWithGemini(selectedImage, prompt);
      setGeneratedImage(result);
    } catch (error) {
      alert("Failed to generate image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      {showCamera && (
        <CameraModal
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
          title="Take Product Photo"
        />
      )}

      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-indigo-900">AI Product Studio</h2>
          <p className="text-indigo-500/80 mt-1">Reimagine ADI Bharat packaging with AI.</p>
        </div>

        {/* Image Upload Area */}
        <div className="flex flex-col gap-3">
          <div 
            onClick={() => !selectedImage && fileInputRef.current?.click()}
            className={`
              relative w-full aspect-square sm:aspect-video rounded-xl border-2 border-dashed 
              flex flex-col items-center justify-center transition-all overflow-hidden group
              ${selectedImage ? 'border-transparent bg-gray-50' : 'border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer'}
            `}
          >
            {selectedImage ? (
              <>
                <img 
                  src={generatedImage || selectedImage} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
                {loading && (
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white backdrop-blur-sm">
                    <svg className="animate-spin h-8 w-8 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="font-medium animate-pulse">Gemini is creating...</span>
                  </div>
                )}
                {!loading && generatedImage && (
                  <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    AI Generated
                  </div>
                )}
                {/* Overlay Controls */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                   <button 
                     onClick={() => fileInputRef.current?.click()}
                     className="bg-white text-gray-800 px-4 py-2 rounded-lg shadow-lg text-sm font-medium hover:bg-gray-100"
                   >
                     Upload New
                   </button>
                   <button 
                     onClick={() => setShowCamera(true)}
                     className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-1"
                   >
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                     </svg>
                     Retake
                   </button>
                </div>
              </>
            ) : (
              <div className="text-center p-6">
                <svg className="w-12 h-12 text-indigo-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-indigo-900 font-medium">Upload Product Photo</p>
                <p className="text-indigo-400 text-sm mt-1 mb-4">Click to browse or take a photo</p>
                <div className="flex gap-2 justify-center">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setShowCamera(true); }}
                    className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-100 transition-colors flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                     </svg>
                    Take Photo
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <input 
          ref={fileInputRef} 
          type="file" 
          accept="image/*" 
          className="hidden" 
          onChange={handleFileChange} 
        />

        {/* Prompt Input */}
        <div className="mt-6">
          <label className="text-sm font-medium text-indigo-900 mb-2 block">
            What should Gemini do?
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., 'Add a retro filter', 'Make the background a farm'"
              className="flex-1 px-4 py-3 rounded-xl border border-indigo-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
            />
            <button
              onClick={handleGenerate}
              disabled={!selectedImage || !prompt || loading}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 rounded-xl font-semibold transition-colors shadow-lg shadow-indigo-200"
            >
              Generate
            </button>
          </div>
          
          {/* Quick Prompts */}
          <div className="mt-4 flex flex-wrap gap-2">
            {['Remove background', 'Add vintage look', 'Place on wooden table', 'Make it glow'].map(p => (
              <button 
                key={p}
                onClick={() => setPrompt(p)}
                className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductAIStudio;