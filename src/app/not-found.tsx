import React from 'react';

// Prevent Next.js from prerendering this page
export const dynamic = 'force-dynamic';
import Image from 'next/image';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#061328] via-primary to-black text-white flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <Image 
            src="/logo.svg" 
            alt="NEDApay Logo" 
            width={80} 
            height={80} 
            className="w-20 h-20"
          />
        </div>
        <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
        <p className="mb-6 text-white/70">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-full text-white font-medium transition-all inline-block"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}
