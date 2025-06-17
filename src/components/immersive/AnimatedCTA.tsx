'use client';

import React, { useEffect, useRef, useState } from 'react';
import { getAnime } from '@/utils/anime-helper';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export function AnimatedCTA() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const circlesRef = useRef<HTMLDivElement>(null);
  
  // State to hold anime.js instance after it's loaded
  // Define a proper function type for anime.js animation function
  type AnimeFunction = (params: { 
    targets: HTMLElement | HTMLElement[] | string | string[] | NodeList | null; 
    [key: string]: unknown 
  }) => Record<string, unknown>;
  
  interface AnimeInstance extends AnimeFunction {
    stagger: (value: number, options?: Record<string, unknown>) => unknown;
  }
  
  const [anime, setAnime] = useState<AnimeInstance | null>(null);

  useEffect(() => {
    // Import anime.js using our helper
    const loadAnime = async () => {
      try {
        // Get anime.js through our helper
        const animeInstance = await getAnime();
        
        // Save to state
        setAnime(animeInstance);
      } catch (error) {
        console.error('Failed to load anime.js:', error);
      }
    };
    
    loadAnime();
  }, []);
  
  useEffect(() => {
    if (!sectionRef.current || !ctaRef.current || !buttonRef.current || !circlesRef.current || !anime) return;
    
    // Create animated background circles
    for (let i = 0; i < 15; i++) {
      const circle = document.createElement('div');
      const size = Math.random() * 100 + 50;
      
      circle.className = 'absolute rounded-full bg-blue-500/10 backdrop-blur-md';
      circle.style.width = `${size}px`;
      circle.style.height = `${size}px`;
      circle.style.left = `${Math.random() * 100}%`;
      circle.style.top = `${Math.random() * 100}%`;
      circle.style.opacity = '0';
      
      circlesRef.current.appendChild(circle);
    }
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Animate circles
            if (circlesRef.current) {
              const circles = circlesRef.current.querySelectorAll('div');
              anime({
                targets: circles,
                opacity: [0, 0.7],
                scale: [0, 1],
                delay: anime.stagger(100),
                duration: 1200,
                easing: 'easeOutQuad',
                complete: () => {
                  // Continuous floating animation
                  if (circlesRef.current) {
                    const circles = circlesRef.current.querySelectorAll('div');
                    anime({
                      targets: circles,
                      translateX: () => (Math.random() - 0.5) * 40, // -20 to 20
                      translateY: () => (Math.random() - 0.5) * 40, // -20 to 20
                      scale: () => 0.9 + Math.random() * 0.3,
                      opacity: () => 0.3 + Math.random() * 0.4,
                      duration: 3000,
                      delay: anime.stagger(200),
                      easing: 'easeInOutQuad',
                      loop: true,
                      direction: 'alternate'
                    });
                  }
                }
              });
            }
            
            // Animate CTA content
            if (ctaRef.current) {
              anime({
                targets: ctaRef.current,
                opacity: [0, 1],
                translateY: [30, 0],
                duration: 800,
                easing: 'easeOutQuad'
              });
            }
            
            // Animate button with pulse effect
            if (buttonRef.current) {
              anime({
                targets: buttonRef.current,
                scale: [0.9, 1],
                opacity: [0, 1],
                delay: 500,
                duration: 800,
                easing: 'easeOutElastic(1, .5)',
                complete: () => {
                  if (buttonRef.current) {
                    anime({
                      targets: buttonRef.current,
                      boxShadow: [
                        '0 0 0 0 rgba(255,255,255,0)',
                        '0 0 0 15px rgba(255,255,255,0)'
                      ],
                      duration: 1500,
                      easing: 'easeOutQuad',
                      loop: true
                    });
                  }
                }
              });
            }
            
            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    // Add hover effect to button
    const handleMouseEnter = () => {
      if (!buttonRef.current) return;
      
      anime({
        targets: buttonRef.current,
        scale: 1.05,
        duration: 300,
        easing: 'easeOutQuad'
      });
    };
    
    const handleMouseLeave = () => {
      if (!buttonRef.current) return;
      
      anime({
        targets: buttonRef.current,
        scale: 1,
        duration: 300,
        easing: 'easeOutQuad'
      });
    };
    
    if (buttonRef.current) {
      buttonRef.current.addEventListener('mouseenter', handleMouseEnter);
      buttonRef.current.addEventListener('mouseleave', handleMouseLeave);
    }
    
    // Store a reference to buttonRef.current to use in cleanup function
    const buttonRefCurrent = buttonRef.current;
    
    return () => {
      observer.disconnect();
      buttonRefCurrent?.removeEventListener('mouseenter', handleMouseEnter);
      buttonRefCurrent?.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [anime]);
  
  return (
    <div 
      ref={sectionRef} 
      className="relative py-24 overflow-hidden"
    >
      <div ref={circlesRef} className="absolute inset-0 z-0" aria-hidden="true" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div 
          ref={ctaRef}
          className="max-w-3xl mx-auto text-center opacity-0"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to experience the future of finance?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Join thousands of users who trust NEDApay for their digital asset management. 
            Start your journey today.
          </p>
          <Link 
            href="/wallet" 
            ref={buttonRef}
            className="inline-block bg-white text-blue-900 hover:bg-white/90 px-10 py-4 rounded-full text-xl font-medium flex items-center gap-2 transition-all mx-auto opacity-0"
          >
            <span>Open Wallet</span> <ChevronRight size={20} />
          </Link>
        </div>
      </div>
    </div>
  );
}
