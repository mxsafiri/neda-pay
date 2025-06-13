'use client';

import { FC } from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { ArrowDownLeft, ArrowUpRight, RefreshCcw, Wallet } from 'lucide-react';
import { Transaction } from '@/store/useWalletStore';
import { useRouter } from 'next/navigation';

interface TransactionItemProps {
  transaction: Transaction;
}

export const TransactionItem: FC<TransactionItemProps> = ({ transaction }) => {
  const router = useRouter();
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit': return <ArrowDownLeft className="w-5 h-5 text-green-400" />;
      case 'send': return <ArrowUpRight className="w-5 h-5 text-red-400" />;
      case 'receive': return <ArrowDownLeft className="w-5 h-5 text-green-400" />;
      case 'swap': return <RefreshCcw className="w-5 h-5 text-blue-400" />;
      default: return <Wallet className="w-5 h-5" />;
    }
  };
  
  const getTransactionAmount = () => {
    const prefix = transaction.type === 'send' ? '-' : '+';
    return (
      <span className={transaction.type === 'send' ? 'text-red-400' : 'text-green-400'}>
        {prefix}${transaction.amount}
      </span>
    );
  };

  const getTransactionLabel = () => {
    switch (transaction.type) {
      case 'deposit': return 'Deposit';
      case 'send': return `Sent to ${transaction.to?.slice(0, 6)}...${transaction.to?.slice(-4)}`;
      case 'receive': return `Received from ${transaction.from?.slice(0, 6)}...${transaction.from?.slice(-4)}`;
      case 'swap': return 'Swap';
      default: return transaction.type;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-between py-3 border-b border-white/10 cursor-pointer hover:bg-white/5 transition-colors px-2 -mx-2 rounded-lg"
      onClick={() => router.push(`/transaction/${transaction.id}`)}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
          {getTransactionIcon(transaction.type)}
        </div>
        <div>
          <p className="font-medium">{getTransactionLabel()}</p>
          <p className="text-sm text-white/60">
            {formatDistanceToNow(new Date(transaction.timestamp), { addSuffix: true })}
          </p>
        </div>
      </div>
      {getTransactionAmount()}
    </motion.div>
  );
};
