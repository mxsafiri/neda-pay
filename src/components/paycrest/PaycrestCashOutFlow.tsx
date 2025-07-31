'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, Loader2, CheckCircle, ArrowUp } from 'lucide-react'
import { useNotifications } from '@/contexts/NotificationContext'
import { getSupportedCurrencies, getInstitutions, getExchangeRate } from '@/utils/paycrest'
import { useWallet } from '@privy-io/react-auth'
import { getTokenBalance } from '@/utils/blockchain'

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

const PaycrestCashOutFlow: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null)
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null)
  const [amount, setAmount] = useState('')
  const [exchangeData, setExchangeData] = useState<ExchangeRateData | null>(null)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [isSliding, setIsSliding] = useState(false)
  const [slideProgress, setSlideProgress] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const [showProviderDropdown, setShowProviderDropdown] = useState(false)
  const [usdcBalance, setUsdcBalance] = useState<string>('0')
  const [amountInUSDC, setAmountInUSDC] = useState<string>('0')
  const { addNotification } = useNotifications()
  const { user } = useWallet()

  // Fetch USDC balance
  const fetchBalance = useCallback(async () => {
    if (!user?.address) return

    if (!embeddedWallet?.address) return
    
    try {
      const balance = await getTokenBalance(BASE_TOKENS.USDC, embeddedWallet.address as `0x${string}`)
      setUsdcBalance(balance)
    } catch (error) {
      console.error('Error fetching USDC balance:', error)
    }
  }, [embeddedWallet?.address])

  // Load supported countries
  const loadCountries = useCallback(async () => {
    if (!validatePaycrestConfig()) {
      setError('Paycrest is not properly configured')
      return
    }

    setIsLoading(true)
    try {
      const currencies = await getSupportedCurrencies()
      setCountries(currencies)
      setError(null)
    } catch (error) {
      console.error('Failed to load countries:', error)
      setError('Failed to load supported countries')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load providers for selected country
  const loadProviders = useCallback(async (countryCode: string) => {
    setIsLoading(true)
    try {
      const institutions = await getInstitutions(countryCode)
      setProviders(institutions)
      setError(null)
    } catch (error) {
      console.error('Failed to load providers:', error)
      setError('Failed to load payment providers')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Get exchange rate
  const getRate = useCallback(async () => {
    if (!selectedCountry || !amount || parseFloat(amount) <= 0) return

    setIsLoading(true)
    try {
      const rate = await getExchangeRate('USDC', amount, selectedCountry.code)
      setExchangeRate(rate)
      setError(null)
    } catch (error) {
      console.error('Failed to get exchange rate:', error)
      setError('Failed to get exchange rate')
    } finally {
      setIsLoading(false)
    }
  }, [selectedCountry, amount])

  useEffect(() => {
    if (authenticated && embeddedWallet?.address) {
      fetchBalance()
      loadCountries()
    }
  }, [authenticated, embeddedWallet?.address, fetchBalance, loadCountries])

  useEffect(() => {
    if (selectedCountry) {
      loadProviders(selectedCountry.code)
    }
  }, [selectedCountry, loadProviders])

  useEffect(() => {
    if (amount && selectedCountry) {
      const debounceTimer = setTimeout(() => {
        getRate()
      }, 500)
      return () => clearTimeout(debounceTimer)
    }
  }, [amount, selectedCountry, getRate])

  // Handle country selection
  const handleCountrySelect = (country: PaycrestCurrency) => {
    setSelectedCountry(country)
    setSelectedProvider(null)
    setStep('provider')
  }

  // Handle provider selection
  const handleProviderSelect = (provider: PaycrestInstitution) => {
    setSelectedProvider(provider)
    setStep('amount')
  }

  // Handle amount input
  const handleAmountChange = (value: string) => {
    const numValue = value.replace(/[^0-9.]/g, '')
    if (numValue === '' || /^\d*\.?\d*$/.test(numValue)) {
      setAmount(numValue)
    }
  }

  // Handle slide to cash out
  const handleSlideMove = (progress: number) => {
    setSlideProgress(progress)
    if (progress >= 95 && !isSlideComplete) {
      setIsSlideComplete(true)
      handleCashOut()
    }
  }

  // Execute cash out
  const handleCashOut = async () => {
    if (!selectedCountry || !selectedProvider || !amount || !embeddedWallet?.address) return

    setIsProcessing(true)
    try {
      const orderData = {
        amount,
        token: 'USDC',
        fiat: selectedCountry.code,
        institution_id: selectedProvider.id,
        account_number: selectedProvider.type === 'mobile_money' ? phoneNumber : accountNumber,
        account_name: accountName || 'NEDApay User',
        reference: `NEDApay-${Date.now()}`
      }

      await createCashOutOrder(orderData)
      
      addNotification({
        type: 'cashout',
        title: 'Cash-out Initiated',
        message: `Your ${amount} USDC cash-out to ${selectedProvider.name} has been initiated.`
      })

      // Reset form
      setStep('country')
      setSelectedCountry(null)
      setSelectedProvider(null)
      setAmount('')
      setPhoneNumber('')
      setAccountNumber('')
      setAccountName('')
      setSlideProgress(0)
      setIsSlideComplete(false)
      
      if (onClose) onClose()
    } catch (error) {
      console.error('Cash-out failed:', error)
      setError('Cash-out failed. Please try again.')
      addNotification({
        type: 'system',
        title: 'Cash-out Failed',
        message: 'Your cash-out request could not be processed. Please try again.'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const getProviderIcon = (type: string) => {
    switch (type) {
      case 'mobile_money':
        return <Phone className="w-5 h-5" />
      case 'bank':
        return <Building2 className="w-5 h-5" />
      default:
        return <Globe className="w-5 h-5" />
    }
  }

  const isValidAmount = amount && parseFloat(amount) > 0 && parseFloat(amount) <= parseFloat(usdcBalance)
  const canProceed = step === 'confirm' && isValidAmount && selectedProvider && (selectedProvider.type === 'mobile_money' ? phoneNumber : accountNumber)

  return (
    <div className={`max-w-md mx-auto ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-sm bg-black/20 rounded-2xl p-6 border border-white/10"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Cash Out</h2>
          <p className="text-gray-300">Convert USDC to local currency</p>
        </div>

        {/* Step Indicator */}
        <div className="flex justify-center mb-6">
          <div className="flex space-x-2">
            {['country', 'provider', 'amount', 'confirm'].map((stepName, index) => (
              <div
                key={stepName}
                className={`w-3 h-3 rounded-full ${
                  ['country', 'provider', 'amount', 'details', 'confirm'].indexOf(step) >= index
                    ? 'bg-blue-500'
                    : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Country Selection */}
          {step === 'country' && (
            <motion.div
              key="country"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h3 className="text-lg font-semibold text-white mb-4">Select Country</h3>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {countries.map((country) => (
                    <button
                      key={country.code}
                      onClick={() => handleCountrySelect(country)}
                      className="w-full p-4 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg border border-gray-700 hover:border-blue-500 transition-all duration-200 text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white font-medium">{country.country}</div>
                          <div className="text-sm text-gray-400">{country.name} ({country.symbol})</div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Step 2: Provider Selection */}
          {step === 'provider' && selectedCountry && (
            <motion.div
              key="provider"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="flex items-center mb-4">
                <button
                  onClick={() => setStep('country')}
                  className="text-blue-400 hover:text-blue-300 mr-3"
                >
                  ←
                </button>
                <h3 className="text-lg font-semibold text-white">Select Provider</h3>
              </div>
              <p className="text-gray-300 mb-4">{selectedCountry.country}</p>
              
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {providers.map((provider) => (
                    <button
                      key={provider.id}
                      onClick={() => handleProviderSelect(provider)}
                      className="w-full p-4 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg border border-gray-700 hover:border-blue-500 transition-all duration-200 text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="text-blue-400">
                            {getProviderIcon(provider.type)}
                          </div>
                          <div>
                            <div className="text-white font-medium">{provider.name}</div>
                            <div className="text-sm text-gray-400">
                              {provider.type === 'mobile_money' ? 'Mobile Money' : 'Bank Transfer'} • {selectedCountry.symbol}
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Step 3: Amount Entry */}
          {step === 'amount' && selectedProvider && (
            <motion.div
              key="amount"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="flex items-center mb-4">
                <button
                  onClick={() => setStep('provider')}
                  className="text-blue-400 hover:text-blue-300 mr-3"
                >
                  ←
                </button>
                <h3 className="text-lg font-semibold text-white">Enter Amount</h3>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-300 mb-2">{selectedProvider.name}</p>
                <p className="text-sm text-gray-400">{selectedCountry?.country}</p>
              </div>

              {/* Amount Input */}
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Enter Amount</label>
                <div className="relative">
                  <input
                    type="text"
                    value={amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    placeholder="0.00"
                    className="w-full p-4 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-xl font-semibold focus:border-blue-500 focus:outline-none"
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <span className="text-blue-400 font-semibold">USDC</span>
                  </div>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-sm text-gray-400">Balance: {usdcBalance} USDC</span>
                  <button
                    onClick={() => setAmount(usdcBalance)}
                    className="text-sm text-blue-400 hover:text-blue-300"
                  >
                    Max
                  </button>
                </div>
              </div>

              {/* Exchange Rate Info */}
              {exchangeRate && (
                <div className="mb-4 p-4 bg-gray-800/30 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-300">You&apos;ll receive</span>
                    <span className="text-white font-semibold">
                      {exchangeRate.total} {selectedCountry?.symbol}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Exchange rate</span>
                    <span className="text-gray-300">
                      1 USDC = {exchangeRate.rate} {selectedCountry?.symbol}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Fees</span>
                    <span className="text-gray-300">{exchangeRate.fee} {selectedCountry?.symbol}</span>
                  </div>
                </div>
              )}

              {/* Account Details */}
              <div className="mb-6">
                <label className="block text-gray-300 mb-2">
                  {selectedProvider.type === 'mobile_money' ? 'Phone Number' : 'Account Number'}
                </label>
                <input
                  type="text"
                  value={selectedProvider.type === 'mobile_money' ? phoneNumber : accountNumber}
                  onChange={(e) => {
                    if (selectedProvider.type === 'mobile_money') {
                      setPhoneNumber(e.target.value)
                    } else {
                      setAccountNumber(e.target.value)
                    }
                  }}
                  placeholder={selectedProvider.type === 'mobile_money' ? '+255...' : 'Enter account number'}
                  className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <button
                onClick={() => setStep('confirm')}
                disabled={!isValidAmount || !(selectedProvider.type === 'mobile_money' ? phoneNumber : accountNumber)}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
              >
                Continue
              </button>
            </motion.div>
          )}

          {/* Step 4: Confirmation */}
          {step === 'confirm' && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="flex items-center mb-4">
                <button
                  onClick={() => setStep('amount')}
                  className="text-blue-400 hover:text-blue-300 mr-3"
                >
                  ←
                </button>
                <h3 className="text-lg font-semibold text-white">Confirm Cash Out</h3>
              </div>

              {/* Summary */}
              <div className="mb-6 p-4 bg-gray-800/30 rounded-lg">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Amount</span>
                    <span className="text-white">{amount} USDC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Provider</span>
                    <span className="text-white">{selectedProvider?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">
                      {selectedProvider?.type === 'mobile_money' ? 'Phone' : 'Account'}
                    </span>
                    <span className="text-white">
                      {selectedProvider?.type === 'mobile_money' ? phoneNumber : accountNumber}
                    </span>
                  </div>
                  {exchangeRate && (
                    <div className="flex justify-between font-semibold">
                      <span className="text-gray-300">You&apos;ll receive</span>
                      <span className="text-green-400">
                        {exchangeRate.total} {selectedCountry?.symbol}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Slide to Cash Out */}
              <div className="relative">
                <div className={`bg-gray-800 rounded-full p-1 relative overflow-hidden ${!canProceed ? 'opacity-50' : ''}`}>
                  <motion.div
                    className="absolute inset-y-1 left-1 bg-green-600 rounded-full"
                    style={{ width: `${Math.max(48, slideProgress)}px` }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                  <div className="relative flex items-center justify-center py-4 px-6">
                    <motion.div
                      className={`absolute left-2 w-10 h-10 bg-white rounded-full flex items-center justify-center ${canProceed ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                      drag={canProceed ? "x" : false}
                      dragConstraints={{ left: 0, right: 200 }}
                      dragElastic={0.1}
                      onDrag={(_, info) => {
                        if (!canProceed) return
                        const progress = Math.max(0, Math.min(100, (info.offset.x / 200) * 100))
                        handleSlideMove(progress)
                      }}
                      whileDrag={canProceed ? { scale: 1.1 } : {}}
                    >
                      {isProcessing ? (
                        <Loader2 className="w-5 h-5 text-green-600 animate-spin" />
                      ) : isSlideComplete ? (
                        <Check className="w-5 h-5 text-green-600" />
                      ) : (
                        <ArrowRight className="w-5 h-5 text-green-600" />
                      )}
                    </motion.div>
                    <span className="text-white font-medium ml-12">
                      {isProcessing ? 'Processing...' : isSlideComplete ? 'Complete!' : 'Swipe to Send'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
