'use client';

import { FC } from 'react';

interface TokenIconProps {
  symbol: string;
  size?: number;
  className?: string;
}

export const TokenIcon: FC<TokenIconProps> = ({ 
  symbol, 
  size = 24,
  className = ''
}) => {
  // Map of token symbols to their SVG icons
  const getTokenIcon = (tokenSymbol: string) => {
    switch (tokenSymbol.toUpperCase()) {
      case 'USDC':
        return (
          <svg width={size} height={size} viewBox="0 0 2000 2000" className={className}>
            <circle cx="1000" cy="1000" r="1000" fill="#2775CA"/>
            <path d="M1275.2,976.1c0-145.7-89.8-195.1-269-214.5-130.5-14.3-156.5-43.7-156.5-95.1s41.4-86.4,124.1-86.4c73.5,0,128.3,23.6,151.9,67.9c7.2,13.7,20.1,22.2,35.9,22.2h64.3c26.6,0,46.5-24.3,40-50.2-25.2-100.4-109.8-175.3-220.6-187.5v-108c0-25.1-20.4-45.5-45.5-45.5h-58.9c-25.1,0-45.5,20.4-45.5,45.5v106.5c-137.7,16.5-223.5,100.7-223.5,219.8c0,141.5,85.7,190.8,265,210.2c131.3,16.5,160.5,39.4,160.5,98s-46.5,97.9-138.7,97.9c-108.7,0-146.5-45.8-167.3-91.5-8.6-19.4-27.9-31.5-49.3-31.5h-61.1c-26.6,0-46.5,24.3-40,50.2c27.3,105.5,118.4,180.3,233.2,194.6v107.3c0,25.1,20.4,45.5,45.5,45.5h58.9c25.1,0,45.5-20.4,45.5-45.5v-106.3C1193.3,1164.2,1275.2,1087.6,1275.2,976.1z" fill="white"/>
          </svg>
        );
      case 'ETH':
        return (
          <svg width={size} height={size} viewBox="0 0 784.37 1277.39" className={className}>
            <polygon fill="#343434" points="392.07,0 383.5,29.11 383.5,873.74 392.07,882.29 784.13,650.54 "/>
            <polygon fill="#8C8C8C" points="392.07,0 -0,650.54 392.07,882.29 392.07,472.33 "/>
            <polygon fill="#3C3C3B" points="392.07,956.52 387.24,962.41 387.24,1263.28 392.07,1277.38 784.37,724.89 "/>
            <polygon fill="#8C8C8C" points="392.07,1277.38 392.07,956.52 -0,724.89 "/>
            <polygon fill="#141414" points="392.07,882.29 784.13,650.54 392.07,472.33 "/>
            <polygon fill="#393939" points="0,650.54 392.07,882.29 392.07,472.33 "/>
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
      case 'BTC':
        return (
          <svg width={size} height={size} viewBox="0 0 2000 2000" className={className}>
            <circle cx="1000" cy="1000" r="1000" fill="#F7931A"/>
            <path d="M1437.5,936.1c-35.7-151.1-173.1-202.3-313.7-217.6l0-218.5l-132.1,0l0,212.9c-34.7,0-70.2,0.7-105.6,1.4l0-214.3l-132,0l0,218.5c-28.7,0.6-56.8,1.2-84.2,1.2l0-0.5l-182.2,0l0,141.2c0,0,97.4-1.8,95.8,0c53.7,0,71.2,31.1,77.5,58.1l0,245.5l0,344.1c-2.4,17.2-12.6,44.7-49.2,44.7c1.7,1.5-95.8,0-95.8,0l-26.1,157.7l171.9,0c32,0,63.6,0.6,94.5,0.8l0,220.4l132,0l0-218.2c36.2,0.7,71.2,1.3,105.6,1.3l0,217l132.1,0l0-219.2c226.9-12.8,378.5-77.2,398.1-312.1C1544.9,1068.5,1462.8,1038.9,1437.5,936.1z M1006.9,1113.9c-82.9,0-228.2-26.1-228.2-117.1c0-87.8,145.3-116.5,228.2-116.5c84.8,0,230.7,30.5,230.7,116.5C1237.6,1087.8,1091.7,1113.9,1006.9,1113.9z M1006.9,1419.1c-100.7,0-275.8-31.7-275.8-141.8c0-106.2,175.1-141.2,275.8-141.2c102.6,0,277.7,36.8,277.7,141.2C1284.6,1387.4,1109.5,1419.1,1006.9,1419.1z" fill="white"/>
          </svg>
        );
      case 'DAI':
        return (
          <svg width={size} height={size} viewBox="0 0 2000 2000" className={className}>
            <circle cx="1000" cy="1000" r="1000" fill="#F5AC37"/>
            <path d="M1000,200L500,1000l500,800l500-800L1000,200z M806.8,983.8v-175h386.4v175H806.8z M806.8,1191.2v-175h386.4v175H806.8z" fill="white"/>
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
