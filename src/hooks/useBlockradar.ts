'use client';

import { useCallback, useEffect } from 'react';
import { useBlockradarStore } from '@/store/useBlockradarStore';
import { TokenBalance } from '@/store/useWalletStore';

/**
 * A hook for easily accessing and managing Blockradar wallet functionality
 * throughout the application
 */
export function useBlockradar() {
  const {
    masterWallets,
    userAddresses,
    balances,
    transactions,
    isLoading,
    error,
    selectedBlockchain,
    setSelectedBlockchain,
    createUserAddress,
    fetchBalances,
    fetchTransactions,
    withdraw,
    setError
  } = useBlockradarStore();

  // Auto-fetch balances on mount and blockchain change
  useEffect(() => {
    if (Object.keys(masterWallets).length > 0) {
      fetchBalances();
    }
  }, [fetchBalances, masterWallets, selectedBlockchain]);

  // Get balances for the currently selected blockchain
  const getBalancesForCurrentChain = useCallback((): TokenBalance[] => {
    return balances.filter(b => 'blockchain' in b && b.blockchain === selectedBlockchain);
  }, [balances, selectedBlockchain]);
  
  // Check if a user has an address for the current blockchain
  const hasAddressForCurrentChain = useCallback((): boolean => {
    return Boolean(userAddresses[selectedBlockchain]);
  }, [userAddresses, selectedBlockchain]);
  
  // Get a user's address for the current blockchain
  const getCurrentChainAddress = useCallback((): string | undefined => {
    return userAddresses[selectedBlockchain]?.address;
  }, [userAddresses, selectedBlockchain]);
  
  // Check if user has any addresses
  const hasAnyAddress = useCallback((): boolean => {
    return Object.keys(userAddresses).length > 0;
  }, [userAddresses]);

  // Create an address for the current blockchain if one doesn't exist
  const ensureAddressExists = useCallback(async (
    name?: string, 
    metadata?: Record<string, unknown>
  ): Promise<string> => {
    // If address already exists, return it
    if (hasAddressForCurrentChain()) {
      return getCurrentChainAddress()!;
    }
    
    // Otherwise create a new address
    return createUserAddress(selectedBlockchain, name, metadata);
  }, [createUserAddress, getCurrentChainAddress, hasAddressForCurrentChain, selectedBlockchain]);

  // Send a payment using Blockradar's withdraw function
  const sendPayment = useCallback(async (
    to: string, 
    amount: string, 
    asset: string
  ) => {
    try {
      const result = await withdraw(to, amount, asset);
      fetchTransactions(); // Refresh transaction list
      return result;
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Payment failed');
      }
      throw error;
    }
  }, [withdraw, fetchTransactions, setError]);

  return {
    // State
    masterWallets,
    userAddresses,
    balances,
    transactions,
    isLoading,
    error,
    selectedBlockchain,
    
    // Actions
    setSelectedBlockchain,
    fetchBalances,
    fetchTransactions,
    createUserAddress,
    withdraw: sendPayment,
    
    // Helper methods
    getBalancesForCurrentChain,
    hasAddressForCurrentChain,
    getCurrentChainAddress,
    hasAnyAddress,
    ensureAddressExists
  };
}
