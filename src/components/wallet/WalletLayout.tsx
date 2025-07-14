'use client';

import { FC, ReactNode, useState } from 'react'
import { motion } from 'framer-motion'
import { Logo } from '@/components/ui/Logo'
import { theme } from '@/styles/theme'
import { Home, ArrowLeftRight, Activity, Settings, QrCode, Search, Scan } from 'lucide-react'
// import { LoginButton } from '@/components/auth/LoginButton' // Commented out as it's currently unused
import { usePathname, useRouter } from 'next/navigation'
import { WalletMenu } from './WalletMenu'

interface WalletLayoutProps {
  children: ReactNode
}

const navItems = [
  { name: 'Home', icon: Home, path: '/wallet' },
  { name: 'Swap', icon: ArrowLeftRight, path: '/swap' },
  { name: 'Scan', icon: Scan, path: '/scan' },
  { name: 'Activity', icon: Activity, path: '/activity' },
]

export const WalletLayout: FC<WalletLayoutProps> = ({ children }) => {
  const router = useRouter()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
  const toggleMenu = () => setIsMenuOpen(prev => !prev)
  
  return (
    <div 
      className="min-h-screen bg-black text-white"
      style={{ '--primary': theme.colors.primary } as React.CSSProperties}
    >
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="container mx-auto px-4 py-8 max-w-md relative pb-24"
      >
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <Logo variant="white" size={24} />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="font-medium">Address 1</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Search"
            >
              <Search className="w-6 h-6" />
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label="QR Code"
            >
              <QrCode className="w-6 h-6" />
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              onClick={toggleMenu}
              aria-label="Settings"
            >
              <Settings className="w-6 h-6" />
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
          className="fixed bottom-0 left-0 right-0 bg-black border-t border-white/10 p-4 z-20"
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
