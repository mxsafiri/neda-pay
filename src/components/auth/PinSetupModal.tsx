'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import { generateDeviceToken, hashPin, storeDeviceToken, storeWalletAuth } from '@/utils/deviceAuth';

interface PinSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (deviceToken: string) => void;
  walletAddress: string;
}

export function PinSetupModal({ isOpen, onClose, onComplete, walletAddress }: PinSetupModalProps) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const handleSetupPin = () => {
    // Validate PIN
    if (pin.length < 6) {
      setError('PIN must be at least 6 characters');
      return;
    }
    
    if (pin !== confirmPin) {
      setError('PINs do not match');
      return;
    }
    
    try {
      // Generate and store device token
      const deviceToken = generateDeviceToken();
      storeDeviceToken(deviceToken);
      
      // Hash PIN and store auth data
      const hashedPin = hashPin(pin, deviceToken);
      storeWalletAuth(walletAddress, hashedPin, deviceToken);
      
      // Show success state
      setSuccess(true);
      setError(null);
      
      // Notify parent component
      setTimeout(() => {
        onComplete(deviceToken);
      }, 1500);
    } catch (err) {
      console.error('Failed to set up PIN:', err);
      setError('Failed to set up PIN. Please try again.');
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-lg w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <h3 className="text-lg font-semibold">Set Up Security PIN</h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-800 transition-colors"
            disabled={success}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4">
          {success ? (
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <h4 className="text-xl font-medium mb-2">PIN Set Successfully</h4>
              <p className="text-white/70">
                Your wallet is now secured with a PIN.
                Keep this PIN safe as you&apos;ll need it to access your wallet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                <p className="text-blue-400 text-sm">
                  Create a secure PIN to protect your wallet. You&apos;ll need this PIN to access your wallet in the future.
                </p>
              </div>
              
              <div>
                <label className="block text-sm text-white/70 mb-1">Enter PIN (min. 6 characters)</label>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter PIN"
                  className="w-full h-10 rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              
              <div>
                <label className="block text-sm text-white/70 mb-1">Confirm PIN</label>
                <input
                  type="password"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  placeholder="Confirm PIN"
                  className="w-full h-10 rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              
              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {error}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-slate-700">
          {!success && (
            <button 
              onClick={handleSetupPin} 
              className="w-full p-3 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors"
            >
              Set PIN
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
