const { test } = require('node:test');
const assert = require('node:assert/strict');
const { normalize, parseTerm, searchTerms, filterCatalog, relatedTerms, highlightParts, summarize, searchSnippet, validateSuggestion } = require('../src/lib/dictionary.ts');
// Fixtures are local to tests; application data always comes from Firestore.
const terms = [
  { id: 'gateway', termo: 'API Gateway', descricao: 'Entrada de APIs.' },
  { id: 'description', termo: 'Integração', descricao: 'Usa uma API entre sistemas.' },
  { id: 'exact', termo: 'API', descricao: 'Comunicação entre sistemas.' },
  { id: 'includes', termo: 'OpenAPI', descricao: 'Especificação.' },
  { id: 'security', termo: 'Segurança', descricao: 'Proteção de dados.' },
];
test('normalizes accents, case and surrounding query spaces', () => {
  assert.equal(normalize('SEGURANÇA'), 'seguranca');
  assert.deepEqual(searchTerms(terms, '  SEGURANCA ').map(term => term.id), ['security']);
});
test('ranks exact names before prefixes, substrings and descriptions', () => {
  assert.deepEqual(searchTerms(terms, 'api').map(term => term.id), ['exact', 'gateway', 'includes', 'description']);
});
test('empty query returns every term alphabetically and missing query returns none', () => {
  assert.equal(searchTerms(terms, '').length, terms.length);
  assert.equal(searchTerms(terms, 'no-such-term').length, 0);
  assert.equal(searchTerms(terms, '')[0].id, 'exact');
});
test('catalog combines query and alphabet filtering, including reverse order', () => {
  assert.deepEqual(filterCatalog(terms, 'api', 'a').map(term => term.id), ['exact', 'gateway']);
  assert.deepEqual(filterCatalog(terms, 'api', 'a', true).map(term => term.id), ['gateway', 'exact']);
  assert.deepEqual(filterCatalog(terms, '', 'S').map(term => term.id), ['security']);
});
test('validates Firestore documents and never invents missing details', () => {
  assert.equal(parseTerm('bad', { termo: 12, descricao: 'x' }), null);
  assert.equal(parseTerm('bad', { termo: ' ', descricao: 'x' }), null);
  const parsed = parseTerm('ok', { termo: ' API ', descricao: ' Description ', exemplos: ['An example', 12, ''], relacionados: ['exact', null] });
  assert.equal(parsed.termo, 'API');
  assert.equal(parsed.explicacao, undefined);
  assert.deepEqual(parsed.exemplos, ['An example']);
  assert.deepEqual(parsed.relacionados, ['exact']);
});
test('related terms require explicit references and exclude the current term', () => {
  assert.deepEqual(relatedTerms(terms[2], terms), []);
  assert.deepEqual(relatedTerms({ ...terms[2], relacionados: ['API', 'gateway', 'seguranca', 'missing'] }, terms).map(term => term.id), ['gateway', 'security']);
});
test('highlights repeated case/accent insensitive matches preserving original text', () => {
  const parts = highlightParts('Segurança e SEGURANÇA', 'seguranca');
  assert.deepEqual(parts.filter(part => part.match).map(part => part.text), ['Segurança', 'SEGURANÇA']);
  assert.equal(parts.map(part => part.text).join(''), 'Segurança e SEGURANÇA');
});
test('summaries preserve a complete first sentence where possible', () => {
  const sentence = 'Uma explicação completa com contexto suficiente.';
  assert.equal(summarize(`${sentence} ${'Mais detalhes '.repeat(30)}`, 80), sentence);
  assert.equal(summarize('Texto curto.'), 'Texto curto.');
  assert.ok(summarize('palavras '.repeat(80), 80).endsWith('…'));
});
test('suggestions reject empty/short/oversized input and accept useful explanations', () => {
  assert.ok(validateSuggestion(' ', ' ').term);
  assert.ok(validateSuggestion('API', 'curto').description);
  assert.ok(validateSuggestion('a'.repeat(81), 'Uma explicação válida.').term);
  assert.ok(validateSuggestion('API', 'a'.repeat(501)).description);
  assert.deepEqual(validateSuggestion(' API ', 'Uma explicação válida.'), { term: undefined, description: undefined });
});
test('description matches remain visible in autocomplete snippets', () => {
  const text = 'Uma introdução longa que explica o contexto inicial. ' + 'Mais contexto '.repeat(15) + 'segurança de dados no final.';
  assert.ok(normalize(searchSnippet(text, 'SEGURANCA')).includes('seguranca'));
  assert.equal(searchSnippet('Texto curto.', 'ausente'), 'Texto curto.');
});