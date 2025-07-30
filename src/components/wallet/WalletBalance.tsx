'use client';

import { FC, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { usePrivyWallet } from '@/hooks/usePrivyWallet'
import { LoadingState } from '@/components/ui/LoadingState'
import { useTheme } from '@/contexts/ThemeContext'
import Link from 'next/link'

interface WalletBalanceProps {
  currency?: string
}

export const WalletBalance: FC<WalletBalanceProps> = ({ currency = 'ETH' }) => {
  const { theme } = useTheme()
  const { authenticated, walletAddress, getBalance, ready } = usePrivyWallet()
  const [balance, setBalance] = useState('0')
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  
  // Fetch balance when wallet is ready
  useEffect(() => {
    const fetchWalletBalance = async () => {
      if (authenticated && walletAddress && ready) {
        setIsLoading(true)
        try {
          const ethBalance = await getBalance()
          setBalance(ethBalance)
          setLastUpdated(new Date())
        } catch (error) {
          console.error('Error fetching balance:', error)
          setBalance('0')
        } finally {
          setIsLoading(false)
        }
      }
    }
    
    fetchWalletBalance()
    
    // Set up interval to refresh balance every 30 seconds to detect deposits
    const interval = setInterval(fetchWalletBalance, 30000)
    
    return () => clearInterval(interval)
  }, [authenticated, walletAddress, ready, getBalance])

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
            <span className="text-blue-500">{parseFloat(balance).toFixed(4)}</span>
            <span className="text-gray-300"> {currency}</span>
          </>
        )}
      </motion.h1>
      
      {/* Balance update indicator */}
      {lastUpdated && (
        <p className="text-xs text-gray-400 mt-2">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      )}
      
      {/* Wallet address display for deposits */}
      {walletAddress && (
        <div className="mt-4 p-3 bg-gray-800/30 rounded-lg">
          <p className="text-xs text-gray-400 mb-1">Your wallet address:</p>
          <p className="text-xs font-mono text-gray-300 break-all">
            {walletAddress}
          </p>
        </div>
      )}
      
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
