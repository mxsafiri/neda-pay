'use client';

import React, { useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { generateDeviceToken, hashPin, storeDeviceToken, storeWalletAuth } from '@/utils/deviceAuth';

interface PinSetupFormProps {
  onComplete: () => void;
  walletAddress: string;
}

export function PinSetupForm({ onComplete, walletAddress }: PinSetupFormProps) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSetupPin = async () => {
    // Reset error state
    setError(null);
    
    // Validate PIN
    if (pin.length < 6) {
      setError('PIN must be at least 6 characters');
      return;
    }
    
    if (pin !== confirmPin) {
      setError('PINs do not match');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Generate and store device token
      const deviceToken = generateDeviceToken();
      storeDeviceToken(deviceToken);
      
      // Hash PIN and store auth data
      const hashedPin = hashPin(pin, deviceToken);
      storeWalletAuth(walletAddress, hashedPin, deviceToken);
      
      // Show success state
      setSuccess(true);
      
      // Notify parent component after a short delay
      setTimeout(() => {
        onComplete();
      }, 1500);
    } catch (err) {
      console.error('Failed to set up PIN:', err);
      setError('Failed to set up PIN. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-6">
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
        <>
          <div className="p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
            <p className="text-blue-400 text-sm">
              Create a secure PIN to protect your wallet. You&apos;ll need this PIN to access your wallet in the future.
            </p>
          </div>
          
          <div>
            <label htmlFor="pin" className="block text-sm font-medium mb-2">
              Enter PIN (min. 6 characters)
            </label>
            <input
              type="password"
              id="pin"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter PIN"
              required
            />
          </div>
          
          <div>
            <label htmlFor="confirmPin" className="block text-sm font-medium mb-2">
              Confirm PIN
            </label>
            <input
              type="password"
              id="confirmPin"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Confirm PIN"
              required
            />
          </div>
          
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
              <div className="flex items-center text-red-400 text-sm">
                <AlertCircle className="h-4 w-4 mr-2" />
                {error}
              </div>
            </div>
          )}
          
          <button
            onClick={handleSetupPin}
            disabled={isSubmitting}
            className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-medium transition-colors ${
              isSubmitting 
                ? 'bg-blue-700/50 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
                Setting PIN...
              </>
            ) : (
              'Set PIN'
            )}
          </button>
        </>
      )}
    </div>
  );
}
