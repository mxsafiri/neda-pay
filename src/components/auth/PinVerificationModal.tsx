'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, Key, Clock } from 'lucide-react';
import { useWalletAuth } from '@/hooks/useWalletAuth';

interface PinVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  walletAddress: string;
  isSessionExpired?: boolean;
}

export function PinVerificationModal({ isOpen, onClose, onSuccess, walletAddress, isSessionExpired }: PinVerificationModalProps) {
  const { verifyPinAndRefreshSession, isLoading, error: authError } = useWalletAuth();
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [attempts, setAttempts] = useState(0);
  
  const handleVerifyPin = async () => {
    // Validate PIN format
    if (pin.length < 6) {
      setError('PIN must be at least 6 characters');
      return;
    }
    
    try {
      // Verify PIN and refresh session
      const isAuthenticated = await verifyPinAndRefreshSession(pin);
      
      if (isAuthenticated) {
        // Show success state
        setSuccess(true);
        setError(null);
        
        // Notify parent component
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        // Increment attempts and show error
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        if (newAttempts >= 5) {
          setError('Too many failed attempts. Please try again later.');
        } else {
          setError(`Invalid PIN. ${5 - newAttempts} attempts remaining.`);
        }
      }
    } catch (err) {
      console.error('PIN verification error:', err);
      setError('An error occurred during verification');
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-lg w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <h3 className="text-lg font-semibold">Enter Your PIN</h3>
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
              <h4 className="text-xl font-medium mb-2">Authentication Successful</h4>
              <p className="text-white/70">
                You have successfully authenticated to your wallet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                <p className="text-blue-400 text-sm">
                  Enter your PIN to access your wallet.
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
                <label className="block text-sm text-white/70 mb-1">Enter PIN</label>
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
            <div className="flex flex-col items-center justify-center p-6 text-center">
              {success ? (
                <div className="flex flex-col items-center space-y-4">
                  <CheckCircle2 className="h-16 w-16 text-green-500" />
                  <h3 className="text-xl font-bold">PIN Verified</h3>
                  <p>Wallet access granted.</p>
                </div>
              ) : (
                <>
                  {isSessionExpired ? (
                    <Clock className="h-16 w-16 text-amber-500 mb-4" />
                  ) : (
                    <Key className="h-16 w-16 text-primary mb-4" />
                  )}
                  <h3 className="text-xl font-bold mb-2">
                    {isSessionExpired ? 'Session Expired' : 'Verify Your PIN'}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {isSessionExpired 
                      ? 'Your session has timed out for security. Please enter your PIN to continue.' 
                      : 'Please enter your wallet PIN to continue.'}
                  </p>
                  <button 
                    onClick={handleVerifyPin} 
                    className="w-full p-3 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors"
                    disabled={attempts >= 5}
                  >
                    Verify PIN
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
