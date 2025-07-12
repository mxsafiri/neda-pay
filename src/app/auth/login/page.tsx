'use client';

import React from 'react';
import { WalletLogin } from '@/components/auth/WalletLogin';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function LoginPage() {
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
              src="/images/logo.svg" 
              alt="NEDApay Logo" 
              width={120} 
              height={32} 
              className="h-8 w-auto"
            />
          </Link>
        </div>
        
        <div className="max-w-md mx-auto mt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold mb-4">Welcome to NEDApay</h1>
            <p className="text-white/70">
              Access your wallet to manage your digital assets securely
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <WalletLogin />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 text-center"
          >
            <p className="text-white/50 text-sm">
              By connecting your wallet, you agree to our{' '}
              <Link href="/terms" className="text-blue-400 hover:text-blue-300">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-blue-400 hover:text-blue-300">
                Privacy Policy
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
