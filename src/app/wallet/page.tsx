'use client';

// Prevent Next.js from prerendering this page
export const dynamic = 'force-dynamic';

import React from 'react';
import { WalletLayout } from '@/components/wallet/WalletLayout'
import { CircularWalletBalance } from '@/components/wallet/CircularWalletBalance'
import { useWalletStore } from '@/store/useWalletStore'
import { TransactionItem } from '@/components/wallet/TransactionItem'

import { DAppConnections } from '@/components/wallet/DAppConnections'
import { useTheme, financeTheme } from '@/contexts/ThemeContext'

export default function WalletPage() {
  const { theme } = useTheme();
  const themeColors = financeTheme[theme];
  
  return (
    <WalletLayout>
      <CircularWalletBalance />
      <div className="space-y-6">
        {/* DApp Connections Section */}
        <div 
          className="backdrop-blur-md p-6 rounded-2xl border transition-colors duration-200"
          style={{
            backgroundColor: themeColors.background.card,
            borderColor: themeColors.border.primary
          }}
        >
          <h3 
            className="text-lg font-medium mb-4"
            style={{ color: themeColors.text.primary }}
          >
            Connected Apps
          </h3>
          <DAppConnections />
        </div>
        
        <ActivitySection />
      </div>
    </WalletLayout>
  );
}

function ActivitySection() {
  const { transactions } = useWalletStore();
  
  return (
    <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10">
      <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
      
      <div className="space-y-3">
        {transactions.length > 0 ? (
          transactions.map(transaction => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))
        ) : (
          <div className="text-center py-6 text-white/60">
            No recent transactions
          </div>
        )}
      </div>
    </div>
  );
}
