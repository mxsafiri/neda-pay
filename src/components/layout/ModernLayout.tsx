'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useModernTheme } from '@/contexts/ModernThemeContext'
import { ModernNavigation } from '@/components/layout/ModernNavigation'
import { ModernHeader } from '@/components/layout/ModernHeader'

interface ModernLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  showNavigation?: boolean
  showHeader?: boolean
  className?: string
}

export function ModernLayout({
  children,
  title,
  subtitle,
  showNavigation = true,
  showHeader = true,
  className = ''
}: ModernLayoutProps) {
  const { theme } = useModernTheme()

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      {showHeader && (
        <ModernHeader title={title} subtitle={subtitle} />
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className={`flex-1 ${className}`}
          style={{ backgroundColor: theme.background.primary }}
        >
          {children}
        </motion.div>
      </main>

      {/* Bottom Navigation */}
      {showNavigation && <ModernNavigation />}
    </div>
  )
}

// Page container with consistent padding and max-width
export function ModernPageContainer({ 
  children, 
  className = '',
  maxWidth = 'max-w-md'
}: { 
  children: React.ReactNode
  className?: string
  maxWidth?: string
}) {
  return (
    <div className={`mx-auto w-full ${maxWidth} px-6 py-6 ${className}`}>
      {children}
    </div>
  )
}

// Modern card component with consistent styling
export function ModernCard({
  children,
  variant = 'default',
  className = '',
  ...props
}: {
  children: React.ReactNode
  variant?: 'default' | 'elevated' | 'flat'
  className?: string
  [key: string]: unknown
}) {
  const { theme, variants } = useModernTheme()
  
  const baseClasses = variants.card[variant]
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className={`rounded-xl p-6 ${baseClasses} ${className}`}
      style={{
        backgroundColor: theme.background.card,
        borderColor: theme.border.primary
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Modern button component
export function ModernButton({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  [key: string]: unknown
}) {
  const { theme, variants } = useModernTheme()
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  }
  
  const variantStyles = {
    primary: {
      backgroundColor: theme.button.primary.bg,
      color: theme.button.primary.text
    },
    secondary: {
      backgroundColor: theme.button.secondary.bg,
      color: theme.button.secondary.text
    },
    ghost: {
      backgroundColor: 'transparent',
      color: theme.text.primary
    }
  }
  
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`${variants.button[variant]} ${sizeClasses[size]} ${className}`}
      style={variantStyles[variant]}
      {...props}
    >
      {children}
    </motion.button>
  )
}
