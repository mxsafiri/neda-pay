'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { nedaTheme, lightTheme, darkTheme, componentVariants, animations } from '@/lib/theme'

type ThemeMode = 'light' | 'dark'

interface ModernThemeContextType {
  mode: ThemeMode
  toggleMode: () => void
  theme: typeof lightTheme
  variants: typeof componentVariants
  animations: typeof animations
  colors: typeof nedaTheme
}

const ModernThemeContext = createContext<ModernThemeContextType | undefined>(undefined)

interface ModernThemeProviderProps {
  children: React.ReactNode
  defaultMode?: ThemeMode
}

export function ModernThemeProvider({ 
  children, 
  defaultMode = 'dark' 
}: ModernThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>(defaultMode)

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedMode = localStorage.getItem('neda-theme-mode') as ThemeMode
    if (savedMode && (savedMode === 'light' || savedMode === 'dark')) {
      setMode(savedMode)
    }
  }, [])

  // Save theme to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('neda-theme-mode', mode)
    
    // Update CSS custom properties for smooth transitions
    const root = document.documentElement
    const currentTheme = mode === 'light' ? lightTheme : darkTheme
    
    // Set CSS variables for consistent theming
    root.style.setProperty('--bg-primary', currentTheme.background.primary)
    root.style.setProperty('--bg-secondary', currentTheme.background.secondary)
    root.style.setProperty('--bg-tertiary', currentTheme.background.tertiary)
    root.style.setProperty('--bg-card', currentTheme.background.card)
    root.style.setProperty('--bg-overlay', currentTheme.background.overlay)
    
    root.style.setProperty('--text-primary', currentTheme.text.primary)
    root.style.setProperty('--text-secondary', currentTheme.text.secondary)
    root.style.setProperty('--text-tertiary', currentTheme.text.tertiary)
    root.style.setProperty('--text-accent', currentTheme.text.accent)
    
    root.style.setProperty('--border-primary', currentTheme.border.primary)
    root.style.setProperty('--border-secondary', currentTheme.border.secondary)
    root.style.setProperty('--border-accent', currentTheme.border.accent)
    
    root.style.setProperty('--btn-primary-bg', currentTheme.button.primary.bg)
    root.style.setProperty('--btn-primary-text', currentTheme.button.primary.text)
    root.style.setProperty('--btn-primary-hover', currentTheme.button.primary.hover)
    
    root.style.setProperty('--btn-secondary-bg', currentTheme.button.secondary.bg)
    root.style.setProperty('--btn-secondary-text', currentTheme.button.secondary.text)
    root.style.setProperty('--btn-secondary-hover', currentTheme.button.secondary.hover)
    
  }, [mode])

  const toggleMode = () => {
    setMode(prev => prev === 'light' ? 'dark' : 'light')
  }

  const currentTheme = mode === 'light' ? lightTheme : darkTheme

  const value: ModernThemeContextType = {
    mode,
    toggleMode,
    theme: currentTheme,
    variants: componentVariants,
    animations,
    colors: nedaTheme
  }

  return (
    <ModernThemeContext.Provider value={value}>
      <div 
        className={`min-h-screen transition-colors duration-300 ${mode}`}
        style={{
          backgroundColor: currentTheme.background.primary,
          color: currentTheme.text.primary
        }}
      >
        {children}
      </div>
    </ModernThemeContext.Provider>
  )
}

export function useModernTheme() {
  const context = useContext(ModernThemeContext)
  if (context === undefined) {
    throw new Error('useModernTheme must be used within a ModernThemeProvider')
  }
  return context
}

// Utility function to get theme-aware classes
export function getThemeClasses(mode: ThemeMode) {
  
  return {
    // Background classes
    bgPrimary: mode === 'light' ? 'bg-slate-50' : 'bg-slate-950',
    bgSecondary: mode === 'light' ? 'bg-slate-100' : 'bg-slate-900',
    bgTertiary: mode === 'light' ? 'bg-slate-200' : 'bg-slate-800',
    bgCard: mode === 'light' ? 'bg-white/80' : 'bg-slate-900/80',
    
    // Text classes
    textPrimary: mode === 'light' ? 'text-slate-900' : 'text-slate-50',
    textSecondary: mode === 'light' ? 'text-slate-600' : 'text-slate-300',
    textTertiary: mode === 'light' ? 'text-slate-500' : 'text-slate-400',
    textAccent: mode === 'light' ? 'text-blue-600' : 'text-blue-400',
    
    // Border classes
    borderPrimary: mode === 'light' ? 'border-slate-200' : 'border-slate-800',
    borderSecondary: mode === 'light' ? 'border-slate-300' : 'border-slate-700',
    borderAccent: mode === 'light' ? 'border-blue-300' : 'border-blue-600',
    
    // Button classes
    btnPrimary: mode === 'light' 
      ? 'bg-blue-600 text-white hover:bg-blue-700' 
      : 'bg-blue-600 text-white hover:bg-blue-500',
    btnSecondary: mode === 'light'
      ? 'bg-slate-100 text-slate-900 hover:bg-slate-200'
      : 'bg-slate-800 text-slate-50 hover:bg-slate-700'
  }
}
