'use client';

import { FC } from 'react';
import { motion } from 'framer-motion';
import { theme } from '@/styles/theme';

interface LoadingStateProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

export const LoadingState: FC<LoadingStateProps> = ({ 
  size = 'md', 
  text = 'Loading...', 
  fullScreen = false 
}) => {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };
  
  const containerClasses = fullScreen 
    ? 'fixed inset-0 flex flex-col items-center justify-center backdrop-blur-md z-50' 
    : 'flex flex-col items-center justify-center py-8';
  
  return (
    <div className={containerClasses}>
      <div className="relative">
        <motion.div
          className={`${sizeMap[size]} border-4 border-white/20 rounded-full`}
          style={{ borderTopColor: '#491b8f', borderRightColor: '#1e40af' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className={`absolute inset-0 ${sizeMap[size]} border-4 border-transparent rounded-full`}
          style={{ borderRightColor: '#6d28d9', borderBottomColor: '#1e3a8a' }}
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />
      </div>
      {text && (
        <motion.p 
          className="mt-4 text-white font-medium tracking-wide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};
