'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { WalletLayout } from '@/components/wallet/WalletLayout';
import { ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { SUPPORTED_TOKENS } from '@/config/wallet';
import { useBlockradar } from '@/hooks/useBlockradar';
import { TokenBalance } from '@/store/useWalletStore';
import { z } from 'zod';

// Validation schema for the form
const sendFormSchema = z.object({
  recipient: z.string()
    .min(42, 'Please enter a valid wallet address')
    .max(44, 'Please enter a valid wallet address'),
  amount: z.string()
    .refine((val) => !isNaN(parseFloat(val)), { message: 'Amount must be a valid number' })
    .refine((val) => parseFloat(val) > 0, { message: 'Amount must be greater than 0' }),
  token: z.string().min(1, 'Please select a token'),
});

type SendFormData = z.infer<typeof sendFormSchema>;

export default function SendPage() {
  const router = useRouter();
  const { activeAddress } = useAuth();
  const { 
    balances, 
    transactions,
    isLoading, 
    error: blockradarError,
    selectedBlockchain,
    setSelectedBlockchain,
    withdraw,
    hasAddressForCurrentChain,
    getCurrentChainAddress,
    fetchTransactions,
    getBalancesForCurrentChain
  } = useBlockradar();
  
  // Form state
  const [formData, setFormData] = useState<SendFormData>({
    recipient: '',
    amount: '',
    token: 'USDC',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error on field change
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const validateForm = () => {
    try {
      sendFormSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path) {
            newErrors[err.path[0]] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };
  
  const getMaxAmount = () => {
    const token = getBalancesForCurrentChain().find(b => b.symbol === formData.token);
    return token?.balance || '0.00';
  };
  
  const handleSetMax = () => {
    setFormData(prev => ({ ...prev, amount: getMaxAmount() }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Use Blockradar to withdraw funds
      const response = await withdraw(
        formData.recipient,
        formData.amount,
        formData.token
      );
      
      // Set transaction hash from Blockradar response
      const txHash = response?.data?.hash || `tx_${Date.now()}`;
      
      // Simulate blockchain confirmation
      
      // Refresh transactions to show the new one
      setTimeout(() => {
        fetchTransactions();
      }, 1000);
      
    } catch (error) {
      console.error('Transaction failed', error);
      setErrors({ submit: 'Transaction failed. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <WalletLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10"
      >
        <div className="flex items-center mb-6">
          <button
            onClick={() => router.back()}
            className="mr-4 p-2 rounded-full bg-white/10 hover:bg-white/20"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-semibold">Send Payment</h1>
        </div>
        
        {txHash ? (
          <div className="flex flex-col items-center py-12 text-center">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', duration: 0.6 }}
              className="mb-6 text-green-400"
            >
              <CheckCircle2 size={80} />
            </motion.div>
            <h2 className="text-2xl font-bold mb-2">Payment Sent!</h2>
            <p className="text-white/70 mb-6">
              Your transaction has been successfully submitted to the blockchain.
            </p>
            <div className="bg-white/10 rounded-lg p-4 mb-6 w-full overflow-hidden">
              <p className="text-sm font-mono truncate">{txHash}</p>
            </div>
            <button 
              onClick={() => router.push('/wallet')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              Return to Wallet
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col space-y-6 mb-8">
              <div>
                <label htmlFor="blockchain" className="block text-sm font-medium text-gray-300">
                  Blockchain
                </label>
                <select
                  id="blockchain"
                  name="blockchain"
                  value={selectedBlockchain}
                  onChange={(e) => setSelectedBlockchain(e.target.value)}
                  className="mt-1 block w-full py-2 px-3 border border-gray-700 bg-gray-900 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-white"
                >
                  {Object.keys(balances.reduce<Record<string, boolean>>((acc, b) => {
                    // Properly type check and cast the balance object
                    const balance = b as TokenBalance & { blockchain?: string };
                    if (balance.blockchain) {
                      acc[balance.blockchain] = true;
                    }
                    return acc;
                  }, {})).map((chain) => (
                    <option key={chain} value={chain}>
                      {chain.charAt(0).toUpperCase() + chain.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="token" className="block text-sm font-medium text-gray-300">
                  Token
                </label>
                <select
                  id="token"
                  name="token"
                  value={formData.token}
                  onChange={handleInputChange}
                  className="mt-1 block w-full py-2 px-3 border border-gray-700 bg-gray-900 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-white"
                >
                  {getBalancesForCurrentChain().map((token) => (
                    <option key={token.symbol} value={token.symbol}>
                      {token.symbol}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-white/80 mb-2 font-medium">Recipient Address</label>
              <input
                type="text"
                name="recipient"
                placeholder="0x..."
                value={formData.recipient}
                onChange={handleInputChange}
                className={`w-full bg-white/5 border ${
                  errors.recipient ? 'border-red-500' : 'border-white/20'
                } rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.recipient && (
                <p className="mt-1 text-sm text-red-500">{errors.recipient}</p>
              )}
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="text-white/80 font-medium">Amount</label>
                <button
                  type="button"
                  onClick={handleSetMax}
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  Max: {getMaxAmount()} {formData.token}
                </button>
              </div>
              <div className="flex">
                <input
                  type="text"
                  name="amount"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className={`flex-1 bg-white/5 border ${
                    errors.amount ? 'border-red-500' : 'border-white/20'
                  } rounded-l-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              {errors.amount && (
                <p className="mt-1 text-sm text-red-500">{errors.amount}</p>
              )}
            </div>
            
            {txHash && (
              <div className="mt-4 p-4 bg-green-800 bg-opacity-20 rounded-md border border-green-600">
                <h3 className="flex items-center text-green-500 font-medium">
                  <CheckCircle2 className="mr-2" />
                  Transaction Submitted
                </h3>
                <p className="mt-2 text-sm text-gray-300">
                  Your transaction has been successfully submitted to the network. You can track its status in your transaction history.
                </p>
                <div className="mt-2 flex items-center">
                  <span className="text-sm font-medium text-gray-400">Transaction Hash:</span>
                  <code className="ml-2 px-2 py-1 bg-gray-800 rounded text-xs text-green-400 font-mono overflow-x-auto max-w-full">
                    {txHash}
                  </code>
                </div>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-white/80 mb-2 font-medium">Estimated Network Fee</label>
              <div className="bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white/60">
                0.0001 ETH
              </div>
            </div>
            
            {errors.submit && (
              <div className="mb-6 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400">
                {errors.submit}
              </div>
            )}
            
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/50 text-white flex items-center justify-center gap-2 rounded-lg py-4 font-medium transition-colors ${
                isSubmitting ? 'cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <>
                  <span className="animate-pulse">Processing...</span>
                </>
              ) : (
                <>
                  <Send size={20} />
                  <span>Send Payment</span>
                </>
              )}
            </button>
          </form>
        )}
      </motion.div>
    </WalletLayout>
  );
}
