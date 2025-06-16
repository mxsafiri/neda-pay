'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

export function CTASection() {
  return (
    <section className="container mx-auto px-4 py-16 md:py-24">
      <motion.div 
        className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-white/10"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-lg text-white/80 mb-6 md:mb-0 max-w-xl">
              Join thousands of users who trust NEDApay for their digital asset management. 
              Experience the future of finance today.
            </p>
          </div>
          <Link 
            href="/wallet" 
            className="bg-white text-blue-900 hover:bg-white/90 px-8 py-3 rounded-full text-lg font-medium flex items-center gap-2 transition-all whitespace-nowrap"
          >
            Open Wallet <ChevronRight size={18} />
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
