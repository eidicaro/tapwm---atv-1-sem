import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../src/context/AuthContext';
import { ThemeProvider, useAppTheme } from '../src/context/ThemeContext';

function AppNavigation() {
  const { isDark, colors } = useAppTheme();
  return <><StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={colors.background} /><Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} /></>;
}

export default function RootLayout() {
  return (
    <ThemeProvider><AuthProvider><AppNavigation /></AuthProvider></ThemeProvider>
  );
}
