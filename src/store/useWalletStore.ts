'use client';

import { create } from 'zustand';
import { SUPPORTED_TOKENS } from '@/config/wallet';
import { formatBalance, getTokenBalance, getUsdValue, fetchTransactions } from '@/lib/blockchain';

export type TokenBalance = {
  symbol: string;
  balance: string;
  usdValue: string;
};

export type Transaction = {
  id: string;
  type: 'deposit' | 'send' | 'receive' | 'swap';
  amount: string;
  symbol: string;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
  to?: string;
  from?: string;
  hash?: string;
};

interface WalletState {
  balances: TokenBalance[];
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchBalances: (address: string) => Promise<void>;
  fetchTransactions: (address: string) => Promise<void>;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  // Start with empty balances and transactions - will be populated with real data on fetch
  balances: [],
  transactions: [],
  isLoading: false,
  error: null,
  
  fetchBalances: async (address: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // Fetch real balances from the blockchain
      const balancePromises = Object.values(SUPPORTED_TOKENS).map(async (token) => {
        const rawBalance = await getTokenBalance(token.address, address, token.decimals);
        const formattedBalance = formatBalance(rawBalance);
        const usdValue = getUsdValue(rawBalance, token.symbol);
        
        return {
          symbol: token.symbol,
          balance: formattedBalance,
          usdValue: formatBalance(usdValue)
        };
      });
      
      const balances = await Promise.all(balancePromises);
      
      set({ 
        balances,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch balances', 
        isLoading: false 
      });
    }
  },
  
  fetchTransactions: async (address: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // Fetch real transactions from the blockchain
      const blockchainTransactions = await fetchTransactions(address);
      
      // Use real blockchain transactions if available
      if (blockchainTransactions.length > 0) {
        set({
          transactions: blockchainTransactions,
          isLoading: false
        });
      } else {
        // If no transactions are found, show an empty list instead of mock data
        set({ 
          transactions: [],
          isLoading: false 
        });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch transactions', 
        isLoading: false 
      });
    }
  },
  
  addTransaction: (transaction: Transaction) => {
    set(state => ({
      transactions: [transaction, ...state.transactions]
    }));
  },
  
  updateTransaction: (id: string, updates: Partial<Transaction>) => {
    set(state => ({
      transactions: state.transactions.map(tx => 
        tx.id === id ? { ...tx, ...updates } : tx
      )
    }));
  },
}));
