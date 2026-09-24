import { createContext, useContext, useMemo, useState } from 'react';
import { Appearance, Platform } from 'react-native';
import { AppColors, darkColors, lightColors } from '../../app/theme';

type ThemeMode = 'light' | 'dark';
type ThemeContextValue = { mode: ThemeMode; isDark: boolean; colors: AppColors; toggleTheme: () => void };

const ThemeContext = createContext<ThemeContextValue>({ mode: 'dark', isDark: true, colors: darkColors, toggleTheme: () => undefined });

function initialMode(): ThemeMode {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const saved = window.localStorage?.getItem('dicionario-theme');
    if (saved === 'light' || saved === 'dark') return saved;
  }
  return Appearance.getColorScheme() === 'light' ? 'light' : 'dark';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(initialMode);
  const value = useMemo<ThemeContextValue>(() => ({
    mode, isDark: mode === 'dark', colors: mode === 'dark' ? darkColors : lightColors,
    toggleTheme: () => setMode((current) => {
      const next = current === 'dark' ? 'light' : 'dark';
      if (Platform.OS === 'web' && typeof window !== 'undefined') window.localStorage?.setItem('dicionario-theme', next);
      return next;
    }),
  }), [mode]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() { return useContext(ThemeContext); }
