'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Twitter, Instagram, Linkedin, Github } from 'lucide-react';

interface ModernFooterProps {
  theme: 'light' | 'dark';
}

export function ModernFooter({ theme }: ModernFooterProps) {
  const footerLinks = [
    {
      title: 'Product',
      links: [
        { name: 'Features', href: '#features' },
        { name: 'Security', href: '#security' },
        { name: 'Pricing', href: '#pricing' },
        { name: 'FAQ', href: '#faq' },
      ]
    },
    {
      title: 'Company',
      links: [
        { name: 'About', href: '#about' },
        { name: 'Blog', href: '#blog' },
        { name: 'Careers', href: '#careers' },
        { name: 'Contact', href: '#contact' },
      ]
    },
    {
      title: 'Legal',
      links: [
        { name: 'Privacy Policy', href: '#privacy' },
        { name: 'Terms of Service', href: '#terms' },
        { name: 'Cookie Policy', href: '#cookies' },
      ]
    }
  ];

  const socialLinks = [
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Github, href: '#', label: 'GitHub' },
  ];

  return (
    <footer className={`py-16 ${
      theme === 'light' ? 'bg-gray-50' : 'bg-gray-900'
    }`}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          <div className="lg:col-span-2">
            <Link href="/landing" className="flex items-center gap-2 mb-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                theme === 'light' ? 'bg-[#0A1F44]' : 'bg-[#0A1F44]'
              }`}>
                <Image 
                  src="/logo.svg" 
                  alt="NEDApay Logo" 
                  width={24} 
                  height={24} 
                  className="w-6 h-6"
                />
              </div>
              <span className={`text-xl font-medium font-display ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                NEDApay
              </span>
            </Link>
            <p className={`mb-6 ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-300'
            }`}>
              The secure and intuitive digital wallet for the modern world. Send, receive, and manage your assets with ease.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a 
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className={`p-2 rounded-full transition-colors ${
                    theme === 'light'
                      ? 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <social.icon size={20} />
                </a>
              ))}
            </div>
          </div>
          
          {footerLinks.map((column) => (
            <div key={column.title}>
              <h3 className={`font-medium mb-4 ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                {column.title}
              </h3>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.name}>
                    <a 
                      href={link.href}
                      className={`text-sm transition-colors ${
                        theme === 'light'
                          ? 'text-gray-600 hover:text-blue-600'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className={`pt-8 mt-8 border-t ${
          theme === 'light' ? 'border-gray-200' : 'border-gray-800'
        }`}>
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className={`text-sm mb-4 md:mb-0 ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-400'
            }`}>
              © {new Date().getFullYear()} NEDApay. All rights reserved.
            </p>
            <div className="flex gap-4">
              <a 
                href="#privacy" 
                className={`text-sm ${
                  theme === 'light'
                    ? 'text-gray-600 hover:text-blue-600'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Privacy Policy
              </a>
              <a 
                href="#terms" 
                className={`text-sm ${
                  theme === 'light'
                    ? 'text-gray-600 hover:text-blue-600'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
