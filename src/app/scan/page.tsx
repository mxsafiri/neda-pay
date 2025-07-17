'use client';

// Prevent Next.js from prerendering this page
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { WalletLayout } from '@/components/wallet/WalletLayout';
import { ArrowLeft, Camera, QrCode } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ScanPage() {
  const router = useRouter();
  const [hasCamera, setHasCamera] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  
  // Check if camera is available
  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      navigator.mediaDevices?.enumerateDevices()
        .then(devices => {
          const videoDevices = devices.filter(device => device.kind === 'videoinput');
          setHasCamera(videoDevices.length > 0);
        })
        .catch(err => {
          console.error('Error checking for camera:', err);
          setHasCamera(false);
        });
    }
  }, []);
  
  // Simulate QR code scanning
  const startScanning = () => {
    setScanning(true);
    
    // Simulate a successful scan after 3 seconds
    setTimeout(() => {
      setScanning(false);
      setScannedCode('neda:pay:TZS:100:merchant123');
    }, 3000);
  };
  
  // Handle scanned code
  const handleScannedCode = () => {
    if (!scannedCode) return;
    
    // Parse the scanned code
    const parts = scannedCode.split(':');
    if (parts.length >= 5 && parts[0] === 'neda' && parts[1] === 'pay') {
      const currency = parts[2];
      const amount = parts[3];
      const recipient = parts[4];
      
      // Navigate to payment confirmation
      router.push(`/payment?currency=${currency}&amount=${amount}&recipient=${recipient}`);
    }
  };
  
  return (
    <WalletLayout>
      <div className="mb-6 flex items-center">
        <button 
          onClick={() => router.back()}
          className="mr-3 p-2 rounded-full hover:bg-white/10"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold">Scan QR Code</h1>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Camera View / QR Placeholder */}
        <div className="bg-gray-900 rounded-xl aspect-square flex flex-col items-center justify-center">
          {scanning ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="absolute inset-0 m-8 border-2 border-blue-500 rounded-lg"></div>
              <motion.div 
                className="absolute top-1/2 w-full h-0.5 bg-blue-500"
                animate={{ 
                  y: [-100, 100],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              />
              <Camera className="w-16 h-16 text-blue-500 opacity-20" />
            </div>
          ) : scannedCode ? (
            <div className="text-center p-8">
              <div className="bg-blue-500/20 p-4 rounded-xl mb-4">
                <QrCode className="w-16 h-16 mx-auto text-blue-500 mb-2" />
                <p className="text-blue-400 font-medium">QR Code Scanned!</p>
              </div>
              <p className="text-gray-400 break-all">{scannedCode}</p>
            </div>
          ) : (
            <>
              <QrCode className="w-16 h-16 text-gray-700 mb-4" />
              <p className="text-gray-500">Position a QR code in the camera view</p>
            </>
          )}
        </div>
        
        {/* Action Buttons */}
        {scannedCode ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleScannedCode}
            className="w-full py-4 rounded-full bg-gradient-to-r from-blue-600 to-blue-400 text-white text-xl font-medium"
          >
            Continue to Payment
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={startScanning}
            disabled={scanning || !hasCamera}
            className={`w-full py-4 rounded-full text-white text-xl font-medium ${
              scanning || !hasCamera
                ? 'bg-gray-800 text-gray-400'
                : 'bg-gradient-to-r from-blue-600 to-blue-400'
            }`}
          >
            {scanning ? 'Scanning...' : 'Start Scanning'}
          </motion.button>
        )}
        
        {/* Manual Entry Option */}
        <button
          onClick={() => router.push('/payment?manual=true')}
          className="w-full py-3 border border-gray-700 rounded-full text-white font-medium"
        >
          Enter Payment Details Manually
        </button>
      </motion.div>
    </WalletLayout>
  );
}
