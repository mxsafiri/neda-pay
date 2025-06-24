/**
 * Blockradar Configuration
 * 
 * This file contains configuration for the Blockradar wallet integration.
 * Currently configured for Base blockchain only during the trial period.
 */

// Base blockchain wallet ID from environment variables
const BASE_WALLET_ID = process.env.NEXT_PUBLIC_BASE_WALLET_ID;

// Supported blockchains configuration
export const SUPPORTED_BLOCKCHAINS = {
  base: {
    id: 'base',
    name: 'Base',
    symbol: 'ETH',
    isActive: true,
    walletId: BASE_WALLET_ID || '',
    // Add any Base-specific configuration here
  }
};

// Default blockchain for the application
export const DEFAULT_BLOCKCHAIN = 'base';

// Initialize wallet configuration
export const getWalletConfig = (): Record<string, string> => {
  const walletMap: Record<string, string> = {};
  
  // Only add Base blockchain for the trial period
  if (BASE_WALLET_ID) {
    walletMap['base'] = BASE_WALLET_ID;
  } else {
    console.warn('Base wallet ID not configured. Please add NEXT_PUBLIC_BASE_WALLET_ID to your environment variables.');
  }
  
  return walletMap;
};
