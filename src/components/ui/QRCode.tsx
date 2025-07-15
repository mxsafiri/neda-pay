'use client';

import React from 'react';
import Image from 'next/image';

interface QRCodeProps {
  value: string;
  size?: number;
  bgColor?: string;
}

/**
 * A simple QR code component that uses the Google Charts API to generate QR codes
 * This is a fallback for when qrcode.react is not available
 */
export const QRCode: React.FC<QRCodeProps> = ({
  value,
  size = 200,
  bgColor = 'white'
}) => {
  const encodedValue = encodeURIComponent(value);
  const src = `https://chart.googleapis.com/chart?cht=qr&chl=${encodedValue}&chs=${size}x${size}&choe=UTF-8&chld=L|2`;
  
  return (
    <Image 
      src={src}
      alt={`QR code for ${value}`}
      width={size}
      height={size}
      style={{ backgroundColor: bgColor }}
      priority
    />
  );
};
