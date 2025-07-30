'use client'

import { FC, useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
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

export const CircularWalletBalance: FC<CircularWalletBalanceProps> = () => {
  const router = useRouter()
  const { theme } = useTheme()
  const { authenticated, walletAddress, getTokenBalances, ready } = usePrivyWallet()
  
  // State
  const [ethBalance, setEthBalance] = useState('0')
  const [usdcBalance, setUsdcBalance] = useState('0')
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [selectedCurrency, setSelectedCurrency] = useState<'USDC' | 'ETH' | 'TZS'>('USDC') // Default to USDC display
  const [usdcInTZS, setUsdcInTZS] = useState('0')
  
  // Refs for GSAP animations
  const balanceRef = useRef<HTMLDivElement>(null)
  const circleRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const depositBtnRef = useRef<HTMLButtonElement>(null)
  const cashOutBtnRef = useRef<HTMLButtonElement>(null)

  // Fetch balances when wallet is ready
  useEffect(() => {
    const fetchBalances = async () => {
      if (authenticated && ready && walletAddress) {
        setIsLoading(true)
        try {
          // Get both ETH and USDC balances
          const balances = await getTokenBalances()
          
          const ethToken = balances.find(token => token.symbol === 'ETH')
          const usdcToken = balances.find(token => token.symbol === 'USDC')
          
          const newEthBalance = ethToken?.balance || '0'
          const newUsdcBalance = usdcToken?.balance || '0'
          
          // Convert USDC to TZS (1 USDC ≈ 2559.39 TZS)
          const usdToTZS = 2559.39
          const usdcInTZSValue = (parseFloat(newUsdcBalance) * usdToTZS).toFixed(0)
          setUsdcInTZS(usdcInTZSValue)
          
          // Animate balance change if different
          const getDisplayBalance = (currency: string, eth: string, usdc: string, tzs: string) => {
            switch (currency) {
              case 'ETH': return parseFloat(eth)
              case 'USDC': return parseFloat(usdc)
              case 'TZS': return parseFloat(tzs)
              default: return parseFloat(usdc)
            }
          }
          
          const prevDisplayBalance = getDisplayBalance(selectedCurrency, ethBalance, usdcBalance, usdcInTZS)
          const newDisplayBalance = getDisplayBalance(selectedCurrency, newEthBalance, newUsdcBalance, usdcInTZSValue)
          
          if (prevDisplayBalance !== newDisplayBalance && balanceRef.current) {
            animateBalanceCount(balanceRef.current, prevDisplayBalance, newDisplayBalance)
          }
          
          setEthBalance(newEthBalance)
          setUsdcBalance(newUsdcBalance)
          setLastUpdated(new Date())
          
          console.log('Balances updated:', {
            ETH: newEthBalance,
            USDC: newUsdcBalance,
            wallet: walletAddress
          })
        } catch (error) {
          console.error('Error fetching balances:', error)
        } finally {
          setIsLoading(false)
        }
      }
    }

    fetchBalances()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchBalances, 30000)
    return () => clearInterval(interval)
  }, [authenticated, ready, walletAddress, getTokenBalances, ethBalance, usdcBalance, selectedCurrency, usdcInTZS])

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

  // Handle currency selection
  const handleCurrencyChange = (currency: 'USDC' | 'ETH' | 'TZS') => {
    if (balanceRef.current) {
      animateCurrencyToggle(balanceRef.current)
    }
    setSelectedCurrency(currency)
  }



  // Navigation handlers
  const handleDeposit = () => {
    router.push('/deposit')
  }

  const handleCashOut = () => {
    router.push('/off-ramp')
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
      className="flex flex-col items-center py-4 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >

      {/* Professional Circular Balance Display */}
      <motion.div 
        className="relative w-64 h-64 mx-auto mb-4"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6, ease: [0.68, -0.55, 0.265, 1.55] }}
      >
        {/* Gradient Background Circle */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-900/90 via-gray-800/95 to-black/90 backdrop-blur-xl shadow-2xl border border-gray-700/30" />
        
        {/* Animated Progress Ring */}
        <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background Ring */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="rgba(4, 45, 251, 0.3)"
            strokeWidth="2"
          />
          
          {/* USDC Progress Ring */}
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="url(#usdcGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${(parseFloat(usdcBalance) / Math.max(parseFloat(usdcBalance) + parseFloat(ethBalance), 1)) * 283} 283`}
            initial={{ strokeDasharray: "0 283" }}
            animate={{ strokeDasharray: `${(parseFloat(usdcBalance) / Math.max(parseFloat(usdcBalance) + parseFloat(ethBalance), 1)) * 283} 283` }}
            transition={{ duration: 2, ease: "easeOut" }}
          />
          
          {/* ETH Progress Ring */}
          <motion.circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="url(#ethGradient)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={`${(parseFloat(ethBalance) / Math.max(parseFloat(usdcBalance) + parseFloat(ethBalance), 1)) * 251} 251`}
            initial={{ strokeDasharray: "0 251" }}
            animate={{ strokeDasharray: `${(parseFloat(ethBalance) / Math.max(parseFloat(usdcBalance) + parseFloat(ethBalance), 1)) * 251} 251` }}
            transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
          />
          
          {/* Gradient Definitions */}
          <defs>
            <linearGradient id="usdcGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#1d4ed8" />
              <stop offset="100%" stopColor="#1e40af" />
            </linearGradient>
            <linearGradient id="ethGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="50%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#3730a3" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {isLoading ? (
            <LoadingState size="lg" text="" />
          ) : (
            <>
              {/* Main Balance Display */}
              <motion.div
                ref={balanceRef}
                className="mb-2"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-4xl font-bold text-white">
                  {selectedCurrency === 'ETH' 
                    ? parseFloat(ethBalance).toFixed(4)
                    : selectedCurrency === 'USDC'
                    ? parseFloat(usdcBalance).toFixed(2)
                    : parseInt(usdcInTZS).toLocaleString()}
                </div>
              </motion.div>
              
              {/* Currency Label */}
              <motion.div 
                className="mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <div className="text-lg font-medium text-gray-300">
                  {selectedCurrency === 'TZS' ? 'Tanzanian Shillings' : selectedCurrency}
                </div>
              </motion.div>
              
              {/* Currency Selector */}
              <motion.div 
                className="mb-3 flex items-center justify-center gap-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                {/* USDC Logo - only show when USDC is selected */}
                {selectedCurrency === 'USDC' && (
                  <Image 
                    src="/tokens/usdc.svg" 
                    alt="USDC" 
                    width={20}
                    height={20}
                    className="w-5 h-5"
                  />
                )}
                
                <select 
                  value={selectedCurrency}
                  onChange={(e) => handleCurrencyChange(e.target.value as 'USDC' | 'ETH' | 'TZS')}
                  className="bg-gray-800/80 border border-gray-600/50 rounded-lg px-3 py-1.5 text-sm text-gray-200 cursor-pointer hover:bg-gray-700/80 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500/50"
                >
                  <option value="USDC">USDC</option>
                  <option value="ETH">⚡ ETH</option>
                  <option value="TZS">🇹🇿 TZS</option>
                </select>
              </motion.div>
              
              {/* Balance Summary */}
              <motion.div 
                className="text-xs text-gray-400 space-y-0.5 leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-400 to-yellow-400"></div>
                  <span>USDC: ${parseFloat(usdcBalance).toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-400"></div>
                  <span>ETH: {parseFloat(ethBalance).toFixed(4)}</span>
                </div>
                <div className="text-gray-500 text-xs mt-1">
                  ≈ {parseInt(usdcInTZS).toLocaleString()} TZS
                </div>
              </motion.div>
            </>
          )}
        </div>
        
        {/* Subtle Glow Effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-500/10 via-transparent to-blue-500/10 animate-pulse" />
      </motion.div>

      {/* Primary Action Buttons */}
      <motion.div 
        className="flex gap-4 mt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
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

        {/* Cash-out Button */}
        <motion.button
          ref={cashOutBtnRef}
          onClick={handleCashOut}
          onMouseEnter={() => cashOutBtnRef.current && animateButtonHover(cashOutBtnRef.current, true)}
          onMouseLeave={() => cashOutBtnRef.current && animateButtonHover(cashOutBtnRef.current, false)}
          className={`${themeColors.button.secondary} px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 min-w-[140px] ${themeColors.border.button} border`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Cash-out
        </motion.button>
      </motion.div>

      {/* Wallet Info */}
      {walletAddress && lastUpdated && (
        <motion.div 
          className={`mt-4 text-center ${themeColors.text.secondary}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
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
