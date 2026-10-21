import { useEffect, useRef, useState } from 'react';
import { Link, usePathname, useRouter } from 'expo-router';
import { useAppTheme } from '../context/ThemeContext';
import { Icon, Search } from './WebUI';

export default function SiteHeader() {
  const { isDark, toggleTheme } = useAppTheme();
  const path = usePathname();
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const clicks = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setSearchOpen(value => !value); } };
    window.addEventListener('keydown', shortcut);
    return () => { window.removeEventListener('keydown', shortcut); if (timer.current) clearTimeout(timer.current); };
  }, []);
  useEffect(() => { if (searchOpen) { dialog.current?.showModal(); dialog.current?.querySelector<HTMLInputElement>('input')?.focus(); } else dialog.current?.close(); }, [searchOpen]);
  return <><a className="skip-link" href="#conteudo">Pular para o conteúdo</a><header className="site-header"><div className="container header-inner">
    <Link href="/" className="brand" onPress={event => {
      event.preventDefault();
      if (timer.current) clearTimeout(timer.current);
      clicks.current += 1;
      if (clicks.current === 3) { clicks.current = 0; router.push('/admin'); }
      else timer.current = setTimeout(() => { clicks.current = 0; router.navigate('/'); }, 350);
    }}><span className="brand-mark"><Icon name="code-slash-outline" size={23} /></span><span><strong>Dicionário Tech</strong><small>LAR SÃO FRANCISCO</small></span></Link>
    <nav aria-label="Navegação principal"><Link href="/" aria-label="Início" className={`nav-link ${path === '/' ? 'active' : ''}`} aria-current={path === '/' ? 'page' : undefined}><Icon name="home-outline" size={18} /><span>Início</span></Link><Link href="/sugestao" aria-label="Sugerir termo" className={`nav-link ${path === '/sugestao' ? 'active' : ''}`} aria-current={path === '/sugestao' ? 'page' : undefined}><Icon name="bulb-outline" size={18} /><span>Sugerir termo</span></Link>
      <div className="nav-tools"><button type="button" className="icon-button" onClick={toggleTheme} aria-label={`Ativar tema ${isDark ? 'claro' : 'escuro'}`} title={`Ativar tema ${isDark ? 'claro' : 'escuro'}`}><Icon name={isDark ? 'sunny-outline' : 'moon-outline'} size={20} /></button><button type="button" className="icon-button" aria-label="Pesquisar no dicionário" aria-keyshortcuts="Control+k Meta+k" title="Pesquisar (Ctrl+K ou ⌘K)" onClick={() => setSearchOpen(true)}><Icon name="search-outline" size={20} /></button></div>
    </nav>
  </div></header><dialog ref={dialog} className="global-search" aria-label="Pesquisa global no dicionário" onCancel={() => setSearchOpen(false)} onClose={() => setSearchOpen(false)} onClick={event => { if (event.target === event.currentTarget) setSearchOpen(false); }}>
    <div className="global-search-inner"><div className="dialog-heading"><span>Encontre a próxima palavra.</span><button type="button" className="icon-button" aria-label="Fechar pesquisa" onClick={() => setSearchOpen(false)}><Icon name="close-outline" /></button></div>{searchOpen && <Search autoFocus onNavigate={() => setSearchOpen(false)} />}<p className="shortcut-hint">Use ↑ ↓ para navegar, Enter para abrir e Esc para fechar.</p></div>
  </dialog></>;
}