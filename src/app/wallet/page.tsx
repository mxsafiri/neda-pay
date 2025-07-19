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
import { useTheme, financeTheme } from '@/contexts/ThemeContext'

export default function WalletPage() {
  const [activeTab, setActiveTab] = React.useState<'basic' | 'connect'>('basic');
  const { theme } = useTheme();
  const themeColors = financeTheme[theme];
  
  return (
    <WalletLayout>
      <WalletBalance />
      <div className="space-y-6">
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
            Quick Actions
          </h3>
          
          {/* Tabs for Quick Actions */}
          <div 
            className="flex mb-4"
            style={{ borderBottom: `1px solid ${themeColors.border.primary}` }}
          >
            <button
              className="px-4 py-2 transition-colors"
              style={{
                borderBottom: activeTab === 'basic' ? `2px solid ${themeColors.brand.primary}` : 'none',
                color: activeTab === 'basic' ? themeColors.brand.primary : themeColors.text.secondary
              }}
              onClick={() => setActiveTab('basic')}
            >
              Basic
            </button>
            <button
              className="px-4 py-2 transition-colors"
              style={{
                borderBottom: activeTab === 'connect' ? `2px solid ${themeColors.brand.primary}` : 'none',
                color: activeTab === 'connect' ? themeColors.brand.primary : themeColors.text.secondary
              }}
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
                className="p-4 rounded-xl flex flex-col items-center justify-center transition-all"
                style={{
                  backgroundColor: themeColors.background.tertiary,
                  color: themeColors.text.primary
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = themeColors.background.tertiary;
                }}
              >
                <ArrowDownLeft 
                  className="mb-2" 
                  style={{ color: themeColors.brand.primary }}
                />
                <span>Send Money</span>
              </button>
              <button 
                onClick={() => window.location.href = '/scan'}
                className="p-4 rounded-xl flex flex-col items-center justify-center transition-all"
                style={{
                  backgroundColor: themeColors.background.tertiary,
                  color: themeColors.text.primary
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = themeColors.background.tertiary;
                }}
              >
                <QrCode 
                  className="mb-2" 
                  style={{ color: themeColors.brand.secondary }}
                />
                <span>Scan to Pay</span>
              </button>
              <button 
                onClick={() => window.location.href = '/deposit'}
                className="p-4 rounded-xl flex flex-col items-center justify-center transition-all mt-3"
                style={{
                  backgroundColor: themeColors.background.tertiary,
                  color: themeColors.text.primary
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = themeColors.background.tertiary;
                }}
              >
                <Download 
                  className="mb-2" 
                  style={{ color: themeColors.brand.primary }}
                />
                <span>Deposit</span>
              </button>
              <button 
                onClick={() => window.location.href = '/buy'}
                className="p-4 rounded-xl flex flex-col items-center justify-center transition-all mt-3"
                style={{
                  backgroundColor: themeColors.background.tertiary,
                  color: themeColors.text.primary
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = themeColors.background.tertiary;
                }}
              >
                <Plus 
                  className="mb-2" 
                  style={{ color: themeColors.brand.success }}
                />
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
