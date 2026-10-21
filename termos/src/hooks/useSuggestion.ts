import { useCallback, useRef, useState } from 'react';
import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../backend/firebaseconfig';
import { validateSuggestion } from '../lib/dictionary';
import { createSuggestionSender } from '../lib/suggestion';

function makeSender() {
  return createSuggestionSender(() => doc(collection(db, 'sugestoes')).id, (id, payload) => setDoc(doc(db, 'sugestoes', id), payload));
}
export function useSuggestion(initialTerm = '') {
  const [term, setTermValue] = useState(initialTerm);
  const [description, setDescriptionValue] = useState('');
  const [errors, setErrors] = useState<{ term?: string; description?: string }>({});
  const [state, setState] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const setTerm = useCallback((value: string) => {
    setTermValue(value);
    setErrors(current => current.term ? { ...current, term: validateSuggestion(value, 'valid explanation').term } : current);
  }, []);
  const setDescription = useCallback((value: string) => {
    setDescriptionValue(value);
    setErrors(current => current.description ? { ...current, description: validateSuggestion('valid term', value).description } : current);
  }, []);
  const busy = useRef(false);
  const sender = useRef<ReturnType<typeof makeSender> | null>(null);
  if (!sender.current) sender.current = makeSender();
  const submit = async () => {
    if (busy.current || state === 'success') return;
    const validation = validateSuggestion(term, description);
    setErrors(validation);
    if (validation.term || validation.description) return;
    busy.current = true;
    setState('sending');
    try {
      await sender.current!(term, description);
      setState('success');
    } catch { setState('error'); } finally { busy.current = false; }
  };
  const reset = () => { setTerm(''); setDescription(''); setErrors({}); setState('idle'); sender.current = makeSender(); };
  return { term, setTerm, description, setDescription, errors, state, submit, reset };
}