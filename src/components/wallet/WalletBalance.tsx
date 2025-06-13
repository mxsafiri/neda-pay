'use client';

import { FC, useEffect } from 'react'
import { motion } from 'framer-motion'
import { theme } from '@/styles/theme'
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { useWalletStore } from '@/store/useWalletStore'
import { useAuth } from '@/hooks/useAuth'
import { LoadingState } from '@/components/ui/LoadingState'

interface WalletBalanceProps {
  currency?: string
}

export const WalletBalance: FC<WalletBalanceProps> = ({ currency = 'USDC' }) => {
  const { balances, isLoading, fetchBalances } = useWalletStore()
  const { authenticated, activeAddress } = useAuth()
  
  const balance = balances.find(b => b.symbol === currency)?.balance || '0.00'
  
  useEffect(() => {
    if (authenticated && activeAddress) {
      fetchBalances(activeAddress)
    }
  }, [authenticated, activeAddress, fetchBalances])

  return (
    <motion.div 
      className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 mb-6 border border-white/10 shadow-xl"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      style={{ '--primary': theme.colors.primary } as any}
    >
      {isLoading ? (
        <LoadingState size="sm" text="Loading balance..." />
      ) : (
        <div className="text-center">
          <motion.p 
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 0.7 }}
            transition={{ delay: 0.1 }}
            className="text-white/70 mb-2 font-medium"
          >
            Total Available
          </motion.p>
          <motion.h2 
            className="text-5xl font-bold mb-6 flex items-center justify-center gap-2"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            ${balance}
            <span className="text-base text-white/70">{currency}</span>
          </motion.h2>
          <div className="flex justify-center gap-4">
            <motion.button 
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl transition-colors font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowDownLeft className="w-5 h-5" />
              Deposit
            </motion.button>
            <motion.button 
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl transition-colors font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowUpRight className="w-5 h-5" />
              Send
            </motion.button>
          </div>
        </div>
      )}
    </motion.div>
  )
}
