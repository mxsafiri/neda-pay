'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useAnimate, useScroll, stagger } from 'framer-motion';

// Using Framer Motion for animations instead of anime.js

export function ImmersiveHeader() {
  const [scope, animate] = useAnimate();

  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();
  
  // Initial animation sequence
  useEffect(() => {
    const sequence = async () => {
      // Animate header
      await animate('header', { opacity: [0, 1], y: [-20, 0] }, { duration: 0.5, ease: 'easeOut' });
      
      // Animate logo
      await animate('#logo', 
        { opacity: [0, 1], scale: [0.8, 1] }, 
        { duration: 0.7, type: 'spring', stiffness: 200, damping: 10 }
      );
      
      // Animate nav links
      await animate('.nav-link', 
        { opacity: [0, 1], y: [-10, 0] }, 
        { delay: stagger(0.08, { startDelay: 0.2 }), duration: 0.4 }
      );
    };
    
    sequence();
  }, [animate]);
    
  // Scroll effect using Framer Motion's useScroll hook
  useEffect(() => {
    const unsubscribeScrollY = scrollY.on('change', (latest) => {
      if (latest > 50 && !isScrolled) {
        setIsScrolled(true);
      } else if (latest <= 50 && isScrolled) {
        setIsScrolled(false);
      }
    });
    
    return () => {
      unsubscribeScrollY();
    };
  }, [scrollY, isScrolled]);
  
  return (
    <div ref={scope} className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-[#0A1F44]/80 backdrop-blur-lg shadow-lg' : 'bg-transparent'}`}>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/landing" className="flex items-center gap-2">
            <motion.div 
              id="logo"
              initial={{ opacity: 0, scale: 0.8 }}
              className=""
            >
              <Image 
                src="/logo.svg" 
                alt="NEDApay Logo" 
                width={40} 
                height={40} 
                className="w-10 h-10"
              />
            </motion.div>
            <span className="text-xl font-bold">NEDAwallet</span>
          </Link>
          
          <div className="flex items-center">
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="nav-link"
            >
              <Link 
                href="/wallet" 
                className="bg-white text-blue-900 px-6 py-3 rounded-full font-medium hover:bg-blue-50 transition-colors"
              >
                Open App
              </Link>
            </motion.div>
          </div>
          
          <button className="md:hidden text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
      </motion.header>
    </div>
  );
}
