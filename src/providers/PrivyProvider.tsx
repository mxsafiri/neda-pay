'use client';

import { PrivyProvider as PrivyClientProvider } from '@privy-io/react-auth';
import { PropsWithChildren } from 'react';

export function PrivyProvider({ children }: PropsWithChildren) {
  // Use environment variable with fallback for development
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'cmazgx8te00q1js0n0fid94n9';
  
  // Warn in development if the environment variable is missing
  if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_PRIVY_APP_ID) {
    console.warn('NEXT_PUBLIC_PRIVY_APP_ID environment variable is not set. Using fallback value for development only.');
  }
  
  return (
    <PrivyClientProvider
      appId={privyAppId}
      config={{
        loginMethods: ['email', 'wallet'],
        appearance: {
          theme: 'dark',
          accentColor: '#0A1F44', // NEDApay navy blue
          logo: '/logo/NEDApay Logo Symbol (1)-01.svg',
          logoHref: '/',
          appName: 'NEDApay',
          // Custom styling for better visibility of UI elements
          modal: {
            borderRadius: '16px',
            overlayBackgroundColor: 'rgba(0, 0, 0, 0.8)',
          },
          // Improve visibility of buttons, especially "I have a passkey"
          buttons: {
            // Primary button styling (login/signup buttons)
            primary: {
              backgroundColor: '#0A1F44',
              borderRadius: '12px',
              color: 'white',
            },
            // Secondary button styling ("I have a passkey" button)
            secondary: {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              borderWidth: '1px',
              borderRadius: '12px',
              color: 'white',
              fontWeight: '500',
            },
          },
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
          // Removed noPromptOnSignature as it's not supported in the current Privy SDK version
        },
      }}
    >
      {children}
    </PrivyClientProvider>
  );
}
