'use client'

import React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Home, 
  ArrowUpDown, 
  TrendingUp
} from 'lucide-react'
import { useModernTheme } from '@/contexts/ModernThemeContext'

interface NavItem {
  icon: React.ComponentType<{ size?: number; className?: string }>
  label: string
  href: string
  badge?: number
}

const navItems: NavItem[] = [
  { icon: Home, label: 'Wallet', href: '/wallet' },
  { icon: ArrowUpDown, label: 'Activity', href: '/activity' },
  { icon: TrendingUp, label: 'Invest', href: '/invest' }
]

export function ModernNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, colors } = useModernTheme()

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="sticky bottom-0 z-50 backdrop-blur-xl border-t"
      style={{
        backgroundColor: theme.background.card,
        borderColor: theme.border.primary
      }}
    >
      <div className="flex items-center justify-around px-2 py-2 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <motion.button
              key={item.href}
              onClick={() => router.push(item.href)}
              className="relative flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 min-w-[60px]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                backgroundColor: isActive ? theme.button.primary.bg : 'transparent',
                color: isActive ? theme.button.primary.text : theme.text.secondary
              }}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-xl"
                  style={{ backgroundColor: theme.button.primary.bg }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}

              {/* Icon */}
              <div className="relative z-10 mb-1">
                <Icon 
                  size={20} 
                  className={`transition-all duration-200 ${
                    isActive ? 'scale-110' : 'scale-100'
                  }`}
                />
                
                {/* Badge */}
                {item.badge && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      backgroundColor: colors.accent.error[500],
                      color: theme.text.inverse
                    }}
                  >
                    {item.badge}
                  </motion.div>
                )}
              </div>

              {/* Label */}
              <span 
                className={`relative z-10 text-xs font-medium transition-all duration-200 ${
                  isActive ? 'opacity-100' : 'opacity-70'
                }`}
              >
                {item.label}
              </span>
            </motion.button>
          )
        })}
      </div>
    </motion.nav>
  )
}


