import { useCallback, useEffect, useRef, useState } from 'react';
import { Icon, TermIcon } from './WebIcon';
import type { IconName } from './WebIcon';
import { draftFor, matchesAdminSearch, termPayload, validateTermDraft } from '../lib/admin';
import type { AdminData, AdminRepository, AdminSuggestion, AdminTerm, ReviewStatus, TermDraft, TermPayload } from '../lib/admin';
import { normalize } from '../lib/dictionary';
import './experience.css';
import './admin.css';

type Section = 'overview' | 'suggestions' | 'create' | 'terms';
type Activity = { id: string; title: string; description: string; date: number; icon: IconName; tone: string };
const sections: { id: Section; label: string; icon: IconName; title: string; description: string }[] = [
  { id: 'overview', label: 'Visão geral', icon: 'home-outline', title: 'Visão geral', description: 'Acompanhe o conteúdo e mantenha o dicionário atualizado.' },
  { id: 'suggestions', label: 'Sugestões', icon: 'file-tray-full-outline', title: 'Revisar sugestões', description: 'Avalie as contribuições enviadas pela comunidade.' },
  { id: 'create', label: 'Criar termo', icon: 'add-circle-outline', title: 'Adicionar novo termo', description: 'Publique uma explicação clara e fácil de entender.' },
  { id: 'terms', label: 'Gerenciar termos', icon: 'library-outline', title: 'Gerenciar dicionário', description: 'Encontre, edite ou remova termos publicados.' },
];
const statusLabels: Record<ReviewStatus, string> = { pendente: 'Pendente', aprovado: 'Aprovada', rejeitado: 'Rejeitada' };
const emptyData: AdminData = { terms: [], suggestions: [] };
const dateLabel = (value: number) => new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' }).format(value);

export function AdminBrand() {
  return <a className="admin-brand" href="/" aria-label="Dicionário Tech — voltar ao site"><span className="brand-mark"><Icon name="code-slash-outline" size={23} /></span><span><strong>Dicionário Tech</strong><small>PAINEL ADMINISTRATIVO</small></span></a>;
}
function Empty({ title, children, icon = 'checkmark-circle-outline' }: { title: string; children: React.ReactNode; icon?: IconName }) {
  return <div className="admin-empty"><span className="feature-icon tone-green"><Icon name={icon} size={28} /></span><h2>{title}</h2><p>{children}</p></div>;
}
function Modal({ title, children, onClose, busy }: { title: string; children: React.ReactNode; onClose: () => void; busy: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    dialog.current?.showModal();
    return () => { previous?.focus(); };
  }, []);
  return <dialog ref={dialog} className="admin-modal" aria-labelledby="admin-modal-title" aria-busy={busy} onCancel={event => { event.preventDefault(); if (!busy) onClose(); }}>
    <div className="admin-modal-heading"><h2 id="admin-modal-title">{title}</h2><button type="button" className="icon-button" aria-label="Fechar diálogo" disabled={busy} onClick={onClose}><Icon name="close-outline" /></button></div>{children}
  </dialog>;
}

export function TermEditor({ term, terms, busy, onSave, onCancel }: { term?: AdminTerm; terms: AdminTerm[]; busy: boolean; onSave: (payload: TermPayload) => Promise<boolean>; onCancel?: () => void }) {
  const [draft, setDraft] = useState<TermDraft>(() => draftFor(term));
  const [errors, setErrors] = useState<Partial<Record<keyof TermDraft, string>>>({});
  const form = useRef<HTMLFormElement>(null);
  const submitting = useRef(false);
  const descriptionLimit = Math.max(600, term?.descricao.length ?? 0);
  const categories = [...new Set(terms.map(item => item.categoria).filter((value): value is string => !!value))];
  const change = (field: keyof TermDraft, value: string) => { setDraft(current => ({ ...current, [field]: value })); setErrors(current => ({ ...current, [field]: undefined })); };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy || submitting.current) return;
    const validation = validateTermDraft(draft, descriptionLimit);
    if (terms.some(item => item.id !== term?.id && normalize(item.termo.trim()) === normalize(draft.name.trim()))) validation.name = 'Já existe um termo com esse nome. Edite o cadastro existente.';
    setErrors(validation);
    if (Object.keys(validation).length) { requestAnimationFrame(() => form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()); return; }
    submitting.current = true;
    const payload = termPayload(draft);
    if (term) {
      payload.termo = draft.name.trim();
      if (term.exemplos?.length && !payload.exemplos) payload.exemplos = [];
      if (term.categoria && !payload.categoria) payload.categoria = '';
    }
    try { await onSave(payload); } finally { submitting.current = false; }
  };
  const inputProps = (field: keyof TermDraft) => ({ id: `admin-${field}`, name: field, value: draft[field], onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => change(field, event.target.value), disabled: busy, 'aria-invalid': !!errors[field], 'aria-describedby': errors[field] ? `admin-${field}-error` : undefined });
  const fieldError = (field: keyof TermDraft) => errors[field] && <p className="field-error" id={`admin-${field}-error`}>{errors[field]}</p>;
  return <form ref={form} className="admin-editor admin-surface" noValidate onSubmit={event => void submit(event)} aria-busy={busy}>
    <label htmlFor="admin-name">Nome do termo <span aria-hidden="true">*</span></label>
    <input {...inputProps('name')} required minLength={2} maxLength={80} placeholder="Ex.: computação em nuvem" autoComplete="off" />{fieldError('name')}
    <label htmlFor="admin-description">Descrição <span aria-hidden="true">*</span></label>
    <textarea {...inputProps('description')} required minLength={10} maxLength={descriptionLimit} rows={5} placeholder="Explique o significado e dê contexto…" aria-describedby={`admin-description-count${errors.description ? ' admin-description-error' : ''}`} />
    <div className="admin-field-meta">{fieldError('description')}<span id="admin-description-count">{draft.description.length}/{descriptionLimit}</span></div>
    <label htmlFor="admin-examples">Exemplos <span className="optional">(opcional)</span></label>
    <textarea {...inputProps('examples')} maxLength={2000} rows={3} placeholder="Ex.: O armazenamento em nuvem permite acessar arquivos de qualquer lugar." aria-describedby={`admin-examples-hint${errors.examples ? ' admin-examples-error' : ''}`} />
    <p className="admin-input-hint" id="admin-examples-hint">Escreva um exemplo por linha.</p>{fieldError('examples')}
    <label htmlFor="admin-category">Categoria <span className="optional">(opcional)</span></label>
    <input {...inputProps('category')} list="admin-categories" maxLength={60} placeholder="Selecione ou escreva uma categoria" autoComplete="off" /><datalist id="admin-categories">{categories.map(category => <option key={category} value={category} />)}</datalist>{fieldError('category')}
    <div className="admin-editor-actions"><button type="submit" className="admin-button primary" disabled={busy}>{busy ? <span className="spinner" /> : <Icon name={term ? 'checkmark-outline' : 'cloud-upload-outline'} size={19} />}{busy ? 'Salvando…' : term ? 'Salvar alterações' : 'Publicar termo'}</button>{onCancel && <button type="button" className="admin-button secondary" disabled={busy} onClick={onCancel}>Cancelar</button>}</div>
  </form>;
}

export default function AdminWorkspace({ repository, isDark, toggleTheme, onLogout, onDictionaryChange }: { repository: AdminRepository; isDark: boolean; toggleTheme: () => void; onLogout: () => Promise<void>; onDictionaryChange: () => void }) {
  const [section, setSection] = useState<Section>('overview');
  const [data, setData] = useState<AdminData>(emptyData);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const lock = useRef(false);
  const request = useRef(0);
  const [notice, setNotice] = useState<{ error: boolean; text: string } | null>(null);
  const [status, setStatus] = useState<ReviewStatus | 'all'>('pendente');
  const [suggestionSearch, setSuggestionSearch] = useState('');
  const [sort, setSort] = useState('recent');
  const [search, setSearch] = useState('');
  const [letter, setLetter] = useState('');
  const [visible, setVisible] = useState(20);
  const [editing, setEditing] = useState<AdminTerm | null>(null);
  const [removing, setRemoving] = useState<AdminTerm | null>(null);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [today, setToday] = useState('');
  const heading = useRef<HTMLHeadingElement>(null);
  const navigation = useRef<HTMLElement>(null);
  const pendingCreate = useRef<{ key: string; id: string } | null>(null);
  const currentSection = sections.find(item => item.id === section)!;
  const pending = data.suggestions.filter(item => item.status === 'pendente').length;

  const load = useCallback(async () => {
    const version = ++request.current;
    setLoading(true); setLoadError(false);
    try { const result = await repository.load(); if (version === request.current) setData(result); }
    catch { if (version === request.current) setLoadError(true); }
    finally { if (version === request.current) setLoading(false); }
  }, [repository]);
  useEffect(() => { void load(); return () => { request.current += 1; }; }, [load]);
  useEffect(() => { setToday(new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full', timeZone: 'America/Sao_Paulo' }).format(new Date())); }, []);
  useEffect(() => { navigation.current?.querySelector<HTMLElement>('[aria-current="page"]')?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' }); }, [section]);
  const navigate = (next: Section) => { setNotice(null); setSection(next); requestAnimationFrame(() => { heading.current?.focus(); heading.current?.scrollIntoView({ block: 'start' }); }); };
  const addActivity = (title: string, description: string, icon: IconName, tone: string) => {
    const date = Date.now();
    setActivity(current => [{ id: `session-${date}-${current.length}`, title, description, date, icon, tone }, ...current].slice(0, 20));
  };
  const act = async (key: string, work: () => Promise<void>, success: string) => {
    if (lock.current) return false;
    lock.current = true; setBusy(key); setNotice(null);
    try { await work(); setNotice({ error: false, text: success }); return true; }
    catch (error) { setNotice({ error: true, text: error instanceof Error && error.message.startsWith('Esta sugestão') ? error.message : 'Não foi possível concluir a ação. Seus dados foram preservados. Tente novamente.' }); return false; }
    finally { lock.current = false; setBusy(null); }
  };
  const review = (item: AdminSuggestion, decision: 'aprovado' | 'rejeitado') => act(item.id, async () => {
    const published = await repository.review(item.id, decision);
    setData(current => ({ terms: published ? [...current.terms, published] : current.terms, suggestions: current.suggestions.map(value => value.id === item.id ? { ...value, status: decision } : value) }));
    if (published) onDictionaryChange();
    addActivity(published ? 'Novo termo publicado' : 'Sugestão revisada', `“${item.termo}” ${published ? 'foi adicionado ao dicionário.' : 'foi rejeitada.'}`, published ? 'book-outline' : 'close-circle-outline', published ? 'green' : 'rose');
  }, decision === 'aprovado' ? 'Sugestão aprovada e termo publicado.' : 'Sugestão rejeitada.');
  const create = (payload: TermPayload) => act('create', async () => {
    const key = JSON.stringify(payload);
    if (pendingCreate.current?.key !== key) pendingCreate.current = { key, id: repository.allocateId() };
    const published = await repository.create(payload, pendingCreate.current.id);
    pendingCreate.current = null;
    setData(current => ({ ...current, terms: [...current.terms, published] }));
    onDictionaryChange(); addActivity('Novo termo publicado', `“${published.termo}” foi adicionado ao dicionário.`, 'book-outline', 'green'); navigate('terms');
  }, 'Termo publicado com sucesso.');
  const saveEdit = (payload: TermPayload) => act('edit', async () => {
    if (!editing) return;
    await repository.update(editing.id, payload);
    setData(current => ({ ...current, terms: current.terms.map(item => item.id === editing.id ? { ...item, ...payload } : item) }));
    onDictionaryChange(); addActivity('Termo atualizado', `“${payload.termo}” foi editado.`, 'create-outline', 'blue'); setEditing(null);
  }, 'Alterações salvas.');
  const remove = () => act('remove', async () => {
    if (!removing) return;
    await repository.remove(removing.id);
    setData(current => ({ ...current, terms: current.terms.filter(item => item.id !== removing.id) }));
    onDictionaryChange(); addActivity('Termo removido', `“${removing.termo}” foi removido do dicionário.`, 'trash-outline', 'rose'); setRemoving(null);
  }, 'Termo removido.');
  const received: Activity[] = data.suggestions.filter(item => item.date !== null).map(item => ({ id: `received-${item.id}`, title: 'Sugestão recebida', description: `“${item.termo}” foi enviado pela comunidade.`, date: item.date!, icon: 'mail-outline', tone: 'blue' }));
  const recentActivity = [...activity, ...received].sort((a, b) => b.date - a.date).slice(0, 5);
  const suggestions = data.suggestions.filter(item => (status === 'all' || item.status === status) && matchesAdminSearch(item, suggestionSearch)).sort((a, b) => (sort === 'recent' ? (b.date ?? -Infinity) - (a.date ?? -Infinity) : 0) || a.termo.localeCompare(b.termo, 'pt-BR'));
  const terms = data.terms.filter(item => matchesAdminSearch(item, search) && (!letter || normalize(item.termo).startsWith(normalize(letter)))).sort((a, b) => a.termo.localeCompare(b.termo, 'pt-BR'));
  const hasDates = data.suggestions.some(item => item.date !== null);
  const canAct = !busy && !loading && !loadError;

  return <div className="admin-root admin-shell"><a className="skip-link" href="#admin-content">Pular para o conteúdo</a>
    <aside className="admin-sidebar"><div className="admin-sidebar-top"><AdminBrand /><div className="admin-mobile-tools"><button type="button" className="icon-button" onClick={toggleTheme} aria-label={`Ativar tema ${isDark ? 'claro' : 'escuro'}`}><Icon name={isDark ? 'sunny-outline' : 'moon-outline'} /></button><button type="button" className="icon-button" disabled={!!busy} aria-label="Sair da conta" onClick={() => void act('logout', onLogout, 'Sessão encerrada.')}><Icon name="log-out-outline" /></button></div></div>
      <nav ref={navigation} className="admin-nav" aria-label="Painel administrativo">{sections.map(item => <button key={item.id} type="button" className={section === item.id ? 'active' : ''} aria-current={section === item.id ? 'page' : undefined} onClick={() => navigate(item.id)}><Icon name={item.icon} size={21} /><span>{item.label}</span>{item.id === 'suggestions' && <span className="admin-nav-badge">{loading ? '…' : loadError ? '—' : pending}</span>}</button>)}</nav>
      <div className="admin-sidebar-footer"><a href="/" className="admin-utility"><Icon name="arrow-back-outline" size={19} />Voltar ao site</a><button type="button" className="admin-utility" onClick={toggleTheme}><Icon name={isDark ? 'sunny-outline' : 'moon-outline'} size={20} />Modo {isDark ? 'claro' : 'escuro'}</button><button type="button" className="admin-utility danger" disabled={!!busy} onClick={() => void act('logout', onLogout, 'Sessão encerrada.')}><Icon name="log-out-outline" size={20} />{busy === 'logout' ? 'Saindo…' : 'Sair da conta'}</button></div>
    </aside>
    <main className="admin-main" id="admin-content" tabIndex={-1}><div className="admin-content"><header className="admin-heading"><div><h1 ref={heading} tabIndex={-1}>{currentSection.title}</h1><p>{currentSection.description}</p></div>{section === 'overview' ? <span className="admin-date"><Icon name="calendar-outline" size={17} />{today}</span> : section === 'terms' && <button type="button" className="admin-button primary" onClick={() => navigate('create')}><Icon name="add-outline" size={18} />Novo termo</button>}</header>
      {notice && <div className={`admin-notice ${notice.error ? 'error' : 'success'}`} role={notice.error ? 'alert' : 'status'}><Icon name={notice.error ? 'alert-circle-outline' : 'checkmark-circle-outline'} /><span>{notice.text}</span><button type="button" aria-label="Fechar mensagem" onClick={() => setNotice(null)}><Icon name="close-outline" size={17} /></button></div>}
      {loading ? <div className="admin-loading" role="status"><span className="spinner" />Carregando o painel…</div> : loadError ? <div className="admin-surface admin-error" role="alert"><Icon name="cloud-offline-outline" size={32} /><h2>Não foi possível carregar o painel.</h2><p>Confira sua conexão e as permissões da conta.</p><button type="button" className="admin-button secondary" onClick={() => void load()}><Icon name="refresh-outline" size={18} />Tentar novamente</button></div> : <>
      {section === 'overview' && <><div className="admin-stats"><button type="button" className="admin-stat green" onClick={() => navigate('terms')}><span><strong>{data.terms.length}</strong><span>Termos publicados</span></span><Icon name="library-outline" size={29} /></button><button type="button" className="admin-stat blue" onClick={() => { setStatus('pendente'); navigate('suggestions'); }}><span><strong>{pending}</strong><span>Aguardando revisão</span></span><Icon name="time-outline" size={29} /></button><div className="admin-stat amber"><span><strong>3</strong><span>Ferramentas de gestão</span></span><Icon name="construct-outline" size={29} /></div></div>
        <section className="admin-surface admin-activity"><div className="admin-panel-heading"><div><h2>Atividade recente</h2><p>Contribuições recebidas e ações desta sessão.</p></div><button type="button" className="admin-button subtle" onClick={() => { setStatus('all'); navigate('suggestions'); }}>Ver sugestões</button></div>{recentActivity.length ? <ol>{recentActivity.map(item => <li key={item.id}><span className={`feature-icon tone-${item.tone}`}><Icon name={item.icon} size={24} /></span><div><h3>{item.title}</h3><p>{item.description}</p></div><time dateTime={new Date(item.date).toISOString()}>{dateLabel(item.date)}</time><span className="activity-dot" aria-hidden="true" /></li>)}</ol> : <Empty title="O próximo aprendizado começa aqui." icon="book-outline">Ainda não há atividade com data registrada. Revise as sugestões ou publique um termo.</Empty>}</section>
      </>}
      {section === 'suggestions' && <section aria-label="Revisão de sugestões"><div className="admin-filters" role="group" aria-label="Filtrar sugestões por status">{(['all', 'pendente', 'aprovado', 'rejeitado'] as const).map(value => <button type="button" key={value} aria-pressed={status === value} className={status === value ? 'selected' : ''} onClick={() => setStatus(value)}>{value === 'all' ? 'Todas' : value === 'pendente' ? 'Pendentes' : value === 'aprovado' ? 'Aprovadas' : 'Rejeitadas'} <span>({data.suggestions.filter(item => value === 'all' || item.status === value).length})</span></button>)}</div>
        <div className="admin-toolbar"><label className="admin-search"><Icon name="search-outline" size={19} /><span className="sr-only">Buscar sugestões</span><input type="search" value={suggestionSearch} onChange={event => setSuggestionSearch(event.target.value)} placeholder="Buscar sugestões…" />{suggestionSearch && <button type="button" aria-label="Limpar busca de sugestões" onClick={() => setSuggestionSearch('')}><Icon name="close-outline" size={17} /></button>}</label><label className="admin-sort"><span className="sr-only">Ordenar sugestões</span><select value={hasDates ? sort : 'az'} onChange={event => setSort(event.target.value)}>{hasDates && <option value="recent">Mais recentes</option>}<option value="az">De A a Z</option></select><Icon name="chevron-down-outline" size={15} /></label><button type="button" className="icon-button" aria-label="Atualizar sugestões" disabled={!!busy} onClick={() => void load()}><Icon name="refresh-outline" size={18} /></button></div>
        {suggestions.length ? <div className="admin-list">{suggestions.map(item => <article className="admin-surface admin-suggestion" key={item.id}><div className="admin-row-heading"><TermIcon term={item} /><div><h2>{item.termo}</h2><p>{item.descricao}</p></div><span className={`admin-status ${item.status}`}>{statusLabels[item.status]}</span></div><div className="admin-row-footer"><span className="admin-row-date">{item.date !== null ? <time dateTime={new Date(item.date).toISOString()}>{dateLabel(item.date)}</time> : 'Data não informada'}<span aria-hidden="true"> · </span>pela comunidade</span>{item.status === 'pendente' && <div className="admin-row-actions"><button type="button" className="admin-button primary small" disabled={!canAct} aria-label={`Aprovar sugestão de ${item.termo}`} onClick={() => void review(item, 'aprovado')}>{busy === item.id ? <span className="spinner" /> : <Icon name="checkmark-circle-outline" size={17} />}Aprovar</button><button type="button" className="admin-button danger small" disabled={!canAct} aria-label={`Rejeitar sugestão de ${item.termo}`} onClick={() => void review(item, 'rejeitado')}><Icon name="trash-outline" size={16} />Rejeitar</button></div>}</div></article>)}</div> : <Empty title={status === 'pendente' && !suggestionSearch ? 'Tudo revisado.' : 'Nenhuma sugestão encontrada.'}>{suggestionSearch ? 'Tente outra palavra ou limpe a pesquisa.' : 'As contribuições da comunidade aparecerão aqui.'}</Empty>}
      </section>}
      {section === 'create' && <TermEditor terms={data.terms} busy={!!busy} onSave={create} />}
      {section === 'terms' && <section aria-label="Termos publicados"><label className="admin-search manage-search"><Icon name="search-outline" size={20} /><span className="sr-only">Buscar no dicionário</span><input type="search" value={search} onChange={event => { setSearch(event.target.value); setVisible(20); }} placeholder="Buscar no dicionário…" />{search && <button type="button" aria-label="Limpar busca de termos" onClick={() => setSearch('')}><Icon name="close-outline" size={17} /></button>}<span className="admin-search-count" role="status">{terms.length} resultado{terms.length === 1 ? '' : 's'}</span></label>
        <div className="admin-filters admin-alphabet" role="group" aria-label="Filtrar termos pela primeira letra"><button type="button" className={!letter ? 'selected' : ''} aria-pressed={!letter} onClick={() => { setLetter(''); setVisible(20); }}>Todos ({data.terms.length})</button>{'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(initial => <button type="button" key={initial} aria-label={`Termos com a letra ${initial}`} aria-pressed={letter === initial} className={letter === initial ? 'selected' : ''} onClick={() => { setLetter(initial); setVisible(20); }}>{initial}</button>)}</div>
        {terms.length ? <><div className="admin-list">{terms.slice(0, visible).map(item => <article key={item.id} className="admin-surface admin-term-row"><TermIcon term={item} /><div className="admin-term-copy"><h2>{item.termo}</h2><p>{item.descricao}</p>{item.categoria && <span className="admin-category">{item.categoria}</span>}</div><div className="admin-row-actions"><button type="button" className="admin-button blue small" disabled={!!busy} aria-label={`Editar termo ${item.termo}`} onClick={() => { setNotice(null); setEditing(item); }}><Icon name="create-outline" size={17} />Editar</button><button type="button" className="admin-button danger small" disabled={!!busy} aria-label={`Remover termo ${item.termo}`} onClick={() => { setNotice(null); setRemoving(item); }}><Icon name="trash-outline" size={17} />Remover</button></div></article>)}</div>{visible < terms.length && <button type="button" className="admin-button secondary admin-show-more" onClick={() => setVisible(count => count + 20)}>Mostrar mais termos <Icon name="chevron-down-outline" size={17} /></button>}</> : <Empty title="Nenhum termo encontrado." icon="search-outline">Tente outra palavra ou selecione todas as letras.</Empty>}
      </section>}
      </>}
    </div></main>
    {editing && <Modal title="Editar termo" busy={!!busy} onClose={() => setEditing(null)}>{notice?.error && <div className="admin-notice error" role="alert">{notice.text}</div>}<TermEditor term={editing} terms={data.terms} busy={!!busy} onSave={saveEdit} onCancel={() => setEditing(null)} /></Modal>}
    {removing && <Modal title="Remover termo?" busy={!!busy} onClose={() => setRemoving(null)}>{notice?.error && <div className="admin-notice error" role="alert">{notice.text}</div>}<p className="admin-delete-copy">“{removing.termo}” será removido do dicionário. Esta ação não pode ser desfeita pelo painel.</p><div className="admin-editor-actions"><button type="button" className="admin-button secondary" disabled={!!busy} autoFocus onClick={() => setRemoving(null)}>Cancelar</button><button type="button" className="admin-button danger" disabled={!!busy} onClick={() => void remove()}>{busy === 'remove' ? <span className="spinner" /> : <Icon name="trash-outline" size={18} />}Remover termo</button></div></Modal>}
  </div>;
}
