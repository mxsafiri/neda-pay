'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Key, Shield } from 'lucide-react';
import { WalletAuthFlow } from '@/components/auth/WalletAuthFlow';
import { useWalletAuth } from '@/hooks/useWalletAuth';

export default function SignInPage() {
  const router = useRouter();
  const { isWalletAuthenticated, signInWithWallet } = useWalletAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [showAuthFlow, setShowAuthFlow] = useState(false);
  
  // Check if wallet exists in local storage
  useEffect(() => {
    const walletData = localStorage.getItem('neda_wallet');
    if (!walletData) {
      // No wallet found, redirect to create wallet
      router.push('/create-wallet');
    }
  }, [router]);
  
  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signInWithWallet();
      setShowAuthFlow(true);
    } catch (error) {
      console.error('Failed to sign in:', error);
      setIsSigningIn(false);
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
            <h1 className="text-3xl font-bold mb-2">Access Your Wallet</h1>
            <p className="text-white/70">
              Sign in to your secure digital wallet
            </p>
          </div>
          
          {!showAuthFlow ? (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                    <Key className="text-primary h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Secure Access</h3>
                    <p className="text-sm text-white/70">
                      Verify your identity with your security PIN
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                    <Shield className="text-primary h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Device Recognition</h3>
                    <p className="text-sm text-white/70">
                      We'll verify this device is authorized to access your wallet
                    </p>
                  </div>
                </div>
              </div>
              
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleSignIn}
                disabled={isSigningIn}
                className="w-full p-4 bg-primary hover:bg-primary/90 text-white rounded-lg flex items-center justify-center transition-colors"
              >
                {isSigningIn ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Access Wallet <ArrowRight className="ml-2 h-4 w-4" />
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
