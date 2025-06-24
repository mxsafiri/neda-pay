'use client';

import { useCallback, useEffect } from 'react';
import { useBlockradarStore } from '@/store/useBlockradarStore';
import { TokenBalance } from '@/store/useWalletStore';
import { DEFAULT_BLOCKCHAIN } from '@/lib/blockradar/config';

/**
 * A hook for easily accessing and managing Blockradar wallet functionality
 * throughout the application
 * 
 * During the trial period, this hook is configured to only work with the Base blockchain
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

  // Ensure Base blockchain is always selected during trial period
  useEffect(() => {
    if (selectedBlockchain !== DEFAULT_BLOCKCHAIN) {
      setSelectedBlockchain(DEFAULT_BLOCKCHAIN);
    }
  }, [selectedBlockchain, setSelectedBlockchain]);

  // Auto-fetch balances on mount
  useEffect(() => {
    if (Object.keys(masterWallets).length > 0) {
      fetchBalances();
    }
  }, [fetchBalances, masterWallets]);

  // Get balances for Base blockchain (only supported chain during trial)
  const getBalancesForCurrentChain = useCallback((): TokenBalance[] => {
    return balances.filter(b => 'blockchain' in b && b.blockchain === DEFAULT_BLOCKCHAIN);
  }, [balances]);
  
  // Check if a user has an address for Base blockchain
  const hasAddressForCurrentChain = useCallback((): boolean => {
    return Boolean(userAddresses[DEFAULT_BLOCKCHAIN]);
  }, [userAddresses]);
  
  // Get a user's address for Base blockchain
  const getCurrentChainAddress = useCallback((): string | undefined => {
    return userAddresses[DEFAULT_BLOCKCHAIN]?.address;
  }, [userAddresses]);
  
  // Check if user has any addresses
  const hasAnyAddress = useCallback((): boolean => {
    return Object.keys(userAddresses).length > 0;
  }, [userAddresses]);

  // Create an address for Base blockchain if one doesn't exist
  const ensureAddressExists = useCallback(async (
    name?: string, 
    metadata?: Record<string, unknown>
  ): Promise<string> => {
    // If address already exists, return it
    if (hasAddressForCurrentChain()) {
      return getCurrentChainAddress()!;
    }
    
    // Otherwise create a new address for Base blockchain
    return createUserAddress(DEFAULT_BLOCKCHAIN, name, metadata);
  }, [createUserAddress, getCurrentChainAddress, hasAddressForCurrentChain]);

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
    // Always return Base as the selected blockchain during trial period
    selectedBlockchain: DEFAULT_BLOCKCHAIN,
    
    // Actions
    // During trial period, setSelectedBlockchain is disabled
    setSelectedBlockchain: () => {/* Disabled during trial period */},
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
