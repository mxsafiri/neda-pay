'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Info } from 'lucide-react';
import { Token } from './TokenSelector';

interface SwapDetailsProps {
  fromToken: Token;
  toToken: Token;
  amount: string;
  estimatedAmount: string;
  rate: number;
  feePercentage: number;
  isLoading?: boolean;
}

export function SwapDetails({
  fromToken,
  toToken,
  amount,
  estimatedAmount,
  rate,
  feePercentage,
  isLoading = false
}: SwapDetailsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Calculate fee amount
  const numericAmount = parseFloat(amount || '0');
  const feeAmount = numericAmount * (feePercentage / 100);
  
  // Format rate for display
  const formattedRate = rate.toFixed(rate < 0.001 ? 6 : 4);
  
  return (
    <div className="mt-4 mb-6">
      <motion.div
        initial={false}
        animate={{ 
          height: isExpanded ? 'auto' : '36px',
          opacity: 1 
        }}
        className="bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10"
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between px-4 py-2 text-sm text-white/70 hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-1.5">
            <Info className="w-4 h-4" />
            <span>Swap Details</span>
          </div>
          <ChevronDown 
            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
          />
        </button>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-4 pb-3 space-y-2"
            >
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/60">Exchange Rate</span>
                <span>
                  1 {fromToken.symbol} = {isLoading ? '...' : formattedRate} {toToken.symbol}
                </span>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/60">Network Fee</span>
                <span>
                  {isLoading ? '...' : `${feePercentage}%`}
                </span>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/60">Fee Amount</span>
                <span>
                  {isLoading ? '...' : `${feeAmount.toFixed(4)} ${fromToken.symbol}`}
                </span>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/60">Minimum Received</span>
                <span>
                  {isLoading ? '...' : `${estimatedAmount} ${toToken.symbol}`}
                </span>
              </div>
              
              <div className="pt-2 text-xs text-white/40 italic">
                Prices and amounts are estimates. Your transaction may be executed at a different price depending on market conditions.
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
