import React, { useState } from 'react';
import BatchVerification from './components/BatchVerification';
import ProductAIStudio from './components/ProductAIStudio';
import { AppView } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.VERIFY);

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-900 relative overflow-x-hidden selection:bg-emerald-500/30 selection:text-emerald-900">
      
      {/* 2026 AURORA BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-slate-50"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-300/20 rounded-full blur-[120px] mix-blend-multiply animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-300/20 rounded-full blur-[120px] mix-blend-multiply animate-pulse-slow delay-1000"></div>
        <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-purple-300/20 rounded-full blur-[100px] mix-blend-multiply animate-pulse-slow delay-2000"></div>
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
      </div>

      {/* Floating Glass Navigation */}
      <nav className="fixed top-6 left-0 right-0 z-50 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl shadow-lg shadow-gray-200/20 px-4 sm:px-6 h-16 flex items-center justify-between transition-all">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl rotate-3"></div>
                <div className="absolute inset-0 bg-gray-900 rounded-xl flex items-center justify-center text-white font-bold text-lg transform transition-transform hover:-rotate-3">
                  A
                </div>
              </div>
              <span className="font-bold text-xl tracking-tight text-gray-900">ADI Bharat</span>
            </div>
            
            <div className="flex bg-gray-100/50 p-1.5 rounded-xl border border-gray-200/50 backdrop-blur-sm">
               <button
                 onClick={() => setView(AppView.VERIFY)}
                 className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${
                   view === AppView.VERIFY 
                     ? 'bg-white text-emerald-900 shadow-sm ring-1 ring-black/5' 
                     : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
                 }`}
               >
                 Verify
               </button>
               <button
                 onClick={() => setView(AppView.AI_STUDIO)}
                 className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-300 flex items-center gap-2 ${
                   view === AppView.AI_STUDIO 
                     ? 'bg-white text-indigo-900 shadow-sm ring-1 ring-black/5' 
                     : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
                 }`}
               >
                 <span className="relative flex h-2 w-2">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75 ${view === AppView.AI_STUDIO ? '' : 'hidden'}`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${view === AppView.AI_STUDIO ? 'bg-indigo-500' : 'bg-gray-400'}`}></span>
                  </span>
                 AI Studio
               </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 px-4 pt-32 pb-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          {view === AppView.VERIFY ? (
            <div className="animate-fade-in space-y-8">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold tracking-wide uppercase mb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live Blockchain Verification
                </div>
                <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
                  From Farm to <br className="hidden sm:block"/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
                     Digital Trust.
                  </span>
                </h1>
                <p className="text-gray-600 max-w-lg mx-auto text-lg leading-relaxed font-medium">
                  Trace your product's journey instantly using our mandatory geolocated traceability system.
                </p>
              </div>
              <BatchVerification />
            </div>
          ) : (
            <div className="animate-fade-in space-y-8">
               <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold tracking-wide uppercase mb-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                  Generative AI 2.5
                </div>
                <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
                  Reimagine <br className="hidden sm:block"/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                    Packaging Design.
                  </span>
                </h1>
                <p className="text-gray-600 max-w-lg mx-auto text-lg leading-relaxed font-medium">
                  Visualize future concepts for ADI Bharat products using our integrated AI Studio.
                </p>
              </div>
              <ProductAIStudio />
            </div>
          )}
        </div>
      </main>

    </div>
  );
};

export default App;