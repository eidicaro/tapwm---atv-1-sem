import { useRef, useState } from 'react';
import { Icon } from './WebIcon';
import { AdminBrand } from './AdminWorkspace.web';
import type { IconName } from './WebIcon';
import './experience.css';
import './admin.css';

const benefits: { icon: IconName; title: string; description: string }[] = [
  { icon: 'checkmark-circle-outline', title: 'Conteúdo de qualidade', description: 'com revisão da comunidade' },
  { icon: 'people-outline', title: 'Mais pessoas aprendendo', description: 'tecnologia sem complicação' },
  { icon: 'bar-chart-outline', title: 'Impacto real', description: 'conhecimento acessível a todos' },
];
export default function LoginView({ login, isDark, toggleTheme, onSuccess }: { login: (email: string, password: string) => Promise<void>; isDark: boolean; toggleTheme: () => void; onSuccess: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const lock = useRef(false);
  const emailInput = useRef<HTMLInputElement>(null);
  const passwordInput = useRef<HTMLInputElement>(null);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (lock.current) return;
    const invalid = { ...(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ? { email: 'Informe um email válido.' } : {}), ...(!password ? { password: 'Informe sua senha.' } : {}) };
    setErrors(invalid); setError('');
    if (invalid.email || invalid.password) { (invalid.email ? emailInput : passwordInput).current?.focus(); return; }
    lock.current = true; setBusy(true);
    try { await login(email.trim(), password); onSuccess(); }
    catch { setError('Não foi possível entrar. Confira suas credenciais e sua conexão e tente novamente.'); }
    finally { lock.current = false; setBusy(false); }
  };
  return <div className="admin-root admin-login"><header className="admin-login-header"><AdminBrand /><div className="admin-login-tools"><a className="admin-utility" href="/"><Icon name="arrow-back-outline" size={18} />Voltar ao site</a><button type="button" className="icon-button" aria-label={`Ativar tema ${isDark ? 'claro' : 'escuro'}`} onClick={toggleTheme}><Icon name={isDark ? 'sunny-outline' : 'moon-outline'} /></button></div></header>
    <main className="admin-login-layout"><section className="admin-login-copy" aria-labelledby="login-intro"><p className="eyebrow">PAINEL ADMINISTRATIVO</p><h1 id="login-intro">Conhecimento<br /> bem cuidado<br /> <em>transforma.</em></h1><p className="admin-login-description">Revise contribuições, gerencie termos e mantenha nosso dicionário simples, correto e acessível.</p><ul className="admin-login-benefits">{benefits.map(item => <li key={item.title}><span className="feature-icon tone-green"><Icon name={item.icon} size={25} /></span><div><h2>{item.title}</h2><p>{item.description}</p></div></li>)}</ul></section>
      <section className="admin-login-card admin-surface" aria-labelledby="login-title"><span className="feature-icon tone-green"><Icon name="lock-closed-outline" size={27} /></span><h2 id="login-title">Bem-vindo de volta</h2><p>Entre com suas credenciais de administrador.</p><form noValidate onSubmit={event => void submit(event)} aria-busy={busy}>
        <label htmlFor="admin-email">EMAIL</label><div className={`admin-login-field ${errors.email ? 'invalid' : ''}`}><Icon name="mail-outline" size={20} /><input id="admin-email" ref={emailInput} name="email" type="email" value={email} onChange={event => { setEmail(event.target.value); setErrors(current => ({ ...current, email: undefined })); }} required autoComplete="username" autoCapitalize="none" placeholder="seu@email.com" disabled={busy} aria-invalid={!!errors.email} aria-describedby={errors.email ? 'login-email-error' : undefined} /></div>{errors.email && <p className="field-error" id="login-email-error">{errors.email}</p>}
        <label htmlFor="admin-password">SENHA</label><div className={`admin-login-field ${errors.password ? 'invalid' : ''}`}><Icon name="lock-closed-outline" size={19} /><input id="admin-password" ref={passwordInput} name="password" type={showPassword ? 'text' : 'password'} value={password} onChange={event => { setPassword(event.target.value); setErrors(current => ({ ...current, password: undefined })); }} required autoComplete="current-password" placeholder="Sua senha" disabled={busy} aria-invalid={!!errors.password} aria-describedby={errors.password ? 'login-password-error' : undefined} /><button type="button" aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} aria-pressed={showPassword} onClick={() => setShowPassword(value => !value)} disabled={busy}><Icon name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={21} /></button></div>{errors.password && <p className="field-error" id="login-password-error">{errors.password}</p>}
        {error && <div className="admin-notice error" role="alert"><Icon name="alert-circle-outline" size={19} /><span>{error}</span></div>}
        <button type="submit" className="admin-button primary admin-login-submit" disabled={busy}>{busy ? <><span className="spinner" />Entrando…</> : <>Entrar no painel <Icon name="arrow-forward-outline" size={20} /></>}</button><p className="admin-login-note"><Icon name="shield-checkmark-outline" size={18} />Ambiente seguro e de acesso restrito</p>
      </form></section></main><footer className="admin-login-footer">Lar São Francisco <span aria-hidden="true">·</span> {new Date().getFullYear()}</footer>
  </div>;
}
