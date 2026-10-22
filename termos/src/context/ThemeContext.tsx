import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance, Platform } from 'react-native';
import { AppColors, darkColors, lightColors } from '../../app/theme';

type ThemeMode = 'light' | 'dark';
type ThemeContextValue = { mode: ThemeMode; isDark: boolean; colors: AppColors; toggleTheme: () => void };
const ThemeContext = createContext<ThemeContextValue>({ mode: 'dark', isDark: true, colors: darkColors, toggleTheme: () => undefined });
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // A stable server/client initial value avoids hydration mismatches in static exports.
  const [mode, setMode] = useState<ThemeMode>('dark');
  useEffect(() => {
    let initial: ThemeMode = Appearance.getColorScheme() === 'light' ? 'light' : 'dark';
    if (Platform.OS === 'web') {
      try { const saved = window.localStorage.getItem('dicionario-theme'); if (saved === 'light' || saved === 'dark') initial = saved; } catch { /* Storage is optional (private/restricted browsers). */ }
    }
    setMode(initial);
  }, []);
  useEffect(() => {
    if (Platform.OS === 'web') { document.documentElement.dataset.theme = mode; document.documentElement.lang = 'pt-BR'; document.documentElement.style.colorScheme = mode; }
  }, [mode]);
  const value = useMemo<ThemeContextValue>(() => ({
    mode, isDark: mode === 'dark', colors: mode === 'dark' ? darkColors : lightColors,
    toggleTheme: () => setMode(current => {
      const next = current === 'dark' ? 'light' : 'dark';
      if (Platform.OS === 'web') { try { window.localStorage.setItem('dicionario-theme', next); } catch { /* Theme still works without persistence. */ } }
      return next;
    }),
  }), [mode]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
export function useAppTheme() { return useContext(ThemeContext); }