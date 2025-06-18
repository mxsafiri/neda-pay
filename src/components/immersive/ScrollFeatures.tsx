'use client';

import React from 'react';
import { Shield, Zap, Globe, Coins } from 'lucide-react';
import { motion } from 'framer-motion';

// Using Framer Motion for animations instead of anime.js

interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
}

const Feature = ({ icon, title, description, index }: FeatureProps): React.ReactElement => {
  // Use a single motion component with nested HTML for better performance
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ 
        duration: 0.6, 
        ease: "easeOut",
        delay: index * 0.1 
      }}
      className="bg-white/5 backdrop-blur-lg rounded-2xl p-6"
    >
      <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">
        {title}
      </h3>
      <p className="text-white/70">
        {description}
      </p>
    </motion.div>
  );
};

export function ScrollFeatures() {
  
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
    <section className="py-20 relative">
      <div className="container mx-auto px-4">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-3xl md:text-4xl font-bold text-center mb-16"
        >
          Why Choose NEDA Pay
        </motion.h2>
        
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
