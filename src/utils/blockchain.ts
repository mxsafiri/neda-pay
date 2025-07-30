/**
 * Blockchain Utilities for NEDApay
 * 
 * Provides comprehensive blockchain interaction capabilities using:
 * - Coinbase RPC for Base chain connectivity
 * - Factory contract for token deployment
 * - BaseScan API for transaction monitoring
 * - Privy embedded wallets for user operations
 */

import { createPublicClient, http, parseEther, formatEther } from 'viem';
import { base, baseSepolia } from 'viem/chains';

// Environment configuration
export const WEB3_CONFIG = {
  FACTORY_ADDRESS: process.env.NEXT_PUBLIC_FACTORY_ADDRESS as `0x${string}`,
  COINBASE_RPC: process.env.NEXT_PUBLIC_COINBASE_RPC!,
  BASESCAN_API_KEY: process.env.NEXT_PUBLIC_BASESCAN_API_KEY!,
  BASE_CHAIN: base,
  BASE_SEPOLIA: baseSepolia,
} as const;

// Configure Base chain with Coinbase RPC
export const baseChain = {
  ...base,
  rpcUrls: {
    default: {
      http: [WEB3_CONFIG.COINBASE_RPC],
    },
  },
};

// Public client for reading blockchain data (initialized conditionally)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _publicClient: any = null;

export const getPublicClient = () => {
  if (!_publicClient && typeof window !== 'undefined' && WEB3_CONFIG.COINBASE_RPC) {
    _publicClient = createPublicClient({
      chain: baseChain,
      transport: http(WEB3_CONFIG.COINBASE_RPC),
    });
  }
  return _publicClient;
};

/**
 * Token deployment interface for investment tokens
 */
export interface TokenDeploymentParams {
  name: string;
  symbol: string;
  totalSupply: bigint;
  decimals?: number;
  owner?: `0x${string}`;
}

/**
 * Transaction monitoring interface
 */
export interface TransactionStatus {
  hash: `0x${string}`;
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber?: bigint;
  gasUsed?: bigint;
  timestamp?: number;
}

/**
 * Balance information for tokens
 */
export interface TokenBalance {
  address: `0x${string}`;
  symbol: string;
  name: string;
  balance: string;
  decimals: number;
  usdValue?: number;
}

/**
 * Get ETH balance for an address
 */
export async function getETHBalance(address: `0x${string}`): Promise<string> {
  try {
    const client = getPublicClient();
    if (!client) {
      console.warn('Public client not available');
      return '0';
    }
    const balance = await client.getBalance({ address });
    return formatEther(balance);
  } catch (error) {
    console.error('Error fetching ETH balance:', error);
    return '0';
  }
}

/**
 * Get ERC-20 token balance
 */
export async function getTokenBalance(
  tokenAddress: `0x${string}`,
  walletAddress: `0x${string}`
): Promise<string> {
  try {
    const client = getPublicClient();
    if (!client) {
      console.warn('Public client not available');
      return '0';
    }

    const tokenABI = [
      {
        name: 'balanceOf',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'account', type: 'address' }],
        outputs: [{ name: '', type: 'uint256' }],
      },
    ] as const;

    const balance = await client.readContract({
      address: tokenAddress,
      abi: tokenABI,
      functionName: 'balanceOf',
      args: [walletAddress],
    });

    return formatEther(balance as bigint);
  } catch (error) {
    console.error('Error fetching token balance:', error);
    return '0';
  }
}

/**
 * Get transaction status using BaseScan API
 */
export async function getTransactionStatus(txHash: `0x${string}`): Promise<TransactionStatus> {
  try {
    const response = await fetch(
      `https://api.basescan.org/api?module=transaction&action=gettxreceiptstatus&txhash=${txHash}&apikey=${WEB3_CONFIG.BASESCAN_API_KEY}`
    );
    
    const data = await response.json();
    
    if (data.status === '1' && data.result) {
      return {
        hash: txHash,
        status: data.result.status === '1' ? 'confirmed' : 'failed',
      };
    }
    
    return {
      hash: txHash,
      status: 'pending',
    };
  } catch (error) {
    console.error('Error fetching transaction status:', error);
    return {
      hash: txHash,
      status: 'pending',
    };
  }
}

/**
 * Deploy a new ERC-20 token using the factory contract
 */
export async function deployToken(
  params: TokenDeploymentParams,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  walletClient: any
): Promise<`0x${string}` | null> {
  try {
    if (!WEB3_CONFIG.FACTORY_ADDRESS) {
      throw new Error('Factory address not configured');
    }

    // Factory contract ABI for token deployment
    const factoryABI = [
      {
        name: 'deployToken',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
          { name: 'name', type: 'string' },
          { name: 'symbol', type: 'string' },
          { name: 'totalSupply', type: 'uint256' },
          { name: 'decimals', type: 'uint8' },
        ],
        outputs: [{ name: 'tokenAddress', type: 'address' }],
      },
    ] as const;

    // Use writeContract directly with walletClient
    const txHash = await walletClient.writeContract({
      address: WEB3_CONFIG.FACTORY_ADDRESS,
      abi: factoryABI,
      functionName: 'deployToken',
      args: [
        params.name,
        params.symbol,
        params.totalSupply,
        params.decimals || 18,
      ],
    });

    console.log('Token deployment transaction:', txHash);
    return txHash;
  } catch (error) {
    console.error('Error deploying token:', error);
    return null;
  }
}

/**
 * Send ETH transaction
 */
export async function sendETH(
  to: `0x${string}`,
  amount: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  walletClient: any
): Promise<`0x${string}` | null> {
  try {
    const txHash = await walletClient.sendTransaction({
      to,
      value: parseEther(amount),
    });

    console.log('ETH transaction sent:', txHash);
    return txHash;
  } catch (error) {
    console.error('Error sending ETH:', error);
    return null;
  }
}

/**
 * Send ERC-20 token transaction
 */
export async function sendToken(
  tokenAddress: `0x${string}`,
  to: `0x${string}`,
  amount: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  walletClient: any
): Promise<`0x${string}` | null> {
  try {
    const tokenABI = [
      {
        name: 'transfer',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
          { name: 'to', type: 'address' },
          { name: 'amount', type: 'uint256' },
        ],
        outputs: [{ name: '', type: 'bool' }],
      },
    ] as const;

    // Use writeContract directly with walletClient
    const txHash = await walletClient.writeContract({
      address: tokenAddress,
      abi: tokenABI,
      functionName: 'transfer',
      args: [to, parseEther(amount)],
    });

    console.log('Token transaction sent:', txHash);
    return txHash;
  } catch (error) {
    console.error('Error sending token:', error);
    return null;
  }
}

/**
 * Get gas price estimation
 */
export async function getGasPrice(): Promise<bigint> {
  try {
    const client = getPublicClient();
    if (!client) {
      console.warn('Public client not available');
      return BigInt(0);
    }
    return await client.getGasPrice();
  } catch (error) {
    console.error('Error fetching gas price:', error);
    return BigInt(0);
  }
}

/**
 * Estimate gas for a transaction
 */
export async function estimateGas(
  to: `0x${string}`,
  data?: `0x${string}`,
  value?: bigint
): Promise<bigint> {
  try {
    const client = getPublicClient();
    if (!client) {
      console.warn('Public client not available');
      return BigInt(21000);
    }
    return await client.estimateGas({
      to,
      data,
      value,
    });
  } catch (error) {
    console.error('Error estimating gas:', error);
    return BigInt(21000); // Default gas limit for simple transfers
  }
}

/**
 * Common token addresses on Base
 */
export const BASE_TOKENS = {
  USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as `0x${string}`,
  WETH: '0x4200000000000000000000000000000000000006' as `0x${string}`,
  DAI: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb' as `0x${string}`,
} as const;

/**
 * Network configuration helper
 */
export function getNetworkConfig() {
  return {
    chainId: baseChain.id,
    chainName: baseChain.name,
    rpcUrl: WEB3_CONFIG.COINBASE_RPC,
    blockExplorer: baseChain.blockExplorers.default.url,
    nativeCurrency: baseChain.nativeCurrency,
  };
}

/**
 * Validate Ethereum address
 */
export function isValidAddress(address: string): address is `0x${string}` {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Format token amount for display
 */
export function formatTokenAmount(amount: string): string {
  const num = parseFloat(amount);
  if (num === 0) return '0';
  if (num < 0.001) return '<0.001';
  if (num < 1) return num.toFixed(6);
  if (num < 1000) return num.toFixed(4);
  if (num < 1000000) return `${(num / 1000).toFixed(2)}K`;
  return `${(num / 1000000).toFixed(2)}M`;
}

/**
 * Get block explorer URL for transaction
 */
export function getTransactionUrl(txHash: `0x${string}`): string {
  return `${baseChain.blockExplorers.default.url}/tx/${txHash}`;
}

/**
 * Get block explorer URL for address
 */
export function getAddressUrl(address: `0x${string}`): string {
  return `${baseChain.blockExplorers.default.url}/address/${address}`;
}
