'use client';

import { FC, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePrivyWallet } from '@/hooks/usePrivyWallet';
import { useModernTheme } from '@/contexts/ModernThemeContext';
import { ShoppingBag, Wallet, Eye, ArrowRight } from 'lucide-react';
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
  const [previewApp, setPreviewApp] = useState<DApp | null>(null);

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
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 
            className="text-xl font-semibold"
            style={{ color: theme.text.primary }}
          >
            Connect to Apps
          </h3>
          <div 
            className="text-sm px-3 py-1 rounded-full"
            style={{ 
              backgroundColor: theme.background.secondary,
              color: theme.text.secondary 
            }}
          >
            {AVAILABLE_DAPPS.length} Available
          </div>
        </div>

        {connectionError && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl border border-red-500/20 bg-red-500/10"
          >
            <p className="text-red-400 text-sm">Error: {connectionError}</p>
          </motion.div>
        )}
        
        <div className="grid grid-cols-1 gap-4">
          {AVAILABLE_DAPPS.map((dApp, index) => (
            <motion.div
              key={dApp.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="group relative p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg"
              style={{
                backgroundColor: theme.background.card,
                borderColor: theme.border.primary
              }}
              whileHover={{ y: -2 }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div 
                    className="p-3 rounded-xl transition-colors duration-300"
                    style={{ backgroundColor: theme.background.secondary }}
                  >
                    <dApp.icon 
                      className="w-6 h-6" 
                      style={{ color: theme.text.accent }}
                    />
                  </div>
                  <div className="flex-1">
                    <h4 
                      className="text-lg font-semibold mb-1"
                      style={{ color: theme.text.primary }}
                    >
                      {dApp.name}
                    </h4>
                    <p 
                      className="text-sm mb-3 leading-relaxed"
                      style={{ color: theme.text.secondary }}
                    >
                      {dApp.description}
                    </p>
                    
                    {dApp.preview && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {dApp.preview.features.slice(0, 2).map((feature, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-2 py-1 rounded-full"
                            style={{
                              backgroundColor: theme.background.secondary,
                              color: theme.text.tertiary
                            }}
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-4">
                {dApp.preview && (
                  <button
                    onClick={() => setPreviewApp(dApp)}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105"
                    style={{
                      backgroundColor: theme.background.secondary,
                      color: theme.text.secondary
                    }}
                  >
                    <Eye className="w-4 h-4" />
                    <span className="text-sm font-medium">Preview</span>
                  </button>
                )}
                
                <button
                  onClick={() => handleConnect(dApp)}
                  disabled={connecting !== ''}
                  className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                    connecting === dApp.id 
                      ? 'opacity-70 cursor-not-allowed' 
                      : 'hover:scale-105 hover:shadow-md'
                  }`}
                  style={{
                    backgroundColor: connecting === dApp.id 
                      ? theme.button.secondary.bg 
                      : theme.button.primary.bg,
                    color: connecting === dApp.id 
                      ? theme.button.secondary.text 
                      : theme.button.primary.text
                  }}
                >
                  <span>{connecting === dApp.id ? 'Connecting...' : 'Connect'}</span>
                  {connecting !== dApp.id && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewApp && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              onClick={() => setPreviewApp(null)}
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-4 z-50 max-w-2xl mx-auto my-auto h-fit rounded-2xl border shadow-2xl overflow-hidden"
              style={{
                backgroundColor: theme.background.card,
                borderColor: theme.border.primary
              }}
            >
              {/* Header */}
              <div 
                className="p-6 border-b"
                style={{ borderColor: theme.border.primary }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: theme.background.secondary }}
                    >
                      <previewApp.icon 
                        className="w-6 h-6" 
                        style={{ color: theme.text.accent }}
                      />
                    </div>
                    <div>
                      <h3 
                        className="text-xl font-semibold"
                        style={{ color: theme.text.primary }}
                      >
                        {previewApp.preview?.title}
                      </h3>
                      <p 
                        className="text-sm"
                        style={{ color: theme.text.secondary }}
                      >
                        {previewApp.name}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setPreviewApp(null)}
                    className="p-2 rounded-lg transition-colors duration-200"
                    style={{ 
                      backgroundColor: theme.background.secondary,
                      color: theme.text.secondary 
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6 space-y-6">
                <p 
                  className="text-base leading-relaxed"
                  style={{ color: theme.text.secondary }}
                >
                  {previewApp.preview?.description}
                </p>
                
                <div>
                  <h4 
                    className="text-lg font-semibold mb-3"
                    style={{ color: theme.text.primary }}
                  >
                    Key Features
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {previewApp.preview?.features.map((feature, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center space-x-2 p-3 rounded-lg"
                        style={{ backgroundColor: theme.background.secondary }}
                      >
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: theme.text.accent }}
                        />
                        <span 
                          className="text-sm font-medium"
                          style={{ color: theme.text.primary }}
                        >
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setPreviewApp(null)}
                    className="px-6 py-2 rounded-lg font-medium transition-all duration-200"
                    style={{
                      backgroundColor: theme.background.secondary,
                      color: theme.text.secondary
                    }}
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setPreviewApp(null);
                      handleConnect(previewApp);
                    }}
                    className="px-6 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                    style={{
                      backgroundColor: theme.button.primary.bg,
                      color: theme.button.primary.text
                    }}
                  >
                    Connect Now
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
