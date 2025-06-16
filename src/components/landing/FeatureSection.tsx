'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Shield, Globe, ArrowUpDown, CreditCard, Lock } from 'lucide-react';

export function FeatureSection() {
  const features = [
    {
      icon: <Zap size={24} />,
      title: "Fast Transactions",
      description: "Send and receive payments instantly with minimal fees across the globe."
    },
    {
      icon: <Shield size={24} />,
      title: "Secure Wallet",
      description: "Your assets are protected with industry-leading security protocols and encryption."
    },
    {
      icon: <Globe size={24} />,
      title: "Global Access",
      description: "Access your wallet from anywhere in the world, on any device."
    },
    {
      icon: <ArrowUpDown size={24} />,
      title: "Token Swaps",
      description: "Exchange digital assets seamlessly with competitive rates and low slippage."
    },
    {
      icon: <CreditCard size={24} />,
      title: "Easy Onboarding",
      description: "Get started quickly with our intuitive interface and simple verification process."
    },
    {
      icon: <Lock size={24} />,
      title: "Self-Custody",
      description: "Maintain full control of your assets with non-custodial wallet technology."
    }
  ];

  return (
    <section id="features" className="container mx-auto px-4 py-16 md:py-24">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose NEDApay</h2>
        <p className="text-lg text-white/70 max-w-2xl mx-auto">
          Experience the future of digital finance with our comprehensive suite of features designed for security, speed, and simplicity.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <FeatureCard 
            key={index}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
            delay={index * 0.1}
          />
        ))}
      </div>
    </section>
  );
}

function FeatureCard({ icon, title, description, delay }: { 
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <motion.div 
      className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 h-full"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      viewport={{ once: true }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <div className="bg-blue-500/20 p-3 rounded-full w-fit mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-medium mb-3">{title}</h3>
      <p className="text-white/70">{description}</p>
    </motion.div>
  );
}
