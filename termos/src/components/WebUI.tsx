import { useEffect, useId, useRef, useState } from 'react';
import { Icon, TermIcon } from './WebIcon';
import { useRouter } from 'expo-router';
import { useDictionary } from '../context/DictionaryContext';
import { useAudio } from '../context/AudioContext';
import { highlightParts, searchTerms, searchSnippet, Term } from '../lib/dictionary';
import './experience.css';
export { Icon, TermIcon } from './WebIcon';
const larLogo = require('../../assets/images/logo_lar.png');

export function termHref(term: Term) { return `/termo?id=${encodeURIComponent(term.id)}`; }
export function Highlight({ value, query }: { value: string; query: string }) {
  return <>{highlightParts(value, query).map((part, index) => part.match ? <mark key={index}>{part.text}</mark> : part.text)}</>;
}
export function Search({ autoFocus = false, onNavigate }: { autoFocus?: boolean; onNavigate?: () => void }) {
  const { terms, loading, error, reload } = useDictionary();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const listId = useId();
  const results = searchTerms(terms, query);
  const matches = results.slice(0, 5);
  const expanded = open;
  useEffect(() => {
    if (autoFocus) input.current?.focus();
    const dismiss = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener('pointerdown', dismiss);
    return () => document.removeEventListener('pointerdown', dismiss);
  }, [autoFocus]);
  useEffect(() => { setActive(0); }, [query, terms]);
  const navigate = (href: string) => { setOpen(false); onNavigate?.(); router.push(href as Parameters<typeof router.push>[0]); };
  useEffect(() => { if (expanded) document.getElementById(listId + '-' + active)?.scrollIntoView({ block: 'nearest' }); }, [active, expanded, listId]);
  const allResults = () => navigate(`/?catalogo=1&q=${encodeURIComponent(query.trim())}`);
  return <div ref={root} className={`search-root ${expanded ? 'is-open' : ''}`} onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false);
  }}>
    <form role="search" className="search-field" onSubmit={event => { event.preventDefault(); if (matches[active]) navigate(termHref(matches[active])); else if (query.trim()) allResults(); }}>
      <Icon name="search-outline" size={25} />
      <label className="sr-only" htmlFor={`${listId}-input`}>Pesquisar termos de tecnologia</label>
      <input id={`${listId}-input`} ref={input} value={query} type="search" role="combobox" aria-autocomplete="list" aria-haspopup="listbox"
        aria-expanded={expanded} aria-controls={`${listId}-list`} aria-activedescendant={expanded && !loading && !error && matches[active] ? `${listId}-${active}` : undefined}
        autoComplete="off" autoFocus={autoFocus} placeholder="O que você quer entender?" onFocus={() => setOpen(true)} onChange={event => { setQuery(event.target.value); setActive(0); setOpen(true); }}
        onKeyDown={event => {
          if (event.nativeEvent.isComposing) return;
          if (event.key === 'Enter' && open && matches[active]) { event.preventDefault(); navigate(termHref(matches[active])); return; }
          if (event.key === 'Escape' && open) { event.preventDefault(); event.stopPropagation(); setOpen(false); }
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            if (!open) { setOpen(true); setActive(event.key === 'ArrowUp' ? Math.max(0, matches.length - 1) : 0); }
            else if (matches.length) setActive(index => (index + (event.key === 'ArrowDown' ? 1 : -1) + matches.length) % matches.length);
          }
        }} />
      {query && <button type="button" className="clear-search" aria-label="Limpar pesquisa" onClick={() => { setQuery(''); setOpen(true); input.current?.focus(); }}><Icon name="close-outline" size={19} /></button>}
      <button type="submit" className="search-submit" aria-label="Buscar termo"><Icon name="arrow-forward-outline" size={25} /></button>
    </form>
    {expanded && <div className="search-panel">
      <p className="search-caption">{query.trim() ? 'RESULTADOS DO DICIONÁRIO' : 'COMECE POR UM CONCEITO'}</p>
      <ul id={`${listId}-list`} role="listbox" aria-label="Termos encontrados" aria-busy={loading}>
        {!loading && !error && matches.map((term, index) => <li id={`${listId}-${index}`} key={term.id} role="option" aria-selected={active === index}
          className={`search-result ${active === index ? 'selected' : ''}`} onPointerMove={() => setActive(index)}
          onPointerDown={event => event.preventDefault()} onClick={() => navigate(termHref(term))}>
          <TermIcon term={term} /><span className="result-copy"><strong><Highlight value={term.termo} query={query} /></strong><span><Highlight value={searchSnippet(term.descricao, query, 105)} query={query} /></span></span><Icon name="arrow-up-outline" size={17} />
        </li>)}
      </ul>
      {loading && <p className="panel-message" role="status"><span className="spinner" /> Carregando o dicionário…</p>}
      {error && <div className="panel-message" role="alert"><p>Não foi possível carregar os termos.</p><button type="button" className="text-button" onClick={reload}>Tentar novamente</button></div>}
      {!loading && !error && !matches.length && <div className="panel-message"><Icon name="search-outline" size={28} /><strong>Nenhum termo por aqui ainda.</strong><p>Que tal ajudar a ampliar o dicionário?</p><button type="button" className="text-button" onClick={() => navigate(`/sugestao?termo=${encodeURIComponent(query.trim())}`)}>Sugerir {query.trim() ? `“${query.trim()}”` : 'um termo'} <Icon name="arrow-forward-outline" size={16} /></button></div>}
      {!loading && !error && matches.length > 0 && <button type="button" className="all-results" onClick={allResults}><span>{query.trim() ? `Ver ${results.length === 1 ? "o resultado" : `os ${results.length} resultados`} para “${query.trim()}”` : 'Explorar o dicionário completo'}</span><Icon name="arrow-forward-outline" size={18} /></button>}
      <span className="sr-only" role="status" aria-live="polite">{!loading && !error ? `${results.length} termos encontrados.` : ''}</span>
    </div>}
  </div>;
}

export function AudioButton({ term, label = false }: { term: Term; label?: boolean }) {
  const { speaking, listen } = useAudio();
  const playing = speaking === term.id;
  return <button type="button" className={`audio-button ${playing ? 'playing' : ''} ${label ? 'with-label' : ''}`} aria-label={`${playing ? 'Parar' : 'Ouvir'} explicação de ${term.termo}`} aria-pressed={playing} onClick={() => void listen(term)}>
    <Icon name={playing ? 'stop-outline' : 'volume-medium-outline'} size={18} />{label && <span>{playing ? 'Parar leitura' : 'Ouvir explicação'}</span>}
  </button>;
}
export function AudioStatus() {
  const { error, speaking } = useAudio();
  return <>{error && <p className="feedback error" role="alert"><Icon name="alert-circle-outline" />{error}</p>}<span className="sr-only" role="status">{speaking ? 'Reproduzindo explicação. Use o botão de áudio para interromper.' : ''}</span></>;
}
export function Footer() {
  return <footer className="site-footer"><div className="container footer-inner"><div className="footer-brand"><img src={typeof larLogo === 'string' ? larLogo : larLogo.uri} alt="Lar São Francisco" width="150" height="50" /><p>Ajudando a inovar vidas através da tecnologia.</p></div><p>Feito para aprender.<br /><span>Construído com a comunidade.</span></p><a href="/sugestao" className="footer-link">Contribua com uma palavra <Icon name="arrow-forward-outline" size={17} /></a></div></footer>;
}
