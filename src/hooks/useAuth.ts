'use client';

import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useCallback, useMemo } from 'react';

type UserInfo = {
  email?: string;
  wallet?: string;
  id: string;
};

export function useAuth() {
  const { 
    ready,
    authenticated,
    user,
    login,
    logout,
    createWallet,
    linkWallet,
    unlinkWallet,
  } = usePrivy();
  
  const { wallets } = useWallets();
  
  const activeWallet = useMemo(() => {
    return wallets?.find(wallet => wallet.walletClientType === 'privy');
  }, [wallets]);

  const activeAddress = useMemo(() => {
    return activeWallet?.address;
  }, [activeWallet]);

  const handleLogin = useCallback(() => {
    login();
  }, [login]);

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  // Format user data for easier consumption in components
  const formattedUser = useMemo(() => {
    if (!user) return null;
    
    const userInfo: UserInfo = {
      id: user.id,
      email: user.email?.address,
      wallet: activeAddress,
    };
    
    return userInfo;
  }, [user, activeAddress]);
  
  return {
    ready,
    authenticated,
    user: formattedUser,
    login: handleLogin,
    logout: handleLogout,
    createWallet,
    linkWallet,
    unlinkWallet,
    wallets,
    activeWallet,
    activeAddress,
  };
}
