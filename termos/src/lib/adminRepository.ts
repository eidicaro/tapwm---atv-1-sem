import { collection, deleteDoc, doc, getDocs, runTransaction, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../backend/firebaseconfig';
import { parseAdminSuggestion, parseAdminTerm } from './admin';
import type { AdminRepository } from './admin';

export const adminRepository: AdminRepository = {
  async load() {
    const [terms, suggestions] = await Promise.all([getDocs(collection(db, 'termos')), getDocs(collection(db, 'sugestoes'))]);
    return {
      terms: terms.docs.flatMap(item => { const term = parseAdminTerm(item.id, item.data()); return term ? [term] : []; }).sort((a, b) => a.termo.localeCompare(b.termo, 'pt-BR')),
      suggestions: suggestions.docs.flatMap(item => { const suggestion = parseAdminSuggestion(item.id, item.data()); return suggestion ? [suggestion] : []; }),
    };
  },
  allocateId: () => doc(collection(db, 'termos')).id,
  async create(payload, id) {
    await setDoc(doc(db, 'termos', id), payload);
    return { id, ...payload };
  },
  async review(id, decision) {
    const suggestionRef = doc(db, 'sugestoes', id);
    const termRef = doc(collection(db, 'termos'));
    // One transaction prevents a partial approval or two admins publishing the same suggestion.
    return runTransaction(db, async transaction => {
      const snapshot = await transaction.get(suggestionRef);
      const suggestion = snapshot.exists() ? parseAdminSuggestion(snapshot.id, snapshot.data()) : null;
      if (!suggestion || suggestion.status !== 'pendente') throw new Error('Esta sugestão já foi revisada. Atualize o painel.');
      const published = { id: termRef.id, termo: suggestion.termo.trim().toLocaleLowerCase('pt-BR'), descricao: suggestion.descricao.trim() };
      if (decision === 'aprovado') transaction.set(termRef, { termo: published.termo, descricao: published.descricao });
      transaction.update(suggestionRef, { status: decision });
      return decision === 'aprovado' ? published : null;
    });
  },
  async update(id, payload) { await updateDoc(doc(db, 'termos', id), payload); },
  async remove(id) { await deleteDoc(doc(db, 'termos', id)); },
};
