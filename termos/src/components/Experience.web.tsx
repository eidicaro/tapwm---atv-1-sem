import { useEffect, useRef, useState } from 'react';
import { Link, useLocalSearchParams } from 'expo-router';
import Head from 'expo-router/head';
import { useIsFocused } from '@react-navigation/native';
import Header from './SiteHeader';
import { AudioButton, AudioStatus, Footer, Highlight, Icon, Search, TermIcon, termHref } from './WebUI';
import { useDictionary } from '../context/DictionaryContext';
import { useSuggestion } from '../hooks/useSuggestion';
import { filterCatalog, normalize, relatedTerms, summarize, Term } from '../lib/dictionary';

function Page({ title, children }: { title: string; children: React.ReactNode }) {
  const focused = useIsFocused();
  if (!focused) return null;
  return <div className="tech-page"><Head><title>{title} | Dicionário Tech</title><meta name="description" content="Tecnologia em palavras simples. Encontre definições claras, ouça explicações e aprenda com o Dicionário Tech do Lar São Francisco." /></Head><Header />{children}<Footer /></div>;
}
function DictionaryState() {
  const { loading, error, reload } = useDictionary();
  if (loading) return <div className="empty-state" role="status"><span className="spinner" /><h3>Preparando seu próximo aprendizado…</h3><p>Carregando os termos do dicionário.</p></div>;
  if (error) return <div className="empty-state" role="alert"><Icon name="cloud-offline-outline" size={35} /><h3>Não conseguimos carregar os termos.</h3><p>Confira sua conexão e tente mais uma vez.</p><button type="button" className="secondary-button" onClick={reload}>Tentar novamente <Icon name="refresh-outline" size={17} /></button></div>;
  return null;
}
function TermCard({ term, query }: { term: Term; query: string }) {
  return <article className="term-card"><TermIcon term={term} /><h3><Link href={termHref(term) as '/termo'}><Highlight value={term.termo} query={query} /></Link></h3><p><Highlight value={summarize(term.descricao)} query={query} /></p><div className="card-actions"><AudioButton term={term} /><Link href={termHref(term) as '/termo'} className="card-arrow" aria-label={`Ler explicação completa de ${term.termo}`}><Icon name="chevron-forward-outline" size={17} /></Link></div></article>;
}
export function HomeScreen() {
  const { terms, loading, error } = useDictionary();
  const params = useLocalSearchParams<{ q?: string; catalogo?: string }>();
  const query = typeof params.q === 'string' ? params.q : '';
  const [letter, setLetter] = useState('');
  const [descending, setDescending] = useState(false);
  const [visible, setVisible] = useState(12);
  const catalog = useRef<HTMLElement>(null);
  const filtered = filterCatalog(terms, query, letter, descending);
  const suggestions = ['api', 'algoritmo', 'cache', 'big data', 'segurança'].map(name => terms.find(term => normalize(term.termo) === name)).filter((term): term is Term => !!term);
  const chips = suggestions.length ? suggestions : terms.slice(0, 5);
  const spotlight = terms.find(term => normalize(term.termo) === 'api') ?? terms[0];
  useEffect(() => { setVisible(12); setLetter(''); }, [query]);
  useEffect(() => {
    if (params.catalogo) requestAnimationFrame(() => catalog.current?.scrollIntoView({ block: 'start' }));
  }, [params.catalogo, query]);
  return <Page title="Tecnologia em palavras simples"><main id="conteudo" tabIndex={-1}>
    <section className="hero-section"><div className="container"><div className="hero-layout"><div className="hero-copy"><p className="eyebrow"><span /> CONHECIMENTO SEM BARREIRAS</p><h1>Tecnologia em<br /><em>palavras simples.</em></h1><p className="hero-description">Encontre definições claras para os termos que movem o mundo digital.<br className="desktop-break" /> Sem jargões, sem complicação.</p><Search /><div className="search-examples"><span>Experimente:</span>{chips.map(term => <Link key={term.id} href={termHref(term) as '/termo'}>{term.termo}</Link>)}</div></div>
    <aside className="hero-spotlight" aria-label="Um conceito para começar"><div className="spotlight-top"><span>UMA PALAVRA. NOVAS POSSIBILIDADES.</span><Icon name="sparkles-outline" size={18} /></div>{spotlight ? <><TermIcon term={spotlight} large /><h2>{spotlight.termo}</h2><p>{summarize(spotlight.descricao, 150)}</p><Link className="spotlight-link" href={termHref(spotlight) as '/termo'}>Entenda esse conceito <Icon name="arrow-forward-outline" size={19} /></Link></> : <><span className="spotlight-book"><Icon name="book-outline" size={58} /></span><h2>Um mundo para descobrir.</h2><p>Cada palavra é um novo passo para entender a tecnologia.</p><a className="spotlight-link" href="#catalogo">Explore o dicionário <Icon name="arrow-down-outline" size={19} /></a></>}<div className="spotlight-bottom"><Icon name="headset-outline" size={16} /><span>Leia. Ouça. Aprenda no seu ritmo.</span></div></aside></div>
    <div className="features"><div className="feature"><span className="feature-icon tone-green"><Icon name="flash-outline" size={25} /></span><div><h2>Rápido</h2><p>Encontre em segundos</p></div></div><div className="feature"><span className="feature-icon tone-blue"><Icon name="chatbubble-ellipses-outline" size={25} /></span><div><h2>Acessível</h2><p>Explicações sem jargões</p></div></div><div className="feature"><span className="feature-icon tone-orange"><Icon name="people-outline" size={25} /></span><div><h2>Colaborativo</h2><p>Construído com a comunidade</p></div></div></div></div></section>
    <section id="catalogo" ref={catalog} className="catalog-section"><div className="container"><div className="section-heading"><div><p className="eyebrow">SEU PRÓXIMO APRENDIZADO</p><h2>Explore os termos<span>.</span></h2><p>Conheça os conceitos e ouça cada explicação.</p></div><label className="sort-control"><span className="sr-only">Ordenar termos</span><Icon name="swap-vertical-outline" size={16} /><select value={descending ? 'za' : 'az'} onChange={event => { setDescending(event.target.value === 'za'); setVisible(12); }}><option value="az">De A a Z</option><option value="za">De Z a A</option></select><Icon name="chevron-down-outline" size={14} /></label></div>
    <div className="alphabet" role="group" aria-label="Filtrar termos pela primeira letra"><button type="button" className={!letter ? 'selected' : ''} aria-pressed={!letter} onClick={() => { setLetter(''); setVisible(12); }}>Todos{!loading && !error && <span> ({terms.length})</span>}</button>{'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(initial => <button type="button" key={initial} aria-label={`Termos com a letra ${initial}`} aria-pressed={letter === initial} className={letter === initial ? 'selected' : ''} onClick={() => { setLetter(initial); setVisible(12); }}>{initial}</button>)}</div>
    {query && <div className="catalog-query"><span>Resultados para <strong>“{query}”</strong></span><Link href="/?catalogo=1" className="text-button">Limpar pesquisa <Icon name="close-outline" size={16} /></Link></div>}
    <span className="sr-only" role="status">{loading ? 'Carregando termos' : `${filtered.length} termos encontrados${letter ? ` com a letra ${letter}` : ''}.`}</span><DictionaryState />
    {!loading && !error && (filtered.length ? <><div className="term-grid" key={`${letter}-${descending}-${query}`}>{filtered.slice(0, visible).map(term => <TermCard key={term.id} term={term} query={query} />)}</div><div className="catalog-bottom"><span>Mostrando {Math.min(visible, filtered.length)} de {filtered.length} termos</span>{visible < filtered.length && <button type="button" className="secondary-button" onClick={() => setVisible(count => count + 12)}>Mostrar mais termos <Icon name="chevron-down-outline" size={17} /></button>}</div></> : <div className="empty-state"><Icon name="search-outline" size={36} /><h3>{terms.length ? 'Ainda não há termos com esse filtro.' : 'Nosso dicionário está começando.'}</h3><p>Uma nova palavra pode começar com você.</p><Link className="secondary-button" href={{ pathname: '/sugestao', params: { termo: query } }}>Sugerir um termo <Icon name="arrow-forward-outline" size={18} /></Link>{letter && <button className="text-button" type="button" onClick={() => setLetter('')}>Ver todas as letras</button>}</div>)}
    <AudioStatus /><div className="contribution-banner"><span className="feature-icon tone-green"><Icon name="bulb-outline" size={25} /></span><div><h3>Conhecimento cresce quando a gente compartilha.</h3><p>Sentiu falta de uma palavra? Ajude a construir o dicionário.</p></div><Link href="/sugestao" className="text-button">Sugerir termo <Icon name="arrow-forward-outline" size={18} /></Link></div></div></section>
  </main></Page>;
}

export function TermScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { terms, loading, error } = useDictionary();
  const term = terms.find(item => item.id === id);
  const [tab, setTab] = useState('explanation');
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  useEffect(() => { setTab('explanation'); }, [id]);
  const related = term ? relatedTerms(term, terms) : [];
  const availableTabs = [{ id: 'explanation', label: 'Explicação', icon: 'bulb-outline' as const }, ...(term?.exemplos?.length ? [{ id: 'examples', label: 'Exemplos práticos', icon: 'chatbubbles-outline' as const }] : [])];
  return <Page title={term?.termo ?? 'Termo'}><main id="conteudo" tabIndex={-1} className="container term-page"><nav className="breadcrumbs" aria-label="Caminho de navegação"><Link href="/">Início</Link><Icon name="chevron-forward-outline" size={13} /><Link href="/?catalogo=1">Dicionário</Link>{term && <><Icon name="chevron-forward-outline" size={13} /><span aria-current="page">{term.termo}</span></>}</nav>
    <DictionaryState />{!loading && !error && !term && <div className="empty-state"><Icon name="book-outline" size={40} /><h1>Termo não encontrado.</h1><p>Esse conceito pode ter sido atualizado ou removido.</p><Link href="/?catalogo=1" className="primary-button">Voltar ao dicionário <Icon name="arrow-forward-outline" /></Link></div>}
    {term && <><div className="term-heading"><TermIcon term={term} large /><div><p className="eyebrow">DICIONÁRIO TECH</p><div className="term-title-row"><h1>{term.termo}</h1><AudioButton term={term} /></div><p>{term.descricao}</p></div><Link href={{ pathname: '/sugestao', params: { termo: term.termo, melhoria: '1' } }} className="secondary-button edit-term"><Icon name="create-outline" size={17} /> Sugerir edição</Link></div>
    <div className="reading-layout"><article className="reading-main"><div className="reading-tabs" role="tablist" aria-label="Conteúdo do termo">{availableTabs.map((item, index) => <button key={item.id} ref={node => { tabs.current[index] = node; }} type="button" role="tab" id={`tab-${item.id}`} aria-selected={tab === item.id} aria-controls={`panel-${item.id}`} tabIndex={tab === item.id ? 0 : -1} className={tab === item.id ? 'active' : ''} onClick={() => setTab(item.id)} onKeyDown={event => {
      const offset = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
      if (offset || event.key === 'Home' || event.key === 'End') { event.preventDefault(); const next = event.key === 'Home' ? 0 : event.key === 'End' ? availableTabs.length - 1 : (index + offset + availableTabs.length) % availableTabs.length; setTab(availableTabs[next].id); tabs.current[next]?.focus(); }
    }}><Icon name={item.icon} size={18} />{item.label}</button>)}</div><section key={`${id}-${tab}`} id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`} tabIndex={0} className="reading-card">{tab === 'examples' ? <><h2>Na prática</h2><ul className="examples-list">{term.exemplos?.map((example, index) => <li key={index}>{example}</li>)}</ul></> : <><p className="eyebrow">ENTENDA O CONCEITO</p><h2>O que é {term.termo}?</h2><p>{term.descricao}</p>{term.explicacao && <p>{term.explicacao}</p>}<div className="reading-audio"><Icon name="headset-outline" size={24} /><div><strong>Prefere ouvir?</strong><p>Aprenda no seu ritmo com a leitura em voz alta.</p></div><AudioButton term={term} label /></div></>}</section><AudioStatus /><Link href="/?catalogo=1" className="text-button back-catalog"><Icon name="arrow-back-outline" size={18} />Voltar ao catálogo</Link></article>
    <aside className="reading-sidebar">{related.length > 0 && <section className="sidebar-card"><h2>Veja também</h2>{related.map(other => <Link key={other.id} href={termHref(other) as '/termo'} className="related-link"><TermIcon term={other} /><span>{other.termo}</span><Icon name="arrow-forward-outline" size={16} /></Link>)}</section>}<section className="sidebar-card contribute-card"><span className="feature-icon tone-green"><Icon name="bulb-outline" size={23} /></span><h2>Vamos aprender juntos?</h2><p>Uma explicação pode ficar ainda melhor com a sua contribuição.</p><Link href={{ pathname: '/sugestao', params: { termo: term.termo, melhoria: '1' } }} className="text-button">Sugerir melhoria <Icon name="arrow-forward-outline" size={16} /></Link></section></aside></div></>}
  </main></Page>;
}

export function SuggestionScreen() {
  const { termo, melhoria } = useLocalSearchParams<{ termo?: string; melhoria?: string }>();
  const form = useSuggestion(typeof termo === 'string' ? termo : '');
  const termInput = useRef<HTMLInputElement>(null);
  const descriptionInput = useRef<HTMLTextAreaElement>(null);
  const { setTerm } = form;
  useEffect(() => { if (typeof termo === 'string') setTerm(termo); }, [termo, setTerm]);
  useEffect(() => { if (form.errors.term) termInput.current?.focus(); else if (form.errors.description) descriptionInput.current?.focus(); }, [form.errors]);
  const sending = form.state === 'sending';
  return <Page title={melhoria ? 'Sugerir melhoria' : 'Sugerir termo'}><main id="conteudo" tabIndex={-1} className="suggestion-page container"><section className="suggestion-copy"><span className="feature-icon tone-green suggestion-bulb"><Icon name="bulb-outline" size={29} /></span><p className="eyebrow">CONSTRUA COM A GENTE</p><h1>Sentiu falta de<br /> uma <em>palavra?</em></h1><p>Sua curiosidade pode ajudar outra pessoa. Sugira um termo e nossa equipe revisa antes de publicar.</p><ol className="contribution-steps"><li><span>01</span>Você envia a sugestão</li><li><span>02</span>Nossa equipe revisa</li><li><span>03</span>A comunidade aprende</li></ol><Link href="/?catalogo=1" className="text-button"><Icon name="arrow-back-outline" size={17} /> Voltar ao dicionário</Link></section>
    <section className="suggestion-card" aria-labelledby="form-title">{form.state === 'success' ? <div className="success-state" role="status"><span className="feature-icon tone-green"><Icon name="checkmark-circle-outline" size={36} /></span><p className="eyebrow">CONTRIBUIÇÃO RECEBIDA</p><h2 id="form-title">Sua ideia já está com a gente.</h2><p>A sugestão de <strong>{form.term}</strong> foi enviada para revisão. Nossa equipe vai conferir a explicação antes de publicá-la.</p><button type="button" className="primary-button" onClick={form.reset}>Sugerir outra palavra <Icon name="add-outline" size={19} /></button><Link href="/" className="text-button">Voltar ao início</Link></div> : <form noValidate aria-busy={sending} onSubmit={event => { event.preventDefault(); void form.submit(); }}><h2 id="form-title">{melhoria ? 'Sugerir uma melhoria' : 'Sugerir novo termo'}</h2><p className="form-intro">{melhoria ? 'Conte como podemos deixar essa explicação mais clara.' : 'Preencha os dados abaixo. Leva menos de um minuto.'}</p>
    <label htmlFor="suggestion-term">NOME DO TERMO <span aria-hidden="true">*</span></label><div className={`form-field ${form.errors.term ? 'invalid' : ''}`}><Icon name="code-slash-outline" size={18} /><input id="suggestion-term" name="termo" ref={termInput} value={form.term} onChange={event => form.setTerm(event.target.value)} required maxLength={80} minLength={2} placeholder="Ex.: Machine Learning" disabled={sending} aria-invalid={!!form.errors.term} aria-describedby={form.errors.term ? 'term-error' : undefined} autoComplete="off" /></div>{form.errors.term && <p id="term-error" className="field-error">{form.errors.term}</p>}
    <label htmlFor="suggestion-description">{melhoria ? 'SUA SUGESTÃO DE EXPLICAÇÃO' : 'EXPLICAÇÃO'} <span aria-hidden="true">*</span></label><textarea id="suggestion-description" name="descricao" ref={descriptionInput} value={form.description} onChange={event => form.setDescription(event.target.value)} required minLength={10} maxLength={500} rows={5} disabled={sending} placeholder="Explique com suas próprias palavras…" aria-invalid={!!form.errors.description} aria-describedby={`description-count${form.errors.description ? ' description-error' : ''}`} />
    <div className="field-meta">{form.errors.description && <p id="description-error" className="field-error">{form.errors.description}</p>}<span id="description-count">{form.description.length}/500</span></div>
    {form.state === 'error' && <p className="feedback error" role="alert"><Icon name="alert-circle-outline" />Não foi possível confirmar o envio. Confira a conexão e tente novamente. Seu texto foi preservado.</p>}
    <button type="submit" className="primary-button submit-suggestion" disabled={sending}>{sending ? <><span className="spinner" /> Enviando para revisão…</> : <>Enviar para revisão <Icon name="arrow-forward-outline" size={19} /></>}</button><p className="form-note"><Icon name="shield-checkmark-outline" size={15} />Não pedimos seus dados pessoais.</p></form>}</section>
  </main></Page>;
}