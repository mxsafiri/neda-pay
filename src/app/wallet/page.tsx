'use client';

// Prevent Next.js from prerendering this page
export const dynamic = 'force-dynamic';

import React from 'react';
import { WalletLayout } from '@/components/wallet/WalletLayout'
import { WalletBalance } from '@/components/wallet/WalletBalance'
import { useWalletStore } from '@/store/useWalletStore'
import { TransactionItem } from '@/components/wallet/TransactionItem'
import { ArrowDownLeft, QrCode, Plus, Download } from 'lucide-react'
import { DAppConnections } from '@/components/wallet/DAppConnections'

export default function WalletPage() {
  const [activeTab, setActiveTab] = React.useState<'basic' | 'connect'>('basic');
  
  return (
    <WalletLayout>
      <WalletBalance />
      <div className="space-y-6">
        <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10">
          <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
          
          {/* Tabs for Quick Actions */}
          <div className="flex border-b border-white/10 mb-4">
            <button
              className={`px-4 py-2 ${activeTab === 'basic' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-white/60'}`}
              onClick={() => setActiveTab('basic')}
            >
              Basic
            </button>
            <button
              className={`px-4 py-2 ${activeTab === 'connect' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-white/60'}`}
              onClick={() => setActiveTab('connect')}
            >
              Connect
            </button>
          </div>
          
          {/* Tab Content */}
          {activeTab === 'basic' ? (
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => window.location.href = '/payment?manual=true'}
                className="bg-white/5 hover:bg-white/10 p-4 rounded-xl flex flex-col items-center justify-center transition-all"
              >
                <ArrowDownLeft className="mb-2 text-blue-400" />
                <span>Send Money</span>
              </button>
              <button 
                onClick={() => window.location.href = '/scan'}
                className="bg-white/5 hover:bg-white/10 p-4 rounded-xl flex flex-col items-center justify-center transition-all"
              >
                <QrCode className="mb-2 text-purple-400" />
                <span>Scan to Pay</span>
              </button>
              <button 
                onClick={() => window.location.href = '/deposit'}
                className="bg-white/5 hover:bg-white/10 p-4 rounded-xl flex flex-col items-center justify-center transition-all mt-3"
              >
                <Download className="mb-2 text-blue-400" />
                <span>Deposit</span>
              </button>
              <button 
                onClick={() => window.location.href = '/buy'}
                className="bg-white/5 hover:bg-white/10 p-4 rounded-xl flex flex-col items-center justify-center transition-all mt-3"
              >
                <Plus className="mb-2 text-green-400" />
                <span>Buy</span>
              </button>
            </div>
          ) : (
            <DAppConnections />
          )}
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
