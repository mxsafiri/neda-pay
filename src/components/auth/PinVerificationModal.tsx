'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, Key } from 'lucide-react';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import { motion } from 'framer-motion';

interface PinVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  walletAddress: string;
  isSessionExpired?: boolean;
}

export function PinVerificationModal({ isOpen, onClose, onSuccess, walletAddress, isSessionExpired }: PinVerificationModalProps) {
  const { verifyPinAndRefreshSession } = useWalletAuth();
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [attempts, setAttempts] = useState(0);
  
  // Auto-focus the PIN input when the modal opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        const pinInput = document.getElementById('pin-input');
        if (pinInput) pinInput.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);
  
  // Handle PIN input keydown for Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleVerifyPin();
    }
  };
  
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
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-slate-900 border border-slate-700 rounded-lg w-full max-w-md overflow-hidden shadow-xl"
      >
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white">
            {isSessionExpired ? 'Session Expired' : 'Enter Your PIN'}
          </h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-800 transition-colors"
            disabled={success}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          {success ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-6"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <h4 className="text-xl font-medium mb-2">Authentication Successful</h4>
              <p className="text-white/70">
                You have successfully authenticated to your wallet.
              </p>
            </motion.div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#0A1F44]/20 mb-3">
                  <Key className="h-8 w-8 text-[#0A1F44]" />
                </div>
                <p className="text-sm text-white/70">
                  Wallet: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </p>
              </div>
              
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <p className="text-blue-400 text-sm">
                  {isSessionExpired 
                    ? 'Your session has expired for security reasons. Please enter your PIN to continue.' 
                    : 'Enter your PIN to access your wallet.'}
                </p>
              </div>
              
              <div>
                <div className="mb-2">
                  <label htmlFor="pin-input" className="block text-sm font-medium text-white/90 mb-1">PIN</label>
                  <input
                    id="pin-input"
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="••••••"
                    className="w-full h-12 rounded-md border border-white/20 bg-white/5 px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[#0A1F44]/50 transition-all"
                    autoComplete="current-password"
                  />
                </div>
                
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm mb-4"
                  >
                    <div className="flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  </motion.div>
                )}
                
                <button 
                  onClick={handleVerifyPin} 
                  className="w-full p-3 bg-[#0A1F44] hover:bg-[#0A1F44]/90 text-white rounded-md transition-colors font-medium mt-2"
                  disabled={attempts >= 5 || pin.length === 0}
                >
                  {attempts >= 5 ? 'Too Many Attempts' : 'Verify PIN'}
                </button>
                
                <button
                  onClick={onClose}
                  className="w-full p-2 text-white/70 hover:text-white text-sm mt-3 transition-colors"
                  type="button"
                >
                  Forgot PIN? Use Recovery Phrase
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
