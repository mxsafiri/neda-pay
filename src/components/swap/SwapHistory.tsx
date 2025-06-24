'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, ArrowRightLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { SwapTransaction } from '@/hooks/useTokenSwap';

interface SwapHistoryProps {
  userId: string;
}

export function SwapHistory({ userId }: SwapHistoryProps) {
  const [transactions, setTransactions] = useState<SwapTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const fetchSwapHistory = async () => {
      if (!userId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Call the swap history API endpoint
        const response = await fetch(`/api/swap/history?userId=${encodeURIComponent(userId)}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || data.message || 'Failed to fetch swap history');
        }
        
        setTransactions(data.transactions);
      } catch (err) {
        console.error('Error fetching swap history:', err);
        setError(err instanceof Error ? err.message : 'Failed to load swap history');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSwapHistory();
  }, [userId]);
  
  // Format date to readable string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="mt-8 text-center">
        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
        <p className="text-sm text-white/60 mt-2">Loading swap history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8 text-center">
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between py-2 px-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 text-sm text-white/70 hover:bg-white/10 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>Recent Swaps</span>
          {transactions.length > 0 && (
            <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-xs">
              {transactions.length}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>
      
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-2 space-y-2"
        >
          {transactions.length === 0 ? (
            <div className="text-center py-4 text-sm text-white/60">
              No swap history found
            </div>
          ) : (
            transactions.map(tx => (
              <div 
                key={tx.id}
                className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <ArrowRightLeft className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">
                      {tx.fromToken} → {tx.toToken}
                    </span>
                  </div>
                  <span className="text-xs text-white/60">
                    {formatDate(tx.timestamp)}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">
                    {tx.inputAmount.toFixed(2)} {tx.fromToken}
                  </span>
                  <span className="text-white/70">
                    {tx.outputAmount.toFixed(2)} {tx.toToken}
                  </span>
                </div>
                
                <div className="mt-2 flex justify-between text-xs">
                  <span className="text-white/50">
                    Rate: 1 {tx.fromToken} = {tx.rate.toFixed(4)} {tx.toToken}
                  </span>
                  <span className="text-white/50">
                    Fee: {tx.fee.toFixed(2)} {tx.fromToken}
                  </span>
                </div>
              </div>
            ))
          )}
        </motion.div>
      )}
    </div>
  );
}
