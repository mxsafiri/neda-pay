'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeOff, Copy, Download, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { useTheme, financeTheme } from '@/contexts/ThemeContext';
import { decryptData, deriveKeyFromPin } from '@/lib/encryption';
import supabase from '@/lib/supabase';

interface ViewRecoveryPhraseModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string;
}

export function ViewRecoveryPhraseModal({ isOpen, onClose, walletAddress }: ViewRecoveryPhraseModalProps) {
  const { theme } = useTheme();
  const themeColors = financeTheme[theme];
  
  const [step, setStep] = useState<'warning' | 'pin' | 'phrase'>('warning');
  const [pin, setPin] = useState('');
  const [recoveryPhrase, setRecoveryPhrase] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPhrase, setShowPhrase] = useState(false);
  const [copied, setCopied] = useState(false);

  const handlePinSubmit = async () => {
    if (pin.length < 6) {
      setError('PIN must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get user data from Supabase database
      const { data: userData, error: userError } = await supabase
        .from('wallet_users')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single();
      
      if (userError || !userData) {
        // Fallback: try to get recovery phrase from localStorage if database fails
        const localRecoveryPhrase = localStorage.getItem('neda_recovery_phrase');
        if (localRecoveryPhrase) {
          setRecoveryPhrase(localRecoveryPhrase);
          setStep('phrase');
          return;
        }
        throw new Error('Recovery phrase not found in database or local storage');
      }
      
      // Derive encryption key from PIN and salt
      const encryptionKey = deriveKeyFromPin(pin, userData.salt);
      
      // Decrypt the recovery phrase
      const decryptedRecoveryPhrase = decryptData(userData.encrypted_recovery_phrase, encryptionKey);
      
      if (!decryptedRecoveryPhrase) {
        throw new Error('Failed to decrypt recovery phrase - incorrect PIN');
      }
      
      setRecoveryPhrase(decryptedRecoveryPhrase);
      setStep('phrase');
    } catch (err) {
      console.error('Failed to retrieve recovery phrase:', err);
      setError(err instanceof Error ? err.message : 'Invalid PIN or failed to retrieve recovery phrase');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyPhrase = async () => {
    try {
      await navigator.clipboard.writeText(recoveryPhrase);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const handleDownloadPhrase = () => {
    const element = document.createElement('a');
    const file = new Blob([`NEDApay Recovery Phrase\n\nWallet Address: ${walletAddress}\nRecovery Phrase: ${recoveryPhrase}\n\nIMPORTANT SECURITY NOTES:\n- Keep this phrase secure and confidential\n- Never share it with anyone\n- Store it offline in a safe place\n- This phrase can restore your entire wallet\n- Delete this file after storing it securely\n\nGenerated: ${new Date().toISOString()}`], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `nedapay-recovery-phrase-${walletAddress.slice(0, 8)}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const resetModal = () => {
    setStep('warning');
    setPin('');
    setRecoveryPhrase('');
    setError(null);
    setShowPhrase(false);
    setCopied(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md rounded-2xl border overflow-hidden"
          style={{
            backgroundColor: themeColors.background.card,
            borderColor: themeColors.border.primary
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b" style={{ borderColor: themeColors.border.primary }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6" style={{ color: themeColors.brand.primary }} />
                <h2 className="text-xl font-semibold" style={{ color: themeColors.text.primary }}>
                  Recovery Phrase
                </h2>
              </div>
              <button
                onClick={handleClose}
                className="p-1 rounded-lg transition-colors"
                style={{ color: themeColors.text.tertiary }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {step === 'warning' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex items-start gap-3 p-4 rounded-lg" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <div className="space-y-2">
                    <h3 className="font-medium text-yellow-600">Security Warning</h3>
                    <p className="text-sm text-yellow-600">
                      Your recovery phrase is the master key to your wallet. Anyone with access to it can control your funds.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium" style={{ color: themeColors.text.primary }}>
                    Before proceeding, ensure:
                  </h4>
                  <ul className="space-y-2 text-sm" style={{ color: themeColors.text.secondary }}>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></span>
                      You are in a private, secure location
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></span>
                      No one can see your screen
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></span>
                      You plan to store it offline securely
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => setStep('pin')}
                  className="w-full py-3 px-4 rounded-lg font-medium transition-colors"
                  style={{
                    backgroundColor: themeColors.brand.primary,
                    color: 'white'
                  }}
                >
                  I Understand - Continue
                </button>
              </motion.div>
            )}

            {step === 'pin' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-medium" style={{ color: themeColors.text.primary }}>
                    Enter Your PIN
                  </h3>
                  <p className="text-sm" style={{ color: themeColors.text.secondary }}>
                    Enter your 6-digit PIN to decrypt and view your recovery phrase
                  </p>
                </div>

                <div className="space-y-4">
                  <input
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="Enter 6-digit PIN"
                    maxLength={6}
                    className="w-full px-4 py-3 rounded-lg border text-center text-lg font-mono tracking-widest transition-colors"
                    style={{
                      backgroundColor: themeColors.background.secondary,
                      borderColor: error ? themeColors.brand.error : themeColors.border.primary,
                      color: themeColors.text.primary
                    }}
                    autoFocus
                  />

                  {error && (
                    <p className="text-sm text-center" style={{ color: themeColors.brand.error }}>
                      {error}
                    </p>
                  )}

                  <button
                    onClick={handlePinSubmit}
                    disabled={pin.length < 6 || isLoading}
                    className="w-full py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
                    style={{
                      backgroundColor: themeColors.brand.primary,
                      color: 'white'
                    }}
                  >
                    {isLoading ? 'Decrypting...' : 'View Recovery Phrase'}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'phrase' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="text-center space-y-2">
                  <CheckCircle className="w-8 h-8 mx-auto text-green-500" />
                  <h3 className="text-lg font-medium" style={{ color: themeColors.text.primary }}>
                    Your Recovery Phrase
                  </h3>
                  <p className="text-sm" style={{ color: themeColors.text.secondary }}>
                    Write this down and store it in a safe place
                  </p>
                </div>

                <div className="relative">
                  <div 
                    className="p-4 rounded-lg border font-mono text-sm leading-relaxed"
                    style={{
                      backgroundColor: themeColors.background.secondary,
                      borderColor: themeColors.border.primary,
                      color: themeColors.text.primary
                    }}
                  >
                    {showPhrase ? recoveryPhrase : '•'.repeat(recoveryPhrase.length)}
                  </div>
                  
                  <button
                    onClick={() => setShowPhrase(!showPhrase)}
                    className="absolute top-2 right-2 p-2 rounded-lg transition-colors"
                    style={{ color: themeColors.text.tertiary }}
                  >
                    {showPhrase ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleCopyPhrase}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border transition-colors"
                    style={{
                      borderColor: themeColors.border.primary,
                      color: themeColors.text.primary
                    }}
                  >
                    <Copy className="w-4 h-4" />
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  
                  <button
                    onClick={handleDownloadPhrase}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-colors"
                    style={{
                      backgroundColor: themeColors.brand.primary,
                      color: 'white'
                    }}
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>

                <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                  <p className="text-xs text-red-600 text-center">
                    Never share this phrase with anyone. NEDApay will never ask for your recovery phrase.
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
