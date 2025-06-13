# NEDApay - Modern Stablecoin Wallet

![NEDApay Logo](/public/logo/NEDApay%20Logo%20Symbol%20(1)-01.svg)
![4](https://github.com/user-attachments/assets/7b28d16a-6b10-4e2f-a177-37cd1cf6a157)


NEDApay is a modern fiat-to-crypto wallet focused on stablecoins on the Base blockchain. It provides a seamless experience for users to manage, swap, and transact with digital assets.

## Features

- **User Authentication**: Secure authentication using Privy with email, wallet, and passkey support
- **Wallet Management**: View balances, transaction history, and manage digital assets
- **Token Swapping**: Exchange between different tokens with real-time rates
- **Transaction History**: Track all your transactions with detailed information
- **KYC Integration**: Complete identity verification process for regulatory compliance
- **Responsive Design**: Optimized for both desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 15 with TypeScript, React Server Components
- **Styling**: Tailwind CSS with custom theme
- **Authentication**: Privy for Web3 authentication
- **State Management**: Zustand for global state
- **Form Handling**: React Hook Form with Zod validation
- **Animations**: Framer Motion for smooth transitions
- **Blockchain**: Base network (Coinbase L2 solution)

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/mxsafiri/neda-pay.git
cd neda-pay
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
```

4. Run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

```
/src
  /app            # Next.js app router pages
  /components     # Reusable UI components
    /auth         # Authentication components
    /settings     # Settings and KYC components
    /swap         # Token swap components
    /ui           # Generic UI components
    /wallet       # Wallet-related components
  /config         # Configuration files
  /hooks          # Custom React hooks
  /lib            # Utility functions
  /providers      # React context providers
  /store          # Zustand state management
  /styles         # Global styles and theme
/public           # Static assets
```

## Key Components

### Authentication

The application uses Privy for Web3 authentication, supporting email, wallet connections, and passkeys. The authentication flow is managed through the `PrivyProvider` component and `useAuth` hook.

```tsx
// Example usage of authentication
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { authenticated, login, logout } = useAuth();
  
  return (
    <div>
      {authenticated ? (
        <button onClick={logout}>Logout</button>
      ) : (
        <button onClick={login}>Login</button>
      )}
    </div>
  );
}
```

### Wallet Integration

The wallet functionality is built on top of Privy's embedded wallets, with state management handled through Zustand.

### Token Swapping

The swap interface allows users to exchange between different tokens with real-time rate calculations and fee breakdowns.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_PRIVY_APP_ID` | Privy application ID for authentication | Yes |

## Deployment

The application can be deployed to Vercel or any other hosting platform that supports Next.js applications.

```bash
npm run build
# or
yarn build
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Next.js](https://nextjs.org) - The React Framework
- [Privy](https://privy.io) - Web3 Authentication
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS framework
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [Base](https://base.org) - Ethereum L2 solution
