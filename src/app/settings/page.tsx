'use client';

// Prevent Next.js from prerendering this page
export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { WalletLayout } from '@/components/wallet/WalletLayout';
import { useAuth } from '@/hooks/useAuth';
import { useTheme, financeTheme } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';
import { ChevronRight, LogOut, Moon, Sun, User, Bell, Globe, FileCheck, X, Layers } from 'lucide-react';
import { KYCForm } from '@/components/settings/KYCForm';
import { KYCStatus } from '@/components/settings/KYCStatus';
import { useKycStatus } from '@/hooks/useKycStatus';
import { KycStatus as KycStatusEnum } from '@/types/kyc';
import { ProfileEditModal, ProfileData } from '@/components/settings/ProfileEditModal';



export default function SettingsPage() {
  const { authenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  // showRecoveryPhraseModal removed - using Privy authentication
  
  // Get current theme colors
  const themeColors = financeTheme[theme];
  const isDarkMode = theme === 'dark';

  const [profileData, setProfileData] = useState<ProfileData>({
    displayName: '',
    bio: '',
    walletAddress: '',
  });
  
  // Initialize default profile function
  const initializeDefaultProfile = useCallback(() => {
    if (user?.wallet) {
      setProfileData({
        displayName: `User ${user.wallet.slice(0, 6)}`,
        bio: '',
        walletAddress: user.wallet,
      });
    }
  }, [user]);

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
  
  // Initialize profile data when user data is available
  useEffect(() => {
    if (user?.wallet) {
      // Get profile data from localStorage or initialize with defaults
      const savedProfile = localStorage.getItem(`profile_${user.id}`);
      if (savedProfile) {
        try {
          setProfileData(JSON.parse(savedProfile));
        } catch (e) {
          console.error('Failed to parse saved profile', e);
          initializeDefaultProfile();
        }
      } else {
        initializeDefaultProfile();
      }
    }
  }, [user, initializeDefaultProfile]);
  
  // Function moved to useCallback above
  
  const handleSaveProfile = async (data: ProfileData) => {
    // Save profile data to localStorage
    if (user?.id) {
      localStorage.setItem(`profile_${user.id}`, JSON.stringify(data));
      setProfileData(data);
      return Promise.resolve();
    }
    return Promise.reject('User not authenticated');
  };
  
  // Theme toggle is now handled by the ThemeContext
  
  const settingsSections = [
    {
      title: 'Account',
      items: [
        {
          icon: User,
          label: 'Profile',
          action: () => setShowProfileModal(true),
          value: profileData.displayName || 'Set up profile',
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
      title: 'Security & Backup',
      items: [
        // Recovery phrase option removed - using Privy authentication
      ],
    },
    {
      title: 'Network',
      items: [
        {
          icon: Layers,
          label: 'Base',
          value: 'Active',
          status: 'success',
          action: () => {},
          description: 'Trial Network',
        },
        {
          icon: Layers,
          label: 'Ethereum',
          value: 'Coming Soon',
          status: 'pending',
          action: () => {},
          description: 'Coming Soon',
          disabled: true,
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: isDarkMode ? Sun : Moon,
          label: 'Theme',
          action: toggleTheme,
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
            className="backdrop-blur-md p-6 rounded-2xl border transition-colors duration-200"
            style={{
              backgroundColor: themeColors.background.card,
              borderColor: themeColors.border.primary
            }}
          >
            <div className="flex items-center gap-4">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${themeColors.brand.primary}30` }}
              >
                <User size={32} style={{ color: themeColors.text.primary }} />
              </div>
              <div>
                <h2 
                  className="text-xl font-bold"
                  style={{ color: themeColors.text.primary }}
                >
                  {user?.wallet ? `${user.wallet.slice(0, 6)}...${user.wallet.slice(-4)}` : 'NEDApay User'}
                </h2>
                <p 
                  className="text-sm"
                  style={{ color: themeColors.text.secondary }}
                >
                  {user?.wallet ? 
                    (typeof user.wallet === 'string' ? 
                      `${user.wallet.slice(0, 6)}...${user.wallet.slice(-4)}` : 
                      'Wallet Connected') : 
                    'Connect Wallet'}
                </p>
              </div>
            </div>
          </motion.div>
          
          <div className="space-y-6">
          {settingsSections.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sectionIndex * 0.1 }}
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
                {section.title}
              </h3>
              <div className="space-y-2">
                {section.items.map((item) => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    disabled={'disabled' in item && item.disabled === true}
                    className="w-full flex items-center justify-between p-3 rounded-xl transition-colors"
                    style={{
                      opacity: ('disabled' in item && item.disabled === true) ? 0.5 : 1,
                      cursor: ('disabled' in item && item.disabled === true) ? 'not-allowed' : 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      if (!('disabled' in item && item.disabled === true)) {
                        e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!('disabled' in item && item.disabled === true)) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon 
                        className="w-5 h-5" 
                        style={{ color: themeColors.text.secondary }}
                      />
                      <div className="flex flex-col items-start">
                        <span style={{ color: themeColors.text.primary }}>{item.label}</span>
                        {'description' in item && (
                          <span 
                            className="text-xs"
                            style={{ color: themeColors.text.tertiary }}
                          >
                            {item.description}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.value && (
                        <span 
                          className="text-sm px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: 
                              'status' in item && item.status === 'warning' ? themeColors.brand.warning + '20' :
                              'status' in item && item.status === 'pending' ? themeColors.brand.secondary + '20' :
                              'status' in item && item.status === 'success' ? themeColors.brand.success + '20' :
                              themeColors.background.tertiary,
                            color: 
                              'status' in item && item.status === 'warning' ? themeColors.brand.warning :
                              'status' in item && item.status === 'pending' ? themeColors.brand.secondary :
                              'status' in item && item.status === 'success' ? themeColors.brand.success :
                              themeColors.text.secondary
                          }}
                        >
                          {item.value}
                        </span>
                      )}
                      <ChevronRight 
                        className="w-4 h-4" 
                        style={{ color: themeColors.text.tertiary }}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          ))}
          </div>
          
          {/* Logout Button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 p-4 rounded-xl transition-colors"
            style={{
              backgroundColor: theme === 'dark' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
              color: themeColors.brand.error
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)';
            }}
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </motion.button>
          
          {/* KYC Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
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
              Identity Verification Status
            </h3>
            {user?.id ? (
              <KYCStatus 
                userId={user.id} 
                showDetails={true} 
                onUpdateClick={() => setShowKYCModal(true)} 
              />
            ) : (
              <p style={{ color: themeColors.text.secondary }}>
                Please connect your wallet to view verification status
              </p>
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
          
          {/* Profile Edit Modal */}
          {showProfileModal && (
            <ProfileEditModal
              isOpen={showProfileModal}
              onClose={() => setShowProfileModal(false)}
              onSave={handleSaveProfile}
              initialData={profileData}
            />
          )}
          
          {/* Recovery Phrase Modal removed - using Privy authentication */}
          

        </div>
      ) : (
        <div 
          className="backdrop-blur-md p-6 rounded-2xl border text-center py-12 transition-colors duration-200"
          style={{
            backgroundColor: themeColors.background.card,
            borderColor: themeColors.border.primary
          }}
        >
          <p 
            className="text-lg mb-4"
            style={{ color: themeColors.text.primary }}
          >
            Please connect your wallet to view settings
          </p>
        </div>
      )}
    </WalletLayout>
  );
}
