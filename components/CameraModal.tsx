import React, { useRef, useEffect, useState } from 'react';

interface CameraModalProps {
  onCapture: (base64Image: string) => void;
  onClose: () => void;
  title?: string;
}

const CameraModal: React.FC<CameraModalProps> = ({ onCapture, onClose, title = "Take Photo" }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string>('');
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' } // Prefer back camera
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Camera Error:", err);
        setError("Unable to access camera. Please check permissions.");
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []); // Run once on mount

  const handleCapture = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const base64Image = canvas.toDataURL('image/jpeg', 0.8);
        onCapture(base64Image);
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/90 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg bg-black rounded-2xl overflow-hidden relative border border-gray-800 shadow-2xl">
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent z-10 flex justify-between items-center">
          <span className="text-white font-medium">{title}</span>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error ? (
          <div className="h-64 flex items-center justify-center text-red-400 p-8 text-center">
            {error}
          </div>
        ) : (
          <div className="relative aspect-[3/4] sm:aspect-video bg-gray-900">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6 bg-gray-900 flex justify-center items-center gap-4">
           <button 
             onClick={handleCapture}
             disabled={!!error}
             className="w-16 h-16 rounded-full bg-white border-4 border-gray-300 outline outline-2 outline-offset-2 outline-white cursor-pointer hover:bg-gray-100 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
           >
           </button>
        </div>
      </div>
    </div>
  );
};

export default CameraModal;