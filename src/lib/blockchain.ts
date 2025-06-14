import { createPublicClient, http, formatUnits, parseAbi } from 'viem';
import { BASE_MAINNET } from '@/config/wallet';

// Create a public client for Base Mainnet
export const publicClient = createPublicClient({
  chain: BASE_MAINNET,
  transport: http(BASE_MAINNET.rpcUrls.default.http[0]),
});

// ERC20 ABI (minimal for balance checking)
const erc20Abi = parseAbi([
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
]);

/**
 * Get token balance for a specific address
 */
export async function getTokenBalance(tokenAddress: string, walletAddress: string, decimals: number) {
  try {
    const balance = await publicClient.readContract({
      address: tokenAddress as `0x${string}`,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [walletAddress as `0x${string}`],
    });

    return formatUnits(balance as bigint, decimals);
  } catch (error) {
    console.error(`Error fetching balance for token ${tokenAddress}:`, error);
    return '0';
  }
}

/**
 * Get native ETH balance
 */
export async function getEthBalance(walletAddress: string) {
  try {
    const balance = await publicClient.getBalance({
      address: walletAddress as `0x${string}`,
    });

    return formatUnits(balance, 18);
  } catch (error) {
    console.error('Error fetching ETH balance:', error);
    return '0';
  }
}

/**
 * Format balance with commas for display
 */
export function formatBalance(balance: string): string {
  // Convert to number, format with 2 decimal places, and add commas
  return parseFloat(balance).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Get USD value for a token amount
 * Note: In a real app, you would fetch prices from an API
 * For now, we'll use a simplified approach for USDC (1:1)
 */
export function getUsdValue(amount: string, symbol: string): string {
  if (symbol === 'USDC') {
    return amount; // 1:1 for USDC
  }
  
  // For other tokens, you would use a price feed
  // This is a placeholder
  return '0.00';
}

/**
 * Interface for transaction data from Basescan API
 */
interface BasescanTransaction {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  nonce: string;
  blockHash: string;
  transactionIndex: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
  isError: string;
  txreceipt_status: string;
  input: string;
  contractAddress: string;
  cumulativeGasUsed: string;
  gasUsed: string;
  confirmations: string;
  methodId: string;
  functionName: string;
}

/**
 * Interface for Basescan API response
 */
interface BasescanResponse {
  status: string;
  message: string;
  result: BasescanTransaction[];
}

/**
 * Determine transaction type based on transaction data
 */
function determineTransactionType(tx: BasescanTransaction, address: string): 'send' | 'receive' | 'deposit' | 'swap' {
  const normalizedAddress = address.toLowerCase();
  
  // If the transaction is from the user's address, it's a send
  if (tx.from.toLowerCase() === normalizedAddress && tx.to.toLowerCase() !== normalizedAddress) {
    return 'send';
  }
  
  // If the transaction is to the user's address, it's a receive
  if (tx.from.toLowerCase() !== normalizedAddress && tx.to.toLowerCase() === normalizedAddress) {
    return 'receive';
  }
  
  // For now, we'll consider other cases as deposits
  // In a more complete implementation, we would check for swap signatures, etc.
  return 'deposit';
}

/**
 * Format transaction amount
 */
function formatTransactionAmount(value: string): string {
  // Convert wei to ETH and format with 2 decimal places
  const ethValue = parseFloat(formatUnits(BigInt(value), 18));
  return ethValue.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/**
 * Fetch recent transactions for an address using Basescan API
 */
export async function fetchTransactions(walletAddress: string) {
  try {
    const apiKey = process.env.NEXT_PUBLIC_BASESCAN_API_KEY;
    if (!apiKey) {
      console.warn('Basescan API key not found. Using mock data.');
      return [];
    }
    
    const apiUrl = `https://api.basescan.org/api?module=account&action=txlist&address=${walletAddress}&startblock=0&endblock=99999999&sort=desc&apikey=${apiKey}`;
    
    const response = await fetch(apiUrl);
    const data = await response.json() as BasescanResponse;
    
    if (data.status !== '1') {
      console.error('Error from Basescan API:', data.message);
      return [];
    }
    
    // Convert Basescan transactions to our app's transaction format
    return data.result.slice(0, 10).map((tx) => {
      const type = determineTransactionType(tx, walletAddress);
      // Explicitly type the status to match Transaction interface
      const status: 'completed' | 'pending' | 'failed' = tx.isError === '0' ? 'completed' : 'failed';
      
      return {
        id: tx.hash,
        type,
        amount: formatTransactionAmount(tx.value),
        symbol: 'ETH', // Default to ETH, in a complete implementation we would detect the token
        timestamp: parseInt(tx.timeStamp) * 1000, // Convert to milliseconds
        status,
        to: type === 'send' ? tx.to : undefined,
        from: type === 'receive' ? tx.from : undefined,
        hash: tx.hash,
      };
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
}
