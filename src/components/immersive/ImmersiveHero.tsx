'use client';

import React, { useEffect, useRef, useState } from 'react';
import { getAnime } from '@/utils/anime-helper';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

// Types are now defined in src/types/anime.d.ts

export function ImmersiveHero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const [currentWord, setCurrentWord] = useState(0);
  const words = ['FASTER', 'SECURED', 'CONNECTED', 'DISTRIBUTED'];
  
  // Handle word animation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Animate word change
  useEffect(() => {
    if (!titleRef.current) return;
    
    const wordElement = titleRef.current.querySelector('.animated-word');
    if (!wordElement) return;
    
    const animateWord = async () => {
      try {
        // Get anime.js through our helper
        const anime = await getAnime();
        
        anime({
          targets: wordElement,
          opacity: [0, 1],
          translateY: [20, 0],
          duration: 800,
          easing: 'easeOutQuad'
        });
      } catch (error) {
        console.error('Error loading anime.js:', error);
      }
    };
    
    animateWord();
  }, [currentWord]);
  
  // Initial animations
  useEffect(() => {
    if (!heroRef.current || !titleRef.current || !descriptionRef.current || !ctaRef.current || !logoRef.current) return;
    
    const initAnimations = async () => {
      try {
        // Get anime.js through our helper
        const anime = await getAnime();
        
        // Staggered animation for title characters
        const titleText = titleRef.current?.innerText || '';
        if (titleRef.current) titleRef.current.innerHTML = '';
        
        // Split text into spans for character animation
        titleText.split('').forEach((char, i) => {
          const span = document.createElement('span');
          span.innerText = char;
          span.style.opacity = '0';
          span.style.display = 'inline-block';
          if (char === ' ') span.innerHTML = '&nbsp;';
          titleRef.current?.appendChild(span);
        });
        
        // Animate each character
        if (titleRef.current) {
          const spans = titleRef.current.querySelectorAll('span');
          anime({
            targets: spans,
            opacity: [0, 1],
            translateY: [20, 0],
            delay: anime.stagger(50),
            easing: 'easeOutQuad',
            duration: 800
          });
        }
        
        // Animate description
        if (descriptionRef.current) {
          anime({
            targets: descriptionRef.current,
            opacity: [0, 1],
            translateY: [20, 0],
            delay: 500,
            duration: 800,
            easing: 'easeOutQuad'
          });
        }
        
        // Animate CTA buttons
        if (ctaRef.current) {
          const ctaButtons = ctaRef.current.querySelectorAll('a');
          anime({
            targets: ctaButtons,
            opacity: [0, 1],
            translateY: [20, 0],
            delay: anime.stagger(200, {start: 800}),
            duration: 800,
            easing: 'easeOutQuad'
          });
        }
        
        // Animate logo
        if (logoRef.current) {
          anime({
            targets: logoRef.current,
            opacity: [0, 1],
            scale: [0.8, 1],
            delay: 300,
            duration: 1200,
            easing: 'easeOutElastic(1, .5)'
          });
        }
      } catch (error) {
        console.error('Error loading anime.js:', error);
      }
    };
    
    initAnimations();
    
    // Add scroll interaction
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
          <div className="flex-1">
            <h1 
              ref={titleRef} 
              className="text-4xl md:text-6xl font-bold mb-6 text-white"
            >
              ONE APP FOR A{' '}
              <span className="animated-word text-blue-300">
                {words[currentWord]}
              </span>{' '}
              <br />GLOBAL LIFE
            </h1>
            <p 
              ref={descriptionRef}
              className="text-xl text-white/80 mb-8"
            >
              Send, receive, and manage your digital assets with NEDApay's secure and intuitive wallet.
            </p>
            <div ref={ctaRef} className="flex flex-wrap gap-4">
              <Link 
                href="/wallet" 
                className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-full text-lg font-medium flex items-center gap-2 transition-all opacity-0"
              >
                Get Started <ArrowRight size={18} />
              </Link>
              <Link 
                href="#features" 
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md px-8 py-3 rounded-full text-lg font-medium transition-all opacity-0"
              >
                Learn More
              </Link>
            </div>
          </div>
          <div ref={logoRef} className="flex-1 relative opacity-0">
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
          </div>
        </div>
      </div>
    </div>
  );
}
