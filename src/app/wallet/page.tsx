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
import { Wallet, Shield, Zap } from 'lucide-react'

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
            {/* Logo/Brand */}
            <div className="space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <Wallet className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">NEDApay</h1>
                <p className="text-gray-400 text-lg">Your Digital Wallet</p>
              </div>
            </div>
            
            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-left">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium">Secure & Safe</h3>
                  <p className="text-gray-400 text-sm">Bank-level security for your digital assets</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 text-left">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium">Lightning Fast</h3>
                  <p className="text-gray-400 text-sm">Instant transactions on Base network</p>
                </div>
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


