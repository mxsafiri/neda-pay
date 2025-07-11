'use client';

import { useState } from 'react';
import { WalletLayout } from '@/components/wallet/WalletLayout';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { ChevronRight, LogOut, Moon, Sun, User, Shield, Bell, Globe, FileCheck, X } from 'lucide-react';
import { KYCForm } from '@/components/settings/KYCForm';
import { KYCStatus } from '@/components/settings/KYCStatus';
import { useKycStatus } from '@/hooks/useKycStatus';
import { KycStatus as KycStatusEnum } from '@/types/kyc';

export default function SettingsPage() {
  const { authenticated, user, logout } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showKYCModal, setShowKYCModal] = useState(false);
  
  // Use our custom hook to get KYC verification status
  const { verification, refetch } = useKycStatus(user?.id || '');
  
  const handleLogout = async () => {
    if (authenticated) {
      await logout();
    }
  };
  
  const handleKYCComplete = () => {
    // Refetch KYC status after submission
    refetch();
    // Close the modal after a delay to show the success state
    setTimeout(() => {
      setShowKYCModal(false);
    }, 3000);
  };
  
  const settingsSections = [
    {
      title: 'Account',
      items: [
        {
          icon: User,
          label: 'Profile',
          action: () => {},
        },
        {
          icon: Shield,
          label: 'Security',
          action: () => {},
        },
        {
          icon: FileCheck,
          label: 'Identity Verification',
          action: () => setShowKYCModal(true),
          value: !verification ? 'Required' : 
                 verification.status === KycStatusEnum.PENDING ? 'Pending' : 
                 verification.status === KycStatusEnum.APPROVED ? 'Verified' : 'Rejected',
          status: !verification ? 'warning' : 
                  verification.status === KycStatusEnum.PENDING ? 'pending' : 
                  verification.status === KycStatusEnum.APPROVED ? 'success' : 'warning',
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: isDarkMode ? Sun : Moon,
          label: 'Theme',
          action: () => setIsDarkMode(!isDarkMode),
          value: isDarkMode ? 'Dark' : 'Light',
        },
        {
          icon: Bell,
          label: 'Notifications',
          action: () => {},
        },
        {
          icon: Globe,
          label: 'Language',
          action: () => {},
          value: 'English',
        },
      ],
    },
  ];

  return (
    <WalletLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
      </div>
      
      {authenticated ? (
        <div className="space-y-6">
          {/* User Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary/30 rounded-full flex items-center justify-center">
                <User size={32} className="text-white/80" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{user?.wallet ? `${user.wallet.slice(0, 6)}...${user.wallet.slice(-4)}` : 'NEDApay User'}</h2>
                <p className="text-white/60 text-sm">
                  {user?.wallet ? 
                    (typeof user.wallet === 'string' ? 
                      `${user.wallet.slice(0, 6)}...${user.wallet.slice(-4)}` : 
                      'Wallet Connected') : 
                    'Connect Wallet'}
                </p>
              </div>
            </div>
          </motion.div>
          
          {/* Settings Sections */}
          {settingsSections.map((section) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10"
            >
              <h3 className="text-lg font-medium mb-4">{section.title}</h3>
              <div className="space-y-2">
                {section.items.map((item) => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5 text-white/70" />
                      <span>{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.value && (
                        <span className={`text-sm px-2 py-0.5 rounded-full ${
                          'status' in item && item.status === 'warning' ? 'bg-yellow-500/20 text-yellow-300' :
                          'status' in item && item.status === 'pending' ? 'bg-blue-500/20 text-blue-300' :
                          'status' in item && item.status === 'success' ? 'bg-green-500/20 text-green-300' :
                          'text-white/60'
                        }`}>
                          {item.value}
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-white/60" />
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          ))}
          
          {/* Logout Button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-red-400"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </motion.button>
          
          {/* KYC Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10"
          >
            <h3 className="text-lg font-medium mb-4">Identity Verification Status</h3>
            {user?.id ? (
              <KYCStatus 
                userId={user.id} 
                showDetails={true} 
                onUpdateClick={() => setShowKYCModal(true)} 
              />
            ) : (
              <p className="text-white/60">Please connect your wallet to view verification status</p>
            )}
          </motion.div>
          
          {/* KYC Modal */}
          {showKYCModal && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="w-full max-w-2xl">
                <div className="relative">
                  <button 
                    onClick={() => setShowKYCModal(false)}
                    className="absolute right-4 top-4 text-white/70 hover:text-white z-10"
                  >
                    <X className="w-6 h-6" />
                  </button>
                  <KYCForm 
                    onComplete={handleKYCComplete} 
                    userId={user?.id || 'unknown'}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 text-center py-12">
          <p className="text-lg mb-4">Please connect your wallet to view settings</p>
        </div>
      )}
    </WalletLayout>
  );
}
