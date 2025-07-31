'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { CircularWalletBalance } from '@/components/wallet/CircularWalletBalance'
import { ModernLayout } from '@/components/layout/ModernLayout'
import { useWalletNotifications } from '@/hooks/useWalletNotifications'
import { DAppConnections } from '@/components/wallet/DAppConnections'
import { WalletHeader } from '@/components/layout/ModernHeader'
import { useModernTheme } from '@/contexts/ModernThemeContext'
import { usePrivy } from '@privy-io/react-auth'
import { ConnectButton } from '@/components/auth/ConnectButton'
// Wallet icon removed - using text-based NEDApay branding instead

export default function WalletPage() {
  const { authenticated, ready } = usePrivy()
  const { theme } = useModernTheme()
  
  // Always call hooks unconditionally (React Hooks rules)
  useWalletNotifications()
  
  // Show loading state while Privy is initializing
  if (!ready) {
    return (
      <ModernLayout showHeader={false} showNavigation={false}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </ModernLayout>
    )
  }
  
  // Show Connect Wallet UI for unauthenticated users
  if (!authenticated) {
    return (
      <ModernLayout showHeader={false} showNavigation={false}>
        <div className="min-h-screen flex flex-col items-center justify-center px-6">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="text-center space-y-8 max-w-md"
          >
            {/* Clean FinTech Branding */}
            <div className="space-y-8">
              {/* NEDApay Wordmark */}
              <div className="text-center space-y-4">
                <h1 className="text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Poppins', fontWeight: 700, letterSpacing: '-0.02em' }}>
                  NEDApay
                </h1>
                <p className="text-gray-300 text-xl" style={{ fontFamily: 'Poppins', fontWeight: 100, letterSpacing: '0.01em' }}>
                  Accept Stablecoins, Swap instantly, Cash Out Easily
                </p>
              </div>
              
              {/* Supported Tokens */}
              <div className="flex justify-center space-x-3">
                <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm" style={{ fontFamily: 'Poppins', fontWeight: 500 }}>
                  USDC
                </span>
                <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm" style={{ fontFamily: 'Poppins', fontWeight: 500 }}>
                  cNGN
                </span>
                <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm" style={{ fontFamily: 'Poppins', fontWeight: 500 }}>
                  TSHC
                </span>
                <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm" style={{ fontFamily: 'Poppins', fontWeight: 500 }}>
                  IDRX
                </span>
              </div>
            </div>
            

            
            {/* Connect Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="pt-4"
            >
              <ConnectButton />
            </motion.div>
          </motion.div>
        </div>
      </ModernLayout>
    )
  }
  
  // Show authenticated wallet UI
  return (
    <ModernLayout showHeader={false} showNavigation={true}>
      {/* Custom Wallet Header */}
      <WalletHeader />
      
      <div className="px-6 py-4 space-y-6 max-w-md mx-auto">
        {/* Circular Wallet Balance */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <CircularWalletBalance />
        </motion.div>

        {/* DApp Connections */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
        >
          <div 
            className="p-6 rounded-xl border shadow-sm"
            style={{
              backgroundColor: theme.background.card,
              borderColor: theme.border.primary
            }}
          >
            <DAppConnections />
          </div>
        </motion.div>
      </div>
    </ModernLayout>
  )
}


