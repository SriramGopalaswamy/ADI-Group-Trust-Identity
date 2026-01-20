import React, { useState } from 'react';
import { UserFormData, VerificationResult } from '../types';
import { verifyBatch } from '../services/verificationService';
import { extractBatchCodeFromImage } from '../services/geminiService';
import CameraModal from './CameraModal';

const BatchVerification: React.FC = () => {
  const [formData, setFormData] = useState<UserFormData>({
    fullName: '',
    mobile: '',
    email: '',
    batchCode: ''
  });
  
  const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [result, setResult] = useState<VerificationResult | null>(null);
  
  // Camera State
  const [showCamera, setShowCamera] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (status === 'ERROR') setStatus('IDLE');
  };

  const performVerification = async (data: UserFormData) => {
    setStatus('LOADING');
    setResult(null);

    try {
      const response = await verifyBatch(
        data.batchCode,
        data.mobile,
        data.email
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
      
      // Automatically attempt to verify with the extracted code and existing form data
      await performVerification(updatedData);
      
    } catch (error) {
      console.error(error);
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
    setFormData({ fullName: '', mobile: '', email: '', batchCode: '' });
    setResult(null);
  };

  const handleDownloadReport = (e: React.MouseEvent<HTMLButtonElement>, url: string) => {
    e.preventDefault();
    e.stopPropagation();

    // Prevent handling of mock/invalid URLs
    if (!url || url === '#' || url.trim() === '') {
      console.warn("Invalid report URL");
      return;
    }

    try {
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      
      // Add download attribute if possible, though backend Content-Disposition is primary
      link.setAttribute('download', 'ADI_Bharat_Test_Report.pdf');
      
      document.body.appendChild(link);
      link.click();
      
      // Immediate cleanup
      document.body.removeChild(link);
    } catch (err) {
      console.error("Download failed programmatically", err);
    }
  };

  if (status === 'SUCCESS' && result?.data) {
    return (
      <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in-up">
        <div className="bg-green-600 p-8 text-center">
          <svg className="w-16 h-16 text-white mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-bold text-white">Verified Authentic</h2>
          <p className="text-green-100 mt-2">Test Report Available</p>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Product</span>
              <span className="font-semibold text-gray-800">{result.data.productName}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Batch Code</span>
              <span className="font-mono font-semibold text-gray-800">{result.data.code}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Test Date</span>
              <span className="font-semibold text-gray-800">{result.data.testDate}</span>
            </div>
          </div>

          <div className="pt-4">
             <button 
               type="button"
               onClick={(e) => result.data?.reportUrl && handleDownloadReport(e, result.data.reportUrl)}
               className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98]"
             >
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
               </svg>
               Download Lab Report (PDF)
             </button>
             <p className="text-xs text-center text-gray-400 mt-4">
               Link expires in 15 minutes for security.
             </p>
          </div>

          <button 
            type="button"
            onClick={handleReset} 
            className="w-full text-green-600 font-medium text-sm hover:underline cursor-pointer"
          >
            Scan another product
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {showCamera && (
        <CameraModal 
          onCapture={handleCameraCapture} 
          onClose={() => setShowCamera(false)}
          title="Scan Batch Code"
        />
      )}

      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Verify Batch</h2>
          <p className="text-gray-500 mt-1">Enter details from your ADI Bharat pack.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Full Name</label>
            <input
              required
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all bg-gray-50"
              placeholder="e.g. Anjali Sharma"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Mobile Number</label>
            <div className="flex gap-2">
              <span className="px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 font-medium">+91</span>
              <input
                required
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                maxLength={10}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all bg-gray-50"
                placeholder="9876543210"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Email ID</label>
            <input
              required
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all bg-gray-50"
              placeholder="anjali@example.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Batch Code</label>
            <div className="relative">
              <input
                required
                type="text"
                name="batchCode"
                value={formData.batchCode}
                onChange={handleChange}
                disabled={isScanning}
                className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all uppercase tracking-widest font-mono bg-gray-50 placeholder:normal-case placeholder:tracking-normal disabled:bg-gray-100 disabled:text-gray-400"
                placeholder="e.g. ADIF5HW825"
              />
              <button
                type="button"
                onClick={() => setShowCamera(true)}
                disabled={isScanning}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                title="Scan with Camera"
              >
                {isScanning ? (
                  <svg className="animate-spin w-5 h-5 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-400">Found on the back of the pack near the QR code.</p>
          </div>

          {status === 'ERROR' && (
             <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100 flex items-start gap-2">
               <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
               {result?.error || 'Verification failed. Please check inputs.'}
             </div>
          )}

          <button
            type="submit"
            disabled={status === 'LOADING' || isScanning}
            className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-[1.01] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-green-700/20"
          >
            {status === 'LOADING' ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </span>
            ) : (
              'Verify Batch'
            )}
          </button>
        </form>
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-gray-400 text-sm">
          Protected by Google Cloud Security. <br/>
          <span className="text-xs">v1.0.4 • ADI Bharat</span>
        </p>
      </div>
    </div>
  );
};

export default BatchVerification;