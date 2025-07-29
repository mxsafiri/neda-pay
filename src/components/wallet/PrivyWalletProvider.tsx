'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { base, baseSepolia } from 'viem/chains';

interface PrivyWalletProviderProps {
  children: React.ReactNode;
}

// Configure supported chains for Privy
const supportedChains = [base, baseSepolia];

/**
 * PrivyWalletProvider replaces BlockradarProvider
 * Provides embedded wallet functionality with social login
 * 
 * Features:
 * - Social login (Google, Apple, Email, Twitter, Discord)
 * - Embedded wallets (no external wallet required)
 * - Multi-chain support (Base, Ethereum, Polygon, etc.)
 * - Account abstraction with gasless transactions
 * - Custom token deployment capabilities
 * 
 * Example usage in layout.tsx:
 * ```tsx
 * import { PrivyWalletProvider } from '@/components/wallet/PrivyWalletProvider';
 * 
 * export default function RootLayout({ children }: { children: React.ReactNode }) {
 *   return (
 *     <PrivyWalletProvider>
 *       {children}
 *     </PrivyWalletProvider>
 *   );
 * }
 * ```
 */
export function PrivyWalletProvider({ children }: PrivyWalletProviderProps) {
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  
  // Debug logging (remove in production)
  console.log('Privy App ID:', privyAppId ? 'Set' : 'Not set');
  
  // If no app ID is set, render children without Privy (for build/development)
  if (!privyAppId || privyAppId === 'undefined') {
    console.warn('Privy App ID not configured. Wallet functionality will be limited.');
    return <>{children}</>;
  }
  
  return (
    <PrivyProvider
      appId={privyAppId}
      config={{
        // Login methods for social authentication
        loginMethods: ['google', 'apple', 'email', 'twitter', 'discord'],
        
        // Appearance configuration
        appearance: {
          theme: 'dark', // Matches NEDApay's dark theme
          accentColor: '#0A1F44', // NEDApay brand color
          logo: '/logo.png', // NEDApay logo
        },
        
        // Embedded wallet configuration
        embeddedWallets: {
          createOnLogin: 'users-without-wallets', // Auto-create wallet for new users
        },
        
        // Legal and compliance
        legal: {
          termsAndConditionsUrl: '/terms',
          privacyPolicyUrl: '/privacy',
        },
        
        // Supported chains
        supportedChains,
      }}
    >
      {children}
    </PrivyProvider>
  );
}
