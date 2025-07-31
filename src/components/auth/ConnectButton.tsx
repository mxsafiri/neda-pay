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
      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Wallet className="w-5 h-5" />
      <span>Connect Wallet</span>
      <ArrowRight className="w-5 h-5" />
    </motion.button>
  )
}
