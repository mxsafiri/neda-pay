'use client';

import { useState, useEffect, useMemo } from 'react';
import { WalletLayout } from '@/components/wallet/WalletLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDownUp, RefreshCcw, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTokenSwap } from '@/hooks/useTokenSwap';
import { useBlockradar } from '@/hooks/useBlockradar';

import { TokenSelector, Token } from '@/components/swap/TokenSelector';
import { SwapInput } from '@/components/swap/SwapInput';
import { SwapDetails } from '@/components/swap/SwapDetails';
import { SwapHistory } from '@/components/swap/SwapHistory';

// Token metadata (logos, country info) - will be merged with real balances
const TOKEN_METADATA: Record<string, { name: string, logoUrl: string, icon: string, country: string }> = {
  'USDC': { name: 'USD Coin', logoUrl: '/tokens/usdc.svg', icon: 'us', country: 'United States' },
  'USDT': { name: 'Tether USD', logoUrl: '/tokens/usdt.svg', icon: 'us', country: 'United States' },
  'nTZS': { name: 'NEDA Tanzanian Shilling', logoUrl: '', icon: 'tz', country: 'Tanzania' },
  'EURC': { name: 'Euro Coin', logoUrl: '', icon: 'eu', country: 'European Union' },
  'GBPT': { name: 'Pound Token', logoUrl: '', icon: 'gb', country: 'United Kingdom' },
};

export default function SwapPage() {
  const { authenticated } = useAuth();
  const { balances, getBalancesForCurrentChain } = useBlockradar();
  const { swap, status: swapStatus, error: swapError, reset } = useTokenSwap();
  const [amount, setAmount] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  
  // Convert Blockradar balances to Token format
  const availableTokens = useMemo(() => {
    const baseBalances = getBalancesForCurrentChain();
    
    // Map balances to Token format
    return baseBalances.map(balance => {
      const symbol = balance.symbol || '';
      const metadata = TOKEN_METADATA[symbol] || { 
        name: symbol, 
        logoUrl: '', 
        icon: 'us', 
        country: 'Unknown' 
      };
      
      return {
        symbol,
        name: metadata.name,
        balance: balance.balance ? balance.balance.toString() : '0.00',
        logoUrl: metadata.logoUrl,
        icon: metadata.icon,
        country: metadata.country
      };
    });
  }, [balances, getBalancesForCurrentChain]);
  
  // Default to first two tokens if available, otherwise use empty tokens
  const [fromToken, setFromToken] = useState<Token>(
    availableTokens.length > 0 ? availableTokens[0] : { 
      symbol: 'USDC', 
      name: 'USD Coin', 
      balance: '0.00', 
      logoUrl: '/tokens/usdc.svg', 
      icon: 'us', 
      country: 'United States' 
    }
  );
  
  const [toToken, setToToken] = useState<Token>(
    availableTokens.length > 1 ? availableTokens[1] : { 
      symbol: 'USDT', 
      name: 'Tether USD', 
      balance: '0.00', 
      logoUrl: '/tokens/usdt.svg', 
      icon: 'us', 
      country: 'United States' 
    }
  );
  
  // Update tokens when balances change
  useEffect(() => {
    if (availableTokens.length > 0) {
      // Find current tokens in new balances
      const newFromToken = availableTokens.find(t => t.symbol === fromToken.symbol) || availableTokens[0];
      const newToToken = availableTokens.find(t => t.symbol === toToken.symbol) || 
        (availableTokens.length > 1 ? availableTokens[1] : availableTokens[0]);
      
      setFromToken(newFromToken);
      setToToken(newToToken);
    }
  }, [availableTokens]);
  
  // Calculate exchange rate based on token pair
  const getExchangeRate = (from: string, to: string) => {
    const rates: Record<string, Record<string, number>> = {
      'USDC': {
        'USDT': 0.998,
        'nTZS': 2500,
        'EURC': 0.92,
        'GBPT': 0.78,
      },
      'USDT': {
        'USDC': 1.002,
        'nTZS': 2505,
        'EURC': 0.921,
        'GBPT': 0.781,
      },
      'nTZS': {
        'USDC': 0.0004,
        'USDT': 0.0004,
        'EURC': 0.00037,
        'GBPT': 0.00031,
      },
      'EURC': {
        'USDC': 1.087,
        'USDT': 1.086,
        'nTZS': 2720,
        'GBPT': 0.85,
      },
      'GBPT': {
        'USDC': 1.28,
        'USDT': 1.28,
        'nTZS': 3205,
        'EURC': 1.18,
      },
    };
    
    return rates[from]?.[to] || 1;
  };
  
  const exchangeRate = getExchangeRate(fromToken.symbol, toToken.symbol);
  
  // Calculate estimated amount based on input and exchange rate
  const estimatedAmount = amount && !isNaN(parseFloat(amount)) 
    ? (parseFloat(amount) * exchangeRate).toFixed(6)
    : '0.00';
  
  // Reset status message after 5 seconds
  useEffect(() => {
    if (swapStatus === 'success' || swapStatus === 'error') {
      const timer = setTimeout(() => {
        reset();
        setStatusMessage('');
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [swapStatus, reset]);
  
  // Update status message when swap status changes
  useEffect(() => {
    if (swapStatus === 'error' && swapError) {
      setStatusMessage(swapError);
    }
  }, [swapStatus, swapError]);
  
  const handleSwap = async () => {
    if (!authenticated || !amount || parseFloat(amount) <= 0) return;
    
    try {
      // Execute the swap using our hook
      const transaction = await swap(fromToken, toToken, amount);
      
      // Success - set status message
      setStatusMessage(`Successfully swapped ${amount} ${fromToken.symbol} for ${transaction.outputAmount.toFixed(6)} ${toToken.symbol}`);
      
      // Reset form after a delay
      setTimeout(() => {
        setAmount('');
      }, 3000);
    } catch (error) {
      // Error handling is done in the hook
      console.error('Swap error:', error);
    }
  };
  
  const handleSwitchTokens = () => {
    if (swapStatus === 'loading') return;
    
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    
    // Clear amount when switching tokens
    setAmount('');
  };

  return (
    <WalletLayout>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Swap</h1>
        <div className="text-sm text-white/60">
          Powered by NEDApay
        </div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 max-w-lg mx-auto"
      >
        <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Select Tokens</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">From</label>
            <TokenSelector 
              tokens={availableTokens}
              selectedToken={fromToken}
              onSelect={setFromToken}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">To</label>
            <TokenSelector 
              tokens={availableTokens.filter(t => t.symbol !== fromToken.symbol)}
              selectedToken={toToken}
              onSelect={setToToken}
            />
          </div>
        </div>
        
          {/* Switch Button */}
          <div className="flex justify-center -my-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSwitchTokens}
              disabled={swapStatus === 'loading'}
              className={`bg-[#0A1F44] p-3 rounded-full border border-white/10 shadow-lg ${swapStatus === 'loading' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#162b4f] cursor-pointer'}`}
            >
              <ArrowDownUp className="w-5 h-5" />
            </motion.button>
          </div>
          
          {/* To Token */}
          <div className="space-y-2">
            <TokenSelector 
              selectedToken={toToken} 
              tokens={availableTokens.filter((t: Token) => t.symbol !== fromToken.symbol)} 
              onSelect={setToToken} 
              label="To (Estimated)"
            />
            <SwapInput 
              token={toToken} 
              amount={estimatedAmount} 
              onChange={() => {}} 
              disabled={true}
            />
          </div>
          
          {/* Swap Details */}
          <SwapDetails 
            fromToken={fromToken}
            toToken={toToken}
            amount={amount}
            estimatedAmount={estimatedAmount}
            rate={exchangeRate}
            feePercentage={0.3}
            isLoading={swapStatus === 'loading'}
          />
          
          {/* Status Message */}
          <AnimatePresence>
            {(swapStatus === 'success' || swapStatus === 'error') && statusMessage && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`rounded-lg p-3 flex items-center gap-2 text-sm ${swapStatus === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}
              >
                {swapStatus === 'success' ? (
                  <Check className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                )}
                <span>{statusMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Swap Button */}
          <button
            onClick={handleSwap}
            disabled={!authenticated || !amount || parseFloat(amount) <= 0 || swapStatus === 'loading'}
            className={`w-full py-4 rounded-xl text-white font-medium flex items-center justify-center gap-2 transition-all ${
              !authenticated || !amount || parseFloat(amount) <= 0 || swapStatus === 'loading'
                ? 'bg-white/20 cursor-not-allowed'
                : 'bg-[#0A1F44] hover:bg-[#162b4f] shadow-lg'
            }`}
          >
            {swapStatus === 'loading' ? (
              <>
                <RefreshCcw className="w-5 h-5 animate-spin" />
                <span>Swapping...</span>
              </>
            ) : (
              'Swap'
            )}
          </button>
        </div>
        
        {/* Swap History */}
        {authenticated && (
          <SwapHistory userId="current-user-id" />
        )}
      </motion.div>
    </WalletLayout>
  );
}
