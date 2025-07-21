'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import { Sun, Moon, Menu, X } from 'lucide-react';

interface ModernHeaderProps {
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}

export function ModernHeader({ theme, onThemeToggle }: ModernHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? theme === 'light'
            ? 'bg-white/90 backdrop-blur-md shadow-sm'
            : 'bg-gray-900/90 backdrop-blur-md shadow-md' 
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/landing" className="flex items-center gap-2 font-display">
            <div className="flex items-center justify-center">
              <Image 
                src="/logo.svg" 
                alt="NEDApay Logo" 
                width={48} 
                height={48} 
                className="w-12 h-12 transition-all duration-200"
                style={{
                  filter: 'brightness(0) saturate(100%) invert(12%) sepia(93%) saturate(7482%) hue-rotate(230deg) brightness(94%) contrast(106%)'
                }}
              />
            </div>
            <span className={`text-xl font-medium ${
              theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>
              NEDApay
            </span>
          </Link>
          
          {/* Desktop Navigation - Removed as requested */}
          <div className="hidden md:flex items-center gap-8"></div>
          
          {/* Right side controls */}
          <div className="flex items-center gap-4">
            {/* Theme toggle */}
            <button
              onClick={onThemeToggle}
              className={`p-2 rounded-full transition-colors ${
                theme === 'light'
                  ? 'hover:bg-gray-100'
                  : 'hover:bg-gray-800'
              }`}
              aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-gray-700" />
              ) : (
                <Sun className="w-5 h-5 text-gray-300" />
              )}
            </button>
            
            {/* Desktop buttons */}
            <Link 
              href="/sign-in" 
              className="hidden md:inline-block px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
              style={{
                color: theme === 'light' ? '#6b7280' : '#d1d5db'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#0254e6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = theme === 'light' ? '#6b7280' : '#d1d5db';
              }}
            >
              Sign In
            </Link>
            
            <Link 
              href="/onboarding" 
              className="hidden md:inline-block px-4 py-2 rounded-full text-sm font-medium text-white transition-all duration-200"
              style={{
                backgroundColor: '#0254e6',
                boxShadow: '0 2px 8px rgba(2, 84, 230, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#0242c7';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(2, 84, 230, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#0254e6';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(2, 84, 230, 0.2)';
              }}
            >
              Open App
            </Link>
            
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-300"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X size={24} className={theme === 'light' ? 'text-gray-900' : 'text-white'} />
              ) : (
                <Menu size={24} className={theme === 'light' ? 'text-gray-900' : 'text-white'} />
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <nav className="flex flex-col gap-4">
              
              <div className="border-t mt-2 pt-2 flex flex-col gap-3">
                <Link 
                  href="/sign-in" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors text-center ${
                    theme === 'light'
                      ? 'text-gray-700 hover:text-[#0A1F44]'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Sign In
                </Link>
                
                <Link 
                  href="/onboarding" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors text-center ${
                    theme === 'light'
                      ? 'bg-[#0A1F44] hover:bg-[#0A1F44]/90 text-white'
                      : 'bg-[#0A1F44] hover:bg-[#0A1F44]/80 text-white'
                  }`}
                >
                  Open App
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
