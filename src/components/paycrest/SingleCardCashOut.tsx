'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, Loader2, CheckCircle, ArrowUp } from 'lucide-react'
import { useNotifications } from '@/contexts/NotificationContext'
import { getSupportedCurrencies, getInstitutions, getExchangeRate } from '@/utils/paycrest'
import { usePrivyWallet } from '@/hooks/usePrivyWallet'
import { getTokenBalance } from '@/utils/blockchain'
import { BASE_TOKENS } from '@/utils/blockchain'

interface Currency {
  code: string
  name: string
  symbol: string
  country?: string
}

interface Institution {
  name: string
  code: string
  type: string
}

interface ExchangeRateData {
  exchangeRate: number
  fee: number
  total: number
}

// Country flag mapping for Paycrest supported countries
const getCountryFlag = (countryCode: string): string => {
  const flagMap: { [key: string]: string } = {
    'TZS': '🇹🇿', // Tanzania
    'KES': '🇰🇪', // Kenya
    'NGN': '🇳🇬', // Nigeria
    'GHS': '🇬🇭', // Ghana
    'UGX': '🇺🇬', // Uganda
  }
  return flagMap[countryCode] || '🌍'
}

// Provider icon mapping for different payment methods
const getProviderIcon = (providerName: string, type: string): string => {
  // Mobile money providers
  if (providerName.toLowerCase().includes('m-pesa')) return '📱'
  if (providerName.toLowerCase().includes('tigo')) return '📱'
  if (providerName.toLowerCase().includes('mtn')) return '📱'
  if (providerName.toLowerCase().includes('airtel')) return '📱'
  if (providerName.toLowerCase().includes('opay')) return '📱'
  
  // Bank transfers
  if (type === 'bank' || providerName.toLowerCase().includes('bank')) return '🏦'
  
  // Default mobile money icon
  if (type === 'mobile_money') return '📱'
  
  return '💳'
}

const SingleCardCashOut: React.FC = () => {
  // State management
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null)
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null)
  const [amount, setAmount] = useState('')
  const [exchangeData, setExchangeData] = useState<ExchangeRateData | null>(null)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const [showProviderDropdown, setShowProviderDropdown] = useState(false)
  const [usdcBalance, setUsdcBalance] = useState<string>('0')
  const [amountInUSDC, setAmountInUSDC] = useState<string>('0')
  const [slideProgress, setSlideProgress] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  
  const { addNotification } = useNotifications()
  const { embeddedWallet } = usePrivyWallet()

  // Fetch USDC balance
  const fetchBalance = useCallback(async () => {
    if (!embeddedWallet?.address) return
    
    try {
      const balance = await getTokenBalance(BASE_TOKENS.USDC, embeddedWallet.address as `0x${string}`)
      setUsdcBalance(balance)
    } catch (error) {
      console.error('Failed to fetch USDC balance:', error)
    }
  }, [embeddedWallet])

  // Load currencies on mount
  useEffect(() => {
    const loadCurrencies = async () => {
      try {
        const currencyData = await getSupportedCurrencies()
        setCurrencies(currencyData)
      } catch (error) {
        console.error('Failed to load currencies:', error)
        addNotification({
          type: 'system',
          title: 'Error',
          message: 'Failed to load supported countries. Please try again.'
        })
      }
    }

    loadCurrencies()
    fetchBalance()
  }, [fetchBalance, addNotification])

  // Load institutions when currency is selected
  const handleCurrencySelect = async (currency: Currency) => {
    setSelectedCurrency(currency)
    setSelectedInstitution(null)
    setShowCountryDropdown(false)
    
    try {
      const institutionData = await getInstitutions(currency.code)
      setInstitutions(institutionData)
    } catch (error) {
      console.error('Failed to load institutions:', error)
      addNotification({
        type: 'system',
        title: 'Error',
        message: 'Failed to load payment methods. Please try again.'
      })
    }
  }

  // Handle institution selection
  const handleInstitutionSelect = (institution: Institution) => {
    setSelectedInstitution(institution)
    setShowProviderDropdown(false)
  }

  // Calculate exchange rate when amount changes
  useEffect(() => {
    const calculateRate = async () => {
      if (!amount || !selectedCurrency || parseFloat(amount) <= 0) {
        setExchangeData(null)
        setAmountInUSDC('0')
        return
      }

      try {
        const rateData = await getExchangeRate('USDC', amount, selectedCurrency.code)
        
        // Transform the rate data to match our interface
        const exchangeRateData: ExchangeRateData = {
          exchangeRate: parseFloat(rateData.rate || '2551.11'), // rate from PaycrestRate
          fee: parseFloat(rateData.fee || '0'),
          total: parseFloat(rateData.total || '0')
        }
        
        setExchangeData(exchangeRateData)
        
        // Calculate USDC equivalent
        const usdcAmount = parseFloat(amount) / exchangeRateData.exchangeRate
        setAmountInUSDC(usdcAmount.toFixed(6))
      } catch (error) {
        console.error('Failed to get exchange rate:', error)
      }
    }

    const debounceTimer = setTimeout(calculateRate, 500)
    return () => clearTimeout(debounceTimer)
  }, [amount, selectedCurrency])

  // Handle slide to send - Create actual Paycrest payment order
  const handleSlideToSend = async () => {
    if (!selectedCurrency || !selectedInstitution || !amount || !exchangeData || !embeddedWallet?.address) return

    setIsProcessing(true)
    
    try {
      // Get account identifier based on provider type
      const accountIdentifier = selectedInstitution.type === 'mobile_money' ? phoneNumber : accountNumber
      
      if (!accountIdentifier) {
        throw new Error('Please enter phone number or account number')
      }

      // Create payment order payload
      const paymentOrderData = {
        amount: parseFloat(amountInUSDC), // USDC amount
        token: 'USDC',
        rate: exchangeData.exchangeRate,
        network: 'base',
        recipient: {
          institution: selectedInstitution.code,
          accountIdentifier: accountIdentifier,
          accountName: 'NEDApay User', // Could be enhanced with user's name
          memo: `NEDApay cash-out to ${selectedInstitution.name}`, // Required field
          currency: selectedCurrency.code,
          providerId: selectedInstitution.code
        },
        reference: `nedapay-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        returnAddress: embeddedWallet.address
      }

      console.log('Creating Paycrest payment order:', paymentOrderData)

      // Get fresh rate data from Paycrest before creating order
      const rateResponse = await fetch(`/api/paycrest/rates/USDC/${amountInUSDC}/${selectedCurrency.code}`)
      const rateData = await rateResponse.json()
      
      if (!rateResponse.ok) {
        console.error('Rate fetch failed:', rateData)
        throw new Error('Failed to get current exchange rate')
      }

      console.log('Fresh rate data from API:', rateData)

      // Validate and update payment order with fresh rate data
      if (!rateData.data || !rateData.data.exchangeRate) {
        console.error('Invalid rate data structure:', rateData)
        throw new Error('Invalid exchange rate data received')
      }

      // Ensure amount and rate are valid numbers
      const freshRate = parseFloat(rateData.data.exchangeRate)
      const usdcAmount = parseFloat(amountInUSDC)
      
      if (isNaN(freshRate) || freshRate <= 0) {
        throw new Error('Invalid exchange rate received from API')
      }
      
      if (isNaN(usdcAmount) || usdcAmount <= 0) {
        throw new Error('Invalid USDC amount calculated')
      }

      // Update payment order with validated data
      paymentOrderData.rate = freshRate
      paymentOrderData.amount = usdcAmount

      console.log('Updated payment order with fresh rate:', paymentOrderData)

      // Create payment order via Paycrest API
      const response = await fetch('/api/paycrest/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentOrderData)
      })

      const result = await response.json()
      
      if (!response.ok) {
        console.error('Payment order creation failed:', result)
        throw new Error(result.details || result.error || 'Failed to create payment order')
      }

      console.log('Payment order created successfully:', result.data)
      
      // TODO: Execute blockchain transaction to send USDC to Paycrest escrow address
      // const escrowAddress = result.data.receiveAddress
      // const usdcAmount = result.data.amount
      
      setIsComplete(true)
      addNotification({
        type: 'cashout',
        title: 'Payment Order Created',
        message: `Payment order created successfully! Order ID: ${result.data.id}. Your ${selectedCurrency.symbol} ${parseFloat(amount).toLocaleString()} will be sent to ${accountIdentifier} via ${selectedInstitution.name}.`
      })
      
      // Reset form after success
      setTimeout(() => {
        setSelectedCurrency(null)
        setSelectedInstitution(null)
        setAmount('')
        setPhoneNumber('')
        setAccountNumber('')
        setExchangeData(null)
        setAmountInUSDC('0')
        setIsComplete(false)
        setSlideProgress(0)
      }, 5000) // Longer delay to show success message
      
    } catch (error) {
      console.error('Cash-out failed:', error)
      addNotification({
        type: 'system',
        title: 'Cash-out Failed',
        message: error instanceof Error ? error.message : 'Failed to process cash-out. Please try again.'
      })
      setIsProcessing(false)
      setSlideProgress(0)
    }
  }

  // Slide gesture handlers
  const handleSlideMove = (progress: number) => {
    setSlideProgress(Math.max(0, Math.min(100, progress)))
    
    if (progress >= 90 && !isProcessing && !isComplete) {
      handleSlideToSend()
    }
  }

  const handleSlideEnd = () => {
    if (slideProgress < 90) {
      setSlideProgress(0)
    }
  }

  const isFormValid = selectedCurrency && selectedInstitution && amount && parseFloat(amount) > 0 && 
    (selectedInstitution.type === 'mobile_money' ? phoneNumber : accountNumber)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-3xl font-bold text-white mb-2">Cash Out</h1>
          <p className="text-blue-200">Convert USDC to local currency</p>
        </div>

        {/* Main Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl p-6 border border-slate-700/50">
          
          {/* Country Selection */}
          <div className="mb-6">
            <label className="block text-white text-sm font-medium mb-3">Select Country</label>
            <div className="relative">
              <button
                onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-left text-white flex items-center justify-between hover:bg-slate-700/70 transition-colors"
              >
                <span className="flex items-center gap-3">
                  <span className="text-2xl">{selectedCurrency ? getCountryFlag(selectedCurrency.code) : '🌍'}</span>
                  <span>{selectedCurrency ? selectedCurrency.name : 'Choose country...'}</span>
                </span>
                <ChevronDown className={`w-5 h-5 transition-transform ${showCountryDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showCountryDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-700 border border-slate-600 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto">
                  {currencies.map((currency) => (
                    <button
                      key={currency.code}
                      onClick={() => handleCurrencySelect(currency)}
                      className="w-full px-4 py-3 text-left text-white hover:bg-slate-600 transition-colors flex items-center gap-3 border-b border-slate-600 last:border-b-0"
                    >
                      <span className="text-xl">{getCountryFlag(currency.code)}</span>
                      <div>
                        <div className="font-medium">{currency.name}</div>
                        <div className="text-sm text-slate-400">{currency.symbol} • {currency.country || currency.name}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Provider Selection */}
          {selectedCurrency && (
            <div className="mb-6">
              <label className="block text-white text-sm font-medium mb-3">Select Payment Method</label>
              <div className="relative">
                <button
                  onClick={() => setShowProviderDropdown(!showProviderDropdown)}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-left text-white flex items-center justify-between hover:bg-slate-700/70 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    {selectedInstitution && (
                      <span className="text-lg">{getProviderIcon(selectedInstitution.name, selectedInstitution.type)}</span>
                    )}
                    <span>{selectedInstitution ? selectedInstitution.name : 'Choose payment method...'}</span>
                  </span>
                  <ChevronDown className={`w-5 h-5 transition-transform ${showProviderDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showProviderDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-slate-700 border border-slate-600 rounded-xl shadow-xl z-40 max-h-48 overflow-y-auto">
                    {institutions.map((institution, index) => (
                      <button
                        key={index}
                        onClick={() => handleInstitutionSelect(institution)}
                        className="w-full px-4 py-3 text-left text-white hover:bg-slate-600 transition-colors flex items-center gap-3 border-b border-slate-600 last:border-b-0"
                      >
                        <span className="text-lg">{getProviderIcon(institution.name, institution.type)}</span>
                        <div>
                          <div className="font-medium">{institution.name}</div>
                          <div className="text-sm text-slate-400">
                            {institution.type === 'mobile_money' ? 'Mobile Money' : 'Bank Transfer'}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Phone Number Input (for mobile money) */}
          {selectedInstitution && selectedInstitution.type === 'mobile_money' && (
            <div className="mb-6">
              <label className="block text-white text-sm font-medium mb-3">Enter Telephone Number</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="089999"
                className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Account Number Input (for banks) */}
          {selectedInstitution && selectedInstitution.type === 'bank' && (
            <div className="mb-6">
              <label className="block text-white text-sm font-medium mb-3">Enter Account Number</label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Account number"
                className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Amount Input */}
          <div className="mb-6">
            <label className="block text-white text-sm font-medium mb-3">Enter Amount</label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={selectedCurrency ? `${selectedCurrency.symbol} 1000` : 'Amount'}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-20"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <button className="bg-amber-600 text-white px-3 py-1 rounded-lg text-sm font-medium">
                  {selectedCurrency?.symbol || 'TZS'}
                </button>
                <button className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-medium">
                  USDC
                </button>
              </div>
            </div>
          </div>

          {/* Balance and Conversion Info */}
          <div className="mb-6 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">You&apos;ll pay</span>
              <span className="text-slate-400">Base</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white font-medium">{amountInUSDC} USDC</span>
              <div className="text-right">
                <div className="text-slate-400 text-sm">Balance:</div>
                <div className="text-white font-medium">{parseFloat(usdcBalance).toFixed(2)} USDC</div>
                <button className="text-blue-400 text-sm hover:text-blue-300">Max</button>
              </div>
            </div>
            
            {exchangeData && (
              <div className="space-y-2 pt-3 border-t border-slate-600">
                <div className="text-xs text-slate-400">
                  1 USDC = {exchangeData.exchangeRate.toFixed(2)} {selectedCurrency?.symbol} • Payment usually completes in 30s
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Total {selectedCurrency?.symbol}</span>
                  <span className="text-white">{exchangeData.total.toFixed(2)} {selectedCurrency?.symbol}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Fees</span>
                  <span className="text-white">{exchangeData.fee.toFixed(2)} {selectedCurrency?.symbol}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Amount in USDC</span>
                  <span className="text-white">{amountInUSDC} USDC</span>
                </div>
              </div>
            )}
          </div>

          {/* Slide to Send Button */}
          <div className="relative">
            <motion.button
              disabled={!isFormValid || isProcessing}
              className={`w-full h-14 rounded-2xl relative overflow-hidden transition-all duration-300 ${
                isFormValid && !isProcessing
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-slate-600 cursor-not-allowed'
              }`}
              onPan={(event, info) => {
                const progress = (info.offset.x / 200) * 100
                handleSlideMove(progress)
              }}
              onPanEnd={handleSlideEnd}
            >
              {/* Progress Background */}
              <motion.div
                className="absolute inset-0 bg-green-500"
                initial={{ width: '0%' }}
                animate={{ width: `${slideProgress}%` }}
                transition={{ duration: 0.1 }}
              />
              
              {/* Button Content */}
              <div className="relative z-10 flex items-center justify-center h-full text-white font-medium">
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : isComplete ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>Complete!</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <ArrowUp className="w-5 h-5" />
                    <span>Swipe to Send</span>
                    <span className="ml-2 text-sm opacity-75">0 {selectedCurrency?.symbol || 'TZS'}</span>
                  </div>
                )}
              </div>
            </motion.button>
            
            <div className="text-center text-slate-400 text-sm mt-2">
              Drag right to confirm send
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SingleCardCashOut
