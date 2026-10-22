// Explicitly isolated fixtures: no Firebase, auth provider or production writes.
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import AdminWorkspace from '../../src/components/AdminWorkspace.web';
import LoginView from '../../src/components/LoginView.web';
import type { AdminData, AdminRepository } from '../../src/lib/admin';

const data: AdminData = {
  terms: [
    { id: 'algorithm', termo: 'Algoritmo', descricao: 'Sequência lógica de passos para resolver um problema.' },
    { id: 'antivirus', termo: 'Antivírus', descricao: 'Programas que monitoram, detectam e eliminam vírus de computador.' },
    { id: 'api', termo: 'API', descricao: 'Interface que permite comunicação entre sistemas.', explicacao: 'Detalhes preservados na edição.', exemplos: ['Integração de sistemas.'], categoria: 'Desenvolvimento' },
    { id: 'big-data', termo: 'Big Data', descricao: 'Grande volume de dados.' },
  ],
  suggestions: [
    { id: 'quantum', termo: 'Computação quântica', descricao: 'Tecnologia que utiliza os princípios da mecânica quântica para processar informações.', status: 'pendente', date: Date.parse('2026-10-20T13:00:00Z') },
    { id: 'edge', termo: 'Edge Computing', descricao: 'Processamento de dados na borda da rede, próximo à fonte de dados.', status: 'pendente', date: Date.parse('2026-10-18T12:00:00Z') },
    { id: 'ml', termo: 'Machine Learning', descricao: 'Área da inteligência artificial que permite que sistemas aprendam com dados.', status: 'pendente', date: null },
    { id: 'done', termo: 'Termo revisado', descricao: 'Contribuição já revisada no adaptador de testes.', status: 'aprovado', date: null },
    { id: 'rejected', termo: 'Outra contribuição', descricao: 'Contribuição rejeitada no adaptador de testes.', status: 'rejeitado', date: null },
  ],
};
const state = { calls: [] as string[], failNext: new URLSearchParams(location.search).has('failLoad') ? 'load' : '', delay: 200, logins: 0, success: false, loggedOut: false, changes: 0 };
Object.assign(window, { __adminTest: state });
async function operation(name: string) {
  state.calls.push(name);
  await new Promise(resolve => setTimeout(resolve, state.delay));
  if (state.failNext === name) { state.failNext = ''; throw new Error('Falha simulada'); }
}
let sequence = 0;
const repository: AdminRepository = {
  load: async () => { await operation('load'); return structuredClone(data); },
  allocateId: () => `test-${++sequence}`,
  create: async (payload, id) => { await operation('create'); const value = { id, ...payload }; data.terms = [...data.terms.filter(item => item.id !== id), value]; return value; },
  review: async (id, decision) => { await operation('review'); const item = data.suggestions.find(value => value.id === id)!; item.status = decision; const term = { id: `approved-${id}`, termo: item.termo.toLowerCase(), descricao: item.descricao }; if (decision === 'aprovado') data.terms.push(term); return decision === 'aprovado' ? term : null; },
  update: async (id, payload) => { await operation('update'); data.terms = data.terms.map(item => item.id === id ? { ...item, ...payload } : item); },
  remove: async id => { await operation('remove'); data.terms = data.terms.filter(item => item.id !== id); },
};
function Harness() {
  const [dark, setDark] = useState(new URLSearchParams(location.search).get('theme') !== 'light');
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  const props = { isDark: dark, toggleTheme: () => setDark(value => !value) };
  return new URLSearchParams(location.search).get('view') === 'login'
    ? <LoginView {...props} login={async () => { state.logins += 1; await operation('login'); }} onSuccess={() => { state.success = true; }} />
    : <AdminWorkspace {...props} repository={repository} onDictionaryChange={() => { state.changes += 1; }} onLogout={async () => { await operation('logout'); state.loggedOut = true; }} />;
}
createRoot(document.getElementById('root')!).render(<Harness />);
