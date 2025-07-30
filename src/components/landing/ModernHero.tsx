'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';

interface ModernHeroProps {
  theme: 'light' | 'dark';
}

export function ModernHero({ theme }: ModernHeroProps) {
  const { login, authenticated, ready } = usePrivy();
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);

  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(100); // Faster typing speed
  
  // Multiple messages for typewriter effect - starting with "It pays to be here"
  const messages = [
    "It pays to be here",
    "Stablecoins are here",
    "Fast payments are here"
  ];
  
  const currentMessage = messages[loopNum % messages.length];
  

  
  // Typewriter effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (text.length < currentMessage.length && !isDeleting) {
        setText(currentMessage.substring(0, text.length + 1));
        setTypingSpeed(100); // Faster typing
      } else if (isDeleting && text.length > 0) {
        setText(currentMessage.substring(0, text.length - 1));
        setTypingSpeed(50); // Faster deleting
      } else if (text.length === currentMessage.length) {
        // Pause at full text
        setTypingSpeed(1500); // Shorter pause
        setIsDeleting(true);
      } else if (text.length === 0) {
        // Start typing again with next message
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
        setTypingSpeed(300); // Shorter pause before next message
      }
    }, typingSpeed);
    
    return () => clearTimeout(timer);
  }, [text, isDeleting, loopNum, currentMessage, typingSpeed]);

  // Handle Connect button click
  const handleConnect = async () => {
    if (!ready) return;
    
    setIsConnecting(true);
    try {
      await login();
      // After successful authentication, redirect to wallet
      router.push('/wallet');
    } catch (error) {
      console.error('Authentication failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  // Redirect if already authenticated
  useEffect(() => {
    if (authenticated) {
      router.push('/wallet');
    }
  }, [authenticated, router]);

  return (
    <section className={`pt-24 md:pt-32 pb-16 md:pb-20 ${theme === 'light' ? 'bg-gradient-to-b from-white to-gray-50' : 'bg-gradient-to-b from-gray-900 to-black'}`}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">
          <div className="flex-1 max-w-2xl">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className={`text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight font-display ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}
            >
              {text.includes('here') ? (
                <>
                  {text.split('here')[0]}
                  <span className="text-[#0254e6]">
                    here
                  </span>
                  {text.split('here')[1] || ''}
                </>
              ) : text}
              <span className="inline-block w-1 h-12 ml-1 bg-[#0254e6] animate-blink"></span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className={`text-xl md:text-2xl mb-8 ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-300'
              }`}
            >
              Send, receive, and manage your digital assets with NEDApay&apos;s secure and intuitive wallet.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap gap-4"
            >
              <button 
                onClick={handleConnect}
                disabled={!ready || isConnecting}
                className={`px-8 py-4 text-lg font-medium flex items-center gap-2 transition-all rounded-lg ${
                  theme === 'light'
                    ? 'bg-[#0254e6] hover:bg-[#0254e6]/90 text-white'
                    : 'bg-[#0254e6] hover:bg-[#0254e6]/80 text-white'
                } ${(!ready || isConnecting) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'}`}
              >
                {isConnecting ? (
                  <>
                    <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    Connect <ArrowRight size={18} />
                  </>
                )}
              </button>
              
              {/* Learn More button removed as requested */}
            </motion.div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex-1 relative"
          >
            <div className="relative w-full max-w-[400px] mx-auto">
              {/* Glow effect */}
              <div className={`absolute inset-0 rounded-full blur-3xl ${
                theme === 'light' ? 'bg-blue-200/50' : 'bg-blue-500/20'
              }`}></div>
              
              {/* Phone mockup */}
              <div className={`relative z-10 rounded-3xl overflow-hidden border ${
                theme === 'light' ? 'border-gray-200 shadow-lg' : 'border-gray-800 shadow-2xl'
              }`}>
                <div className={`pt-8 pb-4 px-4 rounded-t-3xl ${
                  theme === 'light' ? 'bg-white' : 'bg-gray-900'
                }`}>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        theme === 'light' ? 'bg-blue-600' : 'bg-blue-500'
                      }`}>
                        <Image 
                          src="/logo.svg" 
                          alt="NEDApay Logo" 
                          width={16} 
                          height={16} 
                          className="w-4 h-4"
                        />
                      </div>
                      <span className={theme === 'light' ? 'text-gray-900 font-medium' : 'text-white font-medium'}>
                        NEDApay
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${theme === 'light' ? 'bg-gray-300' : 'bg-gray-700'}`}></div>
                      <div className={`w-1.5 h-1.5 rounded-full ${theme === 'light' ? 'bg-gray-300' : 'bg-gray-700'}`}></div>
                      <div className={`w-1.5 h-1.5 rounded-full ${theme === 'light' ? 'bg-gray-300' : 'bg-gray-700'}`}></div>
                    </div>
                  </div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className={`rounded-xl p-4 mb-4 ${
                      theme === 'light' ? 'bg-gray-50' : 'bg-gray-800'
                    }`}
                  >
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.7 }}
                      className={theme === 'light' ? 'text-xs text-gray-500' : 'text-xs text-gray-400'}
                    >
                      Total Balance
                    </motion.div>
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6, delay: 0.9, type: "spring", stiffness: 100 }}
                      className={`text-2xl font-bold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}
                    >
                      TSh 6,145,800
                    </motion.div>
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 1.1 }}
                      className="text-xs text-green-500"
                    >
                      +2.4% today
                    </motion.div>
                  </motion.div>
                  
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {['Send', 'Receive', 'Swap'].map((action, index) => (
                      <motion.div 
                        key={action}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ 
                          duration: 0.5, 
                          delay: 1.3 + (index * 0.1),
                          type: "spring",
                          stiffness: 120
                        }}
                        className={`rounded-lg p-3 text-center ${
                          theme === 'light' ? 'bg-gray-50' : 'bg-gray-800'
                        }`}
                      >
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ 
                            duration: 0.4, 
                            delay: 1.5 + (index * 0.1),
                            type: "spring",
                            stiffness: 200
                          }}
                          className={`w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center ${
                            theme === 'light' ? 'bg-blue-100' : 'bg-blue-900/30'
                          }`}
                        >
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ 
                              duration: 0.3, 
                              delay: 1.7 + (index * 0.1),
                              type: "spring",
                              stiffness: 300
                            }}
                            className={`w-4 h-4 rounded-full ${
                              theme === 'light' ? 'bg-[#0254e6]' : 'bg-[#0254e6]'
                            }`}
                          ></motion.div>
                        </motion.div>
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3, delay: 1.8 + (index * 0.1) }}
                          className={theme === 'light' ? 'text-xs text-gray-700' : 'text-xs text-gray-300'}
                        >
                          {action}
                        </motion.div>
                      </motion.div>
                    ))}
                  </div>
                </div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 2.1 }}
                  className={theme === 'light' ? 'bg-gray-50 p-4' : 'bg-gray-800 p-4'}
                >
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 2.3 }}
                    className={theme === 'light' ? 'text-xs text-gray-500 mb-2' : 'text-xs text-gray-400 mb-2'}
                  >
                    Recent Activity
                  </motion.div>
                  
                  {[1, 2, 3].map((i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ 
                        duration: 0.5, 
                        delay: 2.4 + (i * 0.15),
                        type: "spring",
                        stiffness: 100
                      }}
                      className={`flex items-center gap-3 py-2 ${
                        i < 3 ? theme === 'light' ? 'border-b border-gray-200' : 'border-b border-gray-700' : ''
                      }`}
                    >
                      <motion.div 
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ 
                          duration: 0.4, 
                          delay: 2.6 + (i * 0.15),
                          type: "spring",
                          stiffness: 200
                        }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          theme === 'light' ? 'bg-blue-100' : 'bg-blue-900/30'
                        }`}
                      >
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ 
                            duration: 0.3, 
                            delay: 2.8 + (i * 0.15),
                            type: "spring",
                            stiffness: 300
                          }}
                          className={`w-4 h-4 rounded-full ${
                            theme === 'light' ? 'bg-[#0254e6]' : 'bg-[#0254e6]'
                          }`}
                        ></motion.div>
                      </motion.div>
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 2.7 + (i * 0.15) }}
                        className="flex-1"
                      >
                        <div className={theme === 'light' ? 'text-xs text-gray-900' : 'text-xs text-white'}>
                          Payment #{i}
                        </div>
                        <div className={theme === 'light' ? 'text-xs text-gray-500' : 'text-xs text-gray-400'}>
                          2 hours ago
                        </div>
                      </motion.div>
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ 
                          duration: 0.4, 
                          delay: 2.9 + (i * 0.15),
                          type: "spring",
                          stiffness: 150
                        }}
                        className={`text-xs font-medium ${theme === 'light' ? 'text-green-600' : 'text-green-400'}`}
                      >
                        +$125.00
                      </motion.div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
