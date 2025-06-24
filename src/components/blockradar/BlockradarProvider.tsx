'use client';

import { useEffect } from 'react';
import { useBlockradarStore } from '@/store/useBlockradarStore';

interface BlockradarProviderProps {
  children: React.ReactNode;
  walletConfig: Record<string, string>; // blockchain -> walletId
}

/**
 * BlockradarProvider initializes the Blockradar connection
 * and provides wallet access throughout the application
 * 
 * Example usage in layout.tsx:
 * ```tsx
 * import { BlockradarProvider } from '@/components/blockradar/BlockradarProvider';
 * 
 * export default function RootLayout({ children }: { children: React.ReactNode }) {
 *   return (
 *     <BlockradarProvider walletConfig={{
 *       'ethereum': 'your-ethereum-wallet-id',
 *       'polygon': 'your-polygon-wallet-id',
 *     }}>
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
    if (!initialized && Object.keys(walletConfig).length > 0) {
      initialize(walletConfig);
    }
  }, [initialize, initialized, walletConfig]);

  return <>{children}</>;
}
