'use client';

// Prevent Next.js from prerendering this page
export const dynamic = 'force-dynamic';

import React from 'react';
import { motion } from 'framer-motion';
import { useLogin } from '@privy-io/react-auth';
import { Wallet, Shield, Zap, ArrowRight } from 'lucide-react';
import { ModernLayout, ModernPageContainer, ModernCard, ModernButton } from '@/components/layout/ModernLayout';
import { useModernTheme } from '@/contexts/ModernThemeContext';

export default function SignInPage() {
  const { login } = useLogin();

  // Authentication is now handled directly on this page with Privy Connect button

  const theme = useModernTheme();

  return (
    <ModernLayout showNavigation={false} showHeader={false}>
      <div className="min-h-screen flex items-center justify-center px-6">
        <ModernPageContainer className="max-w-md">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="text-center mb-8"
          >
            <div 
              className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center"
              style={{ backgroundColor: theme.colors.primary[600] }}
            >
              <Wallet size={32} style={{ color: '#ffffff' }} />
            </div>
            <h1 
              className="text-3xl font-bold mb-3"
              style={{ color: '#1f2937' }}
            >
              Welcome to NEDApay
            </h1>
            <p 
              className="text-lg leading-relaxed"
              style={{ color: '#6b7280' }}
            >
              Your modern stablecoin wallet for seamless digital payments
            </p>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            className="space-y-4 mb-8"
          >
            {[
              {
                icon: Shield,
                title: 'Bank-Grade Security',
                description: 'Your funds are protected with enterprise-level security'
              },
              {
                icon: Zap,
                title: 'Instant Transactions',
                description: 'Send and receive money instantly with low fees'
              },
              {
                icon: Wallet,
                title: 'Multi-Chain Support',
                description: 'Access multiple blockchains from one wallet'
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.1, ease: 'easeOut' }}
              >
                <ModernCard variant="default" className="flex items-center space-x-4 p-4">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                  >
                    <feature.icon 
                      size={20} 
                      style={{ color: '#3b82f6' }}
                    />
                  </div>
                  <div>
                    <h3 
                      className="font-medium mb-1"
                      style={{ color: '#1f2937' }}
                    >
                      {feature.title}
                    </h3>
                    <p 
                      className="text-sm"
                      style={{ color: '#6b7280' }}
                    >
                      {feature.description}
                    </p>
                  </div>
                </ModernCard>
              </motion.div>
            ))}
          </motion.div>

          {/* Connect Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6, ease: 'easeOut' }}
          >
            <ModernButton
              onClick={() => {
                // Trigger Privy login modal directly
                login()
              }}
              variant="primary"
              size="lg"
              className="w-full py-4 px-6 text-lg font-medium flex items-center justify-center space-x-3"
            >
              <span>Connect</span>
              <ArrowRight size={20} />
            </ModernButton>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8, ease: 'easeOut' }}
            className="text-center mt-8"
          >
            <p 
              className="text-lg mb-8"
              style={{ color: '#6b7280' }}
            >
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </motion.div>
        </ModernPageContainer>
      </div>
    </ModernLayout>
  );
}
