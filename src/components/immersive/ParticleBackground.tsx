'use client';

import { useEffect, useRef, useState } from 'react';
import { getAnime } from '@/utils/anime-helper';

// Types are now defined in src/types/anime.d.ts

interface Particle {
  x: number;
  y: number;
  size: number;
  color: string;
  speed: number;
  opacity: number;
  element: HTMLDivElement;
}

export function ParticleBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number | null>(null);
  
  // State to hold the anime.js instance after it's loaded
  // Define a proper function type for anime.js animation function
  type AnimeFunction = (params: { 
    targets: HTMLElement | HTMLElement[] | string | string[] | NodeList | null; 
    [key: string]: unknown 
  }) => Record<string, unknown>;
  const [animateFunc, setAnimateFunc] = useState<AnimeFunction | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Import anime.js using our helper
    const importAnime = async () => {
      try {
        // Get anime.js through our helper
        const anime = await getAnime();
        setAnimateFunc(() => anime);
      } catch (error) {
        console.error('Failed to load anime.js:', error);
      }
    };
    
    // Load anime.js
    importAnime();
    
    const container = containerRef.current;
    const particles: Particle[] = [];
    const colors = ['#0A1F44', '#1E3A8A', '#3B82F6', '#93C5FD'];
    
    // Clear any existing particles
    container.innerHTML = '';
    
    // Create particles
    for (let i = 0; i < 50; i++) {
      const particle = document.createElement('div');
      const size = Math.random() * 6 + 2;
      
      particle.className = 'absolute rounded-full';
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      particle.style.opacity = (Math.random() * 0.5 + 0.2).toString();
      
      container.appendChild(particle);
      
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: Math.random() * 1 + 0.5,
        opacity: Math.random() * 0.5 + 0.2,
        element: particle
      });
    }
    
    particlesRef.current = particles;
    
    // Animate particles
    const animate = () => {
      particles.forEach(particle => {
        particle.y -= particle.speed;
        
        // Reset position if particle goes off screen
        if (particle.y < -particle.size) {
          particle.y = window.innerHeight + particle.size;
          particle.x = Math.random() * window.innerWidth;
        }
        
        particle.element.style.transform = `translate(${particle.x}px, ${particle.y}px)`;
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    // Add mouse interaction
    const handleMouseMove = (e: MouseEvent) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      
      particles.forEach(particle => {
        // Calculate distance from mouse
        const dx = mouseX - particle.x;
        const dy = mouseY - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Move particles away from mouse
        if (distance < 100) {
          const angle = Math.atan2(dy, dx);
          const force = (100 - distance) / 10;
          
          // Only call animateFunc if it's loaded
          if (animateFunc) {
            animateFunc({
              targets: particle.element,
              translateX: particle.x - Math.cos(angle) * force,
              translateY: particle.y - Math.sin(angle) * force,
              duration: 300,
              easing: 'easeOutQuad'
            });
          }
        }
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [animateFunc]);
  
  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    />
  );
}
