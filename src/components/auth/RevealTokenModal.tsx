'use client';

import React, { useState } from 'react';
import { X, Eye, EyeOff, Copy, CheckCircle2, AlertCircle } from 'lucide-react';
import { useWalletAuth } from '@/hooks/useWalletAuth';

interface RevealTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RevealTokenModal({ isOpen, onClose }: RevealTokenModalProps) {
  const { getWalletToken } = useWalletAuth();
  const [pin, setPin] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [showToken, setShowToken] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const handleRevealToken = async () => {
    if (pin.length < 6) {
      setError('PIN must be at least 6 characters');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const retrievedToken = await getWalletToken(pin);
      setToken(retrievedToken);
      setShowToken(true);
    } catch (err) {
      console.error('Failed to reveal token:', err);
      setError('Invalid PIN. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCopyToken = () => {
    if (token) {
      navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-md w-full shadow-xl">
        <div className="flex justify-between items-center p-4 border-b border-slate-800">
          <h2 className="text-xl font-semibold">Reveal Security Token</h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          {!token ? (
            <>
              <div className="mb-6">
                <p className="mb-4 text-slate-300">
                  Your security token is required for wallet recovery on new devices. 
                  Please enter your PIN to reveal it.
                </p>
                <div className="bg-yellow-900/20 border border-yellow-800 rounded-md p-3 mb-4">
                  <p className="text-yellow-300 text-sm">
                    <AlertCircle size={16} className="inline-block mr-2" />
                    Store this token securely. Anyone with access to this token could potentially access your wallet.
                  </p>
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="pin" className="block text-sm font-medium mb-2">
                  Enter your PIN
                </label>
                <input
                  id="pin"
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter your PIN"
                />
                {error && (
                  <p className="mt-2 text-red-400 text-sm">{error}</p>
                )}
              </div>
              
              <button
                onClick={handleRevealToken}
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-white rounded-md py-2 flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>Reveal Token</>
                )}
              </button>
            </>
          ) : (
            <>
              <div className="mb-6">
                <p className="mb-4 text-slate-300">
                  This is your security token. Store it securely as you'll need it to recover your wallet on new devices.
                </p>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Your Security Token
                </label>
                <div className="relative">
                  <div className="bg-slate-800 border border-slate-700 rounded-md px-4 py-3 font-mono text-sm break-all">
                    {showToken ? token : '•'.repeat(token.length)}
                  </div>
                  <button
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-12 top-2.5 text-slate-400 hover:text-white transition-colors"
                  >
                    {showToken ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  <button
                    onClick={handleCopyToken}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white transition-colors"
                  >
                    {copied ? <CheckCircle2 size={18} className="text-green-500" /> : <Copy size={18} />}
                  </button>
                </div>
              </div>
              
              <div className="bg-blue-900/20 border border-blue-800 rounded-md p-3 mb-6">
                <p className="text-blue-300 text-sm">
                  <AlertCircle size={16} className="inline-block mr-2" />
                  Store this token in a secure location. You will need it to recover your wallet if you sign in on a new device.
                </p>
              </div>
              
              <button
                onClick={onClose}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white rounded-md py-2"
              >
                Close
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
