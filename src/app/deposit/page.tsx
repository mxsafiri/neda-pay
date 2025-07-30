'use client';

// Prevent Next.js from prerendering this page
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { WalletLayout } from '@/components/wallet/WalletLayout';
import { motion } from 'framer-motion';
import { Copy, CheckCircle, Wallet, AlertCircle } from 'lucide-react';
import { usePrivyWallet } from '@/hooks/usePrivyWallet';
import { QRCode } from '@/components/ui/QRCode';

export default function DepositPage() {
  const { walletAddress, authenticated, ready } = usePrivyWallet();
  const [copied, setCopied] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState('USDC');
  
  // Use the Privy wallet address as the deposit address
  const depositAddress = walletAddress || '';
  
  // No need to create a new address - using the user's existing wallet address
  
  // Handle copy to clipboard
  const copyToClipboard = () => {
    if (depositAddress) {
      navigator.clipboard.writeText(depositAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };
  
  return (
    <WalletLayout>
      <div className="space-y-6">
        <motion.div 
          className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-2xl font-bold mb-6">Deposit {selectedAsset}</h2>
          
          <div className="space-y-6">
            <div className="bg-white/10 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Select Asset</h3>
              <div className="grid grid-cols-1 gap-2">
                <button
                  className={`p-4 rounded-lg flex items-center justify-between ${
                    selectedAsset === 'USDC' ? 'bg-blue-500/20 border border-blue-500/50' : 'bg-white/5'
                  }`}
                  onClick={() => setSelectedAsset('USDC')}
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold mr-3">
                      USDC
                    </div>
                    <div>
                      <p className="font-medium">USD Coin</p>
                      <p className="text-sm text-white/60">USDC</p>
                    </div>
                  </div>
                  {selectedAsset === 'USDC' && <CheckCircle className="text-blue-400" size={20} />}
                </button>
              </div>
            </div>
            
            <div className="bg-white/10 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-4">Your Deposit Address</h3>
              
              {!ready ? (
                <div className="text-center py-6">
                  <div className="w-8 h-8 border-t-2 border-blue-500 border-solid rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-white/60">Loading wallet...</p>
                </div>
              ) : !authenticated ? (
                <div className="text-center py-6">
                  <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                  <p className="text-white/60 mb-4">Please connect your wallet to view deposit address</p>
                  <button 
                    onClick={() => window.location.href = '/sign-in'}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Connect Wallet
                  </button>
                </div>
              ) : depositAddress ? (
                <div className="space-y-4">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-white rounded-lg">
                      <QRCode value={depositAddress} size={200} />
                    </div>
                  </div>
                  
                  <div className="bg-white/5 p-4 rounded-lg break-all">
                    <p className="text-sm text-white/80 mb-1">Address:</p>
                    <div className="flex items-center justify-between">
                      <p className="font-mono text-sm">{depositAddress}</p>
                      <button 
                        onClick={copyToClipboard}
                        className="ml-2 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                      >
                        {copied ? <CheckCircle size={16} className="text-green-400" /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-500/20 border border-yellow-500/50 text-yellow-200 p-4 rounded-lg">
                    <p className="text-sm">
                      <strong>Important:</strong> Only send {selectedAsset} to this address. Sending any other token may result in permanent loss.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-white/60 mb-4">Wallet address not available</p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Refresh
                  </button>
                </div>
              )}
            </div>
            
            <div className="bg-white/10 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Network Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-white/60">Network</p>
                  <p className="font-medium">Base (Ethereum L2)</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-white/60">Token Standard</p>
                  <p className="font-medium">ERC-20</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-white/60">Minimum Deposit</p>
                  <p className="font-medium">1 USDC</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </WalletLayout>
  );
}
