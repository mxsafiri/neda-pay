'use client';

// Prevent Next.js from prerendering this page
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, Variants } from 'framer-motion';
import { ArrowRight, Key, Shield, LockKeyhole } from 'lucide-react';



export default function SignInPage() {
  const router = useRouter();
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Redirect to Privy onboarding since we no longer use PIN authentication
  useEffect(() => {
    router.push('/onboarding');
  }, [router]);
  
  const handleSignIn = async () => {
    setIsSigningIn(true);
    // Redirect to Privy onboarding since we no longer use PIN authentication
    router.push('/onboarding');
    setIsSigningIn(false);
  };
  
  // Animation variants with proper TypeScript typing
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 24
      }
    }
  };
  
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full"
        >
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-center mb-10"
          >
            <h1 className="text-4xl font-bold mb-3 text-white">Access Your Wallet</h1>
            <p className="text-white/70 text-lg">
              Sign in with your PIN to access your wallet
            </p>
          </motion.div>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <motion.div 
              variants={itemVariants}
              className="bg-[#0A1F44]/10 border border-[#0A1F44]/20 rounded-lg p-6 shadow-lg"
            >
              <div className="space-y-5">
                <motion.div 
                  variants={itemVariants}
                  className="flex items-start"
                >
                  <div className="w-12 h-12 rounded-full bg-[#0A1F44]/20 flex items-center justify-center mr-4">
                    <Key className="text-[#0A1F44] h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1 text-white">PIN Access</h3>
                    <p className="text-white/70">
                      Enter your 6-digit PIN to securely access your wallet
                    </p>
                  </div>
                </motion.div>
                
                <motion.div 
                  variants={itemVariants}
                  className="flex items-start"
                >
                  <div className="w-12 h-12 rounded-full bg-[#0A1F44]/20 flex items-center justify-center mr-4">
                    <Shield className="text-[#0A1F44] h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1 text-white">Protected Access</h3>
                    <p className="text-white/70">
                      Your wallet is protected with industry-standard encryption
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
            
            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSignIn}
              disabled={isSigningIn}
              className="w-full p-4 bg-[#0A1F44] hover:bg-[#0A1F44]/90 text-white rounded-md flex items-center justify-center transition-all shadow-lg font-medium text-lg"
            >
              {isSigningIn ? (
                <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LockKeyhole className="mr-2 h-5 w-5" />
                  Sign In with Privy <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </motion.button>
          </motion.div>
          

        </motion.div>
      </div>
    </div>
  );
}
