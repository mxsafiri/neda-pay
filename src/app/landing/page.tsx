'use client';

import React from 'react';
import { ImmersiveHeader } from '@/components/immersive/ImmersiveHeader';
import { ImmersiveHero } from '@/components/immersive/ImmersiveHero';
import { ScrollFeatures } from '@/components/immersive/ScrollFeatures';
import { AnimatedCTA } from '@/components/immersive/AnimatedCTA';
import { ParticleBackground } from '@/components/immersive/ParticleBackground';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#061328] via-primary to-black text-white overflow-x-hidden">
      {/* Particle background for the entire page */}
      <ParticleBackground />
      
      {/* Immersive header with scroll effects */}
      <ImmersiveHeader />
      
      <main>
        {/* Hero section with animated text and interactive elements */}
        <ImmersiveHero />
        
        {/* Features section with scroll-triggered animations */}
        <ScrollFeatures />
        
        {/* CTA section with dynamic background and interactive elements */}
        <AnimatedCTA />
      </main>
    </div>
  );
}
