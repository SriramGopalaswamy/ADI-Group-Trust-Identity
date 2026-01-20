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
    <div className="w-full max-w-xl mx-auto space-y-6 relative z-10">
      {showCamera && (
        <CameraModal
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
          title="Take Product Photo"
        />
      )}

      {/* Glass Panel */}
      <div className="backdrop-blur-2xl bg-white/70 border border-white/50 rounded-[2.5rem] shadow-2xl shadow-indigo-900/10 p-8 relative overflow-hidden">
        {/* Decorative Blob */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-purple-400/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="mb-6 relative">
          <h2 className="text-2xl font-bold text-gray-800">Creative Studio</h2>
          <p className="text-gray-500 font-medium mt-1">Enhance packaging with generative AI.</p>
        </div>

        {/* Image Upload Area */}
        <div className="flex flex-col gap-3">
          <div 
            onClick={() => !selectedImage && fileInputRef.current?.click()}
            className={`
              relative w-full aspect-square sm:aspect-video rounded-3xl border-2 border-dashed 
              flex flex-col items-center justify-center transition-all overflow-hidden group
              ${selectedImage ? 'border-transparent bg-gray-50' : 'border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50/50 cursor-pointer'}
            `}
          >
            {selectedImage ? (
              <>
                <img 
                  src={generatedImage || selectedImage} 
                  alt="Preview" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {loading && (
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white backdrop-blur-md">
                    <div className="relative w-16 h-16 mb-4">
                      <div className="absolute inset-0 border-4 border-indigo-500/30 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-t-indigo-400 rounded-full animate-spin"></div>
                    </div>
                    <span className="font-bold tracking-wide animate-pulse">Processing...</span>
                  </div>
                )}
                {!loading && generatedImage && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                    Generated V2
                  </div>
                )}
                {/* Overlay Controls */}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                   <button 
                     onClick={() => fileInputRef.current?.click()}
                     className="bg-white/90 text-gray-900 px-5 py-2.5 rounded-xl shadow-lg text-sm font-bold hover:bg-white transition-all transform hover:scale-105"
                   >
                     New Upload
                   </button>
                   <button 
                     onClick={() => setShowCamera(true)}
                     className="bg-indigo-600/90 text-white px-5 py-2.5 rounded-xl shadow-lg text-sm font-bold hover:bg-indigo-600 transition-all transform hover:scale-105 flex items-center gap-2"
                   >
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                     </svg>
                     Camera
                   </button>
                </div>
              </>
            ) : (
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                   <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-900 font-bold text-lg">Upload Photo</p>
                <p className="text-gray-400 text-sm mt-1 mb-6">Drag & drop or click to browse</p>
                <div className="flex gap-3 justify-center">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setShowCamera(true); }}
                    className="bg-white border border-indigo-100 text-indigo-600 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-50 transition-all shadow-sm"
                  >
                    Use Camera
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
        <div className="mt-8">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-3">
            AI Prompt
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your vision..."
              className="flex-1 px-6 py-4 rounded-2xl bg-white/60 border border-gray-200/80 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-gray-400 font-medium text-gray-800 backdrop-blur-sm"
            />
            <button
              onClick={handleGenerate}
              disabled={!selectedImage || !prompt || loading}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
            >
              Magic
            </button>
          </div>
          
          {/* Quick Prompts */}
          <div className="mt-4 flex flex-wrap gap-2">
            {['Cyberpunk city', 'Minimalist white', 'Eco-friendly forest', 'Neon glow'].map(p => (
              <button 
                key={p}
                onClick={() => setPrompt(p)}
                className="text-xs bg-indigo-50/50 border border-indigo-100/50 text-indigo-600 px-4 py-2 rounded-xl font-semibold hover:bg-indigo-100 transition-colors"
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