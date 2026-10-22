import { normalize, parseTerm } from './dictionary';
import type { Term } from './dictionary';

export type AdminTerm = Term & { categoria?: string };
export type ReviewStatus = 'pendente' | 'aprovado' | 'rejeitado';
export type AdminSuggestion = { id: string; termo: string; descricao: string; status: ReviewStatus; date: number | null };
export type TermDraft = { name: string; description: string; examples: string; category: string };
export type TermPayload = { termo: string; descricao: string; exemplos?: string[]; categoria?: string };
export type AdminData = { terms: AdminTerm[]; suggestions: AdminSuggestion[] };
export type AdminRepository = {
  load: () => Promise<AdminData>;
  allocateId: () => string;
  create: (payload: TermPayload, id: string) => Promise<AdminTerm>;
  review: (id: string, decision: Exclude<ReviewStatus, 'pendente'>) => Promise<AdminTerm | null>;
  update: (id: string, payload: TermPayload) => Promise<void>;
  remove: (id: string) => Promise<void>;
};

export function parseAdminTerm(id: string, data: Record<string, unknown>): AdminTerm | null {
  const term = parseTerm(id, data);
  return term ? { ...term, categoria: typeof data.categoria === 'string' ? data.categoria.trim() : undefined } : null;
}
export function parseAdminSuggestion(id: string, data: Record<string, unknown>): AdminSuggestion | null {
  const term = parseTerm(id, data);
  if (!term || !['pendente', 'aprovado', 'rejeitado'].includes(String(data.status))) return null;
  const stamp = data.data;
  let date: number | null = null;
  if (stamp instanceof Date) date = stamp.getTime();
  else if (stamp && typeof stamp === 'object' && 'toMillis' in stamp && typeof stamp.toMillis === 'function') date = stamp.toMillis();
  return { id, termo: term.termo, descricao: term.descricao, status: data.status as ReviewStatus, date: Number.isFinite(date) ? date : null };
}
export function draftFor(term?: AdminTerm): TermDraft {
  return { name: term?.termo ?? '', description: term?.descricao ?? '', examples: term?.exemplos?.join('\n') ?? '', category: term?.categoria ?? '' };
}
export function validateTermDraft(draft: TermDraft, descriptionLimit = 600): Partial<Record<keyof TermDraft, string>> {
  const errors: Partial<Record<keyof TermDraft, string>> = {};
  if (draft.name.trim().length < 2 || draft.name.trim().length > 80) errors.name = 'Use de 2 a 80 caracteres no nome.';
  if (draft.description.trim().length < 10) errors.description = 'Explique o termo com pelo menos 10 caracteres.';
  else if (draft.description.length > descriptionLimit) errors.description = `Use até ${descriptionLimit} caracteres na descrição.`;
  if (draft.examples.length > 2000) errors.examples = 'Use até 2.000 caracteres nos exemplos.';
  if (draft.category.trim().length > 60) errors.category = 'Use até 60 caracteres na categoria.';
  return errors;
}
export function termPayload(draft: TermDraft): TermPayload {
  const examples = draft.examples.split('\n').map(line => line.trim()).filter(Boolean);
  const category = draft.category.trim();
  return { termo: draft.name.trim().toLocaleLowerCase('pt-BR'), descricao: draft.description.trim(), ...(examples.length ? { exemplos: examples } : {}), ...(category ? { categoria: category } : {}) };
}
export function matchesAdminSearch(item: { termo: string; descricao: string }, query: string) {
  const needle = normalize(query.trim());
  return !needle || normalize(item.termo).includes(needle) || normalize(item.descricao).includes(needle);
}
