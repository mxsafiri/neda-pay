'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  generateDeviceToken, 
  storeDeviceToken, 
  getDeviceToken, 
  updateSessionActivity,
  isSessionTimedOut,
  createSession,
  clearSession
} from '@/utils/deviceAuth';

import {
  registerWalletUser,
  authenticateWithPin,
  resetPinWithRecoveryPhrase,
  getDevices,
  submitKycVerification,
  getKycVerificationStatus
} from '@/lib/supabaseAuth';

import { generateRecoveryPhrase } from '@/utils/recoveryPhrase';

/**
 * Hook for hybrid wallet authentication
 * - Client-side PIN verification for quick access
 * - Server-side encrypted wallet and recovery phrase storage
 */
export const useHybridWalletAuth = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isWalletAuthenticated, setIsWalletAuthenticated] = useState(false);
  const [isPinRequired, setIsPinRequired] = useState(false);
  const [isNewDevice, setIsNewDevice] = useState(false);
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user has a wallet, if PIN is required, and if session has timed out
  useEffect(() => {
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
        
        // We don't set isWalletAuthenticated to true yet
        // User still needs to verify PIN
        
        // Check if device token exists
        const deviceToken = getDeviceToken();
        if (!deviceToken) {
          setIsNewDevice(true);
          setIsPinRequired(true);
        } else {
          // Check if PIN verification is required (due to session timeout)
          if (isSessionTimedOut()) {
            setIsPinRequired(true);
          } else {
            // If session is valid, we can consider the wallet authenticated
            setIsWalletAuthenticated(true);
          }
        }
      } catch (err) {
        console.error('Failed to parse wallet data:', err);
        setError('Failed to load wallet data');
      }
    }
  }, []);

  /**
   * Create a new wallet with PIN and recovery phrase
   * @param pin The PIN to set for the wallet
   * @returns Object with the new wallet address and recovery phrase
   */
  const createWallet = useCallback(async (pin: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Generate a random wallet address for demo purposes
      // In a real implementation, this would call the BlockRadar API
      const newAddress = `0x${Array.from({length: 40}, () => 
        Math.floor(Math.random() * 16).toString(16)).join('')}`;
      
      // Generate recovery phrase
      const recoveryPhrase = generateRecoveryPhrase();
      
      // Store wallet data in local storage (minimal data)
      const walletData = {
        address: newAddress,
        createdAt: new Date().toISOString()
      };
      
      localStorage.setItem('neda_wallet', JSON.stringify(walletData));
      
      // Generate device token
      const deviceToken = generateDeviceToken();
      storeDeviceToken(deviceToken);
      
      // Store encrypted wallet data in Supabase
      const walletDataString = JSON.stringify({
        address: newAddress,
        createdAt: new Date().toISOString()
      });
      
      const result = await registerWalletUser(
        newAddress,
        walletDataString,
        recoveryPhrase,
        pin
      );
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to register wallet user');
      }
      
      // Create a new session
      createSession();
      
      setWalletAddress(newAddress);
      setIsWalletAuthenticated(true);
      setIsPinRequired(false);
      setIsNewDevice(false);
      setIsSessionExpired(false);
      
      return { address: newAddress, recoveryPhrase };
    } catch (err) {
      console.error('Failed to create wallet:', err);
      setError('Failed to create wallet');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Sign in with existing wallet using PIN
   * @param pin The PIN to verify
   * @returns The wallet address if successful
   */
  const signInWithPin = useCallback(async (pin: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if wallet exists in local storage
      const walletData = localStorage.getItem('neda_wallet');
      if (!walletData) {
        throw new Error('No wallet found');
      }
      
      const parsedData = JSON.parse(walletData);
      const address = parsedData.address;
      
      // Authenticate with PIN using Supabase
      const result = await authenticateWithPin(address, pin);
      
      if (!result.success) {
        setError(result.error || 'Invalid PIN');
        return null;
      }
      
      // If this is a new device, store device token
      if (isNewDevice) {
        const deviceToken = generateDeviceToken();
        storeDeviceToken(deviceToken);
        setIsNewDevice(false);
      }
      
      // Create a new session
      createSession();
      
      setWalletAddress(address);
      setIsWalletAuthenticated(true);
      setIsPinRequired(false);
      setIsSessionExpired(false);
      
      return address;
    } catch (err) {
      console.error('Failed to sign in with PIN:', err);
      setError('Failed to sign in with PIN');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isNewDevice]);

  /**
   * Recover wallet access using recovery phrase
   * @param walletAddress The wallet address
   * @param recoveryPhrase The recovery phrase
   * @param newPin The new PIN to set
   * @returns Whether the recovery was successful
   */
  const recoverWalletAccess = useCallback(async (
    walletAddress: string,
    recoveryPhrase: string,
    newPin: string
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Reset PIN using recovery phrase in Supabase
      const result = await resetPinWithRecoveryPhrase(
        walletAddress,
        recoveryPhrase,
        newPin
      );
      
      if (!result.success) {
        setError(result.error || 'Invalid recovery phrase');
        return false;
      }
      
      // Generate a new device token
      const deviceToken = generateDeviceToken();
      storeDeviceToken(deviceToken);
      
      // Create a new session
      createSession();
      
      setIsWalletAuthenticated(true);
      setIsPinRequired(false);
      setIsNewDevice(false);
      setIsSessionExpired(false);
      
      return true;
    } catch (err) {
      console.error('Failed to recover wallet access:', err);
      setError('Failed to recover wallet access');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Verify PIN and refresh session
   * @param pin The PIN to verify
   * @returns True if PIN is valid
   */
  const verifyPinAndRefreshSession = useCallback(async (pin: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!walletAddress) {
        setError('No wallet address available');
        return false;
      }
      
      // Authenticate with PIN using Supabase
      const result = await authenticateWithPin(walletAddress, pin);
      
      if (!result.success) {
        setError(result.error || 'Invalid PIN');
        return false;
      }
      
      // Create a new session
      createSession();
      setIsSessionExpired(false);
      setIsPinRequired(false);
      setIsWalletAuthenticated(true);
      
      return true;
    } catch (err) {
      console.error('Failed to verify PIN:', err);
      setError('Failed to verify PIN');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);
  
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

  /**
   * Reset PIN using recovery phrase
   * @param recoveryPhrase The recovery phrase
   * @param newPin The new PIN to set
   * @returns True if PIN reset was successful
   */
  const resetPin = useCallback(async (recoveryPhrase: string, newPin: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!walletAddress) {
        setError('No wallet address available');
        return false;
      }
      
      // Reset PIN using recovery phrase in Supabase
      const result = await resetPinWithRecoveryPhrase(
        walletAddress,
        recoveryPhrase,
        newPin
      );
      
      if (!result.success) {
        setError(result.error || 'Invalid recovery phrase');
        return false;
      }
      
      // Create a new session
      createSession();
      setIsSessionExpired(false);
      setIsPinRequired(false);
      
      return true;
    } catch (err) {
      console.error('Failed to reset PIN:', err);
      setError('Failed to reset PIN');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  /**
   * Submit KYC verification data
   * @param verificationType The type of verification
   * @param verificationData The verification data
   * @returns Whether the submission was successful
   */
  const submitKyc = useCallback(async (
    verificationType: string,
    verificationData: Record<string, any>
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!walletAddress) {
        setError('No wallet address available');
        return false;
      }
      
      // Submit KYC verification data to Supabase
      const result = await submitKycVerification(
        walletAddress,
        verificationType,
        verificationData
      );
      
      if (!result.success) {
        setError(result.error || 'Failed to submit KYC verification');
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('Failed to submit KYC verification:', err);
      setError('Failed to submit KYC verification');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  /**
   * Get KYC verification status
   * @returns The KYC verification status
   */
  const getKycStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!walletAddress) {
        setError('No wallet address available');
        return null;
      }
      
      // Get KYC verification status from Supabase
      const result = await getKycVerificationStatus(walletAddress);
      
      if (!result.success) {
        setError(result.error || 'Failed to get KYC verification status');
        return null;
      }
      
      return result.verification;
    } catch (err) {
      console.error('Failed to get KYC verification status:', err);
      setError('Failed to get KYC verification status');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  return {
    walletAddress,
    isWalletAuthenticated,
    isPinRequired,
    isNewDevice,
    isSessionExpired,
    isLoading,
    error,
    createWallet,
    signInWithPin,
    recoverWalletAccess,
    verifyPinAndRefreshSession,
    resetPin,
    logout,
    submitKyc,
    getKycStatus
  };
};
