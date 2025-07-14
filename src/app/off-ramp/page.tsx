'use client';

import React, { useState } from 'react';
import { WalletLayout } from '@/components/wallet/WalletLayout';
import { motion } from 'framer-motion';
import { ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { useWalletStore } from '@/store/useWalletStore';
import { useAuth } from '@/hooks/useAuth';

export default function OffRampPage() {
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { balances } = useWalletStore();
  const { activeAddress } = useAuth();
  
  const availableBalance = balances.find(b => b.symbol === 'TZS')?.balance || '0';
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);
    
    try {
      // Here you would integrate with your off-ramp provider API
      // For now, we'll simulate a successful transaction after a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Success state
      setSuccess(true);
      setAmount('');
      setPhoneNumber('');
    } catch (err) {
      setError('Failed to process withdrawal. Please try again.');
      console.error('Off-ramp error:', err);
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <WalletLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10"
        >
          <h1 className="text-2xl font-bold mb-6">Cash Out</h1>
          
          {success ? (
            <div className="text-center py-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 text-green-400"
              >
                <CheckCircle size={32} />
              </motion.div>
              <h2 className="text-xl font-medium mb-2">Cash Out Successful!</h2>
              <p className="text-gray-400 mb-6">Your funds are on their way to your mobile money account.</p>
              <button
                onClick={() => setSuccess(false)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-full text-white font-medium transition-colors"
              >
                Cash Out Again
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Available Balance
                </label>
                <div className="text-2xl font-bold mb-4">
                  {parseFloat(availableBalance).toFixed(2)} TZS
                </div>
              </div>
              
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-2">
                  Amount to Cash Out
                </label>
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                  Mobile Money Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+255 XXX XXX XXX"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              {error && (
                <div className="flex items-center gap-2 text-red-400 bg-red-400/10 p-3 rounded-lg">
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}
              
              <button
                type="submit"
                disabled={isProcessing || !amount || !phoneNumber}
                className={`w-full py-4 rounded-full flex items-center justify-center gap-2 text-white text-lg font-medium transition-all ${
                  isProcessing || !amount || !phoneNumber
                    ? 'bg-gray-700 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500'
                }`}
              >
                {isProcessing ? (
                  <>
                    <span className="inline-block w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>Cash Out Now</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
              
              <div className="text-xs text-gray-400 text-center">
                Cash outs are typically processed within 5-30 minutes.
                <br />
                A small processing fee may apply.
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </WalletLayout>
  );
}
