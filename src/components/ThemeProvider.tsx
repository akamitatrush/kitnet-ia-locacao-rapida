import React from 'react';
import { ThemeContext, useThemeProvider } from '@/hooks/useTheme';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const themeProvider = useThemeProvider();

  return (
    <ThemeContext.Provider value={themeProvider}>
      {children}
    </ThemeContext.Provider>
  );
};