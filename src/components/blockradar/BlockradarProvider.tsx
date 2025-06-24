'use client';

import { useEffect } from 'react';
import { useBlockradarStore } from '@/store/useBlockradarStore';
import { getWalletConfig } from '@/lib/blockradar/config';

interface BlockradarProviderProps {
  children: React.ReactNode;
  // Optional custom wallet config, but we'll use the Base-only config by default
  walletConfig?: Record<string, string>;
}

/**
 * BlockradarProvider initializes the Blockradar connection
 * and provides wallet access throughout the application
 * 
 * Currently configured for Base blockchain only during the trial period.
 * 
 * Example usage in layout.tsx:
 * ```tsx
 * import { BlockradarProvider } from '@/components/blockradar/BlockradarProvider';
 * 
 * export default function RootLayout({ children }: { children: React.ReactNode }) {
 *   return (
 *     <BlockradarProvider>
 *       {children}
 *     </BlockradarProvider>
 *   );
 * }
 * ```
 */
export function BlockradarProvider({ children, walletConfig }: BlockradarProviderProps) {
  const { initialize, initialized } = useBlockradarStore();

  useEffect(() => {
    // Only initialize if not already done
    if (!initialized) {
      // Use the provided wallet config or the default Base-only config
      const config = walletConfig || getWalletConfig();
      
      if (Object.keys(config).length > 0) {
        initialize(config);
      } else {
        console.warn('No wallet configuration available. Please check your environment variables.');
      }
    }
  }, [initialize, initialized, walletConfig]);

  return <>{children}</>;
}
