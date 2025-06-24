'use client';

import { FC } from 'react';
import { motion } from 'framer-motion';
import { useBlockradar } from '@/hooks/useBlockradar';
import { SUPPORTED_BLOCKCHAINS } from '@/lib/blockradar/config';

/**
 * BlockchainSelector component
 * 
 * During the trial period, this component only shows the Base blockchain
 * and doesn't allow switching to other networks.
 */
export const BlockchainSelector: FC = () => {
  const { selectedBlockchain } = useBlockradar();
  
  // During trial period, we only support Base blockchain
  const blockchain = SUPPORTED_BLOCKCHAINS.base;
  
  return (
    <motion.div
      className="bg-white/5 backdrop-blur-xl rounded-xl p-3 mb-4 border border-white/10"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
            <span className="text-xs font-bold text-white">B</span>
          </div>
          <div>
            <p className="font-medium text-sm">{blockchain.name}</p>
            <p className="text-xs text-white/60">Trial Network</p>
          </div>
        </div>
        <div className="px-3 py-1 bg-blue-500/20 rounded-full">
          <span className="text-xs font-medium text-blue-400">Active</span>
        </div>
      </div>
    </motion.div>
  );
};
