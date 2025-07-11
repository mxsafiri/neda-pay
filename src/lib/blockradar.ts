import axios from 'axios';

const BLOCKRADAR_API_URL = process.env.NEXT_PUBLIC_BLOCKRADAR_API_URL || 'https://api.blockradar.co/v1';
const BLOCKRADAR_API_KEY = process.env.BLOCKRADAR_API_KEY;

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
  
  // Helper methods for common operations
  createUserWallet: async (userId: string, userName: string) => {
    try {
      // First, check if we have a master wallet, if not create one
      const masterWalletId = localStorage.getItem('master_wallet_id');
      
      let walletId: string;
      if (!masterWalletId) {
        // Create a master wallet for the application
        const masterWallet = await createMasterWallet(
          'polygon', // Default to Polygon for stablecoins
          ['usdc', 'usdt'], // Support major stablecoins
          `${window.location.origin}/api/webhooks/blockradar` // Webhook for transaction notifications
        );
        walletId = masterWallet.id;
        localStorage.setItem('master_wallet_id', walletId);
      } else {
        walletId = masterWalletId;
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
    const response = await axios.post(
      `${BLOCKRADAR_API_URL}/wallets`,
      {
        blockchain,
        stablecoins,
        webhookUrl
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': BLOCKRADAR_API_KEY
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating master wallet:', error);
    throw error;
  }
}

/**
 * Generates a dedicated address for a user from a master wallet
 */
export async function generateUserAddress(walletId: string, userId: string, userName: string) {
  try {
    const response = await axios.post(
      `${BLOCKRADAR_API_URL}/wallets/${walletId}/addresses`,
      {
        name: userName,
        metadata: { user_id: userId },
        showPrivateKey: true, // Only for initial creation
        enableGaslessWithdraw: true // Enable gasless transactions for better UX
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': BLOCKRADAR_API_KEY
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error generating user address:', error);
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
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': BLOCKRADAR_API_KEY
        }
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
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': BLOCKRADAR_API_KEY
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error getting address transactions:', error);
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
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': BLOCKRADAR_API_KEY
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error initiating withdrawal:', error);
    throw error;
  }
}
