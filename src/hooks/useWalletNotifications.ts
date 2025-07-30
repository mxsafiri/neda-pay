'use client'

import { useEffect, useRef } from 'react'
import { useNotifications } from '@/contexts/NotificationContext'
import { usePrivyWallet } from '@/hooks/usePrivyWallet'

/**
 * Hook to automatically create notifications for wallet events
 * Tracks balance changes, transactions, and other wallet activities
 */
export function useWalletNotifications() {
  const { addNotification } = useNotifications()
  const { authenticated, embeddedWallet } = usePrivyWallet()
  
  // Track previous values to detect changes
  const prevValues = useRef({
    authenticated: false
  })

  // Note: Balance change tracking would require polling or event listeners
  // For now, we'll provide manual notification functions for transactions

  // Track authentication status changes
  useEffect(() => {
    const prevAuth = prevValues.current.authenticated
    
    if (!prevAuth && authenticated && embeddedWallet?.address) {
      // User just connected - welcome notification is handled by NotificationProvider
      prevValues.current.authenticated = authenticated
    } else if (prevAuth && !authenticated) {
      // User disconnected
      addNotification({
        type: 'system',
        title: 'Wallet Disconnected',
        message: 'Your wallet has been disconnected',
        data: { event: 'disconnect' }
      })
      prevValues.current.authenticated = authenticated
    }
  }, [authenticated, embeddedWallet?.address, addNotification])

  return {
    // Utility function to manually add transaction notifications
    notifyTransaction: (type: 'send' | 'receive', amount: string, currency: 'ETH' | 'USDC', txHash?: string) => {
      addNotification({
        type: type === 'receive' ? 'deposit' : 'transaction',
        title: type === 'receive' ? `${currency} Received` : `${currency} Sent`,
        message: `${type === 'receive' ? '+' : ''}${amount} ${currency} ${type === 'receive' ? 'received' : 'sent'}`,
        data: { amount, currency, type, txHash }
      })
    },

    // Utility function to notify cash-out events
    notifyCashOut: (amount: string, currency: string, status: 'initiated' | 'completed' | 'failed') => {
      const statusMessages = {
        initiated: 'Cash-out order created successfully',
        completed: 'Cash-out completed successfully',
        failed: 'Cash-out failed - please try again'
      }

      addNotification({
        type: 'cashout',
        title: `Cash-out ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        message: `${amount} USDC → ${currency} - ${statusMessages[status]}`,
        data: { amount, currency, status }
      })
    }
  }
}
