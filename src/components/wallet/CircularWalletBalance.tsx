'use client'

import { FC, useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { usePrivyWallet } from '@/hooks/usePrivyWallet'
import { useTheme } from '@/contexts/ThemeContext'
import { LoadingState } from '@/components/ui/LoadingState'
import { 
  animateBalanceCount, 
  animatePageTransition, 
  animateButtonHover,
  animateCurrencyToggle,
  animateBalanceCirclePulse
} from '@/utils/animations'

interface CircularWalletBalanceProps {
  currency?: string
}

export const CircularWalletBalance: FC<CircularWalletBalanceProps> = ({ 
  currency = 'TZS' 
}) => {
  const router = useRouter()
  const { theme } = useTheme()
  const { authenticated, walletAddress, getBalance, ready } = usePrivyWallet()
  
  // State
  const [balance, setBalance] = useState('0')
  const [balanceInTZS, setBalanceInTZS] = useState('0')
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [showETH, setShowETH] = useState(false)
  
  // Refs for GSAP animations
  const balanceRef = useRef<HTMLSpanElement>(null)
  const circleRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const depositBtnRef = useRef<HTMLButtonElement>(null)
  const investBtnRef = useRef<HTMLButtonElement>(null)

  // Fetch balance when wallet is ready
  useEffect(() => {
    const fetchBalance = async () => {
      if (authenticated && ready && walletAddress) {
        setIsLoading(true)
        try {
          const ethBalance = await getBalance()
          const prevBalance = parseFloat(balance)
          const newBalance = parseFloat(ethBalance)
          
          setBalance(ethBalance)
          
          // Convert ETH to TZS
          const ethToUSD = 3200 // Approximate ETH price in USD
          const usdToTZS = 2559.39 // From exchange rate API
          const ethInTZS = (parseFloat(ethBalance) * ethToUSD * usdToTZS).toFixed(0)
          setBalanceInTZS(ethInTZS)
          
          // Animate balance change if different
          if (prevBalance !== newBalance && balanceRef.current) {
            const displayValue = showETH ? newBalance : parseInt(ethInTZS)
            animateBalanceCount(balanceRef.current, prevBalance, displayValue)
          }
          
          setLastUpdated(new Date())
        } catch (error) {
          console.error('Error fetching balance:', error)
        } finally {
          setIsLoading(false)
        }
      }
    }

    fetchBalance()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchBalance, 30000)
    return () => clearInterval(interval)
  }, [authenticated, ready, walletAddress, getBalance, balance, showETH])

  // Page transition animation
  useEffect(() => {
    if (containerRef.current) {
      animatePageTransition(containerRef.current)
    }
  }, [])

  // Circle pulse animation
  useEffect(() => {
    if (circleRef.current && !isLoading) {
      animateBalanceCirclePulse(circleRef.current)
    }
  }, [isLoading])

  // Handle currency toggle
  const handleCurrencyToggle = () => {
    if (balanceRef.current) {
      animateCurrencyToggle(balanceRef.current)
    }
    setShowETH(!showETH)
  }



  // Navigation handlers
  const handleDeposit = () => {
    router.push('/deposit')
  }

  const handleInvest = () => {
    router.push('/invest')
  }

  // Theme colors
  const themeColors = {
    background: {
      primary: theme === 'dark' ? 'bg-black' : 'bg-white',
      card: theme === 'dark' ? 'bg-gray-900/50' : 'bg-white/80',
      circle: theme === 'dark' ? 'bg-gray-900/30' : 'bg-gray-50/30'
    },
    text: {
      primary: theme === 'dark' ? 'text-white' : 'text-gray-900',
      secondary: theme === 'dark' ? 'text-gray-400' : 'text-gray-600',
      accent: 'text-blue-500'
    },
    border: {
      circle: theme === 'dark' ? 'border-blue-500/60' : 'border-blue-500/40',
      button: theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
    },
    button: {
      primary: theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white',
      secondary: theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-black'
    }
  }

  if (!authenticated || !ready) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <LoadingState size="lg" text="Connecting wallet..." />
      </div>
    )
  }

  return (
    <motion.div 
      ref={containerRef}
      className={`flex flex-col items-center py-12 px-6 ${themeColors.background.primary}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Amount Balance Header */}
      <motion.h2 
        className={`text-lg ${themeColors.text.secondary} mb-8 font-medium`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        Amount Balance
      </motion.h2>

      {/* Circular Balance Display */}
      <motion.div 
        ref={circleRef}
        className={`relative w-72 h-72 border-2 ${themeColors.border.circle} rounded-full flex items-center justify-center backdrop-blur-sm ${themeColors.background.circle} shadow-2xl`}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.8, ease: [0.68, -0.55, 0.265, 1.55] }}
        whileHover={{ scale: 1.02 }}
      >
        {/* Balance Content */}
        <div className="text-center cursor-pointer" onClick={handleCurrencyToggle}>
          {isLoading ? (
            <LoadingState size="lg" text="" />
          ) : (
            <>
              <motion.span 
                ref={balanceRef}
                className={`text-5xl font-bold ${themeColors.text.accent} block leading-tight`}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                {showETH ? parseFloat(balance).toFixed(4) : parseInt(balanceInTZS).toLocaleString()}
              </motion.span>
              <motion.span 
                className={`text-2xl ${themeColors.text.secondary} font-medium mt-2 block`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                {showETH ? 'ETH' : currency}
              </motion.span>
              
              {/* Toggle Hint */}
              <motion.p 
                className={`text-xs ${themeColors.text.secondary} mt-3 opacity-60`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 0.8 }}
              >
                Tap to toggle {showETH ? '→ TZS' : '→ ETH'}
              </motion.p>
            </>
          )}
        </div>

        {/* Decorative Ring */}
        <motion.div 
          className="absolute inset-0 rounded-full border border-blue-500/20"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>

      {/* Primary Action Buttons */}
      <motion.div 
        className="flex gap-6 mt-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        {/* Deposit Button */}
        <motion.button
          ref={depositBtnRef}
          onClick={handleDeposit}
          onMouseEnter={() => depositBtnRef.current && animateButtonHover(depositBtnRef.current, true)}
          onMouseLeave={() => depositBtnRef.current && animateButtonHover(depositBtnRef.current, false)}
          className={`${themeColors.button.primary} px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 min-w-[140px]`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Deposit
        </motion.button>

        {/* Invest Button */}
        <motion.button
          ref={investBtnRef}
          onClick={handleInvest}
          onMouseEnter={() => investBtnRef.current && animateButtonHover(investBtnRef.current, true)}
          onMouseLeave={() => investBtnRef.current && animateButtonHover(investBtnRef.current, false)}
          className={`${themeColors.button.secondary} px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 min-w-[140px] ${themeColors.border.button} border`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Invest
        </motion.button>
      </motion.div>

      {/* Wallet Info */}
      {walletAddress && lastUpdated && (
        <motion.div 
          className={`mt-8 text-center ${themeColors.text.secondary}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <p className="text-xs">
            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </p>
          <p className="text-xs mt-1">
            Updated {lastUpdated.toLocaleTimeString()}
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}
