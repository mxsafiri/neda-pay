import axios from 'axios';

const BLOCKRADAR_API_URL = process.env.NEXT_PUBLIC_BLOCKRADAR_API_URL || 'https://api.blockradar.co/v1';
const BLOCKRADAR_API_KEY = process.env.NEXT_PUBLIC_BLOCKRADAR_API_KEY;
const BLOCKRADAR_MASTER_WALLET_ID = process.env.NEXT_PUBLIC_BLOCKRADAR_MASTER_WALLET_ID;

// Helper for consistent headers across all API calls
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'X-API-Key': BLOCKRADAR_API_KEY  // Using capital X-API-Key format
});

/**
 * BlockRadar API client for making API calls
 */
export const blockradarClient = {
  // Core wallet functions
  createMasterWallet: (blockchain: string, stablecoins: string[], webhookUrl: string) => 
    createMasterWallet(blockchain, stablecoins, webhookUrl),
  generateUserAddress: (walletId: string, userId: string, userName: string) => 
    generateUserAddress(walletId, userId, userName),
  getAddressBalance: (address: string) => getAddressBalance(address),
  getAddressTransactions: (address: string) => getAddressTransactions(address),
  
  // Additional wallet methods
  createAddress: (walletId: string, options: { name?: string; metadata?: Record<string, unknown> }) => 
    createAddress(walletId, options),
  getWalletBalances: (walletId: string) => getWalletBalances(walletId),
  getTransactions: (walletId: string, options?: { limit?: number; offset?: number }) => 
    getTransactions(walletId, options),
  withdraw: (walletId: string, options: { to: string; amount: string; token: string }) => 
    withdraw(walletId, options),
  
  // Helper methods for common operations
  createUserWallet: async (userId: string, userName: string) => {
    try {
      // Use the master wallet ID from environment variables
      let walletId: string;
      
      if (BLOCKRADAR_MASTER_WALLET_ID) {
        console.log('Using existing master wallet ID from environment variables');
        walletId = BLOCKRADAR_MASTER_WALLET_ID;
      } else {
        // Fallback to localStorage if environment variable is not set
        const masterWalletId = localStorage.getItem('master_wallet_id');
        
        if (masterWalletId) {
          console.log('Using existing master wallet ID from localStorage');
          walletId = masterWalletId;
        } else {
          console.log('No master wallet ID found, creating a new one');
          // Create a master wallet for the application
          const masterWallet = await createMasterWallet(
            'base', // Default to Base for stablecoins
            ['usdc', 'usdt'], // Support major stablecoins
            `${window.location.origin}/api/webhooks/blockradar` // Webhook for transaction notifications
          );
          walletId = masterWallet.id;
          localStorage.setItem('master_wallet_id', walletId);
        }
      }
      
      // Generate a dedicated address for this user
      const userAddress = await generateUserAddress(walletId, userId, userName);
      return userAddress;
    } catch (error) {
      console.error('Error creating user wallet:', error);
      throw error;
    }
  }
};

/**
 * Creates a master wallet on BlockRadar for a specific blockchain
 */
export async function createMasterWallet(blockchain: string, stablecoins: string[], webhookUrl: string) {
  try {
    // Log the request payload for debugging
    console.log('Creating master wallet with payload:', { blockchain, stablecoins, webhookUrl });
    
    const response = await axios.post(
      `${BLOCKRADAR_API_URL}/wallets`,
      {
        blockchain,
        stablecoins,
        webhookUrl
      },
      {
        headers: getHeaders()
      }
    );
    
    console.log('Master wallet created successfully:', response.data);
    return response.data;
  } catch (error) {
    // More detailed error logging
    if (axios.isAxiosError(error) && error.response) {
      console.error('Error creating master wallet - Status:', error.response.status);
      console.error('Error creating master wallet - Data:', error.response.data);
    } else {
      console.error('Error creating master wallet:', error);
    }
    throw error;
  }
}

/**
 * Generates a dedicated address for a user from a master wallet
 */
export async function generateUserAddress(walletId: string, userId: string, userName: string) {
  try {
    // Log the request payload for debugging
    console.log('Generating user address with payload:', { walletId, userId, userName, enableGaslessWithdraw: true });
    
    const response = await axios.post(
      `${BLOCKRADAR_API_URL}/wallets/${walletId}/addresses`,
      {
        userId,
        userName,
        enableGaslessWithdraw: true // Enable gasless transactions for better UX
      },
      {
        headers: getHeaders()
      }
    );
    
    console.log('User address generated successfully:', response.data);
    return response.data;
  } catch (error) {
    // More detailed error logging
    if (axios.isAxiosError(error) && error.response) {
      console.error('Error generating user address - Status:', error.response.status);
      console.error('Error generating user address - Data:', error.response.data);
    } else {
      console.error('Error generating user address:', error);
    }
    throw error;
  }
}

/**
 * Gets the balance of a specific address
 */
export async function getAddressBalance(address: string) {
  try {
    const response = await axios.get(
      `${BLOCKRADAR_API_URL}/addresses/${address}/balance`,
      {
        headers: getHeaders()
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error getting address balance:', error);
    throw error;
  }
}

/**
 * Gets the transaction history for a specific address
 */
export async function getAddressTransactions(address: string) {
  try {
    const response = await axios.get(
      `${BLOCKRADAR_API_URL}/addresses/${address}/transactions`,
      {
        headers: getHeaders()
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error getting address transactions:', error);
    throw error;
  }
}

/**
 * Creates a new address in a wallet
 */
export async function createAddress(walletId: string, options: { name?: string; metadata?: Record<string, unknown> }) {
  try {
    const response = await axios.post(
      `${BLOCKRADAR_API_URL}/wallets/${walletId}/addresses`,
      options,
      {
        headers: getHeaders()
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating address:', error);
    throw error;
  }
}

/**
 * Gets all balances for a wallet
 */
export async function getWalletBalances(walletId: string) {
  try {
    const response = await axios.get(
      `${BLOCKRADAR_API_URL}/wallets/${walletId}/balances`,
      {
        headers: getHeaders()
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error getting wallet balances:', error);
    throw error;
  }
}

/**
 * Gets all transactions for a wallet
 */
export async function getTransactions(walletId: string, options?: { limit?: number; offset?: number }) {
  try {
    const queryParams = new URLSearchParams();
    if (options?.limit) queryParams.append('limit', options.limit.toString());
    if (options?.offset) queryParams.append('offset', options.offset.toString());
    
    const url = `${BLOCKRADAR_API_URL}/wallets/${walletId}/transactions${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    
    const response = await axios.get(url, {
      headers: getHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error getting wallet transactions:', error);
    throw error;
  }
}

/**
 * Initiates a withdrawal from a wallet
 */
export async function withdraw(walletId: string, options: { to: string; amount: string; token: string }) {
  try {
    const response = await axios.post(
      `${BLOCKRADAR_API_URL}/wallets/${walletId}/withdraw`,
      options,
      {
        headers: getHeaders()
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error initiating withdrawal:', error);
    throw error;
  }
}

/**
 * Initiates a withdrawal from an address
 */
export async function initiateWithdrawal(
  fromAddress: string,
  toAddress: string,
  amount: string,
  asset: string
) {
  try {
    const response = await axios.post(
      `${BLOCKRADAR_API_URL}/withdrawals`,
      {
        fromAddress,
        toAddress,
        amount,
        asset
      },
      {
        headers: getHeaders()
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error initiating withdrawal:', error);
    throw error;
  }
}
