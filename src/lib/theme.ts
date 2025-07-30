/**
 * Modern TweakCN-inspired theme configuration for NEDApay
 * Provides consistent design tokens across all 26 pages
 */

export const nedaTheme = {
  // Primary brand colors - Modern fintech blue palette
  primary: {
    50: '#eff6ff',
    100: '#dbeafe', 
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // Main brand blue
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554'
  },

  // Secondary colors - Sophisticated gray scale
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617'
  },

  // Accent colors - Success, warning, error
  accent: {
    success: {
      50: '#f0fdf4',
      500: '#22c55e',
      600: '#16a34a',
      900: '#14532d'
    },
    warning: {
      50: '#fffbeb',
      500: '#f59e0b',
      600: '#d97706',
      900: '#92400e'
    },
    error: {
      50: '#fef2f2',
      500: '#ef4444',
      600: '#dc2626',
      900: '#7f1d1d'
    }
  },

  // Modern spacing scale
  spacing: {
    xs: '0.5rem',   // 8px
    sm: '0.75rem',  // 12px
    md: '1rem',     // 16px
    lg: '1.5rem',   // 24px
    xl: '2rem',     // 32px
    '2xl': '3rem',  // 48px
    '3xl': '4rem',  // 64px
    '4xl': '6rem',  // 96px
  },

  // Typography scale
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace']
    },
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      base: ['1rem', { lineHeight: '1.5rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    }
  },

  // Border radius scale
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px'
  },

  // Shadow scale
  boxShadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    none: 'none'
  }
}

// Light theme configuration
export const lightTheme = {
  background: {
    primary: nedaTheme.secondary[50],     // #f8fafc
    secondary: nedaTheme.secondary[100],  // #f1f5f9
    tertiary: nedaTheme.secondary[200],   // #e2e8f0
    card: 'rgba(255, 255, 255, 0.8)',
    overlay: 'rgba(255, 255, 255, 0.95)'
  },
  text: {
    primary: nedaTheme.secondary[900],    // #0f172a
    secondary: nedaTheme.secondary[600],  // #475569
    tertiary: nedaTheme.secondary[500],   // #64748b
    inverse: nedaTheme.secondary[50],     // #f8fafc
    accent: nedaTheme.primary[600]        // #2563eb
  },
  border: {
    primary: nedaTheme.secondary[200],    // #e2e8f0
    secondary: nedaTheme.secondary[300],  // #cbd5e1
    accent: nedaTheme.primary[300]        // #93c5fd
  },
  button: {
    primary: {
      bg: nedaTheme.primary[600],         // #2563eb
      text: nedaTheme.secondary[50],      // #f8fafc
      hover: nedaTheme.primary[700]       // #1d4ed8
    },
    secondary: {
      bg: nedaTheme.secondary[100],       // #f1f5f9
      text: nedaTheme.secondary[900],     // #0f172a
      hover: nedaTheme.secondary[200]     // #e2e8f0
    }
  }
}

// Dark theme configuration
export const darkTheme = {
  background: {
    primary: nedaTheme.secondary[950],    // #020617
    secondary: nedaTheme.secondary[900],  // #0f172a
    tertiary: nedaTheme.secondary[800],   // #1e293b
    card: 'rgba(15, 23, 42, 0.8)',
    overlay: 'rgba(15, 23, 42, 0.95)'
  },
  text: {
    primary: nedaTheme.secondary[50],     // #f8fafc
    secondary: nedaTheme.secondary[300],  // #cbd5e1
    tertiary: nedaTheme.secondary[400],   // #94a3b8
    inverse: nedaTheme.secondary[900],    // #0f172a
    accent: nedaTheme.primary[400]        // #60a5fa
  },
  border: {
    primary: nedaTheme.secondary[800],    // #1e293b
    secondary: nedaTheme.secondary[700],  // #334155
    accent: nedaTheme.primary[600]        // #2563eb
  },
  button: {
    primary: {
      bg: nedaTheme.primary[600],         // #2563eb
      text: nedaTheme.secondary[50],      // #f8fafc
      hover: nedaTheme.primary[500]       // #3b82f6
    },
    secondary: {
      bg: nedaTheme.secondary[800],       // #1e293b
      text: nedaTheme.secondary[50],      // #f8fafc
      hover: nedaTheme.secondary[700]     // #334155
    }
  }
}

// Component variants for consistency
export const componentVariants = {
  card: {
    default: 'backdrop-blur-md border transition-all duration-200 hover:shadow-lg',
    elevated: 'backdrop-blur-md border shadow-lg transition-all duration-200 hover:shadow-xl',
    flat: 'border transition-all duration-200'
  },
  button: {
    primary: 'inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium transition-all duration-200 hover:scale-105 active:scale-95',
    secondary: 'inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium transition-all duration-200 hover:scale-105 active:scale-95',
    ghost: 'inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium transition-all duration-200 hover:bg-opacity-10'
  },
  input: {
    default: 'w-full rounded-lg border px-3 py-2 transition-all duration-200 focus:outline-none focus:ring-2',
    large: 'w-full rounded-xl border px-4 py-3 transition-all duration-200 focus:outline-none focus:ring-2'
  }
}

// Animation presets
export const animations = {
  transition: {
    fast: 'transition-all duration-150 ease-out',
    normal: 'transition-all duration-200 ease-out',
    slow: 'transition-all duration-300 ease-out'
  },
  hover: {
    scale: 'hover:scale-105 active:scale-95',
    lift: 'hover:-translate-y-1 hover:shadow-lg',
    glow: 'hover:shadow-lg hover:shadow-primary/25'
  }
}
