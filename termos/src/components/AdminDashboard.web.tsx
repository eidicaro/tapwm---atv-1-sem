import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import Head from 'expo-router/head';
import { useIsFocused } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../context/ThemeContext';
import { useDictionary } from '../context/DictionaryContext';
import { adminRepository } from '../lib/adminRepository';
import AdminWorkspace from './AdminWorkspace.web';

export default function AdminDashboard() {
  const { user, loading, logout } = useAuth();
  const { isDark, toggleTheme } = useAppTheme();
  const { reload } = useDictionary();
  const router = useRouter();
  const focused = useIsFocused();
  const leaving = useRef(false);
  useEffect(() => { if (focused && !loading && !user && !leaving.current) router.replace('/login'); }, [focused, loading, user, router]);
  if (!focused) return null;
  return <><Head><title>Painel administrativo | Dicionário Tech</title><meta name="robots" content="noindex,nofollow" /></Head>{loading || !user ? <div className="admin-root admin-auth-loading" role="status"><span className="spinner" />Verificando sua sessão…</div> : <AdminWorkspace repository={adminRepository} isDark={isDark} toggleTheme={toggleTheme} onDictionaryChange={reload} onLogout={async () => {
    leaving.current = true;
    try { await logout(); router.replace('/'); }
    catch (error) { leaving.current = false; throw error; }
  }} />}</>;
}
