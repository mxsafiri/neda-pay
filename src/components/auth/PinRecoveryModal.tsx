'use client';

import React, { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Key, ArrowRight } from 'lucide-react';
import { validateStoredRecoveryPhrase } from '@/utils/recoveryPhrase';
import { useHybridWalletAuth } from '@/hooks/useHybridWalletAuth';

interface PinRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  walletAddress: string;
}

export function PinRecoveryModal({ isOpen, onClose, onSuccess, walletAddress }: PinRecoveryModalProps) {
  const { resetPin } = useHybridWalletAuth();
  const [recoveryPhrase, setRecoveryPhrase] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'phrase' | 'reset'>('phrase');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Handle recovery phrase verification
  const handleVerifyPhrase = async () => {
    setError(null);
    setIsProcessing(true);
    
    try {
      // For now, we'll use walletAddress as userId (this should be updated to use proper user mapping)
      // In a production system, you'd want to map walletAddress to userId properly
      const userId = walletAddress;
      
      // Validate the provided phrase against stored hash
      const result = await validateStoredRecoveryPhrase(userId, recoveryPhrase);
      
      if (!result.success) {
        setError(result.error || 'Failed to validate recovery phrase');
        setIsProcessing(false);
        return;
      }
      
      if (result.isValid) {
        // Move to PIN reset step
        setStep('reset');
      } else {
        setError('Invalid recovery phrase. Please check and try again.');
      }
    } catch (err) {
      setError('An error occurred during verification. Please try again.');
      console.error('Recovery phrase verification error:', err);
    }
    
    setIsProcessing(false);
  };
  
  // Handle PIN reset
  const handleResetPin = async () => {
    setError(null);
    setIsProcessing(true);
    
    try {
      // Validate PIN format
      if (newPin.length < 6) {
        setError('PIN must be at least 6 characters');
        setIsProcessing(false);
        return;
      }
      
      // Validate PIN confirmation
      if (newPin !== confirmPin) {
        setError('PINs do not match');
        setIsProcessing(false);
        return;
      }
      
      // Reset the PIN using recovery phrase
      await resetPin(recoveryPhrase, newPin);
      
      // Show success message
      setSuccess(true);
      
      // Complete after delay
      setTimeout(() => {
        onSuccess();
      }, 2000);
      
    } catch (err) {
      setError('An error occurred while resetting your PIN. Please try again.');
      console.error('PIN reset error:', err);
    }
    
    setIsProcessing(false);
  };
  
  // Modal animation variants
  const overlayVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };
  
  const modalVariants: Variants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", damping: 25, stiffness: 300 } }
  };

  if (!isOpen) return null;
  
  return (
    <motion.div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={overlayVariants}
    >
      <motion.div 
        className="bg-slate-900 rounded-xl w-full max-w-md overflow-hidden shadow-xl"
        variants={modalVariants}
      >
        <div className="relative">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h3 className="text-lg font-semibold text-white">
              {step === 'phrase' ? 'Recover Account Access' : 'Create New PIN'}
            </h3>
            <button 
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors"
              disabled={isProcessing}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Content */}
          <div className="p-6">
            {step === 'phrase' ? (
              // Step 1: Enter recovery phrase
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-full bg-[#0A1F44]/20 flex items-center justify-center mr-3 flex-shrink-0">
                    <Key className="text-[#0A1F44] h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white mb-1">Enter Your Recovery Phrase</h4>
                    <p className="text-white/70 text-sm">
                      Enter the 12-word recovery phrase you saved during wallet creation. This phrase is the &quot;master key&quot; to your wallet.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="recovery-phrase" className="block text-sm font-medium text-white/70 mb-1">
                      Recovery Phrase
                    </label>
                    <textarea
                      id="recovery-phrase"
                      value={recoveryPhrase}
                      onChange={(e) => setRecoveryPhrase(e.target.value)}
                      placeholder="Enter your 12-word recovery phrase separated by spaces"
                      className="w-full h-24 rounded-md border border-white/20 bg-white/5 px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[#0A1F44]/50 transition-all text-white"
                      disabled={isProcessing}
                    />
                    <p className="text-xs text-white/50 mt-1">
                      Words should be separated by spaces, e.g., &quot;word1 word2 word3...&quot;
                    </p>
                  </div>
                  
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm"
                    >
                      <div className="flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>{error}</span>
                      </div>
                    </motion.div>
                  )}
                  
                  <button 
                    onClick={handleVerifyPhrase}
                    className="w-full p-3 bg-[#0A1F44] hover:bg-[#0A1F44]/90 text-white rounded-md transition-colors font-medium flex items-center justify-center"
                    disabled={!recoveryPhrase.trim() || isProcessing}
                  >
                    {isProcessing ? (
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        Verify Recovery Phrase <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              // Step 2: Create new PIN
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-full bg-[#0A1F44]/20 flex items-center justify-center mr-3 flex-shrink-0">
                    <Key className="text-[#0A1F44] h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white mb-1">Create a New PIN</h4>
                    <p className="text-white/70 text-sm">
                      Your recovery phrase has been verified. Please create a new 6-digit PIN.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="new-pin" className="block text-sm font-medium text-white/70 mb-1">
                      New PIN (6+ digits)
                    </label>
                    <input
                      id="new-pin"
                      type="password"
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value)}
                      placeholder="••••••"
                      className="w-full h-12 rounded-md border border-white/20 bg-white/5 px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[#0A1F44]/50 transition-all"
                      disabled={isProcessing || success}
                      autoComplete="new-password"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="confirm-pin" className="block text-sm font-medium text-white/70 mb-1">
                      Confirm New PIN
                    </label>
                    <input
                      id="confirm-pin"
                      type="password"
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value)}
                      placeholder="••••••"
                      className="w-full h-12 rounded-md border border-white/20 bg-white/5 px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[#0A1F44]/50 transition-all"
                      disabled={isProcessing || success}
                      autoComplete="new-password"
                    />
                  </div>
                  
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm"
                    >
                      <div className="flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>{error}</span>
                      </div>
                    </motion.div>
                  )}
                  
                  {success && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-sm"
                    >
                      <div className="flex items-center">
                        <CheckCircle2 className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>PIN reset successful! Redirecting to your wallet...</span>
                      </div>
                    </motion.div>
                  )}
                  
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => {
                        setStep('phrase');
                        setError(null);
                      }}
                      className="flex-1 p-3 bg-slate-700 hover:bg-slate-600 text-white rounded-md transition-colors"
                      disabled={isProcessing || success}
                    >
                      Back
                    </button>
                    <button 
                      onClick={handleResetPin}
                      className="flex-1 p-3 bg-[#0A1F44] hover:bg-[#0A1F44]/90 text-white rounded-md transition-colors font-medium"
                      disabled={!newPin || !confirmPin || isProcessing || success}
                    >
                      {isProcessing ? (
                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                      ) : (
                        'Reset PIN'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
