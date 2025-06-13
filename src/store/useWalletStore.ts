'use client';

import { create } from 'zustand';
import { SUPPORTED_TOKENS } from '@/config/wallet';

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

export const useWalletStore = create<WalletState>((set, get) => ({
  balances: [
    { 
      symbol: 'USDC', 
      balance: '1,523.00', 
      usdValue: '1,523.00' 
    }
  ],
  transactions: [
    {
      id: '1',
      type: 'deposit',
      amount: '500.00',
      symbol: 'USDC',
      timestamp: Date.now() - 7200000, // 2 hours ago
      status: 'completed',
      to: 'wallet',
    },
    {
      id: '2',
      type: 'send',
      amount: '120.00',
      symbol: 'USDC',
      timestamp: Date.now() - 3600000, // 1 hour ago
      status: 'completed',
      to: '0x1234...5678',
    },
    {
      id: '3',
      type: 'receive',
      amount: '50.00',
      symbol: 'USDC',
      timestamp: Date.now() - 1800000, // 30 minutes ago
      status: 'completed',
      from: '0x8765...4321',
    },
  ],
  isLoading: false,
  error: null,
  
  fetchBalances: async (address: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // In a real implementation, we would fetch balances from the blockchain
      // For now, we'll use mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful response
      set({ 
        balances: [
          { symbol: 'USDC', balance: '1,523.00', usdValue: '1,523.00' }
        ],
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
      // In a real implementation, we would fetch transactions from the blockchain
      // For now, we'll use mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Keep existing mock data
      set({ isLoading: false });
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
