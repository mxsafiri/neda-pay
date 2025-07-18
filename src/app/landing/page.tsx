'use client';

// Prevent Next.js from prerendering this page
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { ModernHeader } from '../../components/landing/ModernHeader';
import { ModernHero } from '../../components/landing/ModernHero';
// ModernFeatures removed as requested
import { ModernCTA } from '../../components/landing/ModernCTA';

export default function LandingPage() {
  // Theme state (light/dark)
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  
  // Check for user's preferred theme on initial load
  useEffect(() => {
    // Check if user has a saved preference
    const savedTheme = localStorage.getItem('neda-theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setTheme(savedTheme);
      return;
    }
    
    // Otherwise check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      setTheme('light');
    }
  }, []);
  
  // Toggle theme function
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('neda-theme', newTheme);
  };
  
  return (
    <div className={`min-h-screen ${theme === 'light' ? 'bg-white' : 'bg-black'}`}>
      {/* Modern header with theme toggle */}
      <ModernHeader theme={theme} onThemeToggle={toggleTheme} />
      
      <main>
        {/* Hero section */}
        <ModernHero theme={theme} />
        
        {/* Features section removed as requested */}
        
        {/* CTA section */}
        <ModernCTA theme={theme} />
      </main>
    </div>
  );
}
