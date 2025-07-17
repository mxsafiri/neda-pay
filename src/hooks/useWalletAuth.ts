'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './useAuth';
import { 
  generateDeviceToken, 
  storeDeviceToken, 
  getDeviceToken, 
  hashPin, 
  storeWalletAuth, 
  // getWalletAuth, 
  // authenticate, 
  verifyDeviceToken,
  verifyPin,
  createSession,
  updateSessionActivity,
  isSessionTimedOut,
  clearSession
} from '@/utils/deviceAuth';

// Commented out unused type
// type WalletAuthState = {
//   address: string | null;
//   isAuthenticated: boolean;
//   privateKey: string | null;
// };

type User = {
  id?: string;
  wallet?: string;
};

interface AuthState {
  authenticated: boolean;
  user: User | null;
}

/**
 * Hook for wallet authentication using private keys
 * Handles wallet import, storage, and authentication state
 */
export const useWalletAuth = () => {
  // const router = useRouter();
  const { authenticated, user } = useAuth() as AuthState;
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isWalletAuthenticated, setIsWalletAuthenticated] = useState(false);
  const [isPinRequired, setIsPinRequired] = useState(false);
  const [isNewDevice, setIsNewDevice] = useState(false);
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user has a wallet, if PIN is required, and if session has timed out
  useEffect(() => {
    if (authenticated && user) {
      // Check if session has timed out
      if (isSessionTimedOut()) {
        setIsSessionExpired(true);
        setIsPinRequired(true);
        console.log('Session has timed out, PIN verification required');
      } else {
        // Update session activity timestamp
        updateSessionActivity();
      }
      
      // Check if wallet exists in local storage
      const walletData = localStorage.getItem('neda_wallet');
      if (walletData) {
        try {
          const parsedData = JSON.parse(walletData);
          setWalletAddress(parsedData.address);
          setIsWalletAuthenticated(true);
          
          // Check if device token exists and is valid
          const deviceToken = getDeviceToken();
          if (!deviceToken) {
            setIsNewDevice(true);
          } else {
            // Check if PIN verification is required (due to new device or session timeout)
            const isDeviceValid = verifyDeviceToken();
            if (!isDeviceValid || isSessionTimedOut()) {
              setIsPinRequired(true);
            }
          }
        } catch (err) {
          console.error('Failed to parse wallet data:', err);
          setError('Failed to load wallet data');
        }
      }
    }
  }, [authenticated, user]);

  /**
   * Create a new wallet
   * @returns Object with the new wallet address
   */
  const createWallet = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Generate a random wallet address for demo purposes
      // In a real implementation, this would call the BlockRadar API
      const newAddress = `0x${Array.from({length: 40}, () => 
        Math.floor(Math.random() * 16).toString(16)).join('')}`;
      
      // Store wallet data in local storage
      const walletData = {
        address: newAddress,
        createdAt: new Date().toISOString()
      };
      
      localStorage.setItem('neda_wallet', JSON.stringify(walletData));
      setWalletAddress(newAddress);
      setIsWalletAuthenticated(true);
      
      return newAddress;
    } catch (err) {
      console.error('Failed to create wallet:', err);
      setError('Failed to create wallet');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Sign in with existing wallet
   */
  const signInWithWallet = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if wallet exists in local storage
      const walletData = localStorage.getItem('neda_wallet');
      if (!walletData) {
        throw new Error('No wallet found');
      }
      
      const parsedData = JSON.parse(walletData);
      setWalletAddress(parsedData.address);
      setIsWalletAuthenticated(true);
      
      // Check if device token exists and is valid
      const deviceToken = getDeviceToken();
      if (!deviceToken) {
        setIsNewDevice(true);
      } else {
        // Check if PIN verification is required
        const isDeviceValid = verifyDeviceToken();
        setIsPinRequired(!isDeviceValid || isSessionTimedOut());
      }
      
      // Create a new session when successfully signed in
      createSession();
      setIsSessionExpired(false);
      
      return parsedData.address;
    } catch (err) {
      console.error('Failed to sign in with wallet:', err);
      setError('Failed to sign in with wallet');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get wallet token (for display purposes only)
   * @param pin The PIN to verify
   * @returns The wallet token if available
   */
  const getWalletToken = useCallback(async (pin: string): Promise<string> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Verify PIN
      const isAuthenticated = verifyPin(pin);
      if (!isAuthenticated) {
        throw new Error('Invalid PIN');
      }
      
      // In a real implementation, this would retrieve the token from secure storage
      // For demo purposes, we'll return the device token
      const deviceToken = getDeviceToken();
      if (!deviceToken) {
        throw new Error('No device token found');
      }
      
      return deviceToken;
    } catch (err) {
      console.error('Failed to get wallet token:', err);
      setError('Failed to get wallet token');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Recover wallet access on a new device
   * @param recoveryToken The recovery token
   * @param pin The PIN to verify
   * @returns Whether the recovery was successful
   */
  const recoverWalletAccess = useCallback(async (recoveryToken: string, pin: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real implementation, this would validate the recovery token with the server
      // For demo purposes, we'll just accept any token and set up a new device
      
      // Generate a new device token
      const deviceToken = generateDeviceToken();
      storeDeviceToken(deviceToken);
      
      // Hash PIN and store auth data
      if (walletAddress) {
        const hashedPin = hashPin(pin, deviceToken);
        storeWalletAuth(walletAddress, hashedPin, deviceToken);
      } else {
        throw new Error('No wallet address available');
      }
      
      setIsNewDevice(false);
      setIsPinRequired(false);
      
      return true;
    } catch (err) {
      console.error('Failed to recover wallet access:', err);
      setError('Failed to recover wallet access');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  /**
   * Verify PIN and refresh session
   * @param pin The PIN to verify
   * @returns True if PIN is valid
   */
  const verifyPinAndRefreshSession = useCallback(async (pin: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Verify PIN
      const isAuthenticated = verifyPin(pin);
      if (!isAuthenticated) {
        setError('Invalid PIN');
        return false;
      }
      
      // Create a new session
      createSession();
      setIsSessionExpired(false);
      setIsPinRequired(false);
      
      return true;
    } catch (err) {
      console.error('Failed to verify PIN:', err);
      setError('Failed to verify PIN');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  /**
   * Logout and clear session
   */
  const logout = useCallback(() => {
    // Clear session
    clearSession();
    setIsWalletAuthenticated(false);
    setIsPinRequired(true);
    setIsSessionExpired(true);
    
    // Note: We don't clear wallet data or device token
    // This allows for quick re-login with PIN
  }, []);

  return {
    walletAddress,
    isWalletAuthenticated,
    isPinRequired,
    isNewDevice,
    isSessionExpired,
    isLoading,
    error,
    createWallet,
    signInWithWallet,
    recoverWalletAccess,
    getWalletToken,
    verifyPinAndRefreshSession,
    logout
  };
};
