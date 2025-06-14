'use client';

import { useParams, useRouter } from 'next/navigation';
import { WalletLayout } from '@/components/wallet/WalletLayout';
import { useWalletStore } from '@/store/useWalletStore';
import { ArrowLeft, ExternalLink, Copy, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';

export default function TransactionPage() {
  const params = useParams();
  const router = useRouter();
  const { transactions } = useWalletStore();
  const [copied, setCopied] = useState(false);
  
  const transaction = transactions.find(tx => tx.id === params.id);
  
  if (!transaction) {
    return (
      <WalletLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <h2 className="text-xl font-medium mb-2">Transaction not found</h2>
          <p className="text-white/60 mb-6">The transaction you&apos;re looking for doesn&apos;t exist</p>
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl"
          >
            <ArrowLeft size={16} />
            Back to Home
          </button>
        </div>
      </WalletLayout>
    );
  }
  
  const getStatusColor = () => {
    switch (transaction.status) {
      case 'completed': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      case 'failed': return 'text-red-400';
      default: return 'text-white';
    }
  };
  
  const copyToClipboard = (text: string | undefined) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const getTransactionIcon = () => {
    const bgColorClass = transaction.type === 'send' ? 'bg-red-400/20' : 'bg-green-400/20';
    const textColorClass = transaction.type === 'send' ? 'text-red-400' : 'text-green-400';
    
    return (
      <div className={`w-16 h-16 ${bgColorClass} rounded-full flex items-center justify-center mb-4`}>
        {transaction.type === 'send' ? (
          <ArrowLeft size={32} className={textColorClass} />
        ) : (
          <ArrowLeft size={32} className={`${textColorClass} transform rotate-180`} />
        )}
      </div>
    );
  };
  
  const formatAmount = () => {
    const prefix = transaction.type === 'send' ? '-' : '+';
    const colorClass = transaction.type === 'send' ? 'text-red-400' : 'text-green-400';
    
    return (
      <span className={`text-3xl font-bold ${colorClass}`}>
        {prefix}${transaction.amount} {transaction.symbol}
      </span>
    );
  };

  return (
    <WalletLayout>
      <div className="mb-6">
        <button 
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Wallet
        </button>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10"
      >
        <div className="flex flex-col items-center mb-6 pt-4">
          {getTransactionIcon()}
          {formatAmount()}
          <p className="text-white/60 mt-1">
            {formatDistanceToNow(new Date(transaction.timestamp), { addSuffix: true })}
          </p>
          <div className={`mt-2 px-3 py-1 rounded-full ${getStatusColor()} bg-white/10 text-sm`}>
            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
          </div>
        </div>
        
        <div className="space-y-4 border-t border-white/10 pt-6">
          <div className="flex justify-between items-center">
            <span className="text-white/60">Type</span>
            <span className="font-medium capitalize">{transaction.type}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-white/60">Date</span>
            <span className="font-medium">
              {new Date(transaction.timestamp).toLocaleString()}
            </span>
          </div>
          
          {transaction.to && (
            <div className="flex justify-between items-center">
              <span className="text-white/60">To</span>
              <div className="flex items-center gap-2">
                <span className="font-medium font-mono">
                  {transaction.to.slice(0, 6)}...{transaction.to.slice(-4)}
                </span>
                <button 
                  onClick={() => copyToClipboard(transaction.to)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>
          )}
          
          {transaction.from && (
            <div className="flex justify-between items-center">
              <span className="text-white/60">From</span>
              <div className="flex items-center gap-2">
                <span className="font-medium font-mono">
                  {transaction.from.slice(0, 6)}...{transaction.from.slice(-4)}
                </span>
                <button 
                  onClick={() => copyToClipboard(transaction.from)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>
          )}
          
          {transaction.hash && (
            <div className="flex justify-between items-center">
              <span className="text-white/60">Transaction Hash</span>
              <div className="flex items-center gap-2">
                <span className="font-medium font-mono">
                  {transaction.hash.slice(0, 6)}...{transaction.hash.slice(-4)}
                </span>
                <button 
                  onClick={() => copyToClipboard(transaction.hash)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                </button>
                <a 
                  href={`https://basescan.org/tx/${transaction.hash}`} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <ExternalLink size={16} />
                </a>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </WalletLayout>
  );
}
