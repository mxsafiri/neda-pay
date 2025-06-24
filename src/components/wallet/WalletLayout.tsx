'use client';

import { FC, ReactNode, useState } from 'react'
import { motion } from 'framer-motion'
import { Logo } from '@/components/ui/Logo'
import { theme } from '@/styles/theme'
import { Home, ArrowLeftRight, Activity, Settings } from 'lucide-react'
import { LoginButton } from '@/components/auth/LoginButton'
import { usePathname, useRouter } from 'next/navigation'
import { WalletMenu } from './WalletMenu'

interface WalletLayoutProps {
  children: ReactNode
}

const navItems = [
  { name: 'Home', icon: Home, path: '/' },
  { name: 'Swap', icon: ArrowLeftRight, path: '/swap' },
  { name: 'Activity', icon: Activity, path: '/activity' },
  { name: 'Settings', icon: Settings, path: '/settings' },
]

export const WalletLayout: FC<WalletLayoutProps> = ({ children }) => {
  const router = useRouter()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
  const toggleMenu = () => setIsMenuOpen(prev => !prev)
  
  return (
    <div 
      className="min-h-screen bg-gradient-to-b from-[#061328] via-primary to-black text-white"
      style={{ '--primary': theme.colors.primary } as React.CSSProperties}
    >
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="container mx-auto px-4 py-8 max-w-md relative pb-24"
      >
        <header className="flex items-center justify-between mb-8">
          <Logo variant="primary" size={120} className="-ml-2" />
          <div className="flex items-center gap-3">
            <LoginButton size="sm" />
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors"
              onClick={toggleMenu}
              aria-label="Open menu"
            >
              <span className="sr-only">Menu</span>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </motion.button>
          </div>
        </header>
        
        {/* WalletMenu component */}
        <WalletMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        
        <main className="relative z-10">{children}</main>

        <motion.nav 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2, duration: 0.5, ease: 'easeOut' }}
          className="fixed bottom-0 left-0 right-0 bg-primary/90 backdrop-blur-md border-t border-white/10 p-4 z-20"
        >
          <div className="flex justify-around max-w-md mx-auto">
            {navItems.map(({ name, icon: Icon, path }) => {
              const isActive = pathname === path || 
                (path !== '/' && pathname?.startsWith(path));
                
              return (
                <motion.button
                  key={name}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => router.push(path)}
                  className={`flex flex-col items-center gap-1 text-xs font-medium transition-colors ${isActive ? 'text-white' : 'text-white/70 hover:text-white/90'}`}
                >
                  <Icon className={`w-6 h-6 ${isActive ? 'text-white' : ''}`} />
                  <span>{name}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.nav>
      </motion.div>
    </div>
  )
}
