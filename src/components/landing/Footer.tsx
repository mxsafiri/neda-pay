'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Twitter, Github, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-white/10 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/landing" className="flex items-center gap-2 mb-4">
              <Image 
                src="/logo.svg" 
                alt="NEDApay Logo" 
                width={30} 
                height={30} 
                className="w-6 h-6"
              />
              <span className="text-xl font-bold">NEDApay</span>
            </Link>
            <p className="text-white/60 mb-4 max-w-md">
              The future of digital finance. Send, receive, and manage your digital assets with NEDApay's secure and intuitive wallet.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="text-white/60 hover:text-white transition-colors">
                <Twitter size={20} />
              </Link>
              <Link href="#" className="text-white/60 hover:text-white transition-colors">
                <Github size={20} />
              </Link>
              <Link href="#" className="text-white/60 hover:text-white transition-colors">
                <Linkedin size={20} />
              </Link>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#features" className="text-white/60 hover:text-white transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/wallet" className="text-white/60 hover:text-white transition-colors">
                  Wallet
                </Link>
              </li>
              <li>
                <Link href="#" className="text-white/60 hover:text-white transition-colors">
                  Security
                </Link>
              </li>
              <li>
                <Link href="#" className="text-white/60 hover:text-white transition-colors">
                  Roadmap
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-white/60 hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="#" className="text-white/60 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="#" className="text-white/60 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-white/60 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-white/60 mb-4 md:mb-0">
            © {new Date().getFullYear()} NEDApay. All rights reserved.
          </div>
          <div className="flex gap-6">
            <Link href="#" className="text-sm text-white/60 hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="#" className="text-sm text-white/60 hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="#" className="text-sm text-white/60 hover:text-white transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
