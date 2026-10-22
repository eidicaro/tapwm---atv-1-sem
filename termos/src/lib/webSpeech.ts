type Callbacks = { onStart: () => void; onDone: () => void; onError: () => void };

// Keep the utterance alive until completion (some browsers otherwise lose callbacks).
let activeUtterance: SpeechSynthesisUtterance | null = null;

export function stopWebSpeech() {
  const previous = activeUtterance;
  activeUtterance = null;
  if (previous) previous.onstart = previous.onend = previous.onerror = null;
  if (typeof window !== 'undefined') window.speechSynthesis?.cancel();
}

export function speakWebSpeech(text: string, callbacks: Callbacks) {
  const synthesis = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'pt-BR';
  utterance.rate = 0.86;
  utterance.pitch = 1;
  utterance.volume = 1;
  const voices = synthesis.getVoices();
  const voice = voices.find(item => item.lang.replace('_', '-').toLowerCase() === 'pt-br')
    ?? voices.find(item => /^pt([-_]|$)/i.test(item.lang));
  if (voice) utterance.voice = voice;
  utterance.onstart = () => { if (activeUtterance === utterance) callbacks.onStart(); };
  utterance.onend = () => {
    if (activeUtterance !== utterance) return;
    activeUtterance = null;
    callbacks.onDone();
  };
  utterance.onerror = () => {
    if (activeUtterance !== utterance) return;
    activeUtterance = null;
    callbacks.onError();
  };
  activeUtterance = utterance;
  // Do not await voice loading or cancellation here: speak must stay in the click handler.
  synthesis.speak(utterance);
  if (synthesis.paused) synthesis.resume();
}
