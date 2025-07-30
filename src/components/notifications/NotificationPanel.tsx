'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNotifications, type Notification } from '@/contexts/NotificationContext'
import { useModernTheme } from '@/contexts/ModernThemeContext'
import { 
  Bell, 
  X, 
  ArrowUpRight, 
  ArrowDownLeft, 
  DollarSign, 
  CreditCard,
  Info,
  Check,
  Trash2
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
// Using div with overflow-y-auto instead of ScrollArea for now

interface NotificationPanelProps {
  isOpen: boolean
  onClose: () => void
}

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'transaction':
      return <ArrowUpRight size={16} className="text-blue-500" />
    case 'deposit':
      return <ArrowDownLeft size={16} className="text-green-500" />
    case 'cashout':
      return <CreditCard size={16} className="text-orange-500" />
    case 'balance':
      return <DollarSign size={16} className="text-purple-500" />
    case 'system':
      return <Info size={16} className="text-blue-500" />
    default:
      return <Bell size={16} className="text-gray-500" />
  }
}

const formatTimestamp = (timestamp: Date) => {
  const now = new Date()
  const diff = now.getTime() - timestamp.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return timestamp.toLocaleDateString()
}

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const { theme } = useModernTheme()
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useNotifications()

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed top-16 right-4 z-50 w-80 max-h-96 rounded-xl shadow-2xl border"
            style={{
              backgroundColor: theme.background.card,
              borderColor: theme.border.primary
            }}
          >
            {/* Header */}
            <div 
              className="flex items-center justify-between p-4 border-b"
              style={{ borderColor: theme.border.primary }}
            >
              <div className="flex items-center space-x-2">
                <Bell size={18} style={{ color: theme.text.primary }} />
                <h3 
                  className="font-semibold"
                  style={{ color: theme.text.primary }}
                >
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </div>

              <div className="flex items-center space-x-1">
                {notifications.length > 0 && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-xs h-7 px-2"
                      style={{ color: theme.text.secondary }}
                    >
                      <Check size={12} className="mr-1" />
                      Mark all read
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearNotifications}
                      className="text-xs h-7 px-2"
                      style={{ color: theme.text.secondary }}
                    >
                      <Trash2 size={12} />
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-7 w-7 p-0"
                  style={{ color: theme.text.secondary }}
                >
                  <X size={14} />
                </Button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell size={32} className="mx-auto mb-2 opacity-30" style={{ color: theme.text.secondary }} />
                  <p 
                    className="text-sm"
                    style={{ color: theme.text.secondary }}
                  >
                    No notifications yet
                  </p>
                </div>
              ) : (
                <div className="p-2">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-3 rounded-lg mb-2 cursor-pointer transition-all duration-200 border ${
                        notification.read ? 'opacity-60' : ''
                      }`}
                      style={{
                        backgroundColor: notification.read 
                          ? theme.background.secondary 
                          : theme.background.primary,
                        borderColor: notification.read 
                          ? 'transparent' 
                          : theme.border.accent
                      }}
                      onClick={() => handleNotificationClick(notification)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 
                              className="text-sm font-medium truncate"
                              style={{ color: theme.text.primary }}
                            >
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <div 
                                className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"
                              />
                            )}
                          </div>
                          <p 
                            className="text-xs mb-1"
                            style={{ color: theme.text.secondary }}
                          >
                            {notification.message}
                          </p>
                          <p 
                            className="text-xs"
                            style={{ color: theme.text.secondary }}
                          >
                            {formatTimestamp(notification.timestamp)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
