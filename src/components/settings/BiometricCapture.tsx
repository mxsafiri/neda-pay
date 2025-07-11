'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, Check, RefreshCw, AlertCircle } from 'lucide-react';
import Image from 'next/image';

interface BiometricCaptureProps {
  onCapture: (image: string) => void;
  onError?: (error: string) => void;
}

export function BiometricCapture({ onCapture, onError }: BiometricCaptureProps) {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Face detection setup
  const faceDetectionInterval = useRef<NodeJS.Timeout | null>(null);
  
  // Simulate face detection (in a real app, use a face detection library)
  const simulateFaceDetection = useCallback(() => {
    if (faceDetectionInterval.current) {
      clearInterval(faceDetectionInterval.current);
    }
    
    // Simulate face detection after 2 seconds
    setTimeout(() => {
      setFaceDetected(true);
      
      // Start countdown for auto-capture
      setCountdown(3);
    }, 2000);
  }, []);
  
  // Start camera
  const startCamera = useCallback(async () => {
    try {
      setError(null);
      
      // Check if browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support camera access');
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user', // Use front camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
        
        // Start face detection simulation
        simulateFaceDetection();
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError(err instanceof Error ? err.message : 'Failed to access camera');
      if (onError) onError(err instanceof Error ? err.message : 'Failed to access camera');
    }
  }, [onError, simulateFaceDetection]);
  
  // Stop camera function - used internally
  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    setIsCameraActive(false);
    setFaceDetected(false);
    
    if (faceDetectionInterval.current) {
      clearInterval(faceDetectionInterval.current);
      faceDetectionInterval.current = null;
    }
  };
  
  // Capture image
  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Get image data as base64 string
    const imageData = canvas.toDataURL('image/png');
    
    // Stop the video stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      streamRef.current = null;
    }
    
    // Set captured image and notify parent
    setCapturedImage(imageData);
    setIsCameraActive(false);
    if (onCapture) onCapture(imageData);
  }, [onCapture]);
  
  // Handle countdown for auto-capture
  useEffect(() => {
    if (countdown === null) return;
    
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else {
      // Auto-capture when countdown reaches 0
      captureImage();
    }
  }, [countdown, captureImage]);
  
  // Retake photo
  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    startCamera();
  }, [startCamera]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Clean up camera resources when component unmounts
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      setIsCameraActive(false);
    };
  }, []);
  
  return (
    <div className="w-full">
      <div className="border-2 border-dashed border-white/20 rounded-lg p-4">
        {error ? (
          <div className="p-4 text-center">
            <div className="flex items-center justify-center mb-2 text-red-400">
              <AlertCircle className="w-6 h-6 mr-2" />
              <span>Camera Error</span>
            </div>
            <p className="text-white/70 text-sm mb-4">{error}</p>
            <button
              onClick={startCamera}
              className="px-4 py-2 bg-primary rounded-lg text-white"
            >
              Try Again
            </button>
          </div>
        ) : capturedImage ? (
          <div className="text-center">
            <div className="relative mb-4">
              <Image 
                src={capturedImage} 
                alt="Captured selfie" 
                className="w-full max-w-xs mx-auto rounded-lg"
                width={320}
                height={240}
                priority
              />
              <div className="absolute top-2 right-2 bg-green-500/80 rounded-full p-1">
                <Check className="w-4 h-4 text-white" />
              </div>
            </div>
            <button
              onClick={retakePhoto}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Retake Photo
            </button>
          </div>
        ) : isCameraActive ? (
          <div className="text-center">
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full max-w-xs mx-auto rounded-lg"
              />
              
              {/* Face detection indicator */}
              <div className={`absolute inset-0 border-4 rounded-lg transition-colors duration-300 ${
                faceDetected ? 'border-green-500' : 'border-transparent'
              }`}>
                {faceDetected && (
                  <div className="absolute top-2 left-2 bg-green-500/80 text-white text-sm px-2 py-1 rounded-full flex items-center">
                    <Check className="w-3 h-3 mr-1" />
                    Face Detected
                  </div>
                )}
                
                {/* Countdown indicator */}
                {countdown !== null && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black/50 text-white text-4xl font-bold w-16 h-16 rounded-full flex items-center justify-center">
                      {countdown}
                    </div>
                  </div>
                )}
              </div>
              
              <canvas ref={canvasRef} className="hidden" />
            </div>
            
            <div className="mt-4 flex justify-center">
              <button
                onClick={captureImage}
                disabled={!faceDetected}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Camera className="w-4 h-4" />
                Capture
              </button>
            </div>
            
            <p className="text-white/50 text-sm mt-3">
              {faceDetected 
                ? "Position your face in the center and click 'Capture'" 
                : "Please position your face in the frame"}
            </p>
          </div>
        ) : (
          <div className="text-center py-8">
            <Camera className="w-12 h-12 text-white/50 mx-auto mb-4" />
            <p className="text-white/70 mb-4">Selfie verification is required for identity confirmation</p>
            <button
              onClick={startCamera}
              className="px-4 py-2 bg-primary hover:bg-primary/90 rounded-lg text-white transition-colors"
            >
              Start Camera
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
