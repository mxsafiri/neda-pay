'use client';

import React, { useState, useEffect } from 'react';
import { WalletLayout } from '@/components/wallet/WalletLayout';
import { motion } from 'framer-motion';
import { Copy, QrCode, CheckCircle } from 'lucide-react';
import { useBlockradarStore } from '@/store/useBlockradarStore';
import { useAuth } from '@/hooks/useAuth';
import { LoadingState } from '@/components/ui/LoadingState';
import { QRCode } from '@/components/ui/QRCode';

export default function DepositPage() {
  const { userAddresses, createUserAddress, isLoading, error, setError } = useBlockradarStore();
  const { authenticated, activeAddress } = useAuth();
  const [copied, setCopied] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState('USDC');
  
  // Get the user's deposit address for the selected blockchain (Base)
  const blockchain = 'base';
  const depositAddress = userAddresses[blockchain]?.address || '';
  
  useEffect(() => {
    // Create a user address if one doesn't exist yet
    const createAddress = async () => {
      if (!depositAddress && authenticated) {
        try {
          await createUserAddress(blockchain, `${activeAddress}-deposit`, { 
            userId: activeAddress,
            purpose: 'deposit'
          });
        } catch (err) {
          console.error('Error creating deposit address:', err);
        }
      }
    };
    
    createAddress();
  }, [blockchain, depositAddress, authenticated, createUserAddress, activeAddress]);
  
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
          
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-lg mb-6">
              <p>{error}</p>
              <button 
                className="text-sm underline mt-2"
                onClick={() => setError(null)}
              >
                Dismiss
              </button>
            </div>
          )}
          
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
              
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingState size="lg" text="Generating your deposit address..." />
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
                <div className="text-center py-6 text-white/60">
                  <p>No deposit address available. Please try again later.</p>
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
