'use client';

import { useCallback, useMemo } from 'react';
import { useWalletAuth } from './useWalletAuth';
import { useRouter } from 'next/navigation';

type UserInfo = {
  wallet?: string;
  id: string;
};

export function useAuth() {
  const { 
    walletAddress,
    isWalletAuthenticated,
    createWallet: createNewWallet,
    logout: walletLogout,
  } = useWalletAuth();
  
  const router = useRouter();
  
  // Generate a user ID based on wallet address
  const userId = useMemo(() => {
    if (!walletAddress) return '';
    return `wallet_${walletAddress.toLowerCase()}`;
  }, [walletAddress]);

  const activeAddress = walletAddress;

  const handleLogin = useCallback(() => {
    // Open wallet login modal
    router.push('/auth/login');
  }, [router]);

  const handleLogout = useCallback(() => {
    walletLogout();
    router.push('/');
  }, [walletLogout, router]);

  // Format user data for easier consumption in components
  const formattedUser = useMemo(() => {
    if (!isWalletAuthenticated || !walletAddress) return null;
    
    const userInfo: UserInfo = {
      id: userId,
      wallet: walletAddress,
    };

    return userInfo;
  }, [isWalletAuthenticated, walletAddress, userId]);
  
  return {
    ready: true,
    authenticated: isWalletAuthenticated,
    user: formattedUser,
    activeAddress,
    login: handleLogin,
    logout: handleLogout,
    createWallet: createNewWallet
  };
}
