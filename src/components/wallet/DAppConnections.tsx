'use client';

import { FC, useState } from 'react';
import { motion } from 'framer-motion';
import { usePrivyWallet } from '@/hooks/usePrivyWallet';
import { useModernTheme } from '@/contexts/ModernThemeContext';
import { ShoppingBag, Wallet, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
    features: string[];
    screenshot: string;
  };
}

// Define available dApps
const AVAILABLE_DAPPS: DApp[] = [
  {
    id: 'merchant-app',
    name: 'NEDApay Merchant',
    description: 'Accept payments from customers',
    icon: ShoppingBag,
    url: 'https://www.nedapay.xyz',
    category: 'merchant',
    preview: {
      title: 'NEDApay Merchant Portal',
      description: 'Accept USDC payments from customers with instant settlement',
      features: ['Instant USDC payments', 'Real-time analytics', 'Multi-currency support', 'Low transaction fees'],
      screenshot: '/images/merchant-preview.png' // We'll add this later
    }
  },
  {
    id: 'wallet-connect',
    name: 'Universal Wallet',
    description: 'Connect to any dApp seamlessly',
    icon: Wallet,
    url: '#',
    category: 'other',
    preview: {
      title: 'Universal dApp Connector',
      description: 'Connect your NEDApay wallet to any decentralized application',
      features: ['WalletConnect support', 'Secure connections', 'Multi-chain compatibility', 'One-click authentication'],
      screenshot: '/images/wallet-connect-preview.png'
    }
  },
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
      
      {/* Apps List - no cards, blend with background */}
      <div className="space-y-3">
        {AVAILABLE_DAPPS.map((dApp, index) => (
          <motion.div
            key={dApp.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="group relative p-3 transition-all duration-200 cursor-pointer hover:bg-white/5 rounded-lg"
            whileHover={{ x: 4 }}
            onClick={() => handleConnect(dApp)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <dApp.icon 
                  className="w-5 h-5" 
                  style={{ color: theme.text.accent }}
                />
                <div>
                  <h4 
                    className="text-base font-medium"
                    style={{ color: theme.text.primary }}
                  >
                    {dApp.name}
                  </h4>
                  <p 
                    className="text-sm"
                    style={{ color: theme.text.secondary }}
                  >
                    {dApp.description}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {connecting === dApp.id ? (
                  <motion.div
                    className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                    style={{ color: theme.text.accent }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                ) : (
                  <ArrowRight 
                    className="w-4 h-4 transition-transform group-hover:translate-x-1" 
                    style={{ color: theme.text.accent }}
                  />
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
