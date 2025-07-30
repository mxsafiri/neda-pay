'use client';

import { FC, useState } from 'react';
import { motion } from 'framer-motion';
import { usePrivyWallet } from '@/hooks/usePrivyWallet';
import { useModernTheme } from '@/contexts/ModernThemeContext';
import { ShoppingBag, Wallet, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// Define the dApp interface
interface DApp {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  url: string;
  category: 'merchant' | 'dao' | 'other';
  preview?: {
    title: string;
    description: string;
    url: string;
    favicon: string;
    features: string[];
  };
}

// Define available dApps with real link preview metadata
const AVAILABLE_DAPPS: DApp[] = [
  {
    id: 'nedapay-merchant',
    name: 'NEDApay Merchant',
    description: 'Accept payments from customers',
    icon: ShoppingBag,
    url: 'https://nedapay.xyz',
    category: 'merchant',
    preview: {
      title: 'NEDApay',
      description: 'Accept Stablecoins, Swap instantly, Cash Out Easily, Track Transactions',
      url: 'nedapay.xyz',
      favicon: '/favicon.ico',
      features: [
        'Instant USDC payments',
        'Real-time analytics',
        'Customer management',
        'Transaction history'
      ]
    }
  },
  {
    id: 'universal-wallet',
    name: 'Universal Wallet',
    description: 'Connect to any dApp seamlessly',
    icon: Wallet,
    url: 'https://https://nedatshc.netlify.app/',
    category: 'other',
    preview: {
      title: 'NEDApay Wallet',
      description: 'Universal Web3 wallet for seamless dApp connections and multi-chain transactions',
      url: 'wallet.nedapay.xyz',
      favicon: '/favicon.ico',
      features: [
        'WalletConnect support',
        'Secure connections',
        'Multi-chain compatibility',
        'dApp ecosystem access'
      ]
    }
  }
];

export const DAppConnections: FC = () => {
  const { authenticated: isWalletAuthenticated, walletAddress } = usePrivyWallet();
  const { theme } = useModernTheme();
  const router = useRouter();
  const [connecting, setConnecting] = useState<string>('');
  const [connectionError, setConnectionError] = useState<string | null>(null);


  const handleConnect = async (dApp: DApp) => {
    console.log('handleConnect called with dApp:', dApp.id);
    setConnectionError(null);
    setConnecting(dApp.id);
    
    try {
      if (!isWalletAuthenticated) {
        console.log('User not authenticated, redirecting to login');
        // If user is not authenticated, redirect to login page
        router.push('/auth/login');
        return;
      }

      console.log('User authenticated, checking dApp.id:', dApp.id);
      if (dApp.id === 'wallet-connect') {
        console.log('Wallet connect functionality');
        // For now, just open a generic wallet connect page
        try {
          // In the future, implement proper wallet connection functionality
          window.open('https://www.nedapay.xyz/wallet-connect', '_blank');
          console.log('Opened wallet connect page');
        } catch (walletError) {
          console.error('Wallet connection specific error:', walletError);
          throw walletError; // Re-throw to be caught by the outer try/catch
        }
      } else {
        // For ecosystem apps, pass the wallet address for seamless sign-in
        try {
          // Get wallet address for SSO between apps
          // walletAddress is already destructured from useWalletAuth()
          
          // Open the dApp with the wallet address for automatic authentication
          if (walletAddress) {
            window.open(`${dApp.url}?wallet_address=${encodeURIComponent(walletAddress)}`, '_blank');
          } else {
            window.open(dApp.url, '_blank');
          }
        } catch (error) {
          // If address retrieval fails, still open the app without SSO
          console.error('Failed to get wallet address:', error);
          window.open(dApp.url, '_blank');
        }
      }
    } catch (error) {
      console.error('Connection error:', error);
      setConnectionError(error instanceof Error ? error.message : 'Failed to connect');
    } finally {
      console.log('Connection attempt completed, resetting connecting state');
      setConnecting('');
    }
  };

  return (
    <div className="space-y-4">
      {/* Section Header - blends with background */}
      <div className="mb-6">
        <h3 
          className="text-xl font-semibold mb-1"
          style={{ color: theme.text.primary }}
        >
          Connect to Apps
        </h3>
        <p 
          className="text-sm"
          style={{ color: theme.text.secondary }}
        >
          {AVAILABLE_DAPPS.length} available apps
        </p>
      </div>

      {connectionError && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-lg"
          style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
        >
          <p className="text-red-400 text-sm">Error: {connectionError}</p>
        </motion.div>
      )}
      
      {/* Apps List - Real Link Previews */}
      <div className="space-y-4">
        {AVAILABLE_DAPPS.map((dApp, index) => (
          <motion.div
            key={dApp.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="group relative p-4 border rounded-xl transition-all duration-200 cursor-pointer hover:shadow-md"
            style={{
              backgroundColor: theme.background.card,
              borderColor: theme.border.primary
            }}
            whileHover={{ y: -2 }}
            onClick={() => handleConnect(dApp)}
          >
            {/* Link Preview Header */}
            <div className="flex items-start space-x-3 mb-3">
              <Image 
                src={dApp.preview?.favicon || '/favicon.ico'} 
                alt="favicon" 
                width={24}
                height={24}
                className="w-6 h-6 rounded-sm flex-shrink-0 mt-0.5"
              />
              <div className="flex-1 min-w-0">
                <h4 
                  className="text-lg font-semibold mb-1 truncate"
                  style={{ color: theme.text.primary }}
                >
                  {dApp.preview?.title || dApp.name}
                </h4>
                <p 
                  className="text-sm leading-relaxed mb-2"
                  style={{ color: theme.text.secondary }}
                >
                  {dApp.preview?.description || dApp.description}
                </p>
                <div 
                  className="text-xs flex items-center space-x-1"
                  style={{ color: theme.text.tertiary }}
                >
                  <span>{dApp.preview?.url || dApp.url}</span>
                </div>
              </div>
              
              {/* Connection Status */}
              <div className="flex items-center space-x-2 flex-shrink-0">
                {connecting === dApp.id ? (
                  <motion.div
                    className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
                    style={{ color: theme.text.accent }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                ) : (
                  <ArrowRight 
                    className="w-5 h-5 transition-transform group-hover:translate-x-1" 
                    style={{ color: theme.text.accent }}
                  />
                )}
              </div>
            </div>
            
            {/* Link Preview Footer */}
            <div 
              className="text-xs pt-2 border-t"
              style={{ 
                borderColor: theme.border.secondary,
                color: theme.text.tertiary 
              }}
            >
              Click to connect • {dApp.category === 'merchant' ? 'Merchant Tools' : 'Wallet Service'}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
