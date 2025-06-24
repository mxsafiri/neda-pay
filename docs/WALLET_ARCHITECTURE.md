# NEDA-pay Wallet Architecture

This document outlines the architecture of the NEDA-pay wallet system, specifically how authentication (Privy) and blockchain infrastructure (Blockradar) work together.

## Core Architecture Components

NEDA-pay uses a hybrid architecture that separates user authentication from blockchain transaction management:

1. **Authentication Layer (Privy)**
   - Handles user identity and authentication
   - Manages wallet connections (MetaMask, Coinbase, etc.)
   - Maintains the user's authenticated state

2. **Blockchain Infrastructure Layer (Blockradar)**
   - Manages dedicated deposit addresses
   - Handles multi-chain transactions
   - Provides auto-sweeping and gasless transaction features
   - Securely stores funds in master wallets

3. **Application Layer (Next.js)**
   - Connects the authentication and blockchain layers
   - Manages the user interface
   - Handles business logic

## How It Works

### Authentication Flow

1. User visits NEDA-pay and clicks "Login"
2. Privy authentication modal appears
3. User connects their preferred wallet (MetaMask, Coinbase, etc.)
4. Privy validates the wallet signature
5. User is authenticated and their wallet address is associated with their account

### Wallet Creation Flow

1. Upon first authentication, NEDA-pay checks if the user has deposit addresses
2. If not, it uses Blockradar API to create dedicated deposit addresses for the user
3. These addresses are linked to the user's account (identified by their authenticated wallet)
4. Addresses are created for each supported blockchain (Ethereum, Base, etc.)

### Deposit Flow

1. User selects "Deposit" in the wallet interface
2. User chooses a blockchain network
3. System displays their dedicated deposit address for that network
4. User sends funds from an external wallet to this address
5. Blockradar detects the deposit and sends a webhook notification
6. Funds appear in the user's NEDA-pay balance
7. If auto-sweeping is enabled, funds are moved to a secure master wallet

### Withdrawal Flow

1. User initiates a withdrawal (send)
2. User specifies:
   - Blockchain network
   - Recipient address
   - Amount and token
3. NEDA-pay validates the transaction details
4. System sends withdrawal request to Blockradar API
5. Blockradar executes the transaction from its master wallet
6. If gasless transactions are enabled, Blockradar covers the gas fees
7. Transaction hash is returned and displayed to the user

## Key Benefits of This Architecture

- **Wallet Agnostic**: Works with any wallet supported by Privy (MetaMask, Coinbase, Rainbow, etc.)
- **Consistent UX**: User experience is the same regardless of which wallet is used for authentication
- **Multi-Chain Support**: Single interface for managing assets across multiple blockchains
- **Reduced Friction**: No need to sign every transaction with the user's wallet
- **Enhanced Security**: Funds are stored in secure master wallets rather than user's connected wallet
- **Cost Efficiency**: Gasless transactions and batched processing reduce fees

## Integration Points

### Privy Integration

Privy is initialized at the application root level:

```tsx
// src/app/layout.tsx
<PrivyProvider>
  <BlockradarProvider>
    {children}
  </BlockradarProvider>
</PrivyProvider>
```

### Blockradar Integration

Blockradar is configured with master wallet IDs for each blockchain:

```tsx
// src/app/layout.tsx
<BlockradarProvider walletConfig={{
  'ethereum': process.env.NEXT_PUBLIC_BLOCKRADAR_ETHEREUM_WALLET_ID,
  'polygon': process.env.NEXT_PUBLIC_BLOCKRADAR_POLYGON_WALLET_ID,
  'base': process.env.NEXT_PUBLIC_BLOCKRADAR_BASE_WALLET_ID,
  'arbitrum': process.env.NEXT_PUBLIC_BLOCKRADAR_ARBITRUM_WALLET_ID
}}>
  {children}
</BlockradarProvider>
```

### Accessing Services in Components

Components can access both services via hooks:

```tsx
// Authentication
const { authenticated, user } = usePrivy();

// Blockchain operations
const { 
  balances, 
  withdraw, 
  fetchBalances, 
  selectedBlockchain,
  setSelectedBlockchain
} = useBlockradar();
```

## Webhook Processing

Blockradar sends webhook notifications for blockchain events, which are processed by our API route:

```
/api/blockradar/webhook
```

This endpoint handles:
- Deposit confirmations
- Withdrawal status updates
- Address creation events
- Error notifications

Webhook signature verification ensures all incoming webhooks are authentic.

## Future Expansion

The architecture is designed to be extensible:

1. **KYC Integration**: A KYC provider can be added alongside Privy for regulatory compliance.
2. **Additional Blockchains**: New blockchains can be added by updating the Blockradar configuration.
3. **Custom Features**: The separation of concerns allows for custom features at each layer.

## Technical Requirements

- Blockradar API key and webhook secret
- Master wallet IDs for each supported blockchain
- Privy app ID
- Environment variables properly configured

## Common Issues and Troubleshooting

- **Authentication Issues**: Check Privy configuration and console logs
- **Missing Balances**: Verify webhook setup and Blockradar API keys
- **Failed Transactions**: Check blockchain network status and gas prices

## Contributing Guidelines

When extending or modifying the wallet functionality:

1. Maintain the separation of concerns between authentication and blockchain operations
2. Use the provided hooks instead of directly accessing the APIs
3. Always validate user input before sending to blockchain
4. Handle loading and error states for all blockchain operations
5. Test across multiple wallets to ensure wallet-agnostic behavior
