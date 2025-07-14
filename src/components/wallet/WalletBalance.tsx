'use client';

import { FC, useEffect } from 'react'
import { motion } from 'framer-motion'
// import { theme } from '@/styles/theme' // Commented out as it's currently unused
import { useWalletStore } from '@/store/useWalletStore'
import { useAuth } from '@/hooks/useAuth'
import { LoadingState } from '@/components/ui/LoadingState'
import Link from 'next/link'

interface WalletBalanceProps {
  currency?: string
}

export const WalletBalance: FC<WalletBalanceProps> = ({ currency = 'TZS' }) => {
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
            className="w-full py-4 rounded-full bg-gradient-to-r from-blue-600 to-blue-400 text-white text-xl font-medium"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Buy
          </motion.button>
        </Link>
        <Link href="/stake" className="w-full">
          <motion.button 
            className="w-full py-4 rounded-full bg-gradient-to-r from-green-600 to-green-400 text-white text-xl font-medium"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Fund
          </motion.button>
        </Link>
      </div>
    </div>
  )
}
