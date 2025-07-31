'use client';

// Prevent Next.js from prerendering this page
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { WalletLayout } from '@/components/wallet/WalletLayout';
import { useWalletStore } from '@/store/useWalletStore';
import { TransactionItem } from '@/components/wallet/TransactionItem';
import { motion } from 'framer-motion';
import { useTheme, financeTheme } from '@/contexts/ThemeContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { Bell, ArrowUpRight, ArrowDownLeft, Repeat, CreditCard, AlertCircle, CheckCircle, Clock } from 'lucide-react';

type FilterType = 'all' | 'notifications' | 'transactions' | 'cashout' | 'deposit';

export default function ActivityPage() {
  const { theme } = useTheme();
  const themeColors = financeTheme[theme];
  const { transactions } = useWalletStore();
  const { notifications } = useNotifications();
  const [filter, setFilter] = useState<FilterType>('all');
  
  // Combine notifications and transactions into a unified activity feed
  const combinedActivities = [
    ...notifications.map(notif => ({
      id: notif.id,
      type: 'notification' as const,
      data: notif,
      timestamp: notif.timestamp
    })),
    ...transactions.map(tx => ({
      id: tx.id,
      type: 'transaction' as const,
      data: tx,
      timestamp: new Date(tx.timestamp || Date.now())
    }))
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  
  const filteredActivities = filter === 'all' 
    ? combinedActivities
    : filter === 'notifications'
    ? combinedActivities.filter(item => item.type === 'notification')
    : filter === 'transactions'
    ? combinedActivities.filter(item => item.type === 'transaction')
    : filter === 'cashout'
    ? combinedActivities.filter(item => 
        (item.type === 'notification' && item.data.type === 'cashout') ||
        (item.type === 'transaction' && item.data.type === 'send')
      )
    : filter === 'deposit'
    ? combinedActivities.filter(item => 
        (item.type === 'notification' && item.data.type === 'deposit') ||
        (item.type === 'transaction' && item.data.type === 'deposit')
      )
    : combinedActivities;
  
  const filters: { label: string; value: FilterType; icon: React.ReactNode }[] = [
    { label: 'All', value: 'all', icon: <Bell className="w-4 h-4" /> },
    { label: 'Notifications', value: 'notifications', icon: <AlertCircle className="w-4 h-4" /> },
    { label: 'Transactions', value: 'transactions', icon: <Repeat className="w-4 h-4" /> },
    { label: 'Cash-out', value: 'cashout', icon: <ArrowUpRight className="w-4 h-4" /> },
    { label: 'Deposits', value: 'deposit', icon: <ArrowDownLeft className="w-4 h-4" /> },
  ];

  const getNotificationIcon = (notificationType: string) => {
    switch (notificationType) {
      case 'cashout': return <ArrowUpRight className="w-5 h-5 text-orange-500" />
      case 'deposit': return <ArrowDownLeft className="w-5 h-5 text-green-500" />
      case 'transaction': return <Repeat className="w-5 h-5 text-blue-500" />
      case 'system': return <CheckCircle className="w-5 h-5 text-purple-500" />
      default: return <Bell className="w-5 h-5 text-gray-500" />
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

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
                className="px-4 py-2 rounded-full text-sm transition-colors flex items-center gap-2"
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
                {filterOption.icon}
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
        {filteredActivities.length > 0 ? (
          <div className="space-y-3">
            {filteredActivities.map((activity) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl border transition-colors duration-200 hover:shadow-md"
                style={{
                  backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                  borderColor: themeColors.border.secondary
                }}
              >
                {activity.type === 'notification' ? (
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(activity.data.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 
                          className="font-medium text-sm"
                          style={{ color: themeColors.text.primary }}
                        >
                          {activity.data.title}
                        </h3>
                        <span 
                          className="text-xs"
                          style={{ color: themeColors.text.tertiary }}
                        >
                          {formatTimeAgo(activity.timestamp)}
                        </span>
                      </div>
                      <p 
                        className="text-sm leading-relaxed"
                        style={{ color: themeColors.text.secondary }}
                      >
                        {activity.data.message}
                      </p>
                      {!activity.data.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      )}
                    </div>
                  </div>
                ) : (
                  <TransactionItem transaction={activity.data} />
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mb-4">
              <Bell className="w-12 h-12 mx-auto" style={{ color: themeColors.text.tertiary }} />
            </div>
            <p 
              className="text-lg mb-2"
              style={{ color: themeColors.text.primary }}
            >
              No activity found
            </p>
            <p 
              className="text-sm"
              style={{ color: themeColors.text.secondary }}
            >
              {filter === 'all'
                ? "Your activity will appear here"
                : `No ${filter} activity yet`}
            </p>
          </div>
        )}
      </motion.div>
    </WalletLayout>
  );
}
