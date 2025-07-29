'use client';

import { useState } from 'react';
import { usePrivyWallet } from '@/hooks/usePrivyWallet';
import { useTheme } from '@/contexts/ThemeContext';
import { theme } from '@/styles/theme';
import { ArrowRight, Mail } from 'lucide-react';

interface SocialLoginFormProps {
  onComplete?: (address: string) => void;
  title?: string;
  subtitle?: string;
}

/**
 * Social Login Form Component
 * Replaces PinSetupForm with Privy social authentication
 * 
 * Features:
 * - Google, Apple, Email, Twitter, Discord login
 * - Embedded wallet creation
 * - NEDApay branding and theme
 * - Seamless onboarding experience
 */
export function SocialLoginForm({ 
  onComplete, 
  title = "Create Your NEDApay Wallet",
  subtitle = "Choose how you'd like to sign in. Your wallet will be created automatically."
}: SocialLoginFormProps) {
  const { createWallet, isLoading, error, authenticated, walletAddress } = usePrivyWallet();
  const { theme: currentTheme } = useTheme();
  const themeColors = {
    primary: theme.colors.primary,
    background: {
      card: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#FFFFFF',
      secondary: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.02)' : '#F9FAFB',
    },
    text: {
      primary: currentTheme === 'dark' ? '#FFFFFF' : theme.colors.text.primary,
      secondary: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : theme.colors.text.secondary,
    },
    border: {
      primary: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#E5E7EB',
    },
  };
  
  const [isCreating, setIsCreating] = useState(false);

  const handleSocialLogin = async () => {
    setIsCreating(true);
    
    try {
      const address = await createWallet();
      if (address && onComplete) {
        onComplete(address);
      }
    } catch (err) {
      console.error('Social login failed:', err);
    } finally {
      setIsCreating(false);
    }
  };

  // If already authenticated, show success state
  if (authenticated && walletAddress) {
    return (
      <div className="space-y-6 text-center">
        <div 
          className="p-6 rounded-lg border transition-colors duration-200"
          style={{
            backgroundColor: themeColors.background.card,
            borderColor: themeColors.border.primary,
          }}
        >
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h3 
            className="text-xl font-semibold mb-2"
            style={{ color: themeColors.text.primary }}
          >
            Wallet Created Successfully!
          </h3>
          
          <p 
            className="text-sm mb-4"
            style={{ color: themeColors.text.secondary }}
          >
            Your NEDApay wallet is ready to use.
          </p>
          
          <div 
            className="p-3 rounded-lg text-xs font-mono break-all"
            style={{
              backgroundColor: themeColors.background.secondary,
              color: themeColors.text.secondary,
            }}
          >
            {walletAddress}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 
          className="text-2xl font-bold"
          style={{ color: themeColors.text.primary }}
        >
          {title}
        </h2>
        <p 
          className="text-sm"
          style={{ color: themeColors.text.secondary }}
        >
          {subtitle}
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div 
          className="p-4 rounded-lg border border-red-500/20"
          style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
        >
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Social Login Button */}
      <div className="space-y-4">
        <button
          onClick={handleSocialLogin}
          disabled={isCreating || isLoading}
          className={`w-full flex items-center justify-center gap-3 py-4 px-6 rounded-lg font-medium transition-all duration-200 ${
            isCreating || isLoading
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:scale-[1.02] active:scale-[0.98]'
          }`}
          style={{
            backgroundColor: themeColors.primary,
            color: '#FFFFFF',
            boxShadow: '0 4px 20px rgba(10, 31, 68, 0.2)',
          }}
        >
          {isCreating || isLoading ? (
            <>
              <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin" />
              Creating Wallet...
            </>
          ) : (
            <>
              <Mail size={20} />
              Create Wallet with Social Login
              <ArrowRight size={18} />
            </>
          )}
        </button>

        {/* Additional Info */}
        <div 
          className="text-center text-xs space-y-2"
          style={{ color: themeColors.text.secondary }}
        >
          <p>
            Powered by Privy • Secure • No downloads required
          </p>
          <p>
            Your wallet will be created automatically after authentication
          </p>
        </div>
      </div>

      {/* Features List */}
      <div 
        className="p-4 rounded-lg border"
        style={{
          backgroundColor: themeColors.background.card,
          borderColor: themeColors.border.primary,
        }}
      >
        <h4 
          className="font-medium mb-3"
          style={{ color: themeColors.text.primary }}
        >
          What you get:
        </h4>
        <ul className="space-y-2 text-sm" style={{ color: themeColors.text.secondary }}>
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            Secure embedded wallet (no downloads needed)
          </li>
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            Social login with Google, Apple, or Email
          </li>
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            Multi-chain support (Base, Ethereum, Polygon)
          </li>
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            Investment token capabilities
          </li>
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            Gasless transactions (we cover fees)
          </li>
        </ul>
      </div>
    </div>
  );
}
