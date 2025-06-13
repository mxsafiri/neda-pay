'use client';

import { WalletLayout } from '@/components/wallet/WalletLayout'
import { WalletBalance } from '@/components/wallet/WalletBalance'
import { useWalletStore } from '@/store/useWalletStore'
import { TransactionItem } from '@/components/wallet/TransactionItem'
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'

export default function Home() {
  return (
    <WalletLayout>
      <WalletBalance />
      <div className="space-y-6">
        <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10">
          <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="flex flex-col items-center justify-center bg-primary text-white p-5 rounded-xl hover:bg-primary/90 transition-colors">
              <ArrowDownLeft className="w-6 h-6 mb-2" />
              <span>Buy</span>
            </button>
            <button className="flex flex-col items-center justify-center bg-white/10 text-white p-5 rounded-xl hover:bg-white/20 transition-colors">
              <ArrowUpRight className="w-6 h-6 mb-2" />
              <span>Send</span>
            </button>
          </div>
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
      {transactions.length > 0 ? (
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-white/60">
          <p>No transactions yet</p>
        </div>
      )}
    </div>
  );
}
