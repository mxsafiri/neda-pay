'use client';

import { PropsWithChildren, createContext, useEffect, useState } from 'react';
import { useWalletAuth } from '@/hooks/useWalletAuth';

// Define the context type
type WalletAuthContextType = {
  isInitialized: boolean;
  isAuthenticated: boolean; // Keep the same name in the context for backward compatibility
  address: string | null; // Keep the same name in the context for backward compatibility
  error: string | null;
};

// Create context with default values
export const WalletAuthContext = createContext<WalletAuthContextType>({
  isInitialized: false,
  isAuthenticated: false,
  address: null,
  error: null,
});

export function WalletAuthProvider({ children }: PropsWithChildren) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isWalletAuthenticated, walletAddress } = useWalletAuth();
  
  // Initialize wallet auth
  useEffect(() => {
    try {
      // Check if we have a wallet in localStorage
      const savedWallet = localStorage.getItem('neda_wallet');
      
      // Mark as initialized regardless of whether wallet exists
      setIsInitialized(true);
      
      if (!savedWallet) {
        console.log('No wallet found in storage');
      } else {
        console.log('Wallet found in storage');
      }
    } catch (err) {
      console.error('Error initializing wallet auth:', err);
      setError('Failed to initialize wallet authentication');
    }
  }, []);
  
  // Set up error handling
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      // Check if error is related to wallet operations
      if (event.message?.toLowerCase().includes('wallet') || 
          event.message?.toLowerCase().includes('ethereum')) {
        console.error('Wallet authentication error:', event.error);
        
        const error = event.error;
        if (error instanceof Error) {
          setError('Wallet error: ' + error.message);
        } else {
          setError('Wallet error occurred');
        }
      }
    };
    
    window.addEventListener('error', handleGlobalError);
    
    return () => {
      window.removeEventListener('error', handleGlobalError);
    };
  }, []);
  
  return (
    <WalletAuthContext.Provider 
      value={{
        isInitialized,
        isAuthenticated: isWalletAuthenticated, // Map from new name to old name for context compatibility
        address: walletAddress, // Map from new name to old name for context compatibility
        error,
      }}
    >
      {children}
    </WalletAuthContext.Provider>
  );
}
