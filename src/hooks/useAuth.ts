'use client';

import { useCallback, useMemo, useEffect } from 'react';
import { useWalletAuth } from './useWalletAuth';
import { useRouter } from 'next/navigation';

type UserInfo = {
  wallet?: string;
  id: string;
};

export function useAuth() {
  const { 
    address,
    isAuthenticated,
    importPrivateKey,
    createWallet: createNewWallet,
    logout: walletLogout,
  } = useWalletAuth();
  
  const router = useRouter();
  
  // Generate a user ID based on wallet address
  const userId = useMemo(() => {
    if (!address) return '';
    return `wallet_${address.toLowerCase()}`;
  }, [address]);

  const activeAddress = address;

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
    if (!isAuthenticated || !address) return null;
    
    const userInfo: UserInfo = {
      id: userId,
      wallet: address,
    };

    return userInfo;
  }, [isAuthenticated, address, userId]);
  
  return {
    ready: true,
    authenticated: isAuthenticated,
    user: formattedUser,
    activeAddress,
    login: handleLogin,
    logout: handleLogout,
    createWallet: createNewWallet,
    importWallet: importPrivateKey,
  };
}
