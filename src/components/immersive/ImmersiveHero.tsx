'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion, AnimatePresence, useAnimate, stagger } from 'framer-motion';

// Using Framer Motion instead of anime.js for more reliable animations

export function ImmersiveHero() {
  const [scope, animate] = useAnimate();
  const heroRef = useRef<HTMLDivElement>(null);
  const [currentWord, setCurrentWord] = useState(0);
  const words = ['FASTER', 'SECURED', 'CONNECTED', 'DISTRIBUTED'];
  
  // Handle word cycling with a timer
  useEffect(() => {
    const wordChangeInterval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 3000);
    
    return () => clearInterval(wordChangeInterval);
  }, [words.length]);
  
  // Initial animation sequence
  useEffect(() => {
    // Using a timeout to ensure DOM elements are rendered before animation
    const animationTimeout = setTimeout(() => {
      const titleElement = document.getElementById('hero-title');
      const descriptionElement = document.getElementById('hero-description');
      const ctaButtons = document.querySelectorAll('.cta-button');
      const logoElement = document.getElementById('hero-logo');
      
      // Only animate elements that exist in the DOM
      if (titleElement) {
        animate(titleElement, { opacity: [0, 1], y: [20, 0] }, { duration: 0.6 });
      }
      
      if (descriptionElement) {
        animate(descriptionElement, { opacity: [0, 1], y: [20, 0] }, { duration: 0.5 });
      }
      
      if (ctaButtons.length > 0) {
        animate(ctaButtons, 
          { opacity: [0, 1], y: [20, 0] }, 
          { delay: stagger(0.1), duration: 0.5 }
        );
      }
      
      if (logoElement) {
        animate(logoElement, 
          { opacity: [0, 1], scale: [0.9, 1] }, 
          { duration: 0.8, type: 'spring' }
        );
      }
    }, 100); // Small delay to ensure DOM is ready
    
    return () => clearTimeout(animationTimeout);
  }, [animate]);
  
  // Handle scroll animation
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const opacity = Math.max(0, 1 - scrollY / 500);
      const translateY = scrollY * 0.5;
      
      if (heroRef.current) {
        heroRef.current.style.opacity = opacity.toString();
        heroRef.current.style.transform = `translateY(${translateY}px)`;
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  return (
    <div ref={heroRef} className="relative min-h-screen flex items-center">
      <div className="container mx-auto px-4 py-16 md:py-24 z-10">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
          <div className="flex-1" ref={scope}>
            <motion.h1 
              id="hero-title"
              initial={{ opacity: 0, y: 20 }}
              className="text-4xl md:text-6xl font-bold mb-6 text-white"
            >
              ONE APP FOR A{' '}
              <AnimatePresence mode="wait">
                <motion.span 
                  key={words[currentWord]}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.5 }}
                  className="inline-block text-blue-300"
                >
                  {words[currentWord].split('').map((char, idx) => (
                    <motion.span 
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        duration: 0.3, 
                        delay: idx * 0.04,
                        ease: "easeOut"
                      }}
                      className="inline-block"
                    >
                      {char}
                    </motion.span>
                  ))}
                </motion.span>
              </AnimatePresence>{' '}
              <br />GLOBAL LIFE
            </motion.h1>
            <motion.p 
              id="hero-description"
              initial={{ opacity: 0, y: 20 }}
              className="text-xl text-white/80 mb-8"
            >
              Send, receive, and manage your digital assets with NEDApay&apos;s secure and intuitive wallet.
            </motion.p>
            <div className="flex flex-wrap gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                className="cta-button"
              >
                <Link 
                  href="/wallet" 
                  className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-full text-lg font-medium flex items-center gap-2 transition-all"
                >
                  Get Started <ArrowRight size={18} />
                </Link>
              </motion.div>
            </div>
          </div>
          <motion.div 
            id="hero-logo"
            initial={{ opacity: 0, scale: 0.9 }}
            className="flex-1 relative">
            <div className="relative w-full max-w-[320px] mx-auto">
              <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full"></div>
              <div className="relative z-10 rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
                {/* Phone mockup with app UI */}
                <div className="bg-[#061328] pt-8 pb-4 px-4 rounded-t-3xl">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <Image 
                        src="/logo.svg" 
                        alt="NEDApay Logo" 
                        width={24} 
                        height={24} 
                        className="w-6 h-6"
                      />
                      <span className="text-white font-medium">NEDApay</span>
                    </div>
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/30"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-white/30"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-white/30"></div>
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3 mb-4">
                    <div className="text-xs text-white/70">Total Balance</div>
                    <div className="text-2xl font-bold text-white">$2,458.32</div>
                    <div className="text-xs text-green-400">+2.4% today</div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {['Send', 'Receive', 'Swap'].map((action) => (
                      <div key={action} className="bg-white/5 rounded-lg p-2 text-center">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-full mx-auto mb-1 flex items-center justify-center">
                          <div className="w-4 h-4 bg-blue-400 rounded-full"></div>
                        </div>
                        <div className="text-xs text-white/80">{action}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-[#0A1F44] p-4">
                  <div className="text-xs text-white/70 mb-2">Recent Activity</div>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-2 py-2 border-b border-white/10 last:border-0">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <div className="w-4 h-4 bg-blue-400 rounded-full"></div>
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-white">Payment #{i}</div>
                        <div className="text-xs text-white/50">2 hours ago</div>
                      </div>
                      <div className="text-xs font-medium text-white">+$125.00</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
