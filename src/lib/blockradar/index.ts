/**
 * Blockradar API Client
 * 
 * This module provides integration with Blockradar's wallet infrastructure services.
 */

import axios from 'axios';

const BLOCKRADAR_API_URL = 'https://api.blockradar.co/v1';
const API_KEY = process.env.NEXT_PUBLIC_BLOCKRADAR_API_KEY;

if (!API_KEY) {
  console.warn('Blockradar API key is not set. Please add it to your environment variables.');
}

interface CreateAddressOptions {
  name?: string;
  metadata?: Record<string, unknown>;
  disableAutoSweep?: boolean;
  enableGaslessWithdraw?: boolean;
  showPrivateKey?: boolean;
}

interface WithdrawOptions {
  toAddress: string;
  asset: string;
  amount: string;
  metadata?: Record<string, unknown>;
}

export const blockradarClient = {
  /**
   * Create a dedicated address for a customer
   */
  createAddress: async (walletId: string, options: CreateAddressOptions = {}) => {
    try {
      const response = await axios.post(
        `${BLOCKRADAR_API_URL}/wallets/${walletId}/addresses`,
        options,
        { headers: { 'x-api-key': API_KEY } }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating Blockradar address:', error);
      throw error;
    }
  },
  
  /**
   * Get wallet balances for a master wallet
   */
  getWalletBalances: async (walletId: string) => {
    try {
      const response = await axios.get(
        `${BLOCKRADAR_API_URL}/wallets/${walletId}/assets`,
        { headers: { 'x-api-key': API_KEY } }
      );
      return response.data;
    } catch (error) {
      console.error('Error getting wallet balances:', error);
      throw error;
    }
  },
  
  /**
   * Get transactions for a wallet or address
   */
  getTransactions: async (walletId: string, options: { address?: string; limit?: number; page?: number } = {}) => {
    try {
      const params = new URLSearchParams();
      if (options.address) params.append('address', options.address);
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.page) params.append('page', options.page.toString());
      
      const response = await axios.get(
        `${BLOCKRADAR_API_URL}/wallets/${walletId}/transactions?${params.toString()}`,
        { headers: { 'x-api-key': API_KEY } }
      );
      return response.data;
    } catch (error) {
      console.error('Error getting transactions:', error);
      throw error;
    }
  },
  
  /**
   * Initiate a withdrawal from a master wallet
   */
  withdraw: async (walletId: string, options: WithdrawOptions) => {
    try {
      const response = await axios.post(
        `${BLOCKRADAR_API_URL}/wallets/${walletId}/withdraw`,
        options,
        { headers: { 'x-api-key': API_KEY } }
      );
      return response.data;
    } catch (error) {
      console.error('Error initiating withdrawal:', error);
      throw error;
    }
  },

  /**
   * Get details for a specific address
   */
  getAddress: async (walletId: string, addressId: string) => {
    try {
      const response = await axios.get(
        `${BLOCKRADAR_API_URL}/wallets/${walletId}/addresses/${addressId}`,
        { headers: { 'x-api-key': API_KEY } }
      );
      return response.data;
    } catch (error) {
      console.error('Error getting address details:', error);
      throw error;
    }
  },

  /**
   * List all addresses for a wallet
   */
  listAddresses: async (walletId: string, options: { limit?: number; page?: number } = {}) => {
    try {
      const params = new URLSearchParams();
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.page) params.append('page', options.page.toString());
      
      const response = await axios.get(
        `${BLOCKRADAR_API_URL}/wallets/${walletId}/addresses?${params.toString()}`,
        { headers: { 'x-api-key': API_KEY } }
      );
      return response.data;
    } catch (error) {
      console.error('Error listing addresses:', error);
      throw error;
    }
  },

  /**
   * Get all master wallets
   */
  listWallets: async () => {
    try {
      const response = await axios.get(
        `${BLOCKRADAR_API_URL}/wallets`,
        { headers: { 'x-api-key': API_KEY } }
      );
      return response.data;
    } catch (error) {
      console.error('Error listing wallets:', error);
      throw error;
    }
  }
};
