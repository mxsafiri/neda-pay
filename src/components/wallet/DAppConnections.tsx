'use client';

import { FC, useState } from 'react';
import { motion } from 'framer-motion';
import { usePrivy } from '@privy-io/react-auth';
import { ExternalLink, ShoppingBag, Users, Wallet } from 'lucide-react';

// Define the dApp interface
interface DApp {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  url: string;
  category: 'merchant' | 'dao' | 'other';
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
  },
  {
    id: 'washika-dao',
    name: 'washikaDAO',
    description: 'Community governance platform',
    icon: Users,
    url: 'https://www.washikadao.xyz',
    category: 'dao',
  },
  {
    id: 'wallet-connect',
    name: 'Connect Wallet',
    description: 'Connect to any dApp',
    icon: Wallet,
    url: '#',
    category: 'other',
  },
];

export const DAppConnections: FC = () => {
  const { authenticated, connectWallet, login, getAccessToken } = usePrivy();
  const [connecting, setConnecting] = useState<string>('');
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const handleConnect = async (dApp: DApp) => {
    setConnectionError(null);
    setConnecting(dApp.id);
    
    try {
      if (!authenticated) {
        // If user is not authenticated, prompt them to connect their wallet
        await login();
        return;
      }

      if (dApp.id === 'wallet-connect') {
        // Use Privy's connectWallet for connecting external wallets
        await connectWallet();
      } else {
        // For ecosystem apps, pass the auth token for seamless sign-in
        try {
          // Get Privy auth token for SSO between apps
          const authToken = await getAccessToken();
          
          // Open the dApp with the auth token for automatic authentication
          if (authToken) {
            window.open(`${dApp.url}?auth_token=${encodeURIComponent(authToken)}`, '_blank');
          } else {
            window.open(dApp.url, '_blank');
          }
        } catch (error) {
          // If token retrieval fails, still open the app without SSO
          console.error('Failed to get auth token:', error);
          window.open(dApp.url, '_blank');
        }
      }
    } catch (error) {
      console.error('Connection error:', error);
      setConnectionError(error instanceof Error ? error.message : 'Failed to connect');
    } finally {
      setConnecting('');
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium mb-2">Connect to Apps</h3>
      {connectionError && (
        <div className="bg-red-500/20 border border-red-500/50 text-white p-3 rounded-lg text-sm">
          Error: {connectionError}
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-4">
        {AVAILABLE_DAPPS.map((dApp) => (
          <motion.div
            key={dApp.id}
            className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-center justify-between"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <div className="flex items-center space-x-3">
              <div className="bg-primary/20 p-2 rounded-lg">
                <dApp.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-white">{dApp.name}</h4>
                <p className="text-sm text-white/70">{dApp.description}</p>
              </div>
            </div>
            <button
              onClick={() => handleConnect(dApp)}
              disabled={connecting !== ''}
              className={`${connecting === dApp.id ? 'bg-primary/40' : 'bg-primary/20 hover:bg-primary/30'} text-primary px-4 py-2 rounded-lg flex items-center space-x-1 transition-colors ${connecting !== '' ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <span>{connecting === dApp.id ? 'Connecting...' : 'Connect'}</span>
              {connecting !== dApp.id && <ExternalLink className="w-4 h-4" />}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
