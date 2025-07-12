'use client';

import React, { useState } from 'react';
import { Copy, Eye, EyeOff, CheckCircle, Shield, Loader2, AlertCircle } from 'lucide-react';
import { generateUserAddress } from '@/lib/blockradar';
import { motion } from 'framer-motion';

interface WalletCreationProps {
  userId: string;
  userName: string;
  onComplete?: (address: string) => void;
}

export function WalletCreation({ userId, userName, onComplete }: WalletCreationProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [walletData, setWalletData] = useState<{
    address: string;
    privateKey: string;
  } | null>(null);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [copied, setCopied] = useState<'address' | 'privateKey' | null>(null);

  const createWallet = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Use the master wallet ID from environment variables
      const masterWalletId = process.env.NEXT_PUBLIC_BLOCKRADAR_MASTER_WALLET_ID;
      
      // Debug logging to see what's happening
      console.log('Environment variables available:', { 
        masterWalletId,
        hasBaseWalletId: !!process.env.NEXT_PUBLIC_BASE_WALLET_ID,
        hasApiUrl: !!process.env.NEXT_PUBLIC_BLOCKRADAR_API_URL
      });
      
      // Try to get the master wallet ID from localStorage as fallback
      const fallbackWalletId = localStorage.getItem('master_wallet_id');
      
      if (!masterWalletId && !fallbackWalletId) {
        throw new Error('Master wallet ID not configured - Please contact support');
      }
      
      // Use the environment variable if available, otherwise use the fallback
      // TypeScript safety: ensure it's always a string
      const effectiveWalletId = (masterWalletId || fallbackWalletId) as string;
      
      // Add a small delay to show loading state for better UX
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate a dedicated address for this user
      const response = await generateUserAddress(effectiveWalletId, userId, userName);
      
      if (!response?.data) {
        throw new Error('Failed to create wallet address - Network error');
      }
      
      const { address, privateKey } = response.data;
      
      if (!address || !privateKey) {
        throw new Error('Invalid wallet data received');
      }
      
      // Store wallet data in state
      setWalletData({
        address,
        privateKey
      });
      
      // Store in localStorage for authentication
      try {
        localStorage.setItem('neda_wallet', JSON.stringify({
          address,
          privateKey
        }));
      } catch (storageErr) {
        console.warn('Could not store wallet in local storage:', storageErr);
        // Continue anyway as we have the data in state
      }
      
    } catch (err: any) {
      console.error('Error creating wallet:', err);
      setError(err.message || 'Failed to create wallet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: 'address' | 'privateKey') => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    
    setTimeout(() => {
      setCopied(null);
    }, 2000);
  };

  const handleContinue = () => {
    if (walletData && onComplete) {
      try {
        // Verify wallet data is in localStorage before continuing
        const storedWallet = localStorage.getItem('neda_wallet');
        if (!storedWallet) {
          // Try to store it again if it's missing
          localStorage.setItem('neda_wallet', JSON.stringify(walletData));
        }
        
        // Call the onComplete callback with the wallet address
        onComplete(walletData.address);
      } catch (err) {
        // If localStorage fails, still allow continuing but warn the user
        console.warn('Warning: Could not verify wallet storage', err);
        setError('Warning: Your wallet may not be properly saved. Please make sure to back up your private key.');
        // Still call onComplete to allow the user to proceed
        setTimeout(() => {
          onComplete(walletData.address);
        }, 2000); // Give user time to see the warning
      }
    }
  };


  return (
    <motion.div 
      className="space-y-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {!walletData ? (
        <>
          <div className="bg-white/5 border border-white/10 overflow-hidden rounded-lg">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="bg-primary/20 p-2 rounded-full mr-3">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Secure Wallet Creation</h4>
                  <p className="text-white/70 text-sm">Your wallet will be created securely and linked to your verified identity</p>
                </div>
              </div>
              
              <button
                onClick={createWallet}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-medium transition-colors"
                aria-label="Create wallet"
                aria-busy={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Creating Your Secure Wallet...</span>
                  </>
                ) : (
                  <>
                    <Shield className="h-5 w-5" />
                    <span>Create Your Wallet</span>
                  </>
                )}
              </button>
              
              {loading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-center text-white/60 mt-2"
                >
                  This may take a few moments. Please don't refresh the page.
                </motion.div>
              )}
            </div>
          </div>
          
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4 flex items-start"
            >
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-200 font-medium">Error</p>
                <p className="text-sm text-red-200">{error}</p>
                {error.includes('Network') && (
                  <button 
                    onClick={() => createWallet()} 
                    className="text-xs text-red-300 underline mt-2 hover:text-red-100"
                  >
                    Try again
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </>
      ) : (
        <>
          <div className="bg-white/5 border border-white/10 overflow-hidden rounded-lg">
            <div className="p-4 pb-2 border-b border-white/10">
              <div className="text-lg flex items-center">
                <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                Wallet Created Successfully
              </div>
              <p className="text-white/70 text-sm">
                Your wallet is now ready to use. Keep your private key secure.
              </p>
            </div>
            
            <div className="space-y-4 p-4">
              <div>
                <label className="text-sm text-white/70 block mb-1">Wallet Address</label>
                <div className="flex items-center gap-2">
                  <input 
                    value={walletData.address} 
                    readOnly 
                    className="flex h-10 w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <button 
                    onClick={() => copyToClipboard(walletData.address, 'address')}
                    title="Copy address"
                    className="h-10 w-10 inline-flex items-center justify-center rounded-md border border-white/20 bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    {copied === 'address' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm text-white/70">Private Key</label>
                  <button 
                    onClick={() => setShowPrivateKey(!showPrivateKey)}
                    className="h-7 px-2 py-1 text-xs inline-flex items-center rounded-md hover:bg-white/10 transition-colors"
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
                
                <div className="mt-1 p-3 bg-slate-800 rounded-md border border-slate-700 break-all font-mono text-sm">
                  {showPrivateKey ? walletData.privateKey : '••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••'}
                </div>
                
                <div className="flex justify-end mt-2">
                  <button 
                    onClick={() => copyToClipboard(walletData.privateKey, 'privateKey')}
                    className="h-8 px-3 py-1 text-xs inline-flex items-center rounded-md border border-white/20 bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    {copied === 'privateKey' ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-1" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-1" /> Copy Key
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-amber-500/20 border border-amber-500/30 rounded-lg">
                <p className="text-amber-300 text-sm">
                  <strong>Important:</strong> Store your private key securely. If you lose it, you will lose access to your wallet and funds.
                </p>
              </div>
            </div>
            
            <div className="p-4 pt-2 border-t border-white/10">
              <motion.div className="space-y-4">
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-white/70 text-center"
                >
                  Make sure you've saved your private key before continuing.
                  You won't be able to access your wallet without it.
                </motion.p>
                
                <button
                  onClick={handleContinue}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                  aria-label="Continue to next step"
                >
                  <CheckCircle className="h-5 w-5" />
                  <span>I've Saved My Private Key - Continue</span>
                </button>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
