'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePrivyWallet } from '@/hooks/usePrivyWallet'
import { getTokenBalance } from '@/utils/blockchain'
import { BASE_TOKENS } from '@/utils/blockchain'
import { ChevronDown, ArrowRight, Check, Loader2 } from 'lucide-react'
import { useNotifications } from '@/contexts/NotificationContext'
import {
  getSupportedCurrencies,
  getInstitutions,
  getExchangeRate,
  createCashOutOrder,
  validatePaycrestConfig,
  type PaycrestInstitution
} from '@/utils/paycrest'

interface ModernCashOutProps {
  onClose?: () => void
  className?: string
}

interface PayoutMethod {
  id: string
  name: string
  type: 'bank' | 'mobile'
  currency: string
  icon: string
  institution?: PaycrestInstitution
}

export const ModernCashOut: React.FC<ModernCashOutProps> = ({ onClose, className = '' }) => {
  // Wallet integration
  const { authenticated, embeddedWallet } = usePrivyWallet()
  const { addNotification } = useNotifications()
  
  // State management
  const [amount, setAmount] = useState('')
  const [selectedMethod, setSelectedMethod] = useState<PayoutMethod | null>(null)
  const [usdcBalance, setUsdcBalance] = useState('0')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showMethodDropdown, setShowMethodDropdown] = useState(false)
  const [slideProgress, setSlideProgress] = useState(0)
  const [isSlideComplete, setIsSlideComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [payoutMethods, setPayoutMethods] = useState<PayoutMethod[]>([])

  // Fetch USDC balance
  const fetchBalance = useCallback(async () => {
    if (!embeddedWallet?.address) return
    
    try {
      const balance = await getTokenBalance(BASE_TOKENS.USDC, embeddedWallet.address as `0x${string}`)
      setUsdcBalance(balance)
    } catch (error) {
      console.error('Error fetching USDC balance:', error)
    }
  }, [embeddedWallet?.address])

  useEffect(() => {
    if (authenticated && embeddedWallet?.address) {
      fetchBalance()
      initializePaycrest()
    }
  }, [authenticated, embeddedWallet?.address, fetchBalance])

  // Initialize Paycrest data
  const initializePaycrest = async () => {
    if (!validatePaycrestConfig()) {
      setError('Paycrest is not properly configured. Please contact support.')
      return
    }

    // Loading payout methods
    try {
      // Get supported currencies and institutions
      const currencies = await getSupportedCurrencies()
      const methods: PayoutMethod[] = []

      // Create payout methods from Paycrest data
      for (const currency of currencies.slice(0, 4)) { // Limit to first 4 for demo
        const institutions = await getInstitutions(currency.code)
        
        for (const institution of institutions.slice(0, 2)) { // Limit to 2 per currency
          methods.push({
            id: `${currency.code.toLowerCase()}-${institution.id}`,
            name: `${institution.name} (${currency.name})`,
            type: institution.type === 'mobile_money' ? 'mobile' : 'bank',
            currency: currency.code,
            icon: institution.type === 'mobile_money' ? '📱' : '🏦',
            institution
          })
        }
      }
      
      setPayoutMethods(methods)
    } catch (error) {
      console.error('Failed to initialize Paycrest:', error)
      setError('Failed to load payment options. Please try again.')
      
      // Fallback to mock data if API fails
      setPayoutMethods([
        { id: 'tz-bank', name: 'Tanzania Bank Transfer', type: 'bank', currency: 'TZS', icon: '🏦' },
        { id: 'tz-mobile', name: 'M-Pesa Tanzania', type: 'mobile', currency: 'TZS', icon: '📱' },
        { id: 'ke-mobile', name: 'M-Pesa Kenya', type: 'mobile', currency: 'KES', icon: '📱' },
        { id: 'ng-bank', name: 'Nigeria Bank Transfer', type: 'bank', currency: 'NGN', icon: '🏦' },
      ])
    } finally {
      // Finished loading methods
    }
  }

  // Quick amount selection
  const handleQuickAmount = (percentage: number) => {
    const balance = parseFloat(usdcBalance)
    const quickAmount = (balance * percentage / 100).toFixed(2)
    setAmount(quickAmount)
  }

  // Handle slide to cash out
  const handleSlideStart = () => {
    setSlideProgress(0)
    setIsSlideComplete(false)
  }

  const handleSlideMove = (progress: number) => {
    setSlideProgress(progress)
    if (progress >= 100 && !isSlideComplete && isValidAmount && selectedMethod) {
      setIsSlideComplete(true)
      handleCashOut()
    }
  }

  const handleCashOut = async () => {
    if (!selectedMethod || !amount || !embeddedWallet?.address) return
    
    setIsProcessing(true)
    setError(null)
    
    try {
      // Notify cash-out initiation
      addNotification({
        type: 'cashout',
        title: 'Cash-out Initiated',
        message: `Processing ${amount} USDC → ${selectedMethod.currency}`,
        data: { amount, currency: selectedMethod.currency, status: 'initiated' }
      })
      
      // Get exchange rate first
      const rate = await getExchangeRate('USDC', amount, selectedMethod.currency)
      console.log('Exchange rate:', rate)
      
      // Create cash-out order with Paycrest
      const orderData = {
        amount,
        token: 'USDC',
        fiat: selectedMethod.currency,
        institution_id: selectedMethod.institution?.id || selectedMethod.id,
        account_number: '1234567890', // This would come from user input in full implementation
        account_name: 'User Account', // This would come from user input in full implementation
        reference: `NEDApay-${Date.now()}`,
      }
      
      const order = await createCashOutOrder(orderData)
      
      // TODO: Send USDC to Paycrest receiving address
      // const txHash = await sendTokenTransaction(
      //   BASE_TOKENS.USDC,
      //   order.receiving_address as `0x${string}`,
      //   amount
      // )
      
      console.log('Cash-out order created:', order)
      
      // Notify successful cash-out
      addNotification({
        type: 'cashout',
        title: 'Cash-out Successful',
        message: `${amount} USDC cash-out order created successfully`,
        data: { amount, currency: selectedMethod.currency, status: 'completed', orderId: order.id }
      })
      
      // Success - close modal
      onClose?.()
    } catch (error) {
      console.error('Cash-out failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setError(`Cash-out failed: ${errorMessage}`)
      setIsSlideComplete(false)
      
      // Notify cash-out failure
      addNotification({
        type: 'cashout',
        title: 'Cash-out Failed',
        message: `Failed to process ${amount} USDC cash-out: ${errorMessage}`,
        data: { amount, currency: selectedMethod.currency, status: 'failed', error: errorMessage }
      })
    } finally {
      setIsProcessing(false)
      setSlideProgress(0)
    }
  }

  const isValidAmount = amount && parseFloat(amount) > 0 && parseFloat(amount) <= parseFloat(usdcBalance)
  const canSlide = isValidAmount && selectedMethod && !isProcessing

  return (
    <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 ${className}`}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900 rounded-2xl p-6 w-full max-w-md mx-auto shadow-2xl border border-gray-800"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <ArrowRight className="w-5 h-5 text-white rotate-180" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Cash Out</h2>
              <p className="text-sm text-gray-400">Available: {usdcBalance} USDC</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              ×
            </button>
          )}
        </div>

        {/* Amount Section */}
        <div className="mb-6">
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-white mb-2">
              ${amount || '0.00'}
            </div>
            <p className="text-sm text-gray-400">
              You get ≈ {selectedMethod ? (parseFloat(amount || '0') * 2559.39).toFixed(0) : '0'} {selectedMethod?.currency || 'TZS'} ↑
            </p>
          </div>

          {/* Quick Amount Buttons */}
          <div className="flex space-x-2 mb-4">
            {[25, 50, 75, 100].map((percentage) => (
              <button
                key={percentage}
                onClick={() => handleQuickAmount(percentage)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  amount === ((parseFloat(usdcBalance) * percentage / 100).toFixed(2))
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {percentage}%
              </button>
            ))}
          </div>

          {/* Custom Amount Input */}
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              max={usdcBalance}
              step="0.01"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
              USDC
            </div>
          </div>
        </div>

        {/* Payout Method Dropdown */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Payout Method
          </label>
          <div className="relative">
            <button
              onClick={() => setShowMethodDropdown(!showMethodDropdown)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-left flex items-center justify-between hover:border-gray-600 transition-colors"
            >
              {selectedMethod ? (
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{selectedMethod.icon}</span>
                  <div>
                    <div className="text-white font-medium">{selectedMethod.name}</div>
                    <div className="text-sm text-gray-400">{selectedMethod.type === 'bank' ? 'Bank Transfer' : 'Mobile Money'}</div>
                  </div>
                </div>
              ) : (
                <span className="text-gray-400">Select payout method</span>
              )}
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showMethodDropdown ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showMethodDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10 max-h-60 overflow-y-auto"
                >
                  {payoutMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => {
                        setSelectedMethod(method)
                        setShowMethodDropdown(false)
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors flex items-center space-x-3 first:rounded-t-lg last:rounded-b-lg"
                    >
                      <span className="text-xl">{method.icon}</span>
                      <div>
                        <div className="text-white font-medium">{method.name}</div>
                        <div className="text-sm text-gray-400">{method.type === 'bank' ? 'Bank Transfer' : 'Mobile Money'} • {method.currency}</div>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Fee Information */}
        {selectedMethod && amount && (
          <div className="mb-6 p-4 bg-gray-800 rounded-lg">
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="text-gray-400">Network fee</span>
              <span className="text-white">$0.43</span>
            </div>
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="text-gray-400">Service fee</span>
              <span className="text-white">$2.57</span>
            </div>
            <div className="border-t border-gray-700 pt-2 mt-2">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-gray-300">Total fees</span>
                <span className="text-white">$3.00</span>
              </div>
            </div>
          </div>
        )}

        {/* Slide to Cash Out Button */}
        <div className="relative">
          <div className={`bg-gray-800 rounded-full p-1 relative overflow-hidden ${!canSlide ? 'opacity-50' : ''}`}>
            <motion.div
              className="absolute inset-y-1 left-1 bg-blue-600 rounded-full"
              style={{ width: `${Math.max(48, slideProgress)}px` }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
            <div className="relative flex items-center justify-center py-4 px-6">
              <motion.div
                className={`absolute left-2 w-10 h-10 bg-white rounded-full flex items-center justify-center ${canSlide ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                drag={canSlide ? "x" : false}
                dragConstraints={{ left: 0, right: 200 }}
                dragElastic={0.1}
                onDragStart={handleSlideStart}
                onDrag={(_, info) => {
                  if (!canSlide) return
                  const progress = Math.max(0, Math.min(100, (info.offset.x / 200) * 100))
                  handleSlideMove(progress)
                }}
                whileDrag={canSlide ? { scale: 1.1 } : {}}
              >
                {isProcessing ? (
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                ) : isSlideComplete ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <ArrowRight className="w-5 h-5 text-blue-600" />
                )}
              </motion.div>
              <span className="text-white font-medium ml-12">
                {isProcessing ? 'Processing...' : isSlideComplete ? 'Complete!' : 'Slide to cash out'}
              </span>
            </div>
          </div>
          
          {/* Validation Messages */}
          {!isValidAmount && (
            <p className="text-red-400 text-sm mt-2 text-center">
              {!amount ? 'Enter an amount' : parseFloat(amount) > parseFloat(usdcBalance) ? 'Insufficient balance' : 'Invalid amount'}
            </p>
          )}
          
          {!selectedMethod && (
            <p className="text-red-400 text-sm mt-2 text-center">
              Select a payout method
            </p>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded-lg">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}
      </motion.div>
    </div>
  )
}
