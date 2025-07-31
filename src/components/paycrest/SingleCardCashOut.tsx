'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, Loader2, CheckCircle, ArrowRight, Clock } from 'lucide-react'
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
  const [isPending, setIsPending] = useState(false)
  const [paymentOrderId, setPaymentOrderId] = useState<string | null>(null)
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
          currency: selectedCurrency.code
          // Removed providerId as it may be causing rate validation conflicts
        },
        reference: `nedapay-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        returnAddress: embeddedWallet.address
      }

      console.log('Creating Paycrest payment order:', paymentOrderData)

      // Use the existing exchange rate data that was already calculated
      // This ensures consistency between the rate shown to user and the rate sent to Paycrest
      console.log('Using existing exchange rate data:', exchangeData)
      console.log('Provider details:', selectedInstitution)
      
      // Validate that we have proper exchange rate data
      if (!exchangeData || !exchangeData.exchangeRate || exchangeData.exchangeRate <= 0) {
        throw new Error('Invalid exchange rate data. Please try selecting amount again.')
      }
      
      const usdcAmount = parseFloat(amountInUSDC)
      if (isNaN(usdcAmount) || usdcAmount <= 0) {
        throw new Error('Invalid USDC amount calculated')
      }

      // Use the exchange rate that was already calculated and shown to the user
      // This ensures consistency and should match what Paycrest expects
      paymentOrderData.rate = exchangeData.exchangeRate
      paymentOrderData.amount = usdcAmount
      
      // The issue might be that we need to use a different field structure
      // Let's try using the currency code instead of specific provider code for rate validation
      console.log('Final payment order data before sending:', {
        ...paymentOrderData,
        recipient: {
          ...paymentOrderData.recipient,
          // Keep the specific provider code but log it for debugging
          institution: selectedInstitution.code,
          providerId: selectedInstitution.code
        }
      })

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
      
      // Store payment order details
      setPaymentOrderId(result.data.id)
      const escrowAddress = result.data.receiveAddress
      const usdcAmountToSend = result.data.amount
      
      console.log('Escrow address:', escrowAddress)
      console.log('USDC amount to send:', usdcAmountToSend)
      
      // Show pending state for blockchain transaction
      setIsProcessing(false)
      setIsPending(true)
      
      addNotification({
        type: 'cashout',
        title: 'Payment Order Created',
        message: `Payment order created! Order ID: ${result.data.id}. Now sending USDC to Paycrest...`
      })
      
      // Execute gasless blockchain transaction to send USDC to Paycrest escrow
      try {
        console.log('Executing gasless USDC transfer to Paycrest escrow...', {
          escrowAddress,
          usdcAmountToSend,
          walletAddress: embeddedWallet?.address
        })
        
        // Import and configure Biconomy for gasless transactions
        const { sendGaslessUSDC, getBiconomyConfig } = await import('@/utils/biconomy')
        
        // Debug Biconomy configuration
        const biconomyConfig = getBiconomyConfig()
        console.log('Biconomy configuration:', biconomyConfig)
        
        if (!biconomyConfig.configured) {
          console.error('Biconomy not configured:', {
            bundlerUrl: !!biconomyConfig.bundlerUrl,
            paymasterUrl: !!biconomyConfig.paymasterUrl,
            chainId: biconomyConfig.chainId
          })
          // Fallback to regular transaction with user paying gas
          console.log('Falling back to regular transaction - user will pay gas fees')
        }
        
        // Get proper wallet client from Privy embedded wallet
        if (!embeddedWallet) {
          throw new Error('No wallet connected')
        }
        
        console.log('Getting wallet client from Privy embedded wallet...', {
          walletType: embeddedWallet.walletClientType,
          address: embeddedWallet.address,
          chainId: embeddedWallet.chainId
        })
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let walletClient: any = null
        
        try {
          // Get Ethereum provider from Privy wallet
          console.log('Calling getEthereumProvider()...')
          const provider = await embeddedWallet.getEthereumProvider()
          
          if (!provider) {
            throw new Error('Failed to get Ethereum provider from embedded wallet')
          }
          
          console.log('Ethereum provider obtained:', {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            isMetaMask: (provider as any).isMetaMask,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            chainId: (provider as any).chainId,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            selectedAddress: (provider as any).selectedAddress,
            hasRequest: typeof provider.request === 'function'
          })
          
          // Create wallet client using viem
          console.log('Creating wallet client with viem...')
          const { createWalletClient, custom } = await import('viem')
          const { base } = await import('viem/chains')
          
          walletClient = createWalletClient({
            account: embeddedWallet.address as `0x${string}`,
            chain: base,
            transport: custom(provider),
          })
          
          console.log('Wallet client created successfully:', {
            address: walletClient.account?.address,
            chainId: walletClient.chain?.id,
            hasWriteContract: typeof walletClient.writeContract === 'function'
          })
          
        } catch (providerError) {
          console.error('Failed to create wallet client:', providerError)
          const errorMessage = providerError instanceof Error ? providerError.message : 'Unknown error occurred'
          throw new Error(`Wallet client creation failed: ${errorMessage}`)
        }
        
        if (!walletClient) {
          throw new Error('Wallet client creation failed - no client available')
        }
        
        // Send USDC transfer using Biconomy (gasless) or fallback to regular transaction
        console.log('Sending USDC to escrow:', {
          escrowAddress,
          usdcAmount: usdcAmountToSend,
          biconomyConfigured: biconomyConfig.configured,
          walletClient: !!walletClient
        })
        
        let txHash: string | null = null
        
        if (biconomyConfig.configured) {
          // Try Biconomy gasless transaction first
          console.log('Attempting gasless transaction via Biconomy...')
          try {
            txHash = await sendGaslessUSDC(
              escrowAddress,
              usdcAmountToSend,
              walletClient
            )
          } catch (biconomyError) {
            console.error('Biconomy gasless transaction failed:', biconomyError)
            console.log('Falling back to regular transaction...')
          }
        }
        
        // Fallback to regular transaction if Biconomy failed or not configured
        if (!txHash) {
          console.log('Using regular transaction with gas fees...')
          const { sendToken } = await import('../../utils/blockchain')
          txHash = await sendToken(
            '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC contract on Base
            escrowAddress as `0x${string}`,
            usdcAmountToSend,
            walletClient
          )
        }
        
        console.log('USDC transfer successful! Transaction hash:', txHash)
        
        // Update to success state after blockchain transaction
        setIsPending(false)
        setIsComplete(true)
        
        addNotification({
          type: 'cashout',
          title: 'Cash-out Complete!',
          message: `${selectedCurrency.symbol} ${parseFloat(amount).toLocaleString()} has been sent to ${accountIdentifier} via ${selectedInstitution.name}. Transaction: ${txHash}`
        })
        
      } catch (blockchainError) {
        console.error('Blockchain transaction failed:', blockchainError)
        
        // Reset states on blockchain failure
        setIsPending(false)
        setIsProcessing(false)
        setSlideProgress(0)
        
        addNotification({
          type: 'system',
          title: 'Transaction Failed',
          message: `Failed to send USDC to Paycrest. Your payment order ${result.data.id} was created but the blockchain transaction failed. Please try again.`
        })
        
        return // Exit early on blockchain failure
      }
      
      // Reset form after showing success
      setTimeout(() => {
        setSelectedCurrency(null)
        setSelectedInstitution(null)
        setAmount('')
        setPhoneNumber('')
        setAccountNumber('')
        setExchangeData(null)
        setAmountInUSDC('0')
        setIsComplete(false)
        setPaymentOrderId(null)
        setSlideProgress(0)
      }, 4000)
      
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

        {/* Pending State Card */}
        {isPending && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800/50 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 text-center"
          >
            <div className="mb-6">
              <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-orange-400 animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Processing Cash-out</h2>
              <p className="text-slate-300 mb-4">
                Your payment order is being processed...
              </p>
              {paymentOrderId && (
                <div className="bg-slate-700/50 rounded-xl p-3 mb-4">
                  <p className="text-sm text-slate-400 mb-1">Order ID</p>
                  <p className="text-white font-mono text-sm">{paymentOrderId}</p>
                </div>
              )}
              <div className="text-sm text-slate-400">
                Sending {selectedCurrency?.symbol} {parseFloat(amount || '0').toLocaleString()} to {selectedInstitution?.name}
              </div>
            </div>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400"></div>
            </div>
          </motion.div>
        )}

        {/* Success State Card */}
        {isComplete && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800/50 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 text-center"
          >
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Cash-out Complete!</h2>
              <p className="text-slate-300 mb-4">
                Your money has been sent successfully
              </p>
              {paymentOrderId && (
                <div className="bg-slate-700/50 rounded-xl p-3 mb-4">
                  <p className="text-sm text-slate-400 mb-1">Order ID</p>
                  <p className="text-white font-mono text-sm">{paymentOrderId}</p>
                </div>
              )}
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-4">
                <div className="text-green-400 font-medium mb-1">
                  {selectedCurrency?.symbol} {parseFloat(amount || '0').toLocaleString()}
                </div>
                <div className="text-sm text-slate-400">
                  Sent to {selectedInstitution?.type === 'mobile_money' ? phoneNumber : accountNumber} via {selectedInstitution?.name}
                </div>
              </div>
              <p className="text-xs text-slate-500">
                This form will reset automatically in a few seconds
              </p>
            </div>
          </motion.div>
        )}

        {/* Main Form Card - Only show when not pending or complete */}
        {!isPending && !isComplete && (
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
                    <ArrowRight className="w-5 h-5" />
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
        )}
      </div>
    </div>
  )
}

export default SingleCardCashOut
