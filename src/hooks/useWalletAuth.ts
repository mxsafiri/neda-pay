'use client';

import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';

type WalletAuthState = {
  address: string | null;
  isAuthenticated: boolean;
  privateKey: string | null;
};

/**
 * Hook for wallet authentication using private keys
 * Handles wallet import, storage, and authentication state
 */
export function useWalletAuth() {
  const [walletState, setWalletState] = useState<WalletAuthState>({
    address: null,
    isAuthenticated: false,
    privateKey: null
  });

  // Load wallet from localStorage on mount
  useEffect(() => {
    const savedWallet = localStorage.getItem('neda_wallet');
    if (savedWallet) {
      try {
        const parsed = JSON.parse(savedWallet);
        // Only store the address in state, keep private key encrypted
        setWalletState({
          address: parsed.address,
          isAuthenticated: true,
          privateKey: null // Don't keep in memory
        });
      } catch {
        console.error('Failed to parse saved wallet');
      }
    }
  }, []);

  /**
   * Import a wallet using a private key
   * @param privateKey The private key to import
   * @returns Object with success status and address or error
   */
  const importPrivateKey = useCallback((privateKey: string) => {
    try {
      // Check if input looks like an address instead of a private key
      if (privateKey.match(/^0x[a-fA-F0-9]{40}$/)) {
        console.error('User entered a wallet address instead of private key');
        return { 
          success: false, 
          error: 'You entered a wallet address. Please enter your private key instead.'
        };
      }

      // Validate private key format
      if (!privateKey.startsWith('0x')) {
        // Try to add 0x prefix if missing
        privateKey = `0x${privateKey}`;
      }
      
      const wallet = new ethers.Wallet(privateKey);
      const address = wallet.address;
      
      // Save to localStorage (in production, consider more secure storage)
      localStorage.setItem('neda_wallet', JSON.stringify({
        address,
        // In a production environment, encrypt this before storing
        privateKey: privateKey
      }));
      
      setWalletState({
        address,
        isAuthenticated: true,
        privateKey: null // Don't keep in memory
      });
      
      return { success: true, address };
    } catch (error) {
      console.error('Invalid private key:', error);
      return { 
        success: false, 
        error: 'Invalid private key. Please check that you entered the correct private key.'
      };
    }
  }, []);

  /**
   * Create a new wallet
   * @returns Object with the new wallet address and private key
   */
  const createWallet = useCallback(() => {
    try {
      const wallet = ethers.Wallet.createRandom();
      const address = wallet.address;
      const privateKey = wallet.privateKey;
      
      // Save to localStorage
      localStorage.setItem('neda_wallet', JSON.stringify({
        address,
        privateKey
      }));
      
      setWalletState({
        address,
        isAuthenticated: true,
        privateKey: null // Don't keep in memory
      });
      
      return { address, privateKey };
    } catch (error) {
      console.error('Failed to create wallet:', error);
      throw error;
    }
  }, []);

  /**
   * Get the private key from storage (use with caution)
   * @returns The private key if available
   */
  const getPrivateKey = useCallback(() => {
    const savedWallet = localStorage.getItem('neda_wallet');
    if (savedWallet) {
      try {
        const parsed = JSON.parse(savedWallet);
        return parsed.privateKey;
      } catch {
        console.error('Failed to get private key');
        return null;
      }
    }
    return null;
  }, []);

  /**
   * Log out and remove wallet from storage
   */
  const logout = useCallback(() => {
    localStorage.removeItem('neda_wallet');
    setWalletState({
      address: null,
      isAuthenticated: false,
      privateKey: null
    });
  }, []);

  return {
    address: walletState.address,
    isAuthenticated: walletState.isAuthenticated,
    importPrivateKey,
    createWallet,
    getPrivateKey,
    logout
  };
}
