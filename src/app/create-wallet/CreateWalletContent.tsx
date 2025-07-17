'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Wallet, Shield } from 'lucide-react';
import { WalletAuthFlow } from '@/components/auth/WalletAuthFlow';
import { useWalletAuth } from '@/hooks/useWalletAuth';

export default function CreateWalletContent() {
  const router = useRouter();
  const { createWallet } = useWalletAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [walletCreated, setWalletCreated] = useState(false);
  
  const handleCreateWallet = async () => {
    setIsCreating(true);
    try {
      await createWallet();
      setWalletCreated(true);
    } catch (error) {
      console.error('Failed to create wallet:', error);
      setIsCreating(false);
    }
  };
  
  const handleAuthComplete = () => {
    // Redirect to wallet dashboard
    router.push('/wallet');
  };
  
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Create Your Wallet</h1>
            <p className="text-white/70">
              Set up your secure digital wallet to start using NEDA Pay
            </p>
          </div>
          
          {!walletCreated ? (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                    <Wallet className="text-primary h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Secure Wallet</h3>
                    <p className="text-sm text-white/70">
                      Your funds are securely managed by BlockRadar
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                    <Shield className="text-primary h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">PIN Protection</h3>
                    <p className="text-sm text-white/70">
                      Secure your wallet with a PIN for added security
                    </p>
                  </div>
                </div>
              </div>
              
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleCreateWallet}
                disabled={isCreating}
                className="w-full p-4 bg-primary hover:bg-primary/90 text-white rounded-lg flex items-center justify-center transition-colors"
              >
                {isCreating ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Create Wallet <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </motion.button>
            </div>
          ) : (
            <WalletAuthFlow onComplete={handleAuthComplete} />
          )}
        </div>
      </div>
    </div>
  );
}
