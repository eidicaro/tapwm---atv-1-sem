import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../src/context/AuthContext';
import { ThemeProvider, useAppTheme } from '../src/context/ThemeContext';
import { DictionaryProvider } from '../src/context/DictionaryContext';
import { AudioProvider } from '../src/context/AudioContext';

function AppNavigation() {
  const { isDark, colors } = useAppTheme();
  return <><StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={colors.background} /><Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background }, animation: 'fade', animationDuration: 200 }} /></>;
}
export default function RootLayout() {
  return <ThemeProvider><AuthProvider><DictionaryProvider><AudioProvider><AppNavigation /></AudioProvider></DictionaryProvider></AuthProvider></ThemeProvider>;
}