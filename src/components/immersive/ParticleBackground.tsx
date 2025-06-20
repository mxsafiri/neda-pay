'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useAnimationControls, useMotionValue } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  speed: number;
  opacity: number;
}

// A single particle component using Framer Motion
const AnimatedParticle: React.FC<Particle> = ({ x, y, size, color, speed, opacity }) => {
  const controls = useAnimationControls();
  const yPos = useMotionValue(y);
  const mouseDistance = useRef<number>(9999);
  
  // Animation loop for floating movement
  useEffect(() => {
    const animate = async () => {
      while (true) {
        // Only animate if not being affected by mouse
        if (mouseDistance.current > 100) {
          await controls.start({
            y: yPos.get() - speed,
            transition: { duration: 0.01, ease: "linear" }
          });
          
          // Reset position if goes off screen
          if (yPos.get() < -size) {
            yPos.set(window.innerHeight + size);
            controls.set({ x: Math.random() * window.innerWidth, y: yPos.get() });
          }
        }
        await new Promise(resolve => requestAnimationFrame(resolve));
      }
    };
    
    animate();
  }, [controls, speed, size, yPos]);
  
  // Handle mouse interactions via a global mouse position tracker
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      
      // Calculate distance from particle to mouse
      const dx = mouseX - x;
      const dy = mouseY - yPos.get();
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      mouseDistance.current = distance;
      
      // Move particle away from mouse
      if (distance < 100) {
        const angle = Math.atan2(dy, dx);
        const force = (100 - distance) / 10;
        
        controls.start({
          x: x - Math.cos(angle) * force,
          y: yPos.get() - Math.sin(angle) * force,
          transition: { duration: 0.3, ease: "easeOut" }
        });
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [controls, x, yPos]);
  
  return (
    <motion.div
      layout
      className="absolute rounded-full"
      style={{ 
        width: size, 
        height: size, 
        backgroundColor: color,
        opacity: opacity,
        x,
        y: yPos
      }}
      animate={controls}
      initial={{ x, y: yPos.get() }}
    />
  );
};

export function ParticleBackground() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const colors = ['#0A1F44', '#1E3A8A', '#3B82F6', '#93C5FD'];
    const newParticles: Particle[] = [];
    
    // Create fewer particles for better performance
    for (let i = 0; i < 25; i++) { // Reduced from 50 to 25
      const size = Math.random() * 5 + 2; // Slightly smaller particles
      
      newParticles.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: Math.random() * 0.8 + 0.3, // Slightly slower for smoother movement
        opacity: Math.random() * 0.4 + 0.1 // Slightly less opaque
      });
    }
    
    setParticles(newParticles);
    
    // Handle window resize to adjust particle positions
    const handleResize = () => {
      setParticles(prev => 
        prev.map(particle => ({
          ...particle,
          x: Math.min(particle.x, window.innerWidth),
          y: Math.min(particle.y, window.innerHeight)
        }))
      );
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return (
    <div 
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      {particles.map(particle => (
        <AnimatedParticle 
          key={particle.id}
          {...particle}
        />
      ))}
    </div>
  );
}
