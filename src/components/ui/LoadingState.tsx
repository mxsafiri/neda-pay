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
    ? 'fixed inset-0 flex flex-col items-center justify-center bg-primary/90 backdrop-blur-md z-50' 
    : 'flex flex-col items-center justify-center py-8';
  
  return (
    <div className={containerClasses}>
      <div className="relative">
        <motion.div
          className={`${sizeMap[size]} border-4 border-white/20 rounded-full`}
          style={{ borderTopColor: theme.colors.primary }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className={`absolute inset-0 ${sizeMap[size]} border-4 border-transparent rounded-full`}
          style={{ borderRightColor: 'rgba(255, 255, 255, 0.8)' }}
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />
      </div>
      {text && (
        <motion.p 
          className="mt-4 text-white/80 font-medium"
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
