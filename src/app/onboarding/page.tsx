'use client';

// Prevent Next.js from prerendering this page
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Wallet, Shield, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { usePrivyWallet } from '@/hooks/usePrivyWallet';
import { SocialLoginForm } from '@/components/auth/SocialLoginForm';

// Modern onboarding states
enum OnboardingState {
  LANDING = 'landing',
  AUTHENTICATING = 'authenticating',
  SUCCESS = 'success'
}

export default function OnboardingPage() {
  const router = useRouter();
  const { authenticated, walletAddress, ready } = usePrivyWallet();
  const [currentState, setCurrentState] = useState<OnboardingState>(OnboardingState.LANDING);
  const [showSuccess, setShowSuccess] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (ready && authenticated && walletAddress) {
      setCurrentState(OnboardingState.SUCCESS);
      setShowSuccess(true);
      // Redirect to wallet after showing success
      setTimeout(() => {
        router.push('/wallet');
      }, 2000);
    }
  }, [ready, authenticated, walletAddress, router]);



  const handleAuthenticationComplete = (address?: string) => {
    console.log('Wallet created with address:', address);
    setCurrentState(OnboardingState.SUCCESS);
    setShowSuccess(true);
    // Redirect to wallet
    setTimeout(() => {
      router.push('/wallet');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#061328] via-primary to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
            <ArrowLeft size={18} />
            <span>Back to Home</span>
          </Link>
          
          <Link href="/" className="flex items-center">
            <Image 
              src="/logo.svg" 
              alt="NEDApay Logo" 
              width={120} 
              height={32} 
              className="h-8 w-auto"
            />
          </Link>
        </div>
        
        <div className="max-w-4xl mx-auto">
          {/* Landing State - Show features and social login */}
          {currentState === OnboardingState.LANDING && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              {/* Hero Section */}
              <div className="mb-12">
                <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Welcome to NEDApay
                </h1>
                <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
                  Your gateway to modern finance. Create your secure wallet in seconds with social login.
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid md:grid-cols-3 gap-8 mb-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="bg-gray-900/50 backdrop-blur-md rounded-xl p-6 border border-gray-700/50"
                >
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Zap className="text-blue-400" size={24} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Instant Setup</h3>
                  <p className="text-white/60 text-sm">
                    No downloads, no seed phrases. Get started with just your social account.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="bg-gray-900/50 backdrop-blur-md rounded-xl p-6 border border-gray-700/50"
                >
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Shield className="text-green-400" size={24} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Bank-Grade Security</h3>
                  <p className="text-white/60 text-sm">
                    Your wallet is secured by enterprise-grade encryption and social recovery.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="bg-gray-900/50 backdrop-blur-md rounded-xl p-6 border border-gray-700/50"
                >
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Wallet className="text-purple-400" size={24} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Multi-Chain Ready</h3>
                  <p className="text-white/60 text-sm">
                    Access Base, Ethereum, and other blockchains from one wallet.
                  </p>
                </motion.div>
              </div>

              {/* Social Login Form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="max-w-md mx-auto"
              >
                <SocialLoginForm 
                  onComplete={handleAuthenticationComplete}
                  title="Get Started"
                  subtitle="Choose your preferred sign-in method"
                />
              </motion.div>
            </motion.div>
          )}

          {/* Authenticating State */}
          {currentState === OnboardingState.AUTHENTICATING && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="w-12 h-12 border-t-2 border-blue-500 border-solid rounded-full animate-spin"></div>
              </div>
              <h2 className="text-2xl font-bold mb-4">Creating Your Wallet...</h2>
              <p className="text-white/70">
                We&apos;re setting up your secure wallet with social authentication.
              </p>
            </motion.div>
          )}

          {/* Success State */}
          {currentState === OnboardingState.SUCCESS && showSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={40} className="text-green-500" />
              </div>
              
              <h2 className="text-3xl font-bold mb-4">Welcome to NEDApay!</h2>
              <p className="text-white/70 mb-6">
                Your wallet has been created successfully.
              </p>
              
              {walletAddress && (
                <div className="bg-gray-900/50 backdrop-blur-md rounded-xl p-4 mb-6 max-w-md mx-auto">
                  <p className="text-sm text-white/60 mb-2">Your Wallet Address:</p>
                  <p className="font-mono text-sm text-blue-400 break-all">
                    {walletAddress}
                  </p>
                </div>
              )}
              
              <p className="text-sm text-white/50">
                Redirecting you to your wallet...
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
