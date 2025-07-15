'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { WalletLayout } from '@/components/wallet/WalletLayout';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Token options
const TOKEN_OPTIONS = [
  { symbol: 'TZS', name: 'NEDA Tanzanian Shilling', icon: '🇹🇿', price: 0.0004 },
  { symbol: 'USDC', name: 'USD Coin', icon: '🇺🇸', price: 1.0 },
  { symbol: 'EURC', name: 'Euro Coin', icon: '🇪🇺', price: 1.09 },
];

// Payment method options
const PAYMENT_METHODS = [
  { id: 'bank', name: 'Bank Transfer', icon: '🏦', cards: ['Banks'] },
  { id: 'mobile_money', name: 'Mobile Money', icon: '📱', cards: ['M-Pesa', 'Tigo Pesa'] },
  { id: 'card', name: 'Credit Card', icon: '💳', cards: ['Visa', 'Mastercard'] },
];

// Network options removed - network selection handled automatically based on token

export default function BuyPage() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [selectedToken, /* setSelectedToken */] = useState(TOKEN_OPTIONS[0]);
  const [selectedPaymentMethod, /* setSelectedPaymentMethod */] = useState(PAYMENT_METHODS[0]);
  const [selectedCard, /* setSelectedCard */] = useState(PAYMENT_METHODS[0].cards[0]);
  // USDC equivalent calculation removed for cleaner UI
  
  // Handle numeric keypad input
  const handleKeypadPress = (value: string) => {
    if (value === 'backspace') {
      setAmount(prev => prev.slice(0, -1));
      return;
    }
    
    // Handle decimal point
    if (value === '.') {
      if (amount.includes('.')) return;
      setAmount(prev => prev + '.');
      return;
    }
    
    // Limit to 2 decimal places
    if (amount.includes('.')) {
      const parts = amount.split('.');
      if (parts[1] && parts[1].length >= 2) return;
    }
    
    setAmount(prev => prev + value);
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
        <h1 className="text-2xl font-bold">Buy</h1>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Amount Input */}
        <div className="bg-gray-900 rounded-xl p-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400">Amount</span>
            <div className="flex items-center gap-1">
              <span className="text-blue-500 font-medium">{selectedToken.symbol}</span>
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </div>
          </div>
          
          <div className="text-center mb-2">
            <input
              type="text"
              inputMode="decimal"
              className="text-5xl font-bold bg-transparent text-center w-full outline-none"
              placeholder="0"
              value={amount}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
                  setAmount(value);
                }
              }}
              readOnly // Use keypad instead
            />
          </div>
          
          {/* USDC equivalent display removed */}
        </div>
        
        {/* Network Selection removed - network is automatically selected based on token */}
        
        {/* Payment Method */}
        <div className="bg-gray-900 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">{selectedPaymentMethod.icon}</span>
              <div>
                <div>Pay with</div>
                <div className="text-gray-400">{selectedPaymentMethod.name}</div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </div>
        </div>
        
        {/* Card Selection */}
        <div className="bg-gray-900 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div>
                <div>Using</div>
                <div className="text-gray-400">{selectedCard}</div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </div>
        </div>
        
        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0].map((key) => (
            <button
              key={key}
              onClick={() => handleKeypadPress(key.toString())}
              className="bg-gray-800 hover:bg-gray-700 rounded-full h-14 flex items-center justify-center text-xl font-medium"
            >
              {key}
            </button>
          ))}
          <button
            onClick={() => handleKeypadPress('backspace')}
            className="bg-gray-800 hover:bg-gray-700 rounded-full h-14 flex items-center justify-center"
          >
            ←
          </button>
        </div>
        
        {/* Continue Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={!amount || parseFloat(amount) <= 0}
          className={`w-full py-4 rounded-full text-white text-xl font-medium mt-6 ${
            !amount || parseFloat(amount) <= 0
              ? 'bg-gray-800 text-gray-400'
              : 'bg-gradient-to-r from-blue-600 to-blue-400'
          }`}
        >
          Continue to payment
        </motion.button>
      </motion.div>
    </WalletLayout>
  );
}
