'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, Key } from 'lucide-react';
import { hashPin, storeDeviceToken, storeWalletAuth } from '@/utils/deviceAuth';

interface DeviceRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  walletAddress: string;
}

export function DeviceRecoveryModal({ isOpen, onClose, onComplete, walletAddress }: DeviceRecoveryModalProps) {
  const [deviceToken, setDeviceToken] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const handleRecovery = () => {
    // Validate inputs
    if (!deviceToken || deviceToken.trim().length < 10) {
      setError('Please enter a valid security token');
      return;
    }
    
    if (pin.length < 6) {
      setError('PIN must be at least 6 characters');
      return;
    }
    
    try {
      // Store the provided device token
      storeDeviceToken(deviceToken);
      
      // Hash PIN and store auth data
      const hashedPin = hashPin(pin, deviceToken);
      storeWalletAuth(walletAddress, hashedPin, deviceToken);
      
      // Show success state
      setSuccess(true);
      setError(null);
      
      // Notify parent component
      setTimeout(() => {
        onComplete();
      }, 1500);
    } catch (err) {
      console.error('Failed to recover device access:', err);
      setError('Failed to recover access. Please try again.');
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-lg w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <h3 className="text-lg font-semibold">Recover Wallet Access</h3>
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
              <h4 className="text-xl font-medium mb-2">Access Recovered</h4>
              <p className="text-white/70">
                You have successfully recovered access to your wallet on this device.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                <p className="text-blue-400 text-sm">
                  Enter your security token and PIN to recover access to your wallet on this device.
                </p>
              </div>
              
              <div className="text-center mb-2">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 mb-2">
                  <Key className="h-8 w-8 text-primary" />
                </div>
                <p className="text-sm text-white/70">
                  Wallet: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </p>
              </div>
              
              <div>
                <label className="block text-sm text-white/70 mb-1">Security Token</label>
                <input
                  type="text"
                  value={deviceToken}
                  onChange={(e) => setDeviceToken(e.target.value)}
                  placeholder="Enter your security token"
                  className="w-full h-10 rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              
              <div>
                <label className="block text-sm text-white/70 mb-1">PIN</label>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter your PIN"
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
              onClick={handleRecovery} 
              className="w-full p-3 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors"
            >
              Recover Access
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
