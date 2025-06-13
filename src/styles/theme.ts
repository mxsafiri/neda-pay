export const theme = {
  colors: {
    primary: '#0A1F44', // Navy Blue
    secondary: '#FFFFFF', // White
    background: {
      dark: '#000000',
      light: '#FFFFFF',
    },
    text: {
      primary: '#0A1F44',
      secondary: '#6B7280',
      inverse: '#FFFFFF',
    },
    accent: {
      blue: '#2563EB',
      green: '#10B981',
    }
  },
  fonts: {
    sans: 'var(--font-geist-sans)', // Modern sans-serif font
    mono: 'var(--font-geist-mono)',
  },
  spacing: {
    px: '1px',
    0: '0',
    0.5: '0.125rem',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    DEFAULT: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  }
} as const;
