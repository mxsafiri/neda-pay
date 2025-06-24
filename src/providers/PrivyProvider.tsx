'use client';

import { PrivyProvider as PrivyClientProvider } from '@privy-io/react-auth';
import { PropsWithChildren, useEffect, useState } from 'react';
import { PrivyTagline } from '@/components/auth/PrivyTagline';

export function PrivyProvider({ children }: PropsWithChildren) {
  const [error, setError] = useState<string | null>(null);
  
  // Use environment variable with fallback for development
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'cmazgx8te00q1js0n0fid94n9';
  
  // Log the App ID being used (without exposing the full value in production)
  useEffect(() => {
    console.log(`Privy initialized with App ID: ${privyAppId.substring(0, 6)}...`);
    
    // Check if the App ID is valid (basic format check)
    if (!privyAppId || privyAppId.length < 10) {
      console.error('Privy App ID appears to be invalid or missing');
      setError('Authentication configuration error');
    }
  }, [privyAppId]);
  
  // Warn in development if the environment variable is missing
  if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_PRIVY_APP_ID) {
    console.warn('NEXT_PUBLIC_PRIVY_APP_ID environment variable is not set. Using fallback value for development only.');
  }
  
  // Define a type for Privy errors
  type PrivyError = {
    message?: string;
    code?: string;
    status?: number;
    [key: string]: unknown;
  };

  // Handle authentication errors
  const handlePrivyError = (error: Error | PrivyError | unknown) => {
    console.error('Privy authentication error:', error);
    
    // Type guard for Error objects
    if (error instanceof Error) {
      setError('Authentication error: ' + error.message);
    } 
    // Type guard for PrivyError objects
    else if (typeof error === 'object' && error !== null && 'message' in error) {
      const privyError = error as PrivyError;
      setError('Authentication error: ' + (privyError.message || 'Unknown error'));
    } 
    // Fallback for unknown error types
    else {
      setError('Authentication error: Unknown error occurred');
    }
  };
  
  return (
    <>
      <PrivyTagline />
      {error ? (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50">
          <div className="bg-[#061328] p-6 rounded-xl border border-red-500/30 max-w-md w-full">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-white">Authentication Error</h3>
              <p className="text-white/70">{error}</p>
              <p className="text-white/50 text-sm">Please check your Privy App ID configuration or try again later.</p>
              <button 
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors mt-2"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      ) : (
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
          onError={handlePrivyError}
        >
          {children}
        </PrivyClientProvider>
      )}
    </>
  );
}
