'use client';

import { PrivyProvider as PrivyClientProvider } from '@privy-io/react-auth';
import { PropsWithChildren } from 'react';
import { PrivyTagline } from '@/components/auth/PrivyTagline';

export function PrivyProvider({ children }: PropsWithChildren) {
  // Use environment variable with fallback for development
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'cmazgx8te00q1js0n0fid94n9';
  
  // Warn in development if the environment variable is missing
  if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_PRIVY_APP_ID) {
    console.warn('NEXT_PUBLIC_PRIVY_APP_ID environment variable is not set. Using fallback value for development only.');
  }
  
  return (
    <>
      <PrivyTagline />
      <PrivyClientProvider
        appId={privyAppId}
        config={{
          loginMethods: ['email', 'wallet'],
          appearance: {
            theme: 'dark',
            accentColor: '#0A1F44', // NEDApay navy blue
            logo: '/logo/NEDApay Logo Symbol (1)-01.svg'
          },
          embeddedWallets: {
            createOnLogin: 'users-without-wallets'
            // Removed noPromptOnSignature as it's not supported in the current Privy SDK version
          }
          // Note: Custom styling for modal and buttons is now handled via CSS in the PrivyTagline component
        }}
    >
      {children}
    </PrivyClientProvider>
    </>
  );
}
