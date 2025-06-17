'use client';

import React, { useEffect, useRef } from 'react';
import { getAnime } from '@/utils/anime-helper';
import Link from 'next/link';
import Image from 'next/image';

// Types are now defined in src/types/anime.d.ts

export function ImmersiveHeader() {
  const headerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!headerRef.current || !logoRef.current || !navRef.current) return;
    
    // Import anime.js using our helper
    const initAnimations = async () => {
      try {
        // Get anime.js through our helper
        const anime = await getAnime();
        
        // Initial animation
        anime({
          targets: headerRef.current,
          opacity: [0, 1],
          translateY: [-20, 0],
          duration: 800,
          easing: 'easeOutQuad'
        });
        
        // Logo animation
        anime({
          targets: logoRef.current,
          scale: [0.8, 1],
          opacity: [0, 1],
          duration: 1000,
          easing: 'easeOutElastic(1, .5)'
        });
        
        // Nav items animation
        if (navRef.current) {
          const navLinks = navRef.current.querySelectorAll('a');
          anime({
            targets: navLinks,
            opacity: [0, 1],
            translateY: [-10, 0],
            delay: anime.stagger(100, {start: 300}),
            duration: 600,
            easing: 'easeOutQuad'
          });
        }
      } catch (error) {
        console.error('Failed to load anime.js:', error);
      }
    };
    
    initAnimations();
    
    // Scroll effect
    const handleScroll = () => {
      const scrollY = window.scrollY;
      
      if (scrollY > 50) {
        headerRef.current?.classList.add('bg-[#0A1F44]/80', 'backdrop-blur-lg', 'shadow-lg');
        headerRef.current?.classList.remove('bg-transparent');
      } else {
        headerRef.current?.classList.remove('bg-[#0A1F44]/80', 'backdrop-blur-lg', 'shadow-lg');
        headerRef.current?.classList.add('bg-transparent');
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  return (
    <div 
      ref={headerRef}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-transparent"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/landing" className="flex items-center gap-2">
            <div ref={logoRef} className="opacity-0">
              <Image 
                src="/logo.svg" 
                alt="NEDApay Logo" 
                width={40} 
                height={40} 
                className="w-10 h-10"
              />
            </div>
            <span className="text-xl font-bold">NEDAwallet</span>
          </Link>
          
          <div ref={navRef} className="hidden md:flex items-center gap-8">
            {['Features', 'Security', 'About', 'Support'].map((item) => (
              <Link 
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-white/80 hover:text-white transition-colors opacity-0"
              >
                {item}
              </Link>
            ))}
            <Link 
              href="/wallet"
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md px-5 py-2 rounded-full text-sm font-medium transition-all opacity-0"
            >
              Open App
            </Link>
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
    </div>
  );
}
