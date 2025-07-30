'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { CircularWalletBalance } from '@/components/wallet/CircularWalletBalance'
import { ModernLayout } from '@/components/layout/ModernLayout'
import { useWalletNotifications } from '@/hooks/useWalletNotifications'
import { DAppConnections } from '@/components/wallet/DAppConnections';
import { WalletHeader } from '@/components/layout/ModernHeader'
import { useModernTheme } from '@/contexts/ModernThemeContext'

export default function WalletPage() {
  // Initialize wallet notifications to track balance changes
  useWalletNotifications()
  const { theme } = useModernTheme()
  
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
  );
}


