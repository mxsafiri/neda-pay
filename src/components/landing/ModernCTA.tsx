'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ModernCTAProps {
  theme: 'light' | 'dark';
}

export function ModernCTA({ theme }: ModernCTAProps) {
  return (
    <section className={`py-20 ${
      theme === 'light' 
        ? 'bg-gradient-to-b from-gray-50 to-white' 
        : 'bg-gradient-to-b from-gray-900 to-black'
    }`}>
      <div className="container mx-auto px-4">
        <div className={`rounded-3xl overflow-hidden ${
          theme === 'light'
            ? 'bg-[#0254e6]'
            : 'bg-[#0254e6]'
        }`}>
          <div className="relative">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-40 h-40 rounded-full bg-white"></div>
              <div className="absolute bottom-0 right-0 w-60 h-60 rounded-full bg-white"></div>
              <div className="absolute top-1/2 right-1/4 w-20 h-20 rounded-full bg-white"></div>
            </div>
            
            <div className="relative z-10 py-16 px-8 md:px-16 text-center">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-3xl md:text-4xl font-bold mb-4 text-white font-display"
              >
                Ready to experience the future of digital finance?
              </motion.h2>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto"
              >
                Join thousands of users who are already enjoying the benefits of NEDApay&apos;s secure and intuitive wallet.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="text-white/80 text-lg">
                  Use the Connect button above to get started instantly
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
