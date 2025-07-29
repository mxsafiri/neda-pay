'use client';

import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useCallback, useEffect, useState } from 'react';

/**
 * Hook for Privy wallet operations
 * Replaces useWalletAuth and useHybridWalletAuth
 * 
 * Features:
 * - Social login (Google, Apple, Email, etc.)
 * - Embedded wallet creation
 * - Multi-chain support
 * - Account abstraction
 * - Investment token deployment
 */
export const usePrivyWallet = () => {
  const { 
    login, 
    logout, 
    authenticated, 
    ready, 
    user 
  } = usePrivy();
  
  const { wallets, ready: walletsReady } = useWallets();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // Get the primary embedded wallet
  const embeddedWallet = wallets.find((wallet) => wallet.walletClientType === 'privy');
  
  // Update wallet address when wallets change
  useEffect(() => {
    if (embeddedWallet?.address) {
      setWalletAddress(embeddedWallet.address);
      
      // Store wallet info for compatibility with existing components
      localStorage.setItem('neda_wallet', JSON.stringify({
        address: embeddedWallet.address,
        provider: 'privy',
        socialProvider: user?.linkedAccounts?.[0]?.type || 'email',
        createdAt: new Date().toISOString()
      }));
    }
  }, [embeddedWallet, user]);

  /**
   * Create wallet with social login
   * Replaces the old createWallet function
   */
  const createWallet = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!authenticated) {
        // Trigger Privy login modal
        await login();
      }
      
      // Wallet is automatically created by Privy
      if (embeddedWallet?.address) {
        return embeddedWallet.address;
      }
      
      throw new Error('Failed to create wallet');
    } catch (err) {
      console.error('Failed to create wallet:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create wallet';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [login, authenticated, embeddedWallet]);

  /**
   * Sign in with existing wallet
   * Replaces signInWithWallet and signInWithPin
   */
  const signIn = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!authenticated) {
        await login();
      }
      
      return embeddedWallet?.address || null;
    } catch (err) {
      console.error('Failed to sign in:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign in';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [login, authenticated, embeddedWallet]);

  /**
   * Sign out
   */
  const signOut = useCallback(async () => {
    setIsLoading(true);
    
    try {
      await logout();
      setWalletAddress(null);
      localStorage.removeItem('neda_wallet');
    } catch (err) {
      console.error('Failed to sign out:', err);
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  /**
   * Get wallet balance for a specific token
   */
  const getBalance = useCallback(async () => {
    if (!embeddedWallet) {
      throw new Error('No wallet connected');
    }
    
    try {
      // Implementation will depend on your token contracts
      // For now, return a placeholder
      return '0';
    } catch (err) {
      console.error('Failed to get balance:', err);
      throw err;
    }
  }, [embeddedWallet]);

  /**
   * Send transaction
   */
  const sendTransaction = useCallback(async (to: string, amount: string, tokenAddress?: string) => {
    if (!embeddedWallet) {
      throw new Error('No wallet connected');
    }
    
    try {
      // Implementation for sending transactions
      // This will use Privy's transaction methods
      console.log('Sending transaction:', { to, amount, tokenAddress });
      return 'transaction_hash_placeholder';
    } catch (err) {
      console.error('Failed to send transaction:', err);
      throw err;
    }
  }, [embeddedWallet]);

  /**
   * Deploy investment token
   * New capability for NEDApay investment features
   */
  const deployInvestmentToken = useCallback(async (
    name: string, 
    symbol: string, 
    totalSupply: number
  ) => {
    if (!embeddedWallet) {
      throw new Error('No wallet connected');
    }
    
    try {
      // Implementation for deploying custom investment tokens
      console.log('Deploying investment token:', { name, symbol, totalSupply });
      return 'contract_address_placeholder';
    } catch (err) {
      console.error('Failed to deploy token:', err);
      throw err;
    }
  }, [embeddedWallet]);

  return {
    // Authentication state
    authenticated,
    ready: ready && walletsReady,
    user,
    walletAddress,
    embeddedWallet,
    
    // Loading and error states
    isLoading,
    error,
    
    // Authentication methods
    createWallet,
    signIn,
    signOut,
    
    // Wallet operations
    getBalance,
    sendTransaction,
    deployInvestmentToken,
    
    // Compatibility with existing code
    isWalletAuthenticated: authenticated,
    isPinRequired: false, // No PIN needed with Privy
    isNewDevice: false, // Privy handles cross-device sync
    isSessionExpired: false, // Privy manages sessions
  };
};
