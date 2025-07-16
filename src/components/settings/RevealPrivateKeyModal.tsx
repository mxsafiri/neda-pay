'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Copy, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { useWalletAuth } from '@/hooks/useWalletAuth';

interface RevealPrivateKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RevealPrivateKeyModal({ isOpen, onClose }: RevealPrivateKeyModalProps) {
  const [password, setPassword] = useState('');
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const { getPrivateKey } = useWalletAuth();
  const privateKey = getPrivateKey();
  
  // Simple password verification - in a real app, this should be more secure
  const verifyPassword = () => {
    // For demo purposes, accept any password with at least 6 characters
    // In production, this should validate against a stored password hash
    if (password.length >= 6) {
      setIsPasswordVerified(true);
      setError(null);
    } else {
      setError('Password must be at least 6 characters');
    }
  };
  
  const toggleShowPrivateKey = () => {
    setShowPrivateKey(!showPrivateKey);
  };
  
  const copyToClipboard = () => {
    if (privateKey) {
      navigator.clipboard.writeText(privateKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-lg w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <h3 className="text-lg font-semibold">Reveal Private Key</h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4">
          {!isPasswordVerified ? (
            <div className="space-y-4">
              <div className="p-3 bg-amber-500/20 border border-amber-500/30 rounded-lg">
                <p className="text-amber-300 text-sm">
                  <strong>Security Warning:</strong> Your private key gives full access to your wallet. Never share it with anyone.
                </p>
              </div>
              
              <div>
                <label className="block text-sm text-white/70 mb-1">Enter Password to Continue</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
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
              
              <button 
                onClick={verifyPassword} 
                className="w-full p-3 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors"
              >
                Verify Password
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm">
                  <strong>IMPORTANT:</strong> Never share your private key with anyone. Anyone with your private key has full access to your wallet.
                </p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm text-white/70">Your Private Key</label>
                  <button 
                    onClick={toggleShowPrivateKey}
                    className="h-8 px-2 text-xs inline-flex items-center rounded-md hover:bg-white/10 transition-colors"
                  >
                    {showPrivateKey ? (
                      <>
                        <EyeOff className="h-3 w-3 mr-1" /> Hide
                      </>
                    ) : (
                      <>
                        <Eye className="h-3 w-3 mr-1" /> Show
                      </>
                    )}
                  </button>
                </div>
                <div className="relative">
                  <div className="mt-1 p-3 bg-slate-800 rounded-md border border-slate-700 break-all font-mono text-sm">
                    {showPrivateKey ? privateKey : '•'.repeat(64)}
                  </div>
                  <button 
                    onClick={copyToClipboard}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md hover:bg-slate-700 transition-colors"
                    disabled={!showPrivateKey}
                  >
                    {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              <div className="p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                <p className="text-blue-400 text-sm">
                  Store your private key in a secure password manager or write it down and keep it in a safe place.
                </p>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-slate-700">
          <button 
            onClick={onClose} 
            className="w-full p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
