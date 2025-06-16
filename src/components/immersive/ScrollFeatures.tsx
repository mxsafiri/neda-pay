'use client';

import { useEffect, useRef, useState } from 'react';
import { Shield, Zap, Globe, Coins } from 'lucide-react';
import { getAnime } from '@/utils/anime-helper';

// Import anime.js types from our declaration file
// Types are now defined in src/types/anime.d.ts

interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
}

const Feature = ({ icon, title, description, index }: FeatureProps): React.ReactElement => {
  const featureRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!featureRef.current) return;
    
    // Import anime.js using our helper
    const importAnime = async () => {
      try {
        // Get anime.js through our helper
        const anime = await getAnime();
        
        // Use anime directly since we just imported it
        if (featureRef.current) {
          anime({
            targets: featureRef.current,
            opacity: [0, 1],
            translateY: [50, 0],
            scale: [0.9, 1],
            delay: index * 100,
            duration: 800,
            easing: 'easeOutQuad'
          });
        }
        
        // Animate icon
        if (featureRef.current) {
          const iconElement = featureRef.current.querySelector('.feature-icon');
          if (iconElement) {
            anime({
              targets: iconElement,
              scale: [0, 1],
              rotate: ['-20deg', '0deg'],
              opacity: [0, 1],
              delay: index * 100 + 300,
              duration: 800,
              easing: 'easeOutElastic(1, .5)'
            });
          }
        }
      } catch (error) {
        console.error('Failed to load anime.js:', error);
      }
    };
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Load anime and run animations
            importAnime();
            
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );
    
    observer.observe(featureRef.current);
    
    return () => {
      observer.disconnect();
    };
  }, [index]);
  
  return (
    <div 
      ref={featureRef}
      className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 opacity-0 transform"
    >
      <div className="feature-icon w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 opacity-0">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-white/70">{description}</p>
    </div>
  );
};

export function ScrollFeatures() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  
  useEffect(() => {
    if (!sectionRef.current || !titleRef.current) return;
    
    // Import anime.js using our helper
    const importAnime = async () => {
      try {
        // Get anime.js through our helper
        const anime = await getAnime();
        
        // Animate title
        if (titleRef.current) {
          anime({
            targets: titleRef.current,
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 800,
            easing: 'easeOutQuad'
          });
        }
        
        // Add line animation
        const line = document.createElement('div');
        line.className = 'absolute left-1/2 -translate-x-1/2 h-0 w-0.5 bg-blue-400';
        line.style.top = '80px';
        sectionRef.current?.appendChild(line);
        
        anime({
          targets: line,
          height: '100px',
          duration: 1500,
          easing: 'easeInOutQuad'
        });
      } catch (error) {
        console.error('Failed to load anime.js:', error);
      }
    };
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Load anime and run animations
            importAnime();
            
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );
    
    observer.observe(sectionRef.current);
    
    return () => {
      observer.disconnect();
    };
  }, []);
  
  const features = [
    {
      icon: <Shield className="text-blue-400" />,
      title: 'Secure Transactions',
      description: 'End-to-end encryption and advanced security protocols protect your financial data.',
    },
    {
      icon: <Zap className="text-blue-400" />,
      title: 'Instant Transfers',
      description: 'Send and receive money globally in seconds with minimal fees.',
    },
    {
      icon: <Globe className="text-blue-400" />,
      title: 'Global Access',
      description: 'Use NEDA Pay anywhere in the world with our extensive network.',
    },
    {
      icon: <Coins className="text-blue-400" />,
      title: 'Multiple Currencies',
      description: 'Support for major currencies and seamless conversion at competitive rates.',
    },
  ];
  
  return (
    <section ref={sectionRef} className="py-20 relative">
      <div className="container mx-auto px-4">
        <h2 ref={titleRef} className="text-3xl md:text-4xl font-bold text-center mb-16 opacity-0">
          Why Choose NEDA Pay
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Feature 
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
