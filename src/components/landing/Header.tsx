'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export function Header() {
  return (
    <motion.header 
      className="container mx-auto px-4 py-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center">
        <Link href="/landing" className="flex items-center gap-2">
          <Image 
            src="/logo.svg" 
            alt="NEDAwallet Logo" 
            width={40} 
            height={40} 
            className="w-10 h-10"
          />
          <span className="text-2xl font-bold">NEDAwallet</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link 
            href="#features" 
            className="text-white/80 hover:text-white transition-colors hidden md:block"
          >
            Features
          </Link>
          <Link 
            href="/wallet" 
            className="bg-white/10 hover:bg-white/20 backdrop-blur-md px-4 py-2 rounded-full transition-all"
          >
            Open App
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
