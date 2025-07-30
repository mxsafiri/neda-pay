'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { usePrivyWallet } from '@/hooks/usePrivyWallet'

export interface Notification {
  id: string
  type: 'transaction' | 'balance' | 'cashout' | 'deposit' | 'system'
  title: string
  message: string
  timestamp: Date
  read: boolean
  data?: any
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearNotifications: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const { authenticated, embeddedWallet } = usePrivyWallet()

  const addNotification = useCallback((notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false
    }

    setNotifications(prev => [newNotification, ...prev].slice(0, 50)) // Keep only last 50 notifications
  }, [])

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    )
  }, [])

  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  // Add welcome notification when user first connects
  useEffect(() => {
    if (authenticated && embeddedWallet?.address && notifications.length === 0) {
      addNotification({
        type: 'system',
        title: 'Welcome to NEDApay!',
        message: 'Your wallet is connected and ready to use.',
        data: { address: embeddedWallet.address }
      })
    }
  }, [authenticated, embeddedWallet?.address, notifications.length, addNotification])

  const contextValue: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications
  }

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}
