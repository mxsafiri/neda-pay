'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

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
        <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
        <p className="mb-6 text-white/70">
          We apologize for the inconvenience. Please try again or return to the homepage.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-full text-white font-medium transition-all"
          >
            Try again
          </button>
          <Link
            href="/"
            className="bg-white/10 hover:bg-white/20 backdrop-blur-md px-6 py-3 rounded-full text-white font-medium transition-all"
          >
            Return home
          </Link>
        </div>
      </div>
    </div>
  );
}
