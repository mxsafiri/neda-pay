'use client';

// Prevent Next.js from prerendering this page
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2 } from 'lucide-react';

export default function SignInPage() {
  const [walletAddress, setWalletAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!walletAddress || walletAddress.trim() === '') {
        throw new Error('Please enter your wallet address');
      }

      // Store the private key in local storage for the signInWithWallet function to use
      localStorage.setItem('neda_wallet', JSON.stringify({
        address: walletAddress, // Using the address as the private key for now
        createdAt: new Date().toISOString()
      }));
      
      // Redirect to the wallet login page which will handle authentication
      router.push('/auth/login');
      
    } catch (error) {
      console.error('Sign-in error:', error);
      // Handle error message safely for unknown type
      let errorMessage = 'Failed to sign in. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#061328] via-primary to-black text-white flex flex-col">
      <header className="container mx-auto px-4 py-6">
        <Link href="/landing" className="flex items-center gap-2">
          <Image 
            src="/logo.svg" 
            alt="NEDApay Logo" 
            width={40} 
            height={40} 
            className="w-10 h-10"
          />
          <span className="text-xl font-bold">NEDAwallet</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-white/5 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-xl"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-gray-400">Sign in to access your NEDAwallet</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="walletAddress" className="block text-sm font-medium text-gray-300 mb-2">
                Wallet Address
              </label>
              <input
                type="text"
                id="walletAddress"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="Enter your wallet address"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 rounded-full flex items-center justify-center gap-2 text-white text-lg font-medium transition-all ${
                isLoading
                  ? 'bg-blue-700/50 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <div className="text-center mt-6">
              <p className="text-gray-400">
                Don&apos;t have a wallet yet?{' '}
                <Link href="/onboarding" className="text-blue-400 hover:text-blue-300">
                  Create one now
                </Link>
              </p>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
