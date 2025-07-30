'use client'

// Prevent Next.js from prerendering this page
export const dynamic = 'force-dynamic';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { ModernLayout, ModernPageContainer, ModernCard, ModernButton } from '@/components/layout/ModernLayout';
import { PageHeader } from '@/components/layout/ModernHeader';
import { useModernTheme } from '@/contexts/ModernThemeContext';
import { ChevronRight, LogOut, User, Settings as SettingsIcon } from 'lucide-react';

export default function SettingsPage() {
  const { authenticated, user, logout } = usePrivy();
  const router = useRouter();
  const { theme, mode } = useModernTheme();

  const handleLogout = async () => {
    if (authenticated) {
      await logout();
      router.push('/sign-in');
    }
  };

  const settingsItems = [
    {
      icon: User,
      label: 'Profile',
      value: user?.email?.address || 'Not set',
      action: () => {},
    },
    {
      icon: SettingsIcon,
      label: 'Preferences',
      value: mode === 'dark' ? 'Dark Mode' : 'Light Mode',
      action: () => {},
    },
  ];

  if (!authenticated) {
    return (
      <ModernLayout showNavigation={true}>
        <PageHeader title="Settings" subtitle="Please connect your wallet" />
        <ModernPageContainer className="space-y-6">
          <ModernCard variant="elevated">
            <div className="text-center py-12">
              <p 
                className="text-lg mb-4"
                style={{ color: theme.text.primary }}
              >
                Please connect your wallet to view settings
              </p>
              <ModernButton
                onClick={() => router.push('/sign-in')}
                variant="primary"
              >
                Connect Wallet
              </ModernButton>
            </div>
          </ModernCard>
        </ModernPageContainer>
      </ModernLayout>
    );
  }

  return (
    <ModernLayout showNavigation={true}>
      <PageHeader title="Settings" subtitle="Manage your account" />
      <ModernPageContainer className="space-y-6">
        {/* User Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ModernCard variant="elevated">
            <div className="flex items-center space-x-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: theme.button.primary.bg }}
              >
                <User
                  size={24}
                  style={{ color: theme.button.primary.text }}
                />
              </div>
              <div>
                <h3
                  className="text-lg font-medium"
                  style={{ color: theme.text.primary }}
                >
                  {user?.email?.address || 'User'}
                </h3>
                <p
                  className="text-sm"
                  style={{ color: theme.text.secondary }}
                >
                  NEDApay Member
                </p>
              </div>
            </div>
          </ModernCard>
        </motion.div>

        {/* Settings Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ModernCard variant="elevated">
            <h3
              className="text-lg font-medium mb-4"
              style={{ color: theme.text.primary }}
            >
              Settings
            </h3>
            <div className="space-y-2">
              {settingsItems.map((item) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="w-full flex items-center justify-between p-3 rounded-xl transition-colors hover:bg-opacity-10"
                >
                  <div className="flex items-center gap-3">
                    <item.icon
                      className="w-5 h-5"
                      style={{ color: theme.text.secondary }}
                    />
                    <span style={{ color: theme.text.primary }}>{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-sm px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: theme.background.tertiary,
                        color: theme.text.secondary
                      }}
                    >
                      {item.value}
                    </span>
                    <ChevronRight
                      className="w-4 h-4"
                      style={{ color: theme.text.tertiary }}
                    />
                  </div>
                </button>
              ))}
            </div>
          </ModernCard>
        </motion.div>

        {/* Logout Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ModernButton
            onClick={handleLogout}
            variant="secondary"
            className="w-full flex items-center justify-center gap-2 p-4 rounded-xl transition-colors"
            style={{
              backgroundColor: mode === 'dark' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
              color: '#ef4444'
            }}
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </ModernButton>
        </motion.div>
      </ModernPageContainer>
    </ModernLayout>
  );
}
