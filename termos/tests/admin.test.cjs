const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const Module = require('node:module');
const adminFile = `${__dirname}/../src/lib/admin.ts`;
const adminModule = new Module(adminFile, module);
adminModule.require = name => name === './dictionary' ? require('../src/lib/dictionary.ts') : require(name);
adminModule._compile(ts.transpileModule(fs.readFileSync(adminFile, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, adminFile);
const admin = adminModule.exports;

test('admin records preserve optional term data and reject malformed suggestions', () => {
  const term = admin.parseAdminTerm('api', { termo: 'API', descricao: 'Uma interface.', explicacao: 'Detalhes reais', exemplos: ['Um exemplo'], relacionados: ['rede'], categoria: ' Redes ' });
  assert.deepEqual(term.relacionados, ['rede']);
  assert.equal(term.explicacao, 'Detalhes reais');
  assert.equal(term.categoria, 'Redes');
  assert.equal(admin.parseAdminSuggestion('bad', { termo: 12, status: 'pendente' }), null);
  assert.equal(admin.parseAdminSuggestion('bad', { termo: 'API', descricao: 'Texto', status: 'outro' }), null);
  assert.equal(admin.parseAdminSuggestion('s', { termo: 'API', descricao: 'Texto', status: 'pendente' }).date, null);
  assert.equal(admin.parseAdminSuggestion('s', { termo: 'API', descricao: 'Texto', status: 'pendente', data: { toMillis: () => 1234 } }).date, 1234);
});
test('term editor validates fields and creates the schema consumed by the dictionary', () => {
  assert.ok(admin.validateTermDraft(admin.draftFor()).name);
  const draft = { name: '  Computação em Nuvem ', description: ' Acesso remoto a recursos computacionais. ', examples: ' Primeiro exemplo\n\n Segundo exemplo ', category: ' Infraestrutura ' };
  assert.deepEqual(admin.validateTermDraft(draft), {});
  assert.deepEqual(admin.termPayload(draft), { termo: 'computação em nuvem', descricao: 'Acesso remoto a recursos computacionais.', exemplos: ['Primeiro exemplo', 'Segundo exemplo'], categoria: 'Infraestrutura' });
  assert.ok(admin.validateTermDraft({ ...draft, description: 'x'.repeat(601) }).description);
  assert.equal(admin.matchesAdminSearch({ termo: 'Computação', descricao: 'Recursos remotos' }, 'COMPUTACAO'), true);
  assert.equal(admin.matchesAdminSearch({ termo: 'Nuvem', descricao: 'Computação remota' }, 'computacao'), true);
  assert.deepEqual(admin.termPayload({ ...draft, examples: '', category: '' }), { termo: 'computação em nuvem', descricao: 'Acesso remoto a recursos computacionais.' });
});

function repository() {
  const documents = new Map([['sugestoes/pending', { termo: ' API ', descricao: ' Uma interface entre sistemas. ', status: 'pendente' }], ['termos/existing', { termo: 'rede', descricao: 'Uma rede existente.', explicacao: 'Detalhes preservados', relacionados: ['api'] }]]);
  const commits = [];
  let nextId = 0;
  const doc = (parent, name, id) => name ? { path: `${name}/${id}`, id } : { path: `${parent.path}/new-${++nextId}`, id: `new-${nextId}` };
  const update = (ref, fields) => documents.set(ref.path, { ...documents.get(ref.path), ...fields });
  const firestore = {
    collection: (_, name) => ({ path: name }), doc,
    getDocs: async ref => ({ docs: [...documents].filter(([path]) => path.startsWith(`${ref.path}/`)).map(([path, value]) => ({ id: path.split('/')[1], data: () => value })) }),
    setDoc: async (ref, fields) => { documents.set(ref.path, fields); },
    updateDoc: async (ref, fields) => { update(ref, fields); },
    deleteDoc: async ref => { documents.delete(ref.path); },
    runTransaction: async (_, callback) => {
      const writes = [];
      const value = await callback({
        get: async ref => ({ id: ref.id, exists: () => documents.has(ref.path), data: () => documents.get(ref.path) }),
        set: (ref, fields) => writes.push(() => documents.set(ref.path, fields)),
        update: (ref, fields) => writes.push(() => update(ref, fields)),
      });
      writes.forEach(write => write()); commits.push(writes.length); return value;
    },
  };
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync(`${__dirname}/../src/lib/adminRepository.ts`, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  vm.runInNewContext(source, { exports, require: name => name === 'firebase/firestore' ? firestore : name === './admin' ? admin : { db: {} } });
  return { repo: exports.adminRepository, documents, commits };
}
test('approval publishes and marks the suggestion in one transaction; a repeated review cannot publish again', async () => {
  const { repo, documents, commits } = repository();
  const result = await repo.review('pending', 'aprovado');
  assert.equal(result.termo, 'api');
  assert.equal(documents.get('sugestoes/pending').status, 'aprovado');
  assert.equal(documents.get(`termos/${result.id}`).descricao, 'Uma interface entre sistemas.');
  assert.deepEqual(commits, [2]);
  await assert.rejects(repo.review('pending', 'aprovado'), /já foi revisada/);
  assert.equal([...documents.keys()].filter(path => path.startsWith('termos/')).length, 2);
});
test('rejection never publishes a term and edits preserve fields outside the form', async () => {
  const { repo, documents, commits } = repository();
  assert.equal(await repo.review('pending', 'rejeitado'), null);
  assert.deepEqual(commits, [1]);
  const payload = admin.termPayload({ name: 'Rede', description: 'Uma descrição revisada.', examples: '', category: '' });
  await repo.update('existing', payload);
  assert.equal(documents.get('termos/existing').explicacao, 'Detalhes preservados');
  assert.deepEqual(documents.get('termos/existing').relacionados, ['api']);
  await repo.create(payload, 'stable-id'); await repo.create(payload, 'stable-id');
  assert.equal([...documents.keys()].filter(path => path === 'termos/stable-id').length, 1);
  await repo.remove('existing');
  assert.equal(documents.has('termos/existing'), false);
});
