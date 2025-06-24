'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, Copy, Check, Share2 } from 'lucide-react';
import { nanoid } from 'nanoid';

interface PaymentLinkCreatorProps {
  onClose?: () => void;
}

export function PaymentLinkCreator({ onClose }: PaymentLinkCreatorProps) {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [token, setToken] = useState('USDC');
  const [linkId, setLinkId] = useState('');
  const [paymentLink, setPaymentLink] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCreateLink = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate a unique ID for the payment link
    const id = nanoid(10);
    setLinkId(id);
    
    // Create the payment link URL
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/pay/${id}?amount=${amount}&token=${token}`;
    setPaymentLink(link);
    
    // In a real implementation, we would save this to the database
    // For now, we'll just simulate success
    setStep('success');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(paymentLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Payment Request for ${amount} ${token}`,
          text: description || `Payment request of ${amount} ${token}`,
          url: paymentLink,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10"
    >
      {step === 'form' ? (
        <>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Create Payment Link</h3>
          </div>
          
          <form onSubmit={handleCreateLink} className="space-y-4">
            <div>
              <label className="block text-sm text-white/70 mb-1">Amount</label>
              <div className="flex">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="flex-1 bg-white/5 border border-white/10 rounded-l-lg px-3 py-2 text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
                <select
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="bg-white/10 border border-white/10 rounded-r-lg px-3 py-2 text-white focus:outline-none"
                >
                  <option value="USDC">USDC</option>
                  <option value="ETH">ETH</option>
                  <option value="nTZS">nTZS</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-white/70 mb-1">Description (Optional)</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this payment for?"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
              >
                <Link className="w-4 h-4 mr-2" />
                Create Link
              </button>
            </div>
          </form>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Payment Link Created!</h3>
          </div>
          
          <div className="bg-white/5 p-4 rounded-lg mb-4 break-all">
            <p className="text-sm text-white/70">Your payment link:</p>
            <p className="text-sm font-mono">{paymentLink}</p>
          </div>
          
          <div className="flex flex-col space-y-3">
            <button
              onClick={handleCopyLink}
              className="bg-white/10 hover:bg-white/15 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2 text-green-400" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </>
              )}
            </button>
            
            <button
              onClick={handleShare}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Link
            </button>
            
            <button
              onClick={() => {
                setStep('form');
                setAmount('');
                setDescription('');
                setLinkId('');
                setPaymentLink('');
                if (onClose) onClose();
              }}
              className="text-white/70 hover:text-white text-sm text-center mt-2"
            >
              Create Another Link
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
}
