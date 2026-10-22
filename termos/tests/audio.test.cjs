const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function setup(platform = 'web') {
  const calls = [];
  const voices = [{ lang: 'en-US' }, { lang: 'pt-BR' }];
  const synthesis = {
    paused: true,
    getVoices: () => voices,
    cancel: () => calls.push('cancel'),
    speak: utterance => calls.push(utterance),
    resume() { calls.push('resume'); this.paused = false; },
  };
  const sandbox = {
    window: { speechSynthesis: synthesis },
    SpeechSynthesisUtterance: class { constructor(text) { this.text = text; } },
    setTimeout, clearTimeout,
  };
  function load(file, mocks = {}) {
    const exports = {};
    vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
    }).outputText, { ...sandbox, exports, require: name => {
      assert.ok(name in mocks, `Unexpected import: ${name}`);
      return mocks[name];
    } });
    return exports;
  }
  const webSpeech = load(`${__dirname}/../src/lib/webSpeech.ts`);
  const audio = load(`${__dirname}/../src/context/AudioContext.tsx`, {
    react: {
      createContext: () => ({ Provider: 'provider' }),
      useCallback: fn => fn, useContext: () => {}, useEffect: () => {},
      useRef: current => ({ current }), useState: value => [value, () => {}],
    },
    'react/jsx-runtime': { jsx: (_, props) => props.value },
    'react-native': { Platform: { OS: platform } },
    'expo-router': { usePathname: () => '/', useGlobalSearchParams: () => ({}) },
    'expo-speech': { stop: async () => { calls.push('native-stop'); }, speak: (...args) => calls.push(args) },
    '../lib/webSpeech': webSpeech,
  }).AudioProvider({ children: null });
  return { audio, calls, synthesis, voices };
}
const term = { id: 'api', termo: 'API', descricao: 'Uma interface.', explicacao: 'Conecta sistemas.' };

test('web speech starts synchronously in the click and resumes a paused synthesizer', async () => {
  const { audio, calls, voices } = setup();
  const pending = audio.listen(term);
  assert.equal(calls[0], 'cancel');
  const utterance = calls[1];
  assert.equal(utterance.text, 'API. Uma interface.. Conecta sistemas.');
  assert.equal(utterance.voice, voices[1]);
  assert.equal(utterance.lang, 'pt-BR');
  assert.equal(calls[2], 'resume');
  utterance.onstart();
  utterance.onend();
  await pending;
});

test('switching terms cancels old speech, ignores stale callbacks, and toggles off', async () => {
  const { audio, calls } = setup();
  await audio.listen(term);
  const old = calls[1];
  const staleEnd = old.onend;
  await audio.listen({ ...term, id: 'other' });
  const next = calls[4];
  assert.equal(old.onend, null);
  staleEnd();
  await audio.listen({ ...term, id: 'other' });
  assert.equal(next.onend, null);
  assert.equal(calls.length, 6);
});

test('web speech works while voices are still loading and can retry after an error', async () => {
  const { audio, calls, synthesis } = setup();
  synthesis.getVoices = () => [];
  await audio.listen(term);
  calls[1].onerror();
  await audio.listen(term);
  assert.equal(typeof calls[4], 'object');
  audio.stop();
});

test('native speech still waits for cancellation and forwards completion callbacks', async () => {
  const { audio, calls } = setup('android');
  const pending = audio.listen(term);
  assert.deepEqual(calls, ['native-stop']);
  await pending;
  assert.equal(calls[1][1].language, 'pt-BR');
  calls[1][1].onDone();
});
