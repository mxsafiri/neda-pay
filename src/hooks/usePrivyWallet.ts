'use client';

import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useState, useEffect, useCallback } from 'react';
import {
  getETHBalance,
  getTokenBalance,
  sendETH,
  sendToken,
  deployToken,
  getTransactionStatus,
  TokenDeploymentParams,
  TransactionStatus,
  BASE_TOKENS,
  isValidAddress,
  formatTokenAmount,
  getTransactionUrl,
  WEB3_CONFIG,
} from '@/utils/blockchain';

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
   * Get wallet balance (ETH)
   */
  const getBalance = useCallback(async (): Promise<string> => {
    if (!embeddedWallet?.address) {
      console.log('No wallet address available');
      return '0';
    }

    try {
      console.log('Getting ETH balance for:', embeddedWallet.address);
      const balance = await getETHBalance(embeddedWallet.address as `0x${string}`);
      return balance;
    } catch (error) {
      console.error('Error getting balance:', error);
      return '0';
    }
  }, [embeddedWallet]);

  /**
   * Get token balance for a specific token
   */
  const getSpecificTokenBalance = useCallback(async (tokenAddress: string): Promise<string> => {
    if (!embeddedWallet?.address) {
      console.log('No wallet address available');
      return '0';
    }

    try {
      if (!isValidAddress(tokenAddress)) {
        throw new Error('Invalid token address');
      }
      
      const balance = await getTokenBalance(tokenAddress as `0x${string}`, embeddedWallet.address as `0x${string}`);
      return balance;
    } catch (error) {
      console.error('Error getting token balance:', error);
      return '0';
    }
  }, [embeddedWallet]);

  /**
   * Get balances for common Base tokens
   */
  const getTokenBalances = useCallback(async () => {
    if (!embeddedWallet?.address) {
      return [];
    }

    try {
      const balances = await Promise.all([
        getETHBalance(embeddedWallet.address as `0x${string}`).then(balance => ({
          symbol: 'ETH',
          name: 'Ethereum',
          balance,
          address: '0x0000000000000000000000000000000000000000' as `0x${string}`,
          decimals: 18,
        })),
        getTokenBalance(BASE_TOKENS.USDC, embeddedWallet.address as `0x${string}`).then(balance => ({
          symbol: 'USDC',
          name: 'USD Coin',
          balance,
          address: BASE_TOKENS.USDC,
          decimals: 6,
        })),
      ]);

      return balances;
    } catch (error) {
      console.error('Error getting token balances:', error);
      return [];
    }
  }, [embeddedWallet]);

  /**
   * Send ETH transaction
   */
  const sendETHTransaction = useCallback(async (to: string, amount: string): Promise<string | null> => {
    if (!embeddedWallet) {
      throw new Error('No wallet connected');
    }
    
    try {
      if (!isValidAddress(to)) {
        throw new Error('Invalid recipient address');
      }

      // Get wallet client from Privy
      const walletClient = await embeddedWallet.getEthereumProvider();
      
      const txHash = await sendETH(to as `0x${string}`, amount, walletClient);
      
      if (txHash) {
        console.log('ETH transaction sent:', getTransactionUrl(txHash));
      }
      
      return txHash;
    } catch (err) {
      console.error('Failed to send ETH transaction:', err);
      throw err;
    }
  }, [embeddedWallet]);

  /**
   * Send token transaction
   */
  const sendTokenTransaction = useCallback(async (
    tokenAddress: string,
    to: string,
    amount: string
  ): Promise<string | null> => {
    if (!embeddedWallet) {
      throw new Error('No wallet connected');
    }
    
    try {
      if (!isValidAddress(to) || !isValidAddress(tokenAddress)) {
        throw new Error('Invalid address');
      }

      // Get wallet client from Privy
      const walletClient = await embeddedWallet.getEthereumProvider();
      
      const txHash = await sendToken(
        tokenAddress as `0x${string}`,
        to as `0x${string}`,
        amount,
        walletClient
      );
      
      if (txHash) {
        console.log('Token transaction sent:', getTransactionUrl(txHash));
      }
      
      return txHash;
    } catch (err) {
      console.error('Failed to send token transaction:', err);
      throw err;
    }
  }, [embeddedWallet]);

  /**
   * Deploy investment token
   */
  const deployInvestmentToken = useCallback(async (
    params: TokenDeploymentParams
  ): Promise<string | null> => {
    if (!embeddedWallet) {
      throw new Error('No wallet connected');
    }
    
    try {
      // Get wallet client from Privy
      const walletClient = await embeddedWallet.getEthereumProvider();
      
      const txHash = await deployToken(params, walletClient);
      
      if (txHash) {
        console.log('Investment token deployment:', getTransactionUrl(txHash));
      }
      
      return txHash;
    } catch (err) {
      console.error('Failed to deploy investment token:', err);
      throw err;
    }
  }, [embeddedWallet]);

  /**
   * Monitor transaction status
   */
  const monitorTransaction = useCallback(async (txHash: string): Promise<TransactionStatus> => {
    try {
      if (!isValidAddress(txHash) && !txHash.startsWith('0x')) {
        throw new Error('Invalid transaction hash');
      }
      
      return await getTransactionStatus(txHash as `0x${string}`);
    } catch (error) {
      console.error('Error monitoring transaction:', error);
      return {
        hash: txHash as `0x${string}`,
        status: 'failed',
      };
    }
  }, []);

  /**
   * Legacy sendTransaction method for backward compatibility
   */
  const sendTransaction = useCallback(async (to: string, amount: string, token?: string) => {
    if (token && token !== 'ETH') {
      // Send token transaction
      return await sendTokenTransaction(token, to, amount);
    } else {
      // Send ETH transaction
      return await sendETHTransaction(to, amount);
    }
  }, [sendETHTransaction, sendTokenTransaction]);



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
    getSpecificTokenBalance,
    getTokenBalances,
    sendTransaction,
    sendETHTransaction,
    sendTokenTransaction,
    deployInvestmentToken,
    monitorTransaction,
    
    // Blockchain utilities
    isValidAddress,
    formatTokenAmount,
    getTransactionUrl,
    WEB3_CONFIG,
    
    // Compatibility with existing code
    isWalletAuthenticated: authenticated,
    isPinRequired: false, // No PIN needed with Privy
    isNewDevice: false, // Privy handles cross-device sync
    isSessionExpired: false, // Privy manages sessions
  };
};
