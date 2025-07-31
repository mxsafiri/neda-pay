'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { usePrivy } from '@privy-io/react-auth'
import { Wallet, ArrowRight } from 'lucide-react'

export function ConnectButton() {
  const { login } = usePrivy()

  const handleConnect = () => {
    login()
  }

  return (
    <motion.button
      onClick={handleConnect}
      className="w-full bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20 hover:border-white/30 text-white font-medium py-4 px-8 rounded-xl transition-all duration-200 flex items-center justify-center space-x-3"
      style={{ fontFamily: 'Poppins', fontWeight: 500 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <Wallet className="w-5 h-5" />
      <span>Connect Wallet</span>
      <ArrowRight className="w-5 h-5" />
    </motion.button>
  )
}
