'use client'

import { BASE_TOKENS } from './blockchain'

// Environment variables
const BICONOMY_BUNDLER_URL = process.env.NEXT_PUBLIC_BICONOMY_BUNDLER_URL || process.env.BICONOMY_BUNDLER_URL
const BICONOMY_PAYMASTER_URL = process.env.NEXT_PUBLIC_BICONOMY_PAYMASTER_URL || process.env.BICONOMY_PAYMASTER_URL

/**
 * Send gasless USDC transfer using Biconomy (simplified approach)
 * For now, this falls back to regular transaction until Biconomy is fully configured
 */
export async function sendGaslessUSDC(
  to: string,
  amount: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  embeddedWallet: any
): Promise<string> {
  try {
    console.log('Initiating USDC transfer:', {
      to,
      amount,
      contract: BASE_TOKENS.USDC,
      walletAddress: embeddedWallet?.address
    })

    // For now, use the existing sendToken function from blockchain utils
    // This bypasses Biconomy and uses direct wallet client approach
    const { sendToken } = await import('./blockchain')
    
    console.log('Sending USDC transaction:', {
      tokenAddress: BASE_TOKENS.USDC,
      to,
      amount, // Raw amount string - sendToken will handle USDC decimal conversion
      walletClient: embeddedWallet
    })

    // Send USDC using existing blockchain utilities
    // sendToken handles USDC 6-decimal conversion internally
    const txHash = await sendToken(
      BASE_TOKENS.USDC,
      to as `0x${string}`,
      amount, // Pass raw amount - sendToken will convert to 6 decimals
      embeddedWallet
    )

    if (!txHash) {
      throw new Error('Transaction failed - no transaction hash returned')
    }

    console.log('USDC transfer successful! Transaction hash:', txHash)
    return txHash

  } catch (error) {
    console.error('USDC transfer failed:', error)
    throw error
  }
}



/**
 * Check if Biconomy is properly configured
 */
export function isBiconomyConfigured(): boolean {
  return !!(BICONOMY_BUNDLER_URL && BICONOMY_PAYMASTER_URL)
}

/**
 * Get Biconomy configuration status
 */
export function getBiconomyConfig() {
  return {
    bundlerUrl: BICONOMY_BUNDLER_URL,
    paymasterUrl: BICONOMY_PAYMASTER_URL,
    configured: isBiconomyConfigured(),
    chainId: 8453,
    entryPoint: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789'
  }
}
