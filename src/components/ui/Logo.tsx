import Image from 'next/image'
import { cn } from '@/lib/utils'

interface LogoProps {
  variant?: 'symbol' | 'primary' | 'vertical' | 'wordmark' | 'white'
  className?: string
  size?: number
}

export function Logo({ 
  variant = 'primary',
  className,
  size = 32
}: LogoProps) {
  const variants = {
    symbol: '/logo/NEDApay Logo Symbol (1)-01.svg',
    primary: '/logo/NEDApay Logo Symbol (1)-01.svg', // Using new logo for primary as well
    vertical: '/logo/neda-vertical.svg',
    wordmark: '/logo/neda-wordmark.svg',
    white: '/logo/NEDApay Logo Symbol (1)-01.svg' // Using the same logo for white variant
  }

  return (
    <div className={cn('relative flex items-center', className)}>
      <Image
        src={variants[variant]}
        alt="NEDApay Logo"
        width={size}
        height={variant === 'vertical' ? size * 1.5 : size}
        priority
      />
    </div>
  )
}
