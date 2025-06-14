'use client';

import React, { ReactNode } from 'react';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { base } from 'wagmi/chains';
import '@rainbow-me/rainbowkit/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Configure chains and providers
const config = getDefaultConfig({
  appName: 'NEDApay',
  // Using a default project ID for development - in production, this should be an environment variable
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '3ee9b9b0ab8f4b0c2d7ec7c3f91b8a3a', 
  chains: [base],
  ssr: true, // Enable server-side rendering
});

interface Web3ProviderProps {
  children: ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
  // Create a client
  const queryClient = new QueryClient();

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
