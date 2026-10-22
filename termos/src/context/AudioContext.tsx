import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { usePathname, useGlobalSearchParams } from 'expo-router';
import * as Speech from 'expo-speech';
import { Term } from '../lib/dictionary';
import { speakWebSpeech, stopWebSpeech } from '../lib/webSpeech';

type Audio = { speaking: string | null; error: string; listen: (term: Term) => Promise<void>; stop: () => void };
const AudioContext = createContext<Audio>({ speaking: null, error: '', listen: async () => undefined, stop: () => undefined });
export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [speaking, setSpeaking] = useState<string | null>(null);
  const [error, setError] = useState('');
  const current = useRef<string | null>(null);
  const generation = useRef(0);
  const watchdog = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();
  const { id } = useGlobalSearchParams();
  const stop = useCallback(() => {
    if (watchdog.current) clearTimeout(watchdog.current);
    generation.current += 1;
    current.current = null;
    setSpeaking(null);
    if (Platform.OS === 'web') stopWebSpeech();
    else void Speech.stop().catch(() => undefined);
  }, []);
  useEffect(() => { stop(); setError(''); return stop; }, [pathname, id, stop]);
  const listen = async (term: Term) => {
    if (Platform.OS === 'web' && (typeof window === 'undefined' || !window.speechSynthesis || typeof window.speechSynthesis.speak !== 'function' || typeof SpeechSynthesisUtterance === 'undefined')) {
      setError('A leitura em voz alta não está disponível neste navegador.');
      return;
    }
    const stopOnly = current.current === term.id;
    if (watchdog.current) clearTimeout(watchdog.current);
    const version = ++generation.current;
    current.current = stopOnly ? null : term.id;
    setSpeaking(current.current);
    setError('');
    const finish = () => { if (version === generation.current) { if (watchdog.current) clearTimeout(watchdog.current); current.current = null; setSpeaking(null); } };
    const fail = () => { if (version === generation.current) { finish(); setError('Não foi possível reproduzir o áudio. Tente novamente ou confira as vozes do seu dispositivo.'); } };
    try {
      if (Platform.OS === 'web') stopWebSpeech();
      else await Speech.stop();
      if (version !== generation.current || stopOnly) return;
      watchdog.current = setTimeout(() => {
        if (version !== generation.current) return;
        if (Platform.OS === 'web') stopWebSpeech();
        else void Speech.stop().catch(() => undefined);
        fail();
      }, 7000);
      const text = `${term.termo}. ${term.descricao}${term.explicacao ? `. ${term.explicacao}` : ''}`;
      const callbacks = {
        onStart: () => { if (version === generation.current && watchdog.current) clearTimeout(watchdog.current); },
        onDone: finish, onError: fail,
      };
      if (Platform.OS === 'web') speakWebSpeech(text, callbacks);
      else Speech.speak(text, { language: 'pt-BR', rate: 0.86, pitch: 1, ...callbacks, onStopped: finish });
    } catch { fail(); }
  };
  return <AudioContext.Provider value={{ speaking, error, listen, stop }}>{children}</AudioContext.Provider>;
}
export function useAudio() { return useContext(AudioContext); }
