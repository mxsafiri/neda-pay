import React from 'react';
import Image from 'next/image';

export default function Loading() {
  return (
    <div className="min-h-screen text-white flex flex-col items-center justify-center p-4">
      <div className="text-center backdrop-blur-sm bg-black/10 p-8 rounded-xl shadow-xl">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Image 
              src="/logo.svg" 
              alt="NEDApay Logo" 
              width={100} 
              height={100} 
              className="w-24 h-24 drop-shadow-lg"
              priority
            />
            <div className="absolute inset-0 animate-pulse bg-purple-500/30 rounded-full blur-2xl"></div>
          </div>
        </div>
        <div className="h-2 w-48 bg-white/10 rounded-full mx-auto overflow-hidden">
          <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-loadingBar"></div>
        </div>
        <p className="mt-4 text-white font-medium tracking-wide">Loading your wallet...</p>
      </div>
    </div>
  );
}
