'use client';

import React, { useState } from 'react';
import { Link as LinkIcon } from 'lucide-react';
import { PaymentLinkCreator } from './PaymentLinkCreator';

export function PaymentLinkButton() {
  const [showCreator, setShowCreator] = useState(false);
  
  return (
    <>
      <button 
        onClick={() => setShowCreator(true)} 
        className="bg-white/5 hover:bg-white/10 p-4 rounded-xl flex flex-col items-center justify-center transition-all"
      >
        <LinkIcon className="mb-2 text-purple-400" />
        <span>Payment Link</span>
      </button>
      
      {showCreator && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md">
            <PaymentLinkCreator onClose={() => setShowCreator(false)} />
          </div>
          <button 
            onClick={() => setShowCreator(false)}
            className="absolute top-4 right-4 text-white/70 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}
