export type Term = {
  id: string;
  termo: string;
  descricao: string;
  explicacao?: string;
  exemplos?: string[];
  relacionados?: string[];
};

export function normalize(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
}

export function parseTerm(id: string, data: Record<string, unknown>): Term | null {
  if (typeof data.termo !== 'string' || !data.termo.trim() || typeof data.descricao !== 'string') return null;
  return {
    id, termo: data.termo.trim(), descricao: data.descricao.trim(),
    explicacao: typeof data.explicacao === 'string' ? data.explicacao.trim() : undefined,
    exemplos: Array.isArray(data.exemplos) ? data.exemplos.filter((item): item is string => typeof item === 'string' && !!item.trim()) : undefined,
    relacionados: Array.isArray(data.relacionados) ? data.relacionados.filter((item): item is string => typeof item === 'string') : undefined,
  };
}

export function searchTerms(terms: Term[], query: string): Term[] {
  const needle = normalize(query.trim());
  const score = (term: Term) => {
    const name = normalize(term.termo);
    if (name === needle) return 0;
    if (name.startsWith(needle)) return 1;
    if (name.includes(needle)) return 2;
    if (normalize(term.descricao).includes(needle)) return 3;
    return 4;
  };
  return terms.filter(term => !needle || score(term) < 4).sort((a, b) =>
    (needle ? score(a) - score(b) : 0) || a.termo.localeCompare(b.termo, 'pt-BR'));
}

export function filterCatalog(terms: Term[], query: string, letter: string, descending = false): Term[] {
  return searchTerms(terms, query)
    .filter(term => !letter || normalize(term.termo).startsWith(normalize(letter)))
    .sort((a, b) => (descending ? -1 : 1) * a.termo.localeCompare(b.termo, 'pt-BR'));
}

export function summarize(value: string, limit = 170): string {
  if (value.length <= limit) return value;
  const sentence = value.match(/^.{30,}?[.!?](?:\s|$)/)?.[0]?.trim();
  if (sentence && sentence.length <= limit + 50) return sentence;
  const boundary = value.lastIndexOf(' ', limit);
  return `${value.slice(0, boundary > 0 ? boundary : limit).trimEnd()}…`;
}

export function searchSnippet(value: string, query: string, limit = 105): string {
  const needle = normalize(query.trim());
  const short = summarize(value, limit);
  const index = normalize(value).indexOf(needle);
  if (!needle || index < 0 || normalize(short).includes(needle)) return short;
  const start = value.lastIndexOf(' ', Math.max(0, index - 30)) + 1;
  return `${start ? '…' : ''}${summarize(value.slice(start), Math.max(limit, needle.length + 35))}`;
}
export function relatedTerms(term: Term, terms: Term[]): Term[] {
  const explicit = term.relacionados ?? [];
  return terms.filter(other => other.id !== term.id &&
    explicit.some(reference => reference === other.id || normalize(reference) === normalize(other.termo)));
}

export function highlightParts(value: string, query: string): { text: string; match: boolean }[] {
  const needle = normalize(query.trim());
  if (!needle) return [{ text: value, match: false }];
  const source = normalize(value);
  const parts: { text: string; match: boolean }[] = [];
  let cursor = 0;
  let index = source.indexOf(needle);
  while (index >= 0) {
    if (index > cursor) parts.push({ text: value.slice(cursor, index), match: false });
    parts.push({ text: value.slice(index, index + needle.length), match: true });
    cursor = index + needle.length;
    index = source.indexOf(needle, cursor);
  }
  if (cursor < value.length) parts.push({ text: value.slice(cursor), match: false });
  return parts;
}

export function validateSuggestion(term: string, description: string): { term?: string; description?: string } {
  return {
    term: term.trim().length < 2 ? 'Digite um termo com pelo menos 2 caracteres.' : term.trim().length > 80 ? 'Use até 80 caracteres no nome.' : undefined,
    description: description.trim().length < 10 ? 'Explique o termo com pelo menos 10 caracteres.' : description.length > 500 ? 'Use até 500 caracteres na explicação.' : undefined,
  };
}