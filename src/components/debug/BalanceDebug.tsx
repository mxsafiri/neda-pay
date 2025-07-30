'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { usePrivyWallet } from '@/hooks/usePrivyWallet';
import { getETHBalance, getTokenBalance, BASE_TOKENS } from '@/utils/blockchain';

export const BalanceDebug: React.FC = () => {
  const { authenticated, embeddedWallet } = usePrivyWallet();
  const [debugInfo, setDebugInfo] = useState<Record<string, string | number | boolean>>({});
  const [isLoading, setIsLoading] = useState(false);

  const fetchDebugInfo = useCallback(async () => {
    if (!embeddedWallet?.address) {
      setDebugInfo({ error: 'No wallet address available' });
      return;
    }

    setIsLoading(true);
    try {
      const address = embeddedWallet.address as `0x${string}`;
      
      console.log('🔍 Debug: Fetching balances for address:', address);
      
      // Fetch ETH balance
      const ethBalance = await getETHBalance(address);
      console.log('🔍 Debug: ETH balance:', ethBalance);
      
      // Fetch USDC balance
      const usdcBalance = await getTokenBalance(BASE_TOKENS.USDC, address);
      console.log('🔍 Debug: USDC balance:', usdcBalance);
      
      // Check if address is valid
      const isValidAddr = address.startsWith('0x') && address.length === 42;
      
      setDebugInfo({
        walletAddress: address,
        isValidAddress: isValidAddr,
        ethBalance,
        usdcBalance,
        usdcContractAddress: BASE_TOKENS.USDC,
        network: 'Base',
        timestamp: new Date().toISOString(),
      });
      
    } catch (error) {
      console.error('🔍 Debug: Error fetching balances:', error);
      setDebugInfo({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  }, [embeddedWallet?.address]);

  useEffect(() => {
    if (authenticated && embeddedWallet?.address) {
      fetchDebugInfo();
    }
  }, [authenticated, embeddedWallet?.address, fetchDebugInfo]);

  if (!authenticated) {
    return (
      <div className="p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
        <p className="text-yellow-800">Please connect your wallet to debug balances</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 border border-gray-300 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Balance Debug Info</h3>
        <button
          onClick={fetchDebugInfo}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Wallet Address</label>
            <p className="text-sm font-mono bg-white p-2 rounded border">
              {debugInfo.walletAddress || 'Not available'}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Valid Address</label>
            <p className={`text-sm p-2 rounded border ${
              debugInfo.isValidAddress ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {debugInfo.isValidAddress ? 'Yes' : 'No'}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">ETH Balance</label>
            <p className="text-sm font-mono bg-white p-2 rounded border">
              {debugInfo.ethBalance || '0'} ETH
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">USDC Balance</label>
            <p className="text-sm font-mono bg-white p-2 rounded border">
              {debugInfo.usdcBalance || '0'} USDC
            </p>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">USDC Contract Address</label>
          <p className="text-sm font-mono bg-white p-2 rounded border">
            {debugInfo.usdcContractAddress || 'Not available'}
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Network</label>
          <p className="text-sm bg-white p-2 rounded border">
            {debugInfo.network || 'Unknown'}
          </p>
        </div>
        
        {debugInfo.error && (
          <div className="p-3 bg-red-100 border border-red-300 rounded">
            <label className="block text-sm font-medium text-red-700">Error</label>
            <p className="text-sm text-red-800">{debugInfo.error}</p>
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Last Updated</label>
          <p className="text-xs text-gray-600">
            {debugInfo.timestamp || 'Never'}
          </p>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Troubleshooting Tips:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Make sure you funded your wallet on Base network (not Ethereum mainnet)</li>
          <li>• Check that the transaction was confirmed on Base</li>
          <li>• USDC contract address should be: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913</li>
          <li>• Try refreshing the balance after a few seconds</li>
          <li>• Check browser console for any error messages</li>
        </ul>
      </div>
    </div>
  );
};
