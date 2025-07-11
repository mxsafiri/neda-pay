'use client';

import { FC, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { SUPPORTED_BLOCKCHAINS } from '@/lib/blockradar/config';

interface WalletMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalletMenu: FC<WalletMenuProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'network' | 'settings'>('network');
  
  // During trial period, we only support Base blockchain
  const blockchain = SUPPORTED_BLOCKCHAINS.base;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          
          {/* Menu Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-xs bg-[#061328] border-l border-white/10 z-50 overflow-y-auto"
          >
            <div className="p-5">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Wallet Settings</h2>
                <button 
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/10"
                >
                  <X size={20} />
                </button>
              </div>
              
              {/* Tabs */}
              <div className="flex border-b border-white/10 mb-6">
                <button
                  className={`px-4 py-2 text-sm font-medium ${activeTab === 'network' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-white/70'}`}
                  onClick={() => setActiveTab('network')}
                >
                  Network
                </button>
                <button
                  className={`px-4 py-2 text-sm font-medium ${activeTab === 'settings' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-white/70'}`}
                  onClick={() => setActiveTab('settings')}
                >
                  Settings
                </button>
              </div>
              
              {/* Network Tab Content */}
              {activeTab === 'network' && (
                <div className="space-y-4">
                  <p className="text-sm text-white/70 mb-4">
                    Select the blockchain network you want to use. During the trial period, only Base network is available.
                  </p>
                  
                  <div className="bg-white/5 backdrop-blur-xl rounded-xl p-3 border border-white/10">
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
                  </div>
                  
                  <div className="bg-white/5 backdrop-blur-xl rounded-xl p-3 border border-white/10 opacity-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                          <span className="text-xs font-bold text-white">E</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">Ethereum</p>
                          <p className="text-xs text-white/60">Coming Soon</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Settings Tab Content */}
              {activeTab === 'settings' && (
                <div className="space-y-4">
                  <p className="text-sm text-white/70 mb-4">
                    Manage your wallet settings and preferences.
                  </p>
                  
                  <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10">
                    <h3 className="font-medium mb-2">Display Settings</h3>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm">Dark Mode</span>
                      <div className="w-10 h-6 bg-blue-500/30 rounded-full relative">
                        <div className="absolute w-4 h-4 bg-blue-400 rounded-full top-1 right-1"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10">
                    <h3 className="font-medium mb-2">Security</h3>
                    <button 
                      className="w-full text-left text-sm py-2 text-white/80 hover:text-white flex items-center justify-between"
                      onClick={() => window.location.href = '/settings'}
                    >
                      <span>Account & KYC Verification</span>
                      <span className="text-blue-400 text-xs px-2 py-0.5 bg-blue-500/20 rounded-full">Required</span>
                    </button>
                    <button className="w-full text-left text-sm py-2 text-white/80 hover:text-white">
                      Change Password
                    </button>
                    <button className="w-full text-left text-sm py-2 text-white/80 hover:text-white">
                      Two-Factor Authentication
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
