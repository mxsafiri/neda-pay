'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Copy, CheckCircle2, AlertCircle, Shield, Eye, EyeOff } from 'lucide-react';
// Recovery phrase utilities removed - using Privy authentication

interface RecoveryPhraseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  walletAddress: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function RecoveryPhraseModal({ isOpen, onClose, onComplete, walletAddress }: RecoveryPhraseModalProps) {
  const [recoveryPhrase, setRecoveryPhrase] = useState<string>('');
  const [showPhrase, setShowPhrase] = useState(false);
  const [copied, setCopied] = useState(false);
  const [verificationStep, setVerificationStep] = useState(false);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [shuffledWords, setShuffledWords] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Generate recovery phrase on component mount
  useEffect(() => {
    if (isOpen && !recoveryPhrase) {
      // Mock recovery phrase since we're using Privy authentication
      const phrase = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
      setRecoveryPhrase(phrase);
    }
  }, [isOpen, recoveryPhrase]);
  
  // Prepare shuffled words for verification step
  useEffect(() => {
    if (verificationStep && recoveryPhrase) {
      const words = recoveryPhrase.split(' ');
      const shuffled = [...words].sort(() => Math.random() - 0.5);
      setShuffledWords(shuffled);
    }
  }, [verificationStep, recoveryPhrase]);
  
  // Handle copying recovery phrase to clipboard
  const handleCopyPhrase = () => {
    navigator.clipboard.writeText(recoveryPhrase);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };
  
  // Handle word selection during verification
  const handleWordSelect = (word: string) => {
    if (selectedWords.includes(word)) {
      // If word is already selected, remove it
      setSelectedWords(selectedWords.filter(w => w !== word));
    } else {
      // Add word to selected words
      setSelectedWords([...selectedWords, word]);
    }
  };
  
  // Verify that the selected words match the recovery phrase
  const handleVerifyPhrase = () => {
    const originalWords = recoveryPhrase.split(' ');
    
    if (selectedWords.length !== originalWords.length) {
      setError('Please select all words in the correct order');
      return;
    }
    
    // Check if words are in correct order
    const isCorrect = selectedWords.every((word, index) => word === originalWords[index]);
    
    if (isCorrect) {
      setSuccess(true);
      // Note: Recovery phrase storage is handled by the hybrid auth system
      // This component is used in legacy wallet creation flow
      
      // Show success message and complete after delay
      setTimeout(() => {
        onComplete();
      }, 2000);
    } else {
      setError('The selected words do not match the recovery phrase. Please try again.');
      setSelectedWords([]);
    }
  };
  
  // Handle proceeding to verification step
  const handleProceedToVerification = () => {
    setVerificationStep(true);
  };
  
  // Modal animation variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };
  
  const modalVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, damping: 25, stiffness: 300 } }
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
            <h3 className="text-lg font-semibold text-white">Backup Recovery Phrase</h3>
            <button 
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Content */}
          <div className="p-6">
            {!verificationStep ? (
              // Step 1: Display recovery phrase
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-full bg-[#0A1F44]/20 flex items-center justify-center mr-3 flex-shrink-0">
                    <Shield className="text-[#0A1F44] h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white mb-1">Important: Save Your Recovery Phrase</h4>
                    <p className="text-white/70 text-sm">
                      This 12-word recovery phrase is the <strong>only way</strong> to recover your wallet if you forget your PIN. 
                      Write it down and store it in a secure location.
                    </p>
                  </div>
                </div>
                
                <div className="bg-[#0A1F44]/10 border border-[#0A1F44]/20 rounded-lg p-4 relative">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-white/50">Recovery Phrase</span>
                    <button 
                      onClick={() => setShowPhrase(!showPhrase)}
                      className="text-white/70 hover:text-white transition-colors"
                    >
                      {showPhrase ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  
                  {showPhrase ? (
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      {recoveryPhrase.split(' ').map((word, index) => (
                        <div key={index} className="bg-[#0A1F44]/20 rounded px-2 py-1 text-sm text-white flex items-center">
                          <span className="text-white/50 text-xs mr-1">{index + 1}.</span> {word}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-[120px] flex items-center justify-center">
                      <p className="text-white/70">Click the eye icon to reveal your recovery phrase</p>
                    </div>
                  )}
                  
                  <button 
                    onClick={handleCopyPhrase}
                    className="flex items-center justify-center w-full mt-2 py-2 bg-[#0A1F44]/30 hover:bg-[#0A1F44]/40 rounded text-sm text-white transition-colors"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-1" /> Copied to clipboard
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-1" /> Copy to clipboard
                      </>
                    )}
                  </button>
                </div>
                
                <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg p-3 text-amber-300 text-sm">
                  <p className="flex items-start">
                    <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Never share your recovery phrase with anyone. NEDApay will never ask for it.</span>
                  </p>
                </div>
                
                <button 
                  onClick={handleProceedToVerification}
                  className="w-full p-3 bg-[#0A1F44] hover:bg-[#0A1F44]/90 text-white rounded-md transition-colors font-medium"
                  disabled={!showPhrase}
                >
                  I&apos;ve saved my recovery phrase
                </button>
              </div>
            ) : (
              // Step 2: Verify recovery phrase
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-full bg-[#0A1F44]/20 flex items-center justify-center mr-3 flex-shrink-0">
                    <Shield className="text-[#0A1F44] h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white mb-1">Verify Your Recovery Phrase</h4>
                    <p className="text-white/70 text-sm">
                      Select the words in the correct order to verify you&apos;ve saved your recovery phrase.
                    </p>
                  </div>
                </div>
                
                {/* Selected words display */}
                <div className="bg-[#0A1F44]/10 border border-[#0A1F44]/20 rounded-lg p-4">
                  <div className="grid grid-cols-3 gap-2 min-h-[120px]">
                    {Array.from({ length: 12 }).map((_, index) => {
                      const word = selectedWords[index];
                      return (
                        <div 
                          key={index} 
                          className={`rounded px-2 py-1 text-sm flex items-center justify-center ${
                            word ? 'bg-[#0A1F44]/40 text-white' : 'bg-[#0A1F44]/10 text-white/30'
                          }`}
                        >
                          {word ? (
                            <>
                              <span className="text-white/50 text-xs mr-1">{index + 1}.</span> {word}
                            </>
                          ) : (
                            <span className="text-xs">{index + 1}. ...</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Word selection */}
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <div className="flex flex-wrap gap-2">
                    {shuffledWords.map((word, index) => (
                      <button
                        key={index}
                        onClick={() => handleWordSelect(word)}
                        disabled={selectedWords.includes(word)}
                        className={`px-3 py-1 rounded text-sm transition-colors ${
                          selectedWords.includes(word)
                            ? 'bg-[#0A1F44] text-white cursor-not-allowed opacity-50'
                            : 'bg-slate-700 hover:bg-slate-600 text-white'
                        }`}
                      >
                        {word}
                      </button>
                    ))}
                  </div>
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
                      <span>Recovery phrase verified successfully!</span>
                    </div>
                  </motion.div>
                )}
                
                <div className="flex space-x-3">
                  <button 
                    onClick={() => {
                      setVerificationStep(false);
                      setSelectedWords([]);
                      setError(null);
                    }}
                    className="flex-1 p-3 bg-slate-700 hover:bg-slate-600 text-white rounded-md transition-colors"
                    disabled={success}
                  >
                    Back
                  </button>
                  <button 
                    onClick={handleVerifyPhrase}
                    className="flex-1 p-3 bg-[#0A1F44] hover:bg-[#0A1F44]/90 text-white rounded-md transition-colors font-medium"
                    disabled={selectedWords.length !== 12 || success}
                  >
                    Verify
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
