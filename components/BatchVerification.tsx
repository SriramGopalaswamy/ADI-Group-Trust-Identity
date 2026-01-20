import React, { useState, useEffect, useCallback } from 'react';
import { UserFormData, VerificationResult } from '../types';
import { verifyBatch } from '../services/verificationService';
import { extractBatchCodeFromImage } from '../services/geminiService';
import CameraModal from './CameraModal';

const BatchVerification: React.FC = () => {
  const [formData, setFormData] = useState<UserFormData>({
    fullName: '',
    mobile: '',
    email: '',
    batchCode: '',
    location: ''
  });
  
  const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [result, setResult] = useState<VerificationResult | null>(null);
  
  // Camera State
  const [showCamera, setShowCamera] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // Location State
  const [locationStatus, setLocationStatus] = useState<'IDLE' | 'FETCHING' | 'FOUND' | 'DENIED'>('IDLE');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (status === 'ERROR') setStatus('IDLE');
  };

  const handleGetLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setLocationStatus('FETCHING');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        let locationName = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`
          );
          
          if (response.ok) {
            const data = await response.json();
            const addr = data.address;
            
            if (addr) {
              const city = addr.city || addr.town || addr.village || addr.municipality || addr.county;
              const state = addr.state || addr.region;
              const country = addr.country;

              if (city && state) locationName = `${city}, ${state}`;
              else if (city && country) locationName = `${city}, ${country}`;
              else if (state && country) locationName = `${state}, ${country}`;
            }
          }
        } catch (error) {
          console.warn("Reverse geocoding failed.", error);
        }

        setFormData(prev => ({ ...prev, location: locationName }));
        setLocationStatus('FOUND');
        // If we were in an error state due to missing location, clear it
        setStatus((prev) => prev === 'ERROR' ? 'IDLE' : prev);
      },
      (error) => {
        console.error("Location error:", error);
        setLocationStatus('DENIED');
        setFormData(prev => ({ ...prev, location: '' }));
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, []);

  // Automatically attempt to get location on mount
  useEffect(() => {
    handleGetLocation();
  }, [handleGetLocation]);

  const performVerification = async (data: UserFormData) => {
    // Client-side mandatory check
    if (!data.location) {
      setStatus('ERROR');
      setResult({ success: false, error: "Location access is mandatory. Please detect your location." });
      return;
    }

    setStatus('LOADING');
    setResult(null);

    try {
      const response = await verifyBatch(
        data.batchCode,
        data.mobile,
        data.email,
        data.location
      );

      if (response.success) {
        setResult(response);
        setStatus('SUCCESS');
      } else {
        setResult(response);
        setStatus('ERROR');
      }
    } catch (err) {
      setResult({ success: false, error: 'System error. Please try again later.' });
      setStatus('ERROR');
    }
  };

  const handleCameraCapture = async (base64Image: string) => {
    setIsScanning(true);
    setShowCamera(false);
    
    try {
      const code = await extractBatchCodeFromImage(base64Image);
      const updatedData = { ...formData, batchCode: code };
      setFormData(updatedData);
      
      // Only verify if location is already present, otherwise just fill the code
      if (updatedData.location) {
        await performVerification(updatedData);
      }
      
    } catch (error) {
      alert("Could not read batch code. Please try again or enter manually.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await performVerification(formData);
  };

  const handleReset = () => {
    setStatus('IDLE');
    setFormData({ fullName: '', mobile: '', email: '', batchCode: '', location: '' });
    setResult(null);
    setLocationStatus('IDLE');
    // Re-fetch location on reset to ensure fresh data
    handleGetLocation();
  };

  const handleDownloadReport = (e: React.MouseEvent<HTMLButtonElement>, url: string, productName?: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!url || url === '#' || url.trim() === '') {
      alert("Report URL is not available.");
      return;
    }

    let targetUrl = url;
    let isDirectDownload = true;

    if (url.includes('drive.google.com')) {
      if (url.includes('/folders/')) {
        isDirectDownload = false;
      } else if (url.includes('/file/d/')) {
        const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        if (fileIdMatch && fileIdMatch[1]) {
          targetUrl = `https://drive.google.com/uc?export=download&id=${fileIdMatch[1]}`;
        }
      }
    }

    try {
      const link = document.createElement('a');
      link.href = targetUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      
      if (isDirectDownload) {
        const filename = productName 
          ? `ADI_Bharat_${productName.replace(/\s+/g, '_')}_Report.pdf` 
          : 'ADI_Bharat_Test_Report.pdf';
        link.setAttribute('download', filename);
      }
      document.body.appendChild(link);
      link.click();
      setTimeout(() => document.body.removeChild(link), 100);
    } catch (err) {
      console.error(err);
    }
  };

  const isDriveFolder = (url: string) => url && url.includes('drive.google.com') && url.includes('/folders/');

  // ------------------ 2026 UI COMPONENTS ------------------

  if (status === 'SUCCESS' && result?.data) {
    return (
      <div className="w-full max-w-md mx-auto backdrop-blur-2xl bg-white/60 border border-white/50 rounded-3xl shadow-2xl shadow-emerald-500/20 overflow-hidden animate-fade-in-up">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="relative z-10">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm shadow-inner border border-white/30">
               <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Verified Authentic</h2>
            <p className="text-emerald-50 font-medium mt-1">100% Pure • Lab Tested</p>
          </div>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-200/50">
              <span className="text-gray-500 text-sm font-medium uppercase tracking-wide">Product</span>
              <span className="font-bold text-gray-800 text-lg">{result.data.productName}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-200/50">
              <span className="text-gray-500 text-sm font-medium uppercase tracking-wide">Batch Code</span>
              <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">{result.data.code}</span>
            </div>
            
            {result.data.labName && (
               <div className="flex justify-between items-center py-3 border-b border-gray-200/50">
                 <span className="text-gray-500 text-sm font-medium uppercase tracking-wide">Lab</span>
                 <span className="font-semibold text-gray-800 text-right text-sm">{result.data.labName.split(' ')[0]}...</span>
               </div>
            )}
             {result.data.reportNumber && (
               <div className="flex justify-between items-center py-3 border-b border-gray-200/50">
                 <span className="text-gray-500 text-sm font-medium uppercase tracking-wide">Report #</span>
                 <span className="font-mono text-gray-600 text-sm">{result.data.reportNumber}</span>
               </div>
            )}

            <div className="flex justify-between items-center py-3">
              <span className="text-gray-500 text-sm font-medium uppercase tracking-wide">Test Date</span>
              <span className="font-semibold text-gray-800">{result.data.testDate}</span>
            </div>
          </div>

          <div className="pt-2">
             <button 
               type="button"
               onClick={(e) => result.data?.reportUrl && handleDownloadReport(e, result.data.reportUrl, result.data.productName)}
               className="group w-full flex items-center justify-center gap-3 bg-gray-900 hover:bg-black text-white font-bold py-4 px-6 rounded-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-xl shadow-gray-400/20"
             >
               {isDriveFolder(result.data.reportUrl) ? (
                 <>
                   <svg className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                   </svg>
                   <span>View Reports Folder</span>
                 </>
               ) : (
                 <>
                   <svg className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                   </svg>
                   <span>Download Certificate</span>
                 </>
               )}
             </button>
          </div>

          <button 
            type="button"
            onClick={handleReset} 
            className="w-full text-emerald-600 font-semibold text-sm hover:text-emerald-700 py-2"
          >
            Verify Another Product
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto relative z-10">
      {showCamera && (
        <CameraModal 
          onCapture={handleCameraCapture} 
          onClose={() => setShowCamera(false)}
          title="Scan Batch Code"
        />
      )}

      {/* Glassmorphism Card */}
      <div className="backdrop-blur-2xl bg-white/70 border border-white/50 rounded-[2.5rem] shadow-2xl shadow-emerald-900/10 p-8 sm:p-10 relative overflow-hidden">
        {/* Decorative Background Blob */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

        <div className="mb-10 relative">
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
            Verify Origin
          </h2>
          <p className="text-gray-500 mt-2 font-medium">Authenticate your ADI Bharat product.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            
            {/* Input Group */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Full Name</label>
              <input
                required
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-6 py-4 rounded-2xl bg-white/50 border border-gray-200/80 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-gray-400 font-medium text-gray-800 backdrop-blur-sm"
                placeholder="Your Name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Mobile Number</label>
              <div className="flex gap-3">
                <span className="px-5 py-4 bg-gray-100/50 border border-gray-200/80 rounded-2xl text-gray-600 font-bold backdrop-blur-sm">+91</span>
                <input
                  required
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  maxLength={10}
                  className="flex-1 px-6 py-4 rounded-2xl bg-white/50 border border-gray-200/80 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-gray-400 font-medium text-gray-800 tracking-wide backdrop-blur-sm"
                  placeholder="00000 00000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email <span className="text-gray-400 font-normal lowercase tracking-normal">(optional)</span></label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-6 py-4 rounded-2xl bg-white/50 border border-gray-200/80 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-gray-400 font-medium text-gray-800 backdrop-blur-sm"
                placeholder="you@example.com"
              />
            </div>

            {/* MANDATORY LOCATION */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                  Location <span className="text-red-500">*</span>
                </label>
                {locationStatus === 'DENIED' && <span className="text-xs text-red-500 font-medium">Permission Denied</span>}
              </div>
              
              {!formData.location ? (
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={locationStatus === 'FETCHING'}
                    className="relative w-full py-4 rounded-2xl bg-white/80 border border-emerald-200 hover:border-emerald-400 text-emerald-700 font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.99]"
                  >
                    {locationStatus === 'FETCHING' ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Acquiring Coordinates...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>Detect My Location (Required)</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    readOnly
                    type="text"
                    value={formData.location}
                    className="w-full px-6 py-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/50 text-emerald-800 font-semibold outline-none"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 bg-white rounded-full p-1 shadow-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}
            </div>

            {/* BATCH CODE */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Batch Code</label>
              <div className="relative group">
                <input
                  required
                  type="text"
                  name="batchCode"
                  value={formData.batchCode}
                  onChange={handleChange}
                  disabled={isScanning}
                  className="w-full pl-6 pr-14 py-4 rounded-2xl bg-white/50 border border-gray-200/80 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all uppercase tracking-widest font-mono text-lg font-bold text-gray-800 placeholder:normal-case placeholder:font-sans placeholder:text-sm placeholder:tracking-normal placeholder:font-medium disabled:bg-gray-100 disabled:text-gray-400 backdrop-blur-sm"
                  placeholder="e.g. ADIF5HW825"
                />
                <button
                  type="button"
                  onClick={() => setShowCamera(true)}
                  disabled={isScanning}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                  title="Scan with Camera"
                >
                  {isScanning ? (
                    <svg className="animate-spin w-6 h-6 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* ERROR MESSAGE */}
            {status === 'ERROR' && (
               <div className="p-4 bg-red-50/80 backdrop-blur-sm text-red-600 rounded-2xl text-sm border border-red-100 flex items-start gap-3 animate-pulse">
                 <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                 </svg>
                 <span className="font-medium">{result?.error || 'Verification failed. Please check inputs.'}</span>
               </div>
            )}

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={status === 'LOADING' || isScanning}
              className="relative w-full overflow-hidden group rounded-2xl p-[1px] shadow-2xl shadow-emerald-500/30 disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 group-hover:bg-gradient-to-r group-hover:from-emerald-400 group-hover:via-teal-400 group-hover:to-emerald-500 transition-all duration-300"></span>
              <div className="relative bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 h-full rounded-2xl px-6 py-4 flex items-center justify-center transition-all">
                {status === 'LOADING' ? (
                  <span className="flex items-center justify-center gap-3 text-white font-bold">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Authenticating...
                  </span>
                ) : (
                  <span className="text-white font-bold text-lg tracking-wide">Verify Product</span>
                )}
              </div>
            </button>

          </div>
        </form>
      </div>
      
      <div className="mt-8 text-center relative z-10">
        <p className="text-gray-400 text-xs font-medium tracking-wide">
          SECURED BY <span className="text-gray-500 font-bold">GOOGLE CLOUD</span>
          <span className="mx-2 text-gray-300">•</span>
          v2.0.4
        </p>
      </div>
    </div>
  );
};

export default BatchVerification;