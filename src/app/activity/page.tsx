'use client';

// Prevent Next.js from prerendering this page
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { WalletLayout } from '@/components/wallet/WalletLayout';
import { useWalletStore } from '@/store/useWalletStore';
import { TransactionItem } from '@/components/wallet/TransactionItem';
import { motion } from 'framer-motion';
import { useTheme, financeTheme } from '@/contexts/ThemeContext';

type FilterType = 'all' | 'deposit' | 'send' | 'receive' | 'swap';

export default function ActivityPage() {
  const { theme } = useTheme();
  const themeColors = financeTheme[theme];
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
        <h1 
          className="text-2xl font-bold mb-6"
          style={{ color: themeColors.text.primary }}
        >
          Activity
        </h1>
        
        <div className="overflow-x-auto -mx-4 px-4 pb-2">
          <div className="flex gap-2 min-w-max">
            {filters.map((filterOption) => (
              <button
                key={filterOption.value}
                onClick={() => setFilter(filterOption.value)}
                className="px-4 py-2 rounded-full text-sm transition-colors"
                style={{
                  backgroundColor: filter === filterOption.value 
                    ? themeColors.brand.primary 
                    : themeColors.background.tertiary,
                  color: filter === filterOption.value 
                    ? '#ffffff' 
                    : themeColors.text.secondary
                }}
                onMouseEnter={(e) => {
                  if (filter !== filterOption.value) {
                    e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
                    e.currentTarget.style.color = themeColors.text.primary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (filter !== filterOption.value) {
                    e.currentTarget.style.backgroundColor = themeColors.background.tertiary;
                    e.currentTarget.style.color = themeColors.text.secondary;
                  }
                }}
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
        className="backdrop-blur-md p-6 rounded-2xl border transition-colors duration-200"
        style={{
          backgroundColor: themeColors.background.card,
          borderColor: themeColors.border.primary
        }}
      >
        {filteredTransactions.length > 0 ? (
          <div className="space-y-3">
            {filteredTransactions.map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p 
              className="text-lg mb-2"
              style={{ color: themeColors.text.primary }}
            >
              No transactions found
            </p>
            <p 
              className="text-sm"
              style={{ color: themeColors.text.secondary }}
            >
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
