'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export function HeroSection() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const words = ['FASTER', 'SECURED', 'CONNECTED', 'DISTRIBUTED'];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, 3000); // Change word every 3 seconds
    
    return () => clearInterval(interval);
  }, []);
  return (
    <section className="container mx-auto px-4 py-16 md:py-24">
      <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
        <motion.div 
          className="flex-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            ONE APP FOR A{' '}
            <span className="relative inline-block">
              <AnimatePresence mode="wait">
                <motion.span
                  key={words[currentWordIndex]}
                  className="text-blue-300 absolute"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  {words[currentWordIndex]}
                </motion.span>
              </AnimatePresence>
              <span className="invisible">{words[0]}</span>
            </span>{' '}
            <br />GLOBAL LIFE
          </h1>
          <p className="text-xl text-white/80 mb-8">
            Send, receive, and manage your digital assets with NEDApay's secure and intuitive wallet.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link 
              href="/wallet" 
              className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-full text-lg font-medium flex items-center gap-2 transition-all"
            >
              Get Started <ArrowRight size={18} />
            </Link>
            <Link 
              href="#features" 
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md px-8 py-3 rounded-full text-lg font-medium transition-all"
            >
              Learn More
            </Link>
          </div>
        </motion.div>
        <motion.div 
          className="flex-1 relative"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="relative w-full max-w-[320px] mx-auto">
            <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full"></div>
            <div className="relative z-10 rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
              {/* Phone mockup with app UI */}
              <div className="bg-[#061328] pt-8 pb-4 px-4 rounded-t-3xl">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                    <Image 
                      src="/logo.svg" 
                      alt="NEDApay Logo" 
                      width={20} 
                      height={20} 
                    />
                    <span className="text-sm font-medium">NEDApay</span>
                  </div>
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>
                  </div>
                </div>
                
                {/* App UI */}
                <div className="bg-[#0A1F44] rounded-2xl p-4 mb-6">
                  <div className="text-xs text-white/60 mb-1">Total Balance</div>
                  <div className="text-2xl font-bold mb-2">$2,458.33</div>
                  <div className="flex gap-2 mb-4">
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">+2.4%</span>
                    <span className="text-xs text-white/60">Last 24h</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="bg-blue-600 text-white text-xs px-4 py-1.5 rounded-full flex-1">send</button>
                    <button className="bg-white/10 text-white text-xs px-4 py-1.5 rounded-full flex-1">receive</button>
                  </div>
                </div>
                
                {/* Recent Transactions */}
                <div className="mb-2">
                  <div className="flex justify-between items-center mb-3">
                    <div className="text-sm font-medium">Recent Transactions</div>
                    <div className="text-xs text-blue-400">See All</div>
                  </div>
                  
                  {/* Transaction Items */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-white/5 p-2 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <ArrowRight size={14} className="text-blue-400" />
                        </div>
                        <div>
                          <div className="text-xs font-medium">Sent USDC</div>
                          <div className="text-xs text-white/60">Today</div>
                        </div>
                      </div>
                      <div className="text-xs">-$120.00</div>
                    </div>
                    
                    <div className="flex items-center justify-between bg-white/5 p-2 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                          <ArrowRight size={14} className="text-green-400 rotate-180" />
                        </div>
                        <div>
                          <div className="text-xs font-medium">Received ETH</div>
                          <div className="text-xs text-white/60">Yesterday</div>
                        </div>
                      </div>
                      <div className="text-xs">+$350.00</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Bottom Navigation */}
              <div className="bg-[#061328]/90 backdrop-blur-md py-3 px-6 flex justify-around items-center border-t border-white/10">
                <div className="flex flex-col items-center">
                  <div className="w-5 h-5 rounded-full bg-blue-500/20 mb-1"></div>
                  <div className="text-[10px] text-blue-400">Home</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-5 h-5 rounded-full bg-white/10 mb-1"></div>
                  <div className="text-[10px] text-white/40">Swap</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-5 h-5 rounded-full bg-white/10 mb-1"></div>
                  <div className="text-[10px] text-white/40">Activity</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-5 h-5 rounded-full bg-white/10 mb-1"></div>
                  <div className="text-[10px] text-white/40">Settings</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
