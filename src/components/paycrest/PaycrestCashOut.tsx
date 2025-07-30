'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, DollarSign, CreditCard, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { usePrivyWallet } from '@/hooks/usePrivyWallet';
import { useTheme } from '@/contexts/ThemeContext';
import { LoadingState } from '@/components/ui/LoadingState';
import {
  getSupportedCurrencies,
  getInstitutions,
  getExchangeRate,
  verifyBankAccount,
  createCashOutOrder,
  validatePaycrestConfig,
  getOrderStatusBadge,
  type PaycrestCurrency,
  type PaycrestInstitution,
  type PaycrestRate,
  type PaycrestOrder,
} from '@/utils/paycrest';

interface PaycrestCashOutProps {
  initialAmount?: string;
}

type CashOutStep = 'amount' | 'destination' | 'review' | 'processing' | 'success' | 'error';

export const PaycrestCashOut: React.FC<PaycrestCashOutProps> = ({ initialAmount = '' }) => {
  const router = useRouter();
  const { theme } = useTheme();
  const { authenticated, sendTokenTransaction, getSpecificTokenBalance } = usePrivyWallet();

  // State management
  const [currentStep, setCurrentStep] = useState<CashOutStep>('amount');
  const [amount, setAmount] = useState(initialAmount);
  const [selectedCurrency, setSelectedCurrency] = useState<PaycrestCurrency | null>(null);
  const [selectedInstitution, setSelectedInstitution] = useState<PaycrestInstitution | null>(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [isVerifyingAccount, setIsVerifyingAccount] = useState(false);
  const [exchangeRate, setExchangeRate] = useState<PaycrestRate | null>(null);
  const [order, setOrder] = useState<PaycrestOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [usdcBalance, setUsdcBalance] = useState('0');
  // const [isLoading, setIsLoading] = useState(false);

  // Data
  const [currencies, setCurrencies] = useState<PaycrestCurrency[]>([]);
  const [institutions, setInstitutions] = useState<PaycrestInstitution[]>([]);

  // Theme colors
  const themeColors = {
    background: {
      primary: theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50',
      card: theme === 'dark' ? 'bg-gray-800/50' : 'bg-white',
      input: theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50',
    },
    text: {
      primary: theme === 'dark' ? 'text-white' : 'text-gray-900',
      secondary: theme === 'dark' ? 'text-gray-300' : 'text-gray-600',
      muted: theme === 'dark' ? 'text-gray-400' : 'text-gray-500',
    },
    border: {
      primary: theme === 'dark' ? 'border-gray-700' : 'border-gray-200',
      focus: theme === 'dark' ? 'border-blue-500' : 'border-blue-500',
    },
    button: {
      primary: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white',
      secondary: theme === 'dark' 
        ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
        : 'bg-gray-200 hover:bg-gray-300 text-gray-700',
    },
  };

  // Fetch USDC balance
  useEffect(() => {
    const fetchUSDCBalance = async () => {
      if (authenticated && getSpecificTokenBalance) {
        try {
          const balance = await getSpecificTokenBalance('0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'); // USDC on Base
          setUsdcBalance(balance);
        } catch (err) {
          console.error('Failed to fetch USDC balance:', err);
          setUsdcBalance('0');
        }
      }
    };

    fetchUSDCBalance();
  }, [authenticated, getSpecificTokenBalance]);

  // Initialize Paycrest data
  useEffect(() => {
    const initializePaycrest = async () => {
      if (!validatePaycrestConfig()) {
        setError('Paycrest is not properly configured. Please contact support.');
        return;
      }

      try {
        // setIsLoading(true);
        const [currenciesData] = await Promise.all([
          getSupportedCurrencies(),
        ]);
        setCurrencies(currenciesData);
        
        // Default to TZS for Tanzania
        const tzs = currenciesData.find(c => c.code === 'TZS');
        if (tzs) {
          setSelectedCurrency(tzs);
          await loadInstitutions(tzs.code);
        }
      } catch (err) {
        console.error('Failed to initialize Paycrest:', err);
        setError('Failed to load payment options. Please try again.');
      } finally {
        // setIsLoading(false);
      }
    };

    initializePaycrest();
  }, []);

  // Load institutions for selected currency
  const loadInstitutions = async (currencyCode: string) => {
    try {
      const institutionsData = await getInstitutions(currencyCode);
      setInstitutions(institutionsData);
    } catch (err) {
      console.error('Failed to load institutions:', err);
      setError('Failed to load payment providers.');
    }
  };

  // Get exchange rate
  const updateExchangeRate = async () => {
    if (!amount || !selectedCurrency) return;

    try {
      const rate = await getExchangeRate('USDC', amount, selectedCurrency.code);
      setExchangeRate(rate);
    } catch (err) {
      console.error('Failed to get exchange rate:', err);
      setError('Failed to get exchange rate.');
    }
  };

  // Verify bank account
  const handleVerifyAccount = async () => {
    if (!selectedInstitution || !accountNumber) return;

    setIsVerifyingAccount(true);
    try {
      const result = await verifyBankAccount(selectedInstitution.id, accountNumber);
      if (result.valid && result.account_name) {
        setAccountName(result.account_name);
        setError(null);
      } else {
        setError('Invalid account number. Please check and try again.');
      }
    } catch (err) {
      console.error('Account verification failed:', err);
      setError('Failed to verify account. Please try again.');
    } finally {
      setIsVerifyingAccount(false);
    }
  };

  // Create cash-out order
  const handleCreateOrder = async () => {
    if (!selectedCurrency || !selectedInstitution || !accountNumber || !accountName || !amount) {
      setError('Please fill in all required fields.');
      return;
    }

    setCurrentStep('processing');
    // setIsLoading(true);

    try {
      // Create Paycrest order
      const orderData = {
        amount,
        token: 'USDC',
        fiat: selectedCurrency.code,
        institution_id: selectedInstitution.id,
        account_number: accountNumber,
        account_name: accountName,
        reference: `NEDApay-${Date.now()}`,
      };

      const newOrder = await createCashOutOrder(orderData);
      setOrder(newOrder);

      // Send USDC to Paycrest receiving address
      const txHash = await sendTokenTransaction(
        '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC contract address
        newOrder.receiving_address as `0x${string}`,
        amount
      );

      if (txHash) {
        setCurrentStep('success');
      } else {
        throw new Error('Failed to send USDC transaction');
      }
    } catch (err) {
      console.error('Cash-out failed:', err);
      setError(err instanceof Error ? err.message : 'Cash-out failed. Please try again.');
      setCurrentStep('error');
    } finally {
      // setIsLoading(false);
    }
  };

  // Step navigation
  const goToNextStep = () => {
    switch (currentStep) {
      case 'amount':
        if (parseFloat(amount) > 0 && parseFloat(amount) <= parseFloat(usdcBalance || '0')) {
          updateExchangeRate();
          setCurrentStep('destination');
        } else {
          setError('Please enter a valid amount.');
        }
        break;
      case 'destination':
        if (selectedInstitution && accountNumber && accountName) {
          setCurrentStep('review');
        } else {
          setError('Please complete all destination details.');
        }
        break;
      case 'review':
        handleCreateOrder();
        break;
    }
  };

  const goToPreviousStep = () => {
    switch (currentStep) {
      case 'destination':
        setCurrentStep('amount');
        break;
      case 'review':
        setCurrentStep('destination');
        break;
      case 'error':
        setCurrentStep('review');
        break;
    }
  };

  if (!authenticated) {
    return (
      <div className={`min-h-screen ${themeColors.background.primary} flex items-center justify-center`}>
        <div className={`${themeColors.background.card} p-8 rounded-2xl shadow-lg text-center`}>
          <h2 className={`text-xl font-semibold ${themeColors.text.primary} mb-4`}>
            Authentication Required
          </h2>
          <p className={`${themeColors.text.secondary} mb-6`}>
            Please connect your wallet to access cash-out functionality.
          </p>
          <button
            onClick={() => router.push('/landing')}
            className={`px-6 py-3 ${themeColors.button.primary} rounded-lg font-medium transition-colors`}
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${themeColors.background.primary}`}>
      {/* Header */}
      <div className={`${themeColors.background.card} border-b ${themeColors.border.primary}`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => currentStep === 'amount' ? router.back() : goToPreviousStep()}
              className={`p-2 ${themeColors.text.secondary} hover:${themeColors.text.primary} transition-colors`}
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className={`text-2xl font-bold ${themeColors.text.primary}`}>
                Cash Out
              </h1>
              <p className={`${themeColors.text.secondary}`}>
                Convert USDC to local currency
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center space-x-4 mb-8">
          {['amount', 'destination', 'review', 'processing'].map((step, index) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === step
                    ? 'bg-blue-600 text-white'
                    : ['success', 'error'].includes(currentStep) || 
                      ['amount', 'destination', 'review', 'processing'].indexOf(currentStep) > index
                    ? 'bg-green-600 text-white'
                    : `${themeColors.background.card} ${themeColors.text.muted} border ${themeColors.border.primary}`
                }`}
              >
                {['success', 'error'].includes(currentStep) || 
                 ['amount', 'destination', 'review', 'processing'].indexOf(currentStep) > index ? (
                  <CheckCircle size={16} />
                ) : (
                  index + 1
                )}
              </div>
              {index < 3 && (
                <div
                  className={`w-12 h-0.5 ${
                    ['success', 'error'].includes(currentStep) || 
                    ['amount', 'destination', 'review', 'processing'].indexOf(currentStep) > index
                      ? 'bg-green-600'
                      : `${themeColors.border.primary}`
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-100 border border-red-200 rounded-lg flex items-center gap-3"
          >
            <AlertCircle className="text-red-600" size={20} />
            <p className="text-red-800">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </motion.div>
        )}

        {/* Step Content */}
        <div className="max-w-2xl mx-auto">
          {/* Amount Step */}
          {currentStep === 'amount' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`${themeColors.background.card} p-8 rounded-2xl shadow-lg`}
            >
              <div className="text-center mb-8">
                <DollarSign className="mx-auto mb-4 text-blue-600" size={48} />
                <h2 className={`text-2xl font-bold ${themeColors.text.primary} mb-2`}>
                  How much would you like to cash out?
                </h2>
                <p className={`${themeColors.text.secondary}`}>
                  Available balance: {parseFloat(usdcBalance || '0').toFixed(2)} USDC
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className={`block text-sm font-medium ${themeColors.text.primary} mb-2`}>
                    Amount (USDC)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className={`w-full px-4 py-3 ${themeColors.background.input} ${themeColors.border.primary} border rounded-lg text-2xl text-center ${themeColors.text.primary} focus:outline-none focus:${themeColors.border.focus} focus:border-2`}
                    max={usdcBalance}
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="flex gap-2">
                  {['25', '50', '75', '100'].map((percentage) => (
                    <button
                      key={percentage}
                      onClick={() => {
                        const balance = parseFloat(usdcBalance || '0');
                        const amount = (balance * parseInt(percentage)) / 100;
                        setAmount(amount.toFixed(2));
                      }}
                      className={`flex-1 py-2 px-4 ${themeColors.button.secondary} rounded-lg text-sm font-medium transition-colors`}
                    >
                      {percentage}%
                    </button>
                  ))}
                </div>

                <button
                  onClick={goToNextStep}
                  disabled={!amount || parseFloat(amount) <= 0}
                  className={`w-full py-4 ${themeColors.button.primary} rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {/* Destination Step */}
          {currentStep === 'destination' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`${themeColors.background.card} p-8 rounded-2xl shadow-lg`}
            >
              <div className="text-center mb-8">
                <CreditCard className="mx-auto mb-4 text-blue-600" size={48} />
                <h2 className={`text-2xl font-bold ${themeColors.text.primary} mb-2`}>
                  Where should we send your money?
                </h2>
                <p className={`${themeColors.text.secondary}`}>
                  Choose your preferred payment method
                </p>
              </div>

              <div className="space-y-6">
                {/* Currency Selection */}
                <div>
                  <label className={`block text-sm font-medium ${themeColors.text.primary} mb-2`}>
                    Currency
                  </label>
                  <select
                    value={selectedCurrency?.code || ''}
                    onChange={(e) => {
                      const currency = currencies.find(c => c.code === e.target.value);
                      setSelectedCurrency(currency || null);
                      if (currency) loadInstitutions(currency.code);
                    }}
                    className={`w-full px-4 py-3 ${themeColors.background.input} ${themeColors.border.primary} border rounded-lg ${themeColors.text.primary} focus:outline-none focus:${themeColors.border.focus} focus:border-2`}
                  >
                    <option value="">Select currency</option>
                    {currencies.map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {currency.name} ({currency.symbol})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Institution Selection */}
                {selectedCurrency && (
                  <div>
                    <label className={`block text-sm font-medium ${themeColors.text.primary} mb-2`}>
                      Payment Provider
                    </label>
                    <select
                      value={selectedInstitution?.id || ''}
                      onChange={(e) => {
                        const institution = institutions.find(i => i.id === e.target.value);
                        setSelectedInstitution(institution || null);
                      }}
                      className={`w-full px-4 py-3 ${themeColors.background.input} ${themeColors.border.primary} border rounded-lg ${themeColors.text.primary} focus:outline-none focus:${themeColors.border.focus} focus:border-2`}
                    >
                      <option value="">Select provider</option>
                      {institutions.map((institution) => (
                        <option key={institution.id} value={institution.id}>
                          {institution.name} ({institution.type})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Account Details */}
                {selectedInstitution && (
                  <>
                    <div>
                      <label className={`block text-sm font-medium ${themeColors.text.primary} mb-2`}>
                        Account Number
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value)}
                          placeholder="Enter account number"
                          className={`flex-1 px-4 py-3 ${themeColors.background.input} ${themeColors.border.primary} border rounded-lg ${themeColors.text.primary} focus:outline-none focus:${themeColors.border.focus} focus:border-2`}
                        />
                        <button
                          onClick={handleVerifyAccount}
                          disabled={!accountNumber || isVerifyingAccount}
                          className={`px-6 py-3 ${themeColors.button.primary} rounded-lg font-medium transition-colors disabled:opacity-50`}
                        >
                          {isVerifyingAccount ? 'Verifying...' : 'Verify'}
                        </button>
                      </div>
                    </div>

                    {accountName && (
                      <div className="p-4 bg-green-100 border border-green-200 rounded-lg">
                        <p className="text-green-800 font-medium">
                          Account verified: {accountName}
                        </p>
                      </div>
                    )}
                  </>
                )}

                <button
                  onClick={goToNextStep}
                  disabled={!selectedInstitution || !accountNumber || !accountName}
                  className={`w-full py-4 ${themeColors.button.primary} rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {/* Review Step */}
          {currentStep === 'review' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`${themeColors.background.card} p-8 rounded-2xl shadow-lg`}
            >
              <div className="text-center mb-8">
                <CheckCircle className="mx-auto mb-4 text-blue-600" size={48} />
                <h2 className={`text-2xl font-bold ${themeColors.text.primary} mb-2`}>
                  Review your cash-out
                </h2>
                <p className={`${themeColors.text.secondary}`}>
                  Please confirm the details below
                </p>
              </div>

              <div className="space-y-6">
                {/* Transaction Summary */}
                <div className={`p-6 ${themeColors.background.input} rounded-lg space-y-4`}>
                  <div className="flex justify-between">
                    <span className={themeColors.text.secondary}>Amount</span>
                    <span className={`font-semibold ${themeColors.text.primary}`}>
                      {amount} USDC
                    </span>
                  </div>
                  
                  {exchangeRate && (
                    <>
                      <div className="flex justify-between">
                        <span className={themeColors.text.secondary}>Exchange Rate</span>
                        <span className={`font-semibold ${themeColors.text.primary}`}>
                          1 USDC = {exchangeRate.rate} {selectedCurrency?.code}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className={themeColors.text.secondary}>Fee</span>
                        <span className={`font-semibold ${themeColors.text.primary}`}>
                          {exchangeRate.fee} {selectedCurrency?.code}
                        </span>
                      </div>
                      
                      <div className="border-t pt-4 flex justify-between">
                        <span className={`font-semibold ${themeColors.text.primary}`}>
                          You&apos;ll receive
                        </span>
                        <span className={`font-bold text-lg ${themeColors.text.primary}`}>
                          {exchangeRate.total} {selectedCurrency?.code}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Destination Details */}
                <div className={`p-6 ${themeColors.background.input} rounded-lg space-y-4`}>
                  <h3 className={`font-semibold ${themeColors.text.primary}`}>
                    Destination
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className={themeColors.text.secondary}>Provider</span>
                      <span className={themeColors.text.primary}>{selectedInstitution?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={themeColors.text.secondary}>Account</span>
                      <span className={themeColors.text.primary}>{accountNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={themeColors.text.secondary}>Name</span>
                      <span className={themeColors.text.primary}>{accountName}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={goToNextStep}
                  className={`w-full py-4 ${themeColors.button.primary} rounded-lg font-semibold transition-colors`}
                >
                  Confirm Cash-out
                </button>
              </div>
            </motion.div>
          )}

          {/* Processing Step */}
          {currentStep === 'processing' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`${themeColors.background.card} p-8 rounded-2xl shadow-lg text-center`}
            >
              <Clock className="mx-auto mb-4 text-blue-600 animate-spin" size={48} />
              <h2 className={`text-2xl font-bold ${themeColors.text.primary} mb-4`}>
                Processing your cash-out...
              </h2>
              <p className={`${themeColors.text.secondary} mb-8`}>
                Please wait while we process your transaction. This may take a few moments.
              </p>
              <LoadingState size="lg" text="Processing..." />
            </motion.div>
          )}

          {/* Success Step */}
          {currentStep === 'success' && order && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`${themeColors.background.card} p-8 rounded-2xl shadow-lg text-center`}
            >
              <CheckCircle className="mx-auto mb-4 text-green-600" size={48} />
              <h2 className={`text-2xl font-bold ${themeColors.text.primary} mb-4`}>
                Cash-out initiated successfully!
              </h2>
              <p className={`${themeColors.text.secondary} mb-8`}>
                Your cash-out order has been created and is being processed.
              </p>

              <div className={`p-6 ${themeColors.background.input} rounded-lg mb-8 text-left`}>
                <h3 className={`font-semibold ${themeColors.text.primary} mb-4`}>
                  Order Details
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className={themeColors.text.secondary}>Order ID</span>
                    <span className={`font-mono text-sm ${themeColors.text.primary}`}>
                      {order.id.slice(0, 8)}...
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={themeColors.text.secondary}>Status</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getOrderStatusBadge(order.status)}`}>
                      {order.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={themeColors.text.secondary}>Amount</span>
                    <span className={themeColors.text.primary}>
                      {order.amount} USDC → {order.total_amount} {selectedCurrency?.code}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => router.push('/wallet')}
                  className={`flex-1 py-3 ${themeColors.button.secondary} rounded-lg font-medium transition-colors`}
                >
                  Back to Wallet
                </button>
                <button
                  onClick={() => router.push('/activity')}
                  className={`flex-1 py-3 ${themeColors.button.primary} rounded-lg font-medium transition-colors`}
                >
                  View Activity
                </button>
              </div>
            </motion.div>
          )}

          {/* Error Step */}
          {currentStep === 'error' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`${themeColors.background.card} p-8 rounded-2xl shadow-lg text-center`}
            >
              <AlertCircle className="mx-auto mb-4 text-red-600" size={48} />
              <h2 className={`text-2xl font-bold ${themeColors.text.primary} mb-4`}>
                Cash-out failed
              </h2>
              <p className={`${themeColors.text.secondary} mb-8`}>
                {error || 'Something went wrong. Please try again.'}
              </p>

              <div className="flex gap-4">
                <button
                  onClick={() => router.push('/wallet')}
                  className={`flex-1 py-3 ${themeColors.button.secondary} rounded-lg font-medium transition-colors`}
                >
                  Back to Wallet
                </button>
                <button
                  onClick={goToPreviousStep}
                  className={`flex-1 py-3 ${themeColors.button.primary} rounded-lg font-medium transition-colors`}
                >
                  Try Again
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
