'use client';

import React, { useState, useEffect } from 'react';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import { AlertCircle, CheckCircle2, Copy, Eye, EyeOff, Key } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { WalletTagline } from './WalletTagline';
import Image from 'next/image';

export function WalletLogin() {
  // Include the WalletTagline component to apply custom styling
  useEffect(() => {
    // Add wallet-auth-logo-container class to the parent element
    const cardHeader = document.querySelector('.wallet-login-header');
    if (cardHeader) {
      cardHeader.classList.add('wallet-auth-logo-container');
    }
  }, []);
  const [privateKey, setPrivateKey] = useState('');
  const [error, setError] = useState('');
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [activeTab, setActiveTab] = useState('import');
  const [newWallet, setNewWallet] = useState<{ address: string; privateKey: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const { importPrivateKey, createWallet, isAuthenticated, address } = useWalletAuth();
  const router = useRouter();

  const handleImport = () => {
    if (!privateKey) {
      setError('Please enter your private key');
      return;
    }

    const result = importPrivateKey(privateKey);
    if (!result.success) {
      setError(result.error || 'Failed to import wallet');
    } else {
      setPrivateKey(''); // Clear for security
      router.push('/wallet'); // Redirect to wallet page
    }
  };

  const handleCreateWallet = () => {
    try {
      const wallet = createWallet();
      setNewWallet(wallet);
    } catch (error) {
      setError('Failed to create wallet. Please try again.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleShowPrivateKey = () => {
    setShowPrivateKey(!showPrivateKey);
  };

  const handleContinue = () => {
    router.push('/wallet');
  };

  if (isAuthenticated && !newWallet) {
    return (
      <div className="w-full max-w-md mx-auto bg-white/5 border border-white/10 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Wallet Connected
          </div>
          <p className="text-white/70 text-sm">
            Your wallet is connected and ready to use
          </p>
        </div>
        <div className="p-4">
          <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-md mb-4">
            <p className="text-sm text-green-400 font-medium">Address: {address}</p>
          </div>
        </div>
        <div className="p-4 border-t border-white/10">
          <button 
            onClick={() => router.push('/wallet')} 
            className="w-full p-3 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors"
          >
            Go to Wallet
          </button>
        </div>
      </div>
    );
  }

  if (newWallet) {
    return (
      <div className="w-full max-w-md mx-auto bg-white/5 border border-white/10 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <div className="text-lg font-semibold text-green-400">Wallet Created Successfully!</div>
          <p className="text-white/70 text-sm">
            Your wallet has been created. Please save your private key securely.
          </p>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm text-white/70 mb-1">Wallet Address</label>
            <div className="flex">
              <input 
                value={newWallet.address} 
                readOnly 
                className="font-mono text-sm flex-grow h-10 rounded-md border border-white/20 bg-white/10 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button 
                className="ml-2 h-10 px-3 inline-flex items-center justify-center rounded-md border border-white/20 bg-white/5 hover:bg-white/10 transition-colors" 
                onClick={() => copyToClipboard(newWallet.address)}
              >
                {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm text-white/70">Private Key</label>
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
            <div className="mt-1 p-3 bg-slate-800 rounded-md border border-slate-700 break-all font-mono text-sm">
              {showPrivateKey ? newWallet.privateKey : '••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••'}
            </div>
            <div className="flex justify-end mt-2">
              <button 
                className="h-8 px-3 py-1 text-xs inline-flex items-center rounded-md border border-white/20 bg-white/5 hover:bg-white/10 transition-colors" 
                onClick={() => copyToClipboard(newWallet.privateKey)}
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-1" /> Copied
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
        <div className="p-4 border-t border-white/10">
          <button onClick={handleContinue} className="w-full p-3 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors">
            Continue to Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <WalletTagline />
      
      <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-white/10 wallet-login-header">
          <div className="flex justify-center mb-4">
            <Image 
              src="/logo.svg" 
              alt="NEDApay Logo" 
              width={120} 
              height={40} 
              className="wallet-auth-logo"
            />
          </div>
          <div className="text-lg font-semibold">Access Your Wallet</div>
          <p className="text-white/70 text-sm">
            Import your existing wallet or create a new one
          </p>
        </div>
        <div className="p-4">
          <div className="w-full">
            <div className="grid w-full grid-cols-2 bg-white/5 rounded-md p-1 mb-4">
              <button 
                className={`p-2 rounded-md transition-colors ${activeTab === 'import' ? 'bg-white/10' : ''}`}
                onClick={() => setActiveTab('import')}
              >
                Import Wallet
              </button>
              <button 
                className={`p-2 rounded-md transition-colors ${activeTab === 'create' ? 'bg-white/10' : ''}`}
                onClick={() => setActiveTab('create')}
              >
                Create New
              </button>
            </div>
            
            {activeTab === 'import' && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm text-white/70 mb-1">Private Key</label>
                  <div className="relative">
                    <input
                      type={showPrivateKey ? "text" : "password"}
                      placeholder="Enter your private key"
                      value={privateKey}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrivateKey(e.target.value)}
                      className="w-full h-10 rounded-md border border-white/20 bg-white/10 px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <button
                      type="button"
                      className="absolute right-0 top-0 h-full px-3 inline-flex items-center justify-center hover:bg-white/5 transition-colors"
                      onClick={toggleShowPrivateKey}
                    >
                      {showPrivateKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
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
                  onClick={handleImport} 
                  className="w-full p-3 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors"
                >
                  Import Wallet
                </button>
              </div>
            )}
            
            {activeTab === 'create' && (
              <div className="mt-4 space-y-4">
                <div className="p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                  <p className="text-blue-400 text-sm">
                    Create a new wallet to store and manage your digital assets. Make sure to save your private key securely.
                  </p>
                </div>
                
                <button 
                  onClick={handleCreateWallet} 
                  className="w-full p-3 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors"
                >
                  Create New Wallet
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
