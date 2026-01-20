import React, { useState } from 'react';
import BatchVerification from './components/BatchVerification';
import ProductAIStudio from './components/ProductAIStudio';
import { AppView } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.VERIFY);

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-900">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 backdrop-blur-md bg-white/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-700 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              A
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900">ADI Bharat</span>
          </div>
          
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
             <button
               onClick={() => setView(AppView.VERIFY)}
               className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
                 view === AppView.VERIFY 
                   ? 'bg-white text-gray-900 shadow-sm' 
                   : 'text-gray-500 hover:text-gray-700'
               }`}
             >
               Verify
             </button>
             <button
               onClick={() => setView(AppView.AI_STUDIO)}
               className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                 view === AppView.AI_STUDIO 
                   ? 'bg-white text-indigo-900 shadow-sm' 
                   : 'text-gray-500 hover:text-gray-700'
               }`}
             >
               <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
               </svg>
               AI Studio
             </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 px-4 py-8 sm:py-12 bg-[#F8FAFC]">
        <div className="max-w-4xl mx-auto">
          {view === AppView.VERIFY ? (
            <div className="animate-fade-in">
              <div className="text-center mb-10">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                  Pure. Tested. <span className="text-green-700">Verified.</span>
                </h1>
                <p className="text-gray-600 max-w-lg mx-auto text-lg leading-relaxed">
                  ADI Bharat ensures 100% transparency. Enter your batch code to instantly view lab reports for your specific product.
                </p>
              </div>
              <BatchVerification />
            </div>
          ) : (
            <div className="animate-fade-in">
               <div className="text-center mb-10">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                    Remix
                  </span> Your Experience
                </h1>
                <p className="text-gray-600 max-w-lg mx-auto text-lg leading-relaxed">
                  Use our experimental AI tool to edit photos of our products. Just snap a pic and type what you want to change!
                </p>
              </div>
              <ProductAIStudio />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
           <div className="flex justify-center gap-6 mb-4 text-gray-400">
             <a href="#" className="hover:text-gray-600">Privacy Policy</a>
             <a href="#" className="hover:text-gray-600">Terms of Service</a>
             <a href="#" className="hover:text-gray-600">Contact Support</a>
           </div>
           <p className="text-gray-400 text-sm">© 2026 ADI Bharat Foods Pvt Ltd. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;