'use client';

import { useState, useEffect } from 'react';
import { Token } from './TokenSelector';

interface SwapInputProps {
  token: Token;
  amount: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  label?: string;
  showMax?: boolean;
}

export function SwapInput({
  token,
  amount,
  onChange,
  disabled = false,
  label,
  showMax = false
}: SwapInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  
  // Format balance for display
  const formattedBalance = token.balance;
  
  // Handle max button click
  const handleMaxClick = () => {
    if (disabled) return;
    // Remove commas and convert to number
    const numericBalance = token.balance.replace(/,/g, '');
    onChange(numericBalance);
  };

  return (
    <div className={`bg-white/5 backdrop-blur-sm p-4 rounded-xl border transition-all ${
      isFocused ? 'border-primary/50' : 'border-white/10'
    }`}>
      {label && (
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm text-white/70">{label}</label>
          {showMax && (
            <button
              onClick={handleMaxClick}
              className="text-xs text-primary hover:text-primary/80 transition-colors"
              disabled={disabled}
            >
              MAX
            </button>
          )}
        </div>
      )}
      
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <input
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(e) => {
              // Only allow numbers and decimals
              const value = e.target.value;
              if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
                onChange(value);
              }
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled}
            className={`w-full bg-transparent text-2xl font-medium outline-none ${
              disabled ? 'text-white/70 cursor-not-allowed' : 'text-white'
            }`}
          />
          <div className="flex justify-between items-center mt-1">
            <p className="text-sm text-white/60">
              Balance: {formattedBalance} {token.symbol}
            </p>
            {amount && !disabled && (
              <p className="text-sm text-white/60">
                ≈ ${parseFloat(amount.replace(/,/g, '')).toFixed(2)}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
