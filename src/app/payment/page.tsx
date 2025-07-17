'use client';

// Prevent Next.js from prerendering this page
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { WalletLayout } from '@/components/wallet/WalletLayout';
import { ArrowLeft, CheckCircle, User, Building, AlertCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useWalletStore } from '@/store/useWalletStore';
import { useAuth } from '@/hooks/useAuth';

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { balances } = useWalletStore();
  const { authenticated } = useAuth();
  
  // Get parameters from URL
  const currency = searchParams.get('currency') || 'TZS';
  const initialAmount = searchParams.get('amount') || '';
  const recipient = searchParams.get('recipient') || '';
  const isManual = searchParams.get('manual') === 'true';
  
  const [amount, setAmount] = useState(initialAmount);
  const [recipientId, setRecipientId] = useState(recipient);
  const [recipientName, setRecipientName] = useState('');
  const [note, setNote] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Get current balance for selected currency
  const currentBalance = balances.find(b => b.symbol === currency)?.balance || '0';
  
  // Check if user has enough balance
  const hasEnoughBalance = parseFloat(currentBalance) >= parseFloat(amount || '0');
  
  // Simulate looking up recipient details
  useEffect(() => {
    if (recipientId) {
      // Simulate API call to get recipient details
      setTimeout(() => {
        if (recipientId === 'merchant123') {
          setRecipientName('Local Coffee Shop');
        } else if (recipientId.length > 3) {
          setRecipientName('Unknown Recipient');
        } else {
          setRecipientName('');
        }
      }, 500);
    } else {
      setRecipientName('');
    }
  }, [recipientId]);
  
  // Process payment
  const handlePayment = () => {
    if (!authenticated || !amount || !recipientId || !hasEnoughBalance) return;
    
    setPaymentStatus('processing');
    
    // Simulate payment processing
    setTimeout(() => {
      if (Math.random() > 0.1) { // 90% success rate for demo
        setPaymentStatus('success');
      } else {
        setPaymentStatus('error');
        setErrorMessage('Network error. Please try again.');
      }
    }, 2000);
  };
  
  // Reset and try again
  const handleTryAgain = () => {
    setPaymentStatus('idle');
    setErrorMessage('');
  };
  
  // Go to home after successful payment
  const handleDone = () => {
    router.push('/');
  };
  
  return (
    <WalletLayout>
      <div className="mb-6 flex items-center">
        <button 
          onClick={() => router.back()}
          className="mr-3 p-2 rounded-full hover:bg-white/10"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold">
          {paymentStatus === 'success' ? 'Payment Complete' : 'Payment'}
        </h1>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {paymentStatus === 'success' ? (
          // Success state
          <div className="text-center space-y-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="bg-green-500/20 p-8 rounded-full inline-block mx-auto"
            >
              <CheckCircle className="w-16 h-16 text-green-500" />
            </motion.div>
            
            <div>
              <h2 className="text-2xl font-bold mb-1">Payment Successful</h2>
              <p className="text-gray-400">Your payment has been processed</p>
            </div>
            
            <div className="bg-gray-900 rounded-xl p-6">
              <div className="flex justify-between mb-4">
                <span className="text-gray-400">Amount</span>
                <span className="font-bold">{amount} {currency}</span>
              </div>
              
              <div className="flex justify-between mb-4">
                <span className="text-gray-400">Recipient</span>
                <span>{recipientName || recipientId}</span>
              </div>
              
              {note && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Note</span>
                  <span>{note}</span>
                </div>
              )}
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDone}
              className="w-full py-4 rounded-full bg-gradient-to-r from-blue-600 to-blue-400 text-white text-xl font-medium"
            >
              Done
            </motion.button>
          </div>
        ) : paymentStatus === 'error' ? (
          // Error state
          <div className="text-center space-y-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="bg-red-500/20 p-8 rounded-full inline-block mx-auto"
            >
              <AlertCircle className="w-16 h-16 text-red-500" />
            </motion.div>
            
            <div>
              <h2 className="text-2xl font-bold mb-1">Payment Failed</h2>
              <p className="text-red-400">{errorMessage}</p>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleTryAgain}
              className="w-full py-4 rounded-full bg-gradient-to-r from-blue-600 to-blue-400 text-white text-xl font-medium"
            >
              Try Again
            </motion.button>
          </div>
        ) : (
          // Payment form
          <>
            {/* Current Balance */}
            <div className="bg-gray-900 rounded-xl p-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Available Balance</span>
                <span className="font-bold">{currentBalance} {currency}</span>
              </div>
            </div>
            
            {/* Amount Input */}
            <div className="bg-gray-900 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Amount</span>
                <span className="text-blue-500 font-medium">{currency}</span>
              </div>
              
              {isManual ? (
                <input
                  type="text"
                  inputMode="decimal"
                  className="w-full bg-transparent text-2xl font-bold outline-none"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
                      setAmount(value);
                    }
                  }}
                />
              ) : (
                <div className="text-2xl font-bold">{amount}</div>
              )}
              
              {!hasEnoughBalance && parseFloat(amount || '0') > 0 && (
                <p className="text-red-500 text-sm mt-1">
                  Insufficient balance
                </p>
              )}
            </div>
            
            {/* Recipient Input */}
            <div className="bg-gray-900 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Recipient</span>
                <User className="w-4 h-4 text-gray-500" />
              </div>
              
              {isManual ? (
                <input
                  type="text"
                  className="w-full bg-transparent outline-none"
                  placeholder="Enter recipient ID"
                  value={recipientId}
                  onChange={(e) => setRecipientId(e.target.value)}
                />
              ) : (
                <div>{recipientId}</div>
              )}
              
              {recipientName && (
                <div className="flex items-center gap-2 mt-2 text-sm">
                  <Building className="w-4 h-4 text-blue-500" />
                  <span>{recipientName}</span>
                </div>
              )}
            </div>
            
            {/* Note Input */}
            <div className="bg-gray-900 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Note (Optional)</span>
              </div>
              
              <input
                type="text"
                className="w-full bg-transparent outline-none"
                placeholder="What's this for?"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
            
            {/* Pay Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePayment}
              disabled={paymentStatus === 'processing' || !amount || !recipientId || !hasEnoughBalance}
              className={`w-full py-4 rounded-full text-white text-xl font-medium ${
                paymentStatus === 'processing' || !amount || !recipientId || !hasEnoughBalance
                  ? 'bg-gray-800 text-gray-400'
                  : 'bg-gradient-to-r from-blue-600 to-blue-400'
              }`}
            >
              {paymentStatus === 'processing' ? 'Processing...' : 'Pay'}
            </motion.button>
          </>
        )}
      </motion.div>
    </WalletLayout>
  );
}
