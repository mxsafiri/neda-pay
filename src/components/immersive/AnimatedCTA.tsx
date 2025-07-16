'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { motion, useInView, AnimatePresence } from 'framer-motion';

// Helper component for animated background circles
const AnimatedCircle = ({ size, position, delay }: { size: number, position: { x: number, y: number }, delay: number }) => {
  // Use simpler animation approach for better performance
  return (
    <motion.div 
      className="absolute rounded-full bg-white/10 backdrop-blur-md"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: [0, 0.2, 0.1], scale: 1 }}
      transition={{ 
        duration: 2,
        delay,
        opacity: {
          repeat: Infinity,
          repeatType: "reverse",
          duration: 8, 
          ease: "easeInOut",
        }
      }}
      style={{ 
        width: size,
        height: size,
        left: `${position.x}%`,
        top: `${position.y}%`,
        translateX: '-50%',
        translateY: '-50%'
      }}
      viewport={{ once: true }}
    />
  );
};

// Button with pulse animation
const PulseButton = ({ children, href = "/wallet" }: { children: React.ReactNode, href?: string }) => {
  const [hovered, setHovered] = useState(false);
  
  return (
    <motion.div
      className="inline-block"
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ 
        duration: 0.8, 
        delay: 0.5, 
        type: "spring", 
        stiffness: 200, 
        damping: 10
      }}
      whileHover={{ scale: 1.05 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      <div className="relative">
        <AnimatePresence>
          {hovered && (
            <motion.div 
              className="absolute inset-0 rounded-full bg-white/30"
              initial={{ scale: 1 }}
              animate={{ scale: 1.3, opacity: [1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
          )}
        </AnimatePresence>
        
        <Link 
          href={href}
          className="inline-block bg-white text-blue-900 hover:bg-white/90 px-10 py-4 rounded-full text-xl font-medium flex items-center gap-2 transition-all"
        >
          {children}
        </Link>
      </div>
    </motion.div>
  );
};

export function AnimatedCTA() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  
  // Generate an array of 8 circles for better performance (reduced from 15)
  const circles = Array.from({ length: 8 }, (_, index) => ({
    size: Math.random() * 80 + 50, // 50-130px circles
    position: {
      x: Math.random() * 100, // 0-100%
      y: Math.random() * 100  // 0-100%
    },
    delay: index * 0.1
  }));

  return (
    <div 
      ref={sectionRef}
      className="relative py-24 overflow-hidden"
    >
      <div className="absolute inset-0 z-0" aria-hidden="true">
        {isInView && circles.map((circle, index) => (
          <AnimatedCircle 
            key={index} 
            size={circle.size} 
            position={circle.position} 
            delay={circle.delay} 
          />
        ))}
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.h2 
            className="text-3xl md:text-5xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            Ready to experience the future of finance?
          </motion.h2>
          <motion.p 
            className="text-xl text-white/80 mb-10 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Join thousands of users who trust NEDApay for their digital asset management. 
            Start your journey today.
          </motion.p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <PulseButton href="/create-wallet">
              <span>Create Wallet</span> <ChevronRight size={20} />
            </PulseButton>
            
            <motion.div
              className="inline-block"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.8, 
                delay: 0.7, 
                type: "spring", 
                stiffness: 200, 
                damping: 10
              }}
            >
              <Link 
                href="/sign-in"
                className="inline-block border-2 border-white text-white hover:bg-white/10 px-10 py-4 rounded-full text-xl font-medium flex items-center gap-2 transition-all"
              >
                <span>Sign In</span> <ChevronRight size={20} />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
