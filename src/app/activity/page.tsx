'use client';

import { useState } from 'react';
import { WalletLayout } from '@/components/wallet/WalletLayout';
import { useWalletStore } from '@/store/useWalletStore';
import { TransactionItem } from '@/components/wallet/TransactionItem';
import { motion } from 'framer-motion';

type FilterType = 'all' | 'deposit' | 'send' | 'receive' | 'swap';

export default function ActivityPage() {
  const { transactions } = useWalletStore();
  const [filter, setFilter] = useState<FilterType>('all');
  
  const filteredTransactions = filter === 'all' 
    ? transactions 
    : transactions.filter(tx => tx.type === filter);
  
  const filters: { label: string; value: FilterType }[] = [
    { label: 'All', value: 'all' },
    { label: 'Deposits', value: 'deposit' },
    { label: 'Sent', value: 'send' },
    { label: 'Received', value: 'receive' },
    { label: 'Swaps', value: 'swap' },
  ];

  return (
    <WalletLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-6">Activity</h1>
        
        <div className="overflow-x-auto -mx-4 px-4 pb-2">
          <div className="flex gap-2 min-w-max">
            {filters.map((filterOption) => (
              <button
                key={filterOption.value}
                onClick={() => setFilter(filterOption.value)}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  filter === filterOption.value
                    ? 'bg-primary text-white'
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                {filterOption.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10"
      >
        {filteredTransactions.length > 0 ? (
          <div className="space-y-3">
            {filteredTransactions.map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-white/60">
            <p className="text-lg mb-2">No transactions found</p>
            <p className="text-sm">
              {filter === 'all'
                ? "You haven't made any transactions yet"
                : `You don't have any ${filter} transactions`}
            </p>
          </div>
        )}
      </motion.div>
    </WalletLayout>
  );
}
