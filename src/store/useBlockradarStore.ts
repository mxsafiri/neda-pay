'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TokenBalance, Transaction } from './useWalletStore';
import { blockradarClient } from '@/lib/blockradar';

interface BlockchainInfo {
  id: string;
  name: string;
  symbol: string;
  isActive: boolean;
}

interface AddressInfo {
  id: string;
  address: string;
  walletId: string;
  blockchain: BlockchainInfo;
  name?: string;
  metadata?: Record<string, unknown>;
}

interface BlockradarState {
  // Master wallets by blockchain
  masterWallets: Record<string, string>; // blockchain -> walletId
  
  // User addresses by blockchain
  userAddresses: Record<string, AddressInfo>;
  
  // Balances and transactions
  balances: TokenBalance[];
  transactions: Transaction[];
  
  // State management
  isLoading: boolean;
  error: string | null;
  selectedBlockchain: string;

  // Configuration
  initialized: boolean;
  
  // Actions
  initialize: (walletMap: Record<string, string>) => void;
  setSelectedBlockchain: (blockchain: string) => void;
  createUserAddress: (blockchain: string, name?: string, metadata?: Record<string, unknown>) => Promise<string>;
  fetchBalances: (forceRefresh?: boolean) => Promise<void>;
  fetchTransactions: (limit?: number, page?: number) => Promise<void>;
  withdraw: (toAddress: string, amount: string, asset: string) => Promise<unknown>;
  setError: (error: string | null) => void;
}

export const useBlockradarStore = create<BlockradarState>()(
  persist(
    (set, get) => ({
      // Initial state
      masterWallets: {},
      userAddresses: {},
      balances: [],
      transactions: [],
      isLoading: false,
      error: null,
      selectedBlockchain: 'base', // Default to Base for trial period
      initialized: false,
      
      // Initialize with master wallet IDs
      initialize: (walletMap: Record<string, string>) => {
        // Debug: Check if environment variables are available
        console.log('BlockRadar API URL exists:', !!process.env.NEXT_PUBLIC_BLOCKRADAR_API_URL);
        console.log('BlockRadar API Key exists:', !!process.env.NEXT_PUBLIC_BLOCKRADAR_API_KEY);
        
        set({ masterWallets: walletMap, initialized: true });
        // Fetch balances for the first time
        get().fetchBalances(true);
      },
      
      // Set selected blockchain
      setSelectedBlockchain: (blockchain: string) => {
        set({ selectedBlockchain: blockchain });
      },
      
      // Create a new address for the user
      createUserAddress: async (blockchain: string, name?: string, metadata?: Record<string, unknown>) => {
        const { masterWallets } = get();
        const walletId = masterWallets[blockchain];
        
        if (!walletId) {
          set({ error: `No master wallet found for ${blockchain}` });
          throw new Error(`No master wallet found for ${blockchain}`);
        }
        
        set({ isLoading: true, error: null });
        
        try {
          const response = await blockradarClient.createAddress(walletId, {
            name,
            metadata
          });
          
          if (response?.data) {
            const addressInfo: AddressInfo = {
              id: response.data.id,
              address: response.data.address,
              walletId,
              blockchain: response.data.blockchain,
              name: response.data.name,
              metadata: response.data.metadata
            };
            
            set(state => ({
              userAddresses: {
                ...state.userAddresses,
                [blockchain]: addressInfo
              },
              isLoading: false
            }));
            
            return response.data.address;
          }
          
          throw new Error('Failed to create address: Invalid response');
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create address';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },
      
      // Fetch balances from all configured master wallets
      fetchBalances: async (forceRefresh = false) => {
        const { masterWallets, isLoading } = get();
        
        // Skip if already loading or no wallets configured
        if (isLoading && !forceRefresh) return;
        if (Object.keys(masterWallets).length === 0) {
          set({ error: 'No master wallets configured' });
          return;
        }
        
        set({ isLoading: true, error: null });
        
        try {
          const balancePromises = Object.entries(masterWallets).map(async ([blockchain, walletId]) => {
            const response = await blockradarClient.getWalletBalances(walletId);
            
            if (!response?.data) {
              throw new Error(`Failed to fetch balances for ${blockchain}`);
            }
            
            return response.data.map((asset: { symbol: string; balance: string; usdValue?: string }) => ({
              symbol: asset.symbol,
              balance: asset.balance,
              usdValue: asset.usdValue || '0.00',
              blockchain
            }));
          });
          
          const allBalances = await Promise.all(balancePromises);
          const balances = allBalances.flat();
          
          set({ balances, isLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch balances';
          set({ error: errorMessage, isLoading: false });
        }
      },
      
      // Fetch transactions for the currently selected blockchain
      fetchTransactions: async (limit = 20, page = 1) => {
        const { masterWallets, userAddresses, selectedBlockchain } = get();
        const walletId = masterWallets[selectedBlockchain];
        
        if (!walletId) {
          set({ error: `No master wallet found for ${selectedBlockchain}` });
          return;
        }
        
        set({ isLoading: true, error: null });
        
        try {
          // Get the user's address for the current blockchain
          const addressInfo = userAddresses[selectedBlockchain];
          
          if (!addressInfo) {
            set({ 
              transactions: [],
              isLoading: false,
              error: null
            });
            return;
          }
          
          // Update to match the implemented getTransactions signature
          const response = await blockradarClient.getTransactions(walletId, {
            limit,
            offset: page ? (page - 1) * (limit || 10) : 0
          });
          
          if (response?.data && Array.isArray(response.data.transactions)) {
            set({ 
              transactions: response.data.transactions as Transaction[],
              isLoading: false 
            });
          }
        } catch (error) {
          console.error('Error fetching transactions:', error);
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to fetch transactions'
          });
        }
      },
      
      // Initiate a withdrawal
      withdraw: async (toAddress: string, amount: string, asset: string) => {
        const { masterWallets, selectedBlockchain } = get();
        const walletId = masterWallets[selectedBlockchain];
        
        if (!walletId) {
          set({ error: `No master wallet found for ${selectedBlockchain}` });
          throw new Error(`No master wallet found for ${selectedBlockchain}`);
        }
        
        set({ isLoading: true, error: null });
        
        try {
          // Update to match the implemented withdraw signature
          const response = await blockradarClient.withdraw(walletId, {
            to: toAddress,
            amount,
            token: asset
          });
          
          set({ isLoading: false });
          return response?.data;
        } catch (error) {
          console.error('Error processing withdrawal:', error);
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to process withdrawal'
          });
          throw error;
        }
      },
      
      // Set error
      setError: (error: string | null) => {
        set({ error });
      }
    }),
    {
      name: 'blockradar-storage', // Local storage key
      partialize: (state) => ({
        // Only persist these fields to localStorage
        masterWallets: state.masterWallets,
        userAddresses: state.userAddresses,
        selectedBlockchain: state.selectedBlockchain,
        initialized: state.initialized
      })
    }
  )
);
