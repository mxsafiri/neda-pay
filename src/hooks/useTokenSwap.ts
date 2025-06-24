'use client';

import { useState, useCallback } from 'react';
import { Token } from '@/components/swap/TokenSelector';

export type SwapStatus = 'idle' | 'loading' | 'success' | 'error';

export interface SwapTransaction {
  id: string;
  fromToken: string;
  toToken: string;
  inputAmount: number;
  outputAmount: number;
  fee: number;
  rate: number;
  timestamp: string;
  status: string;
}

interface UseTokenSwapResult {
  swap: (fromToken: Token, toToken: Token, amount: string) => Promise<SwapTransaction>;
  status: SwapStatus;
  transaction: SwapTransaction | null;
  error: string | null;
  reset: () => void;
}

/**
 * Custom hook to handle token swaps
 * @returns Object containing swap function, status, transaction, error and reset function
 */
export function useTokenSwap(): UseTokenSwapResult {
  const [status, setStatus] = useState<SwapStatus>('idle');
  const [transaction, setTransaction] = useState<SwapTransaction | null>(null);
  const [error, setError] = useState<string | null>(null);

  const swap = useCallback(async (fromToken: Token, toToken: Token, amount: string): Promise<SwapTransaction> => {
    if (!amount || parseFloat(amount) <= 0) {
      throw new Error('Invalid amount');
    }

    setStatus('loading');
    setError(null);

    try {
      const response = await fetch('/api/swap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromToken: fromToken.symbol,
          toToken: toToken.symbol,
          amount,
          userId: 'current-user-id', // In a real app, get this from authentication context
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Swap failed');
      }

      setTransaction(data.transaction);
      setStatus('success');
      return data.transaction;
    } catch (err) {
      setStatus('error');
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete swap';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
    setTransaction(null);
  }, []);

  return {
    swap,
    status,
    transaction,
    error,
    reset
  };
}
