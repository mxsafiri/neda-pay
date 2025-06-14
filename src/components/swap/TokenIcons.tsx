'use client';

import { FC } from 'react';
import Image from 'next/image';

interface TokenIconProps {
  symbol: string;
  size?: number;
  className?: string;
  icon?: string;
  country?: string;
}

export const TokenIcon: FC<TokenIconProps> = ({ 
  symbol, 
  size = 24,
  className = '',
  icon,
  country
}) => {
  // Get flag icon for the token based on country code
  const getFlagIcon = () => {
    if (!icon) return null;
    
    // Flag icon styling with rounded corners
    const flagStyle = {
      width: size,
      height: size,
      borderRadius: '50%',
      objectFit: 'cover' as const,
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
    };
    
    // Return flag icon image
    return (
      <div 
        className={`relative ${className}`}
        style={{ width: size, height: size }}
      >
        <Image 
          src={`https://flagcdn.com/w80/${icon.toLowerCase()}.png`}
          alt={country || symbol}
          style={flagStyle}
          title={country || symbol}
          width={size}
          height={size}
        />
        <div 
          className="absolute bottom-0 right-0 bg-[#0A1F44] rounded-full flex items-center justify-center"
          style={{ 
            width: size * 0.5, 
            height: size * 0.5, 
            fontSize: size * 0.25,
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          {symbol.slice(0, 1)}
        </div>
      </div>
    );
  };
  
  // Get token icon based on symbol (fallback for tokens without flag icons)
  const getTokenIcon = (tokenSymbol: string) => {
    // If we have a flag icon, use it
    if (icon) {
      return getFlagIcon();
    }
    
    // Otherwise use token-specific SVG or default icon
    switch (tokenSymbol.toUpperCase()) {
      case 'USDC':
        return (
          <svg width={size} height={size} viewBox="0 0 2000 2000" className={className}>
            <circle cx="1000" cy="1000" r="1000" fill="#2775CA"/>
            <path d="M1275.2,976.1c0-145.7-89.8-195.1-269-214.5-130.5-14.3-156.5-43.7-156.5-95.1s41.4-86.4,124.1-86.4c73.5,0,128.3,23.6,151.9,67.9c7.2,13.7,20.1,22.2,35.9,22.2h64.3c26.6,0,46.5-24.3,40-50.2-25.2-100.4-109.8-175.3-220.6-187.5v-108c0-25.1-20.4-45.5-45.5-45.5h-58.9c-25.1,0-45.5,20.4-45.5,45.5v106.5c-137.7,16.5-223.5,100.7-223.5,219.8c0,141.5,85.7,190.8,265,210.2c131.3,16.5,160.5,39.4,160.5,98s-46.5,97.9-138.7,97.9c-108.7,0-146.5-45.8-167.3-91.5-8.6-19.4-27.9-31.5-49.3-31.5h-61.1c-26.6,0-46.5,24.3-40,50.2c27.3,105.5,118.4,180.3,233.2,194.6v107.3c0,25.1,20.4,45.5,45.5,45.5h58.9c25.1,0,45.5-20.4,45.5-45.5v-106.3C1193.3,1164.2,1275.2,1087.6,1275.2,976.1z" fill="white"/>
          </svg>
        );
      case 'USDT':
        return (
          <svg width={size} height={size} viewBox="0 0 2000 2000" className={className}>
            <circle cx="1000" cy="1000" r="1000" fill="#26A17B"/>
            <path d="M1000,500c-276.1,0-500,223.9-500,500h236.1v-0.1h527.8v0.1H1500C1500,723.9,1276.1,500,1000,500z" fill="white"/>
            <path d="M1123.9,866.2c-16.5,0-30-13.4-30-30v-162h-187.8v162c0,16.5-13.4,30-30,30H764.9v263.9h470.2V866.2H1123.9z" fill="white"/>
          </svg>
        );
      default:
        // Default circular placeholder with token symbol
        return (
          <div 
            style={{ 
              width: size, 
              height: size, 
              backgroundColor: '#0A1F44',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: size * 0.5,
              fontWeight: 'bold',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
            className={className}
          >
            {tokenSymbol.slice(0, 1)}
          </div>
        );
    }
  };

  return getTokenIcon(symbol);
};
