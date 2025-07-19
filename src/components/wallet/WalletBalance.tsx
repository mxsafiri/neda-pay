'use client';

import { FC, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useWalletStore } from '@/store/useWalletStore'
import { useAuth } from '@/hooks/useAuth'
import { LoadingState } from '@/components/ui/LoadingState'
import { useTheme } from '@/contexts/ThemeContext'
import Link from 'next/link'

interface WalletBalanceProps {
  currency?: string
}

export const WalletBalance: FC<WalletBalanceProps> = ({ currency = 'TZS' }) => {
  const { theme } = useTheme()
  const { balances, isLoading, fetchBalances } = useWalletStore()
  const { authenticated, activeAddress } = useAuth()
  
  const balance = balances.find(b => b.symbol === currency)?.balance || '0'
  
  useEffect(() => {
    if (authenticated && activeAddress) {
      fetchBalances(activeAddress)
    }
  }, [authenticated, activeAddress, fetchBalances])

  return (
    <div className="mb-8">
      <motion.h1 
        className="text-6xl font-bold mb-2"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {isLoading ? (
          <LoadingState size="lg" text="" />
        ) : (
          <>
            <span className="text-blue-500">{balance}</span>
            <span className="text-gray-300">|{currency}</span>
          </>
        )}
      </motion.h1>
      
      {/* Secondary balance display removed to reduce confusion */}
      
      <div className="grid grid-cols-2 gap-4 mt-8">
        <Link href="/buy" className="w-full">
          <motion.button 
            className="w-full py-4 rounded-full text-xl font-medium transition-all duration-200"
            style={{
              background: theme === 'dark' 
                ? 'linear-gradient(to right, #2563eb, #60a5fa)' 
                : 'linear-gradient(to right, #1d4ed8, #3b82f6)',
              color: '#ffffff',
              boxShadow: theme === 'dark' 
                ? '0 4px 14px 0 rgba(37, 99, 235, 0.25)' 
                : '0 4px 14px 0 rgba(29, 78, 216, 0.3)'
            }}
            whileHover={{ 
              scale: 1.02,
              boxShadow: theme === 'dark' 
                ? '0 6px 20px 0 rgba(37, 99, 235, 0.35)' 
                : '0 6px 20px 0 rgba(29, 78, 216, 0.4)'
            }}
            whileTap={{ scale: 0.98 }}
          >
            Buy
          </motion.button>
        </Link>
        <Link href="/invest" className="w-full">
          <motion.button 
            className="w-full py-4 rounded-full text-xl font-medium transition-all duration-200"
            style={{
              background: theme === 'dark' 
                ? 'linear-gradient(to right, #16a34a, #4ade80)' 
                : 'linear-gradient(to right, #15803d, #22c55e)',
              color: '#ffffff',
              boxShadow: theme === 'dark' 
                ? '0 4px 14px 0 rgba(22, 163, 74, 0.25)' 
                : '0 4px 14px 0 rgba(21, 128, 61, 0.3)'
            }}
            whileHover={{ 
              scale: 1.02,
              boxShadow: theme === 'dark' 
                ? '0 6px 20px 0 rgba(22, 163, 74, 0.35)' 
                : '0 6px 20px 0 rgba(21, 128, 61, 0.4)'
            }}
            whileTap={{ scale: 0.98 }}
          >
            Invest
          </motion.button>
        </Link>
      </div>
    </div>
  )
}
