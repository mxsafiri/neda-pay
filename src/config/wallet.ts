import { Chain } from 'viem'

export const BASE_MAINNET: Chain = {
  id: 8453,
  name: 'Base',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_COINBASE_RPC || 'https://mainnet.base.org'] },
    public: { http: [process.env.NEXT_PUBLIC_COINBASE_RPC || 'https://mainnet.base.org'] },
  },
  blockExplorers: {
    default: { name: 'BaseScan', url: 'https://basescan.org' },
    etherscan: { name: 'BaseScan', url: 'https://basescan.org', apiUrl: `https://api.basescan.org/api?apikey=${process.env.NEXT_PUBLIC_BASESCAN_API_KEY}` },
  },
}

export const SUPPORTED_TOKENS = {
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Base USDC
    icon: '/icons/usdc.svg',
  },
}

export const WALLET_CONFIG = {
  appName: 'NEDApay',
  chains: [BASE_MAINNET],
  factoryAddress: process.env.NEXT_PUBLIC_FACTORY_ADDRESS,
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '',
}
