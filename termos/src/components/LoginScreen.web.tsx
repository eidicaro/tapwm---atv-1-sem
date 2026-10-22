import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import Head from 'expo-router/head';
import { useIsFocused } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../context/ThemeContext';
import LoginView from './LoginView.web';

export default function LoginScreen() {
  const { login, user, loading } = useAuth();
  const { isDark, toggleTheme } = useAppTheme();
  const router = useRouter();
  const focused = useIsFocused();
  useEffect(() => { if (focused && !loading && user) router.replace('/admin'); }, [focused, loading, user, router]);
  if (!focused) return null;
  return <><Head><title>Acesso administrativo | Dicionário Tech</title><meta name="robots" content="noindex,nofollow" /></Head>{loading || user ? <div className="admin-root admin-auth-loading" role="status"><span className="spinner" />Verificando sua sessão…</div> : <LoginView login={login} isDark={isDark} toggleTheme={toggleTheme} onSuccess={() => router.replace('/admin')} />}</>;
}
