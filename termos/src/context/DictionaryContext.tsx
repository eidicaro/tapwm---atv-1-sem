import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../backend/firebaseconfig';
import { parseTerm, Term } from '../lib/dictionary';

type Dictionary = { terms: Term[]; loading: boolean; error: boolean; reload: () => void };
const DictionaryContext = createContext<Dictionary>({ terms: [], loading: true, error: false, reload: () => undefined });

export function DictionaryProvider({ children }: { children: React.ReactNode }) {
  const [terms, setTerms] = useState<Term[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const request = useRef(0);
  const reload = useCallback(() => {
    const current = ++request.current;
    setLoading(true);
    setError(false);
    getDocs(collection(db, 'termos')).then(snapshot => {
      if (current !== request.current) return;
      const valid = snapshot.docs.map(document => parseTerm(document.id, document.data())).filter((item): item is Term => item !== null);
      setTerms(valid.sort((a, b) => a.termo.localeCompare(b.termo, 'pt-BR')));
    }).catch(() => { if (current === request.current) setError(true); })
      .finally(() => { if (current === request.current) setLoading(false); });
  }, []);
  useEffect(() => { reload(); return () => { request.current += 1; }; }, [reload]);
  return <DictionaryContext.Provider value={{ terms, loading, error, reload }}>{children}</DictionaryContext.Provider>;
}
export function useDictionary() { return useContext(DictionaryContext); }