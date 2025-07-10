import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  systemTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const useThemeProvider = () => {
  const { user } = useAuth();
  const [theme, setThemeState] = useState<Theme>('system');
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');

  // Detect system theme
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Load user theme preference
  useEffect(() => {
    if (user) {
      loadUserTheme();
    } else {
      // Load from localStorage for non-authenticated users
      const savedTheme = localStorage.getItem('theme') as Theme;
      if (savedTheme) {
        setThemeState(savedTheme);
      }
    }
  }, [user]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    const effectiveTheme = theme === 'system' ? systemTheme : theme;
    
    root.classList.remove('light', 'dark');
    root.classList.add(effectiveTheme);
  }, [theme, systemTheme]);

  const loadUserTheme = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('user_preferences')
      .select('theme')
      .eq('user_id', user.id)
      .single();
    
    if (data?.theme) {
      setThemeState(data.theme as Theme);
    }
  };

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    
    if (user) {
      // Save to database
      await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          theme: newTheme,
        });
    } else {
      // Save to localStorage
      localStorage.setItem('theme', newTheme);
    }
  };

  return {
    theme,
    setTheme,
    systemTheme,
  };
};

export { ThemeContext };