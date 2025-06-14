'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import Image from 'next/image';
import { TokenIcon } from './TokenIcons';

export interface Token {
  symbol: string;
  name: string;
  balance: string;
  icon: string;
  country?: string;
  logoUrl?: string;
}

interface TokenSelectorProps {
  selectedToken: Token;
  tokens: Token[];
  onSelect: (token: Token) => void;
  label?: string;
}

export function TokenSelector({
  selectedToken,
  tokens,
  onSelect,
  label
}: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter tokens based on search query
  const filteredTokens = tokens.filter(token => 
    token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
    token.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    setSearchQuery('');
  };

  const handleSelect = (token: Token) => {
    onSelect(token);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {label && (
        <label className="block text-sm text-white/70 mb-2">{label}</label>
      )}
      
      <button
        onClick={handleToggle}
        className="flex items-center gap-2 bg-white/10 hover:bg-white/15 transition-colors px-4 py-3 rounded-xl w-full"
      >
        <div className="flex items-center gap-2 flex-1">
          <TokenIcon 
            symbol={selectedToken.symbol}
            icon={selectedToken.icon}
            country={selectedToken.country}
            size={24}
          />
          <span className="font-medium">{selectedToken.symbol}</span>
          <span className="text-white/60 text-sm hidden sm:inline">{selectedToken.name}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-white/60 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-2 w-full bg-[#0A1F44] border border-white/10 rounded-xl shadow-lg overflow-hidden"
          >
            <div className="p-3 border-b border-white/10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search tokens"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 pl-10 pr-10 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            
            <div className="max-h-60 overflow-y-auto py-2">
              {filteredTokens.length > 0 ? (
                filteredTokens.map((token) => (
                  <button
                    key={token.symbol}
                    onClick={() => handleSelect(token)}
                    className={`flex items-center gap-3 w-full px-4 py-3 hover:bg-white/5 transition-colors ${
                      selectedToken.symbol === token.symbol ? 'bg-white/10' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <TokenIcon 
                        symbol={token.symbol}
                        icon={token.icon}
                        country={token.country}
                        size={24}
                      />
                      <div className="text-left">
                        <div className="font-medium">{token.symbol}</div>
                        <div className="text-white/60 text-xs">{token.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">{token.balance}</div>
                      {selectedToken.symbol === token.symbol && (
                        <Check className="w-4 h-4 text-primary ml-auto" />
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-6 text-center text-white/60">
                  No tokens found matching "{searchQuery}"
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
