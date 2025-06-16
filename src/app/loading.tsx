import React from 'react';
import Image from 'next/image';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#061328] via-primary to-black text-white flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Image 
              src="/logo.svg" 
              alt="NEDApay Logo" 
              width={80} 
              height={80} 
              className="w-20 h-20"
            />
            <div className="absolute inset-0 animate-pulse bg-blue-500/20 rounded-full blur-xl"></div>
          </div>
        </div>
        <div className="h-1.5 w-32 bg-white/10 rounded-full mx-auto overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full animate-loadingBar"></div>
        </div>
        <p className="mt-4 text-white/70">Loading...</p>
      </div>
    </div>
  );
}
