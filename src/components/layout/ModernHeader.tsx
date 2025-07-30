'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Sun, Moon, Bell, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useModernTheme } from '@/contexts/ModernThemeContext'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

interface ModernHeaderProps {
  title?: string
  subtitle?: string
  showBack?: boolean
  showProfile?: boolean
  showNotifications?: boolean
  showThemeToggle?: boolean
  actions?: React.ReactNode
}

export function ModernHeader({
  title,
  subtitle,
  showBack = false,
  showProfile = true,
  showNotifications = true,
  showThemeToggle = true,
  actions
}: ModernHeaderProps) {
  const router = useRouter()
  const { theme, mode, toggleMode } = useModernTheme()

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="sticky top-0 z-50 backdrop-blur-xl border-b"
      style={{
        backgroundColor: theme.background.card,
        borderColor: theme.border.primary
      }}
    >
      <div className="flex items-center justify-between px-6 py-4 max-w-md mx-auto">
        {/* Left Section */}
        <div className="flex items-center space-x-3">
          {showBack && (
            <motion.button
              onClick={() => router.back()}
              className="p-2 rounded-lg transition-all duration-200"
              style={{ color: theme.text.primary }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft size={20} />
            </motion.button>
          )}

          {(title || subtitle) && (
            <div>
              {title && (
                <h1 
                  className="text-lg font-semibold"
                  style={{ color: theme.text.primary }}
                >
                  {title}
                </h1>
              )}
              {subtitle && (
                <p 
                  className="text-sm"
                  style={{ color: theme.text.secondary }}
                >
                  {subtitle}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2">
          {/* Custom Actions */}
          {actions}

          {/* Theme Toggle */}
          {showThemeToggle && (
            <motion.button
              onClick={toggleMode}
              className="p-2 rounded-lg transition-all duration-200"
              style={{ color: theme.text.secondary }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {mode === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </motion.button>
          )}

          {/* Notifications */}
          {showNotifications && (
            <motion.button
              className="relative p-2 rounded-lg transition-all duration-200"
              style={{ color: theme.text.secondary }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Bell size={18} />
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 w-5 h-5 text-xs p-0 flex items-center justify-center"
              >
                3
              </Badge>
            </motion.button>
          )}

          {/* Profile */}
          {showProfile && (
            <motion.button
              onClick={() => router.push('/settings')}
              className="p-1 rounded-lg transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Avatar className="w-8 h-8">
                <AvatarImage src="/api/placeholder/32/32" alt="Profile" />
                <AvatarFallback 
                  className="text-xs font-medium"
                  style={{ 
                    backgroundColor: theme.button.primary.bg,
                    color: theme.button.primary.text 
                  }}
                >
                  <User size={16} />
                </AvatarFallback>
              </Avatar>
            </motion.button>
          )}
        </div>
      </div>
    </motion.header>
  )
}

// Specialized headers for different page types
export function WalletHeader() {
  return (
    <ModernHeader 
      title="NEDApay"
      subtitle="Your Digital Wallet"
      showBack={false}
    />
  )
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <ModernHeader 
      title={title}
      subtitle={subtitle}
      showBack={true}
      showProfile={false}
      showNotifications={false}
    />
  )
}
