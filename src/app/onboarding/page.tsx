'use client';

// Prevent Next.js from prerendering this page
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Define the steps in the onboarding process
enum OnboardingStep {
  WELCOME = 'welcome',
  CREATE_WALLET = 'create_wallet',
  KYC_VERIFICATION = 'kyc_verification',
  COMPLETE = 'complete'
}

// Simplified wallet creation component
const SimpleWalletCreation = ({ onComplete }: { onComplete: (address: string) => void }) => {
  const [isCreating, setIsCreating] = useState(false);
  
  const handleCreateWallet = async () => {
    setIsCreating(true);
    
    try {
      // Simulate wallet creation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a mock wallet address
      const mockAddress = `0x${Array.from({ length: 40 }, () => 
        Math.floor(Math.random() * 16).toString(16)).join('')}`;
      
      // Store in localStorage for persistence
      localStorage.setItem('neda_wallet', JSON.stringify({
        address: mockAddress,
        createdAt: new Date().toISOString()
      }));
      
      onComplete(mockAddress);
    } catch {
      // Handle error
      setIsCreating(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <p className="text-gray-300 mb-4">
        Click the button below to create your secure digital wallet. This will generate a unique wallet address for you.
      </p>
      
      <button
        onClick={handleCreateWallet}
        disabled={isCreating}
        className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-medium transition-colors ${
          isCreating 
            ? 'bg-blue-700/50 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {isCreating ? (
          <>
            <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
            Creating Wallet...
          </>
        ) : (
          <>
            Create Wallet
            <ArrowRight size={18} />
          </>
        )}
      </button>
    </div>
  );
};

// Simplified KYC form component
const SimpleKYCForm = ({ onComplete }: { onComplete: () => void }) => {
  const [fullName, setFullName] = useState('');
  const [country, setCountry] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      onComplete();
    } catch {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium mb-2">
          Full Name
        </label>
        <input
          type="text"
          id="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter your full name"
          required
        />
      </div>
      
      <div>
        <label htmlFor="country" className="block text-sm font-medium mb-2">
          Country
        </label>
        <select
          id="country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        >
          <option value="">Select your country</option>
          <option value="tanzania">Tanzania</option>
          <option value="kenya">Kenya</option>
          <option value="nigeria">Nigeria</option>
          <option value="ghana">Ghana</option>
          <option value="south_africa">South Africa</option>
        </select>
      </div>
      
      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-medium transition-colors ${
          isSubmitting 
            ? 'bg-blue-700/50 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {isSubmitting ? (
          <>
            <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
            Submitting...
          </>
        ) : (
          <>
            Submit Verification
            <ArrowRight size={18} />
          </>
        )}
      </button>
    </form>
  );
};

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(OnboardingStep.WELCOME);
  const [userName, setUserName] = useState<string>('');
  const router = useRouter();
  
  // Handle wallet creation completion
  const handleWalletCreated = (address: string) => {
    // Store address in localStorage instead of component state
    localStorage.setItem('wallet_address', address);
    setCurrentStep(OnboardingStep.KYC_VERIFICATION);
  };

  // Handle KYC completion
  const handleKYCComplete = () => {
    setCurrentStep(OnboardingStep.COMPLETE);
    // Redirect to wallet after a short delay to show completion screen
    setTimeout(() => {
      router.push('/wallet');
    }, 3000);
  };

  // Handle name input for the welcome step
  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userName.trim().length > 0) {
      setCurrentStep(OnboardingStep.CREATE_WALLET);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#061328] via-primary to-black text-white">
      <div className="container mx-auto px-4 py-8">
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
        
        {/* Progress indicator */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            {Object.values(OnboardingStep).map((step, index) => (
              <div key={step} className="flex flex-col items-center">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    Object.values(OnboardingStep).indexOf(currentStep) >= index 
                      ? 'bg-blue-500' 
                      : 'bg-gray-700'
                  }`}
                >
                  {Object.values(OnboardingStep).indexOf(currentStep) > index ? (
                    <CheckCircle size={16} />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <span className="text-xs mt-2 capitalize">
                  {step.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
          <div className="relative h-1 bg-gray-700 mt-4">
            <div 
              className="absolute h-1 bg-blue-500 transition-all duration-500"
              style={{ 
                width: `${(Object.values(OnboardingStep).indexOf(currentStep) / (Object.values(OnboardingStep).length - 1)) * 100}%` 
              }}
            />
          </div>
        </div>
        
        <div className="max-w-3xl mx-auto">
          {/* Welcome step */}
          {currentStep === OnboardingStep.WELCOME && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-gray-900/50 backdrop-blur-md rounded-xl p-8 shadow-xl"
            >
              <h1 className="text-3xl font-bold mb-6 text-center">Welcome to NEDApay</h1>
              <p className="text-white/70 text-center mb-8">
                Let&apos;s get you set up with your digital wallet. First, we&apos;ll need to know what to call you.
              </p>
              
              <form onSubmit={handleNameSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your name"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                >
                  Continue
                  <ArrowRight size={18} />
                </button>
              </form>
            </motion.div>
          )}
          
          {/* Wallet Creation step */}
          {currentStep === OnboardingStep.CREATE_WALLET && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-gray-900/50 backdrop-blur-md rounded-xl p-8 shadow-xl"
            >
              <h1 className="text-3xl font-bold mb-6 text-center">Create Your Wallet</h1>
              <p className="text-white/70 text-center mb-8">
                Your digital wallet will be used to securely store and manage your assets.
              </p>
              
              <SimpleWalletCreation onComplete={handleWalletCreated} />
            </motion.div>
          )}
          
          {/* KYC Verification step */}
          {currentStep === OnboardingStep.KYC_VERIFICATION && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-gray-900/50 backdrop-blur-md rounded-xl p-8 shadow-xl"
            >
              <h1 className="text-3xl font-bold mb-6 text-center">Identity Verification</h1>
              <p className="text-white/70 text-center mb-8">
                To comply with regulations and protect your account, we need to verify your identity.
              </p>
              
              <SimpleKYCForm onComplete={handleKYCComplete} />
            </motion.div>
          )}
          
          {/* Complete step */}
          {currentStep === OnboardingStep.COMPLETE && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-gray-900/50 backdrop-blur-md rounded-xl p-8 shadow-xl text-center"
            >
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={40} className="text-green-500" />
              </div>
              
              <h1 className="text-3xl font-bold mb-4">Setup Complete!</h1>
              <p className="text-white/70 mb-8">
                Your wallet has been created and your identity verification is being processed. You&apos;re all set to start using NEDApay!
              </p>
              
              <p className="text-sm text-white/50 mb-4">
                Redirecting you to your wallet...
              </p>
              
              <div className="w-12 h-12 border-t-2 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
