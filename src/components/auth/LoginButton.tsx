'use client';

import { FC } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Wallet } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface LoginButtonProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoginButton: FC<LoginButtonProps> = ({ 
  className = '',
  size = 'md',
}) => {
  const { authenticated, login, activeAddress } = useAuth();
  const router = useRouter();
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };
  
  const displayAddress = activeAddress 
    ? `${activeAddress.slice(0, 6)}...${activeAddress.slice(-4)}`
    : '';
    
  const handleClick = () => {
    if (authenticated) {
      router.push('/wallet');
    } else {
      login();
    }
  };

  return (
    <motion.button
      className={`flex items-center gap-2 bg-primary hover:bg-primary/90 text-white rounded-xl transition-colors font-medium ${sizeClasses[size]} ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
    >
      <Wallet className="w-5 h-5" />
      {authenticated ? displayAddress : 'Connect Wallet'}
    </motion.button>
  );
};
