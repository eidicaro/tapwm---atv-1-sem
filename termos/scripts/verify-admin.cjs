const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const http = require('node:http');
const { spawn } = require('node:child_process');
const assert = require('node:assert/strict');
const bundle = require('../tests/helpers/browser-bundle.cjs');
const project = path.resolve(__dirname, '..');
const artifacts = path.join(project, '.artifacts');
fs.mkdirSync(artifacts, { recursive: true });
const javascript = bundle(path.join(project, 'tests/fixtures/admin-harness.tsx'));
const html = '<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Isolated admin UI verification</title><link rel="stylesheet" href="/experience.css"><link rel="stylesheet" href="/admin.css"><style>html,body,#root{height:100%;margin:0}#root{display:flex}</style><div id="root"></div><script src="/harness.js"></script></html>';
const server = http.createServer((request, response) => {
  const name = new URL(request.url, 'http://localhost').pathname;
  if (name === '/') { response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }).end(html); return; }
  if (name === '/harness.js') { response.writeHead(200, { 'Content-Type': 'application/javascript' }).end(javascript); return; }
  const file = name === '/experience.css' || name === '/admin.css' ? path.join(project, 'src/components', name.slice(1)) : path.resolve(project, 'public', `.${name}`);
  if ((!file.startsWith(path.join(project, 'public') + path.sep) && !['/experience.css', '/admin.css'].includes(name)) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { response.writeHead(404).end(); return; }
  response.writeHead(200, { 'Content-Type': name.endsWith('.css') ? 'text/css' : 'font/ttf' }); fs.createReadStream(file).pipe(response);
});
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
let chrome, socket;
const results = [], errors = [];
async function main() {
  await new Promise(resolve => server.listen(4174, '127.0.0.1', resolve));
  chrome = spawn(process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--remote-debugging-port=9232', `--user-data-dir=${path.join(os.tmpdir(), 'dicionario-admin-qa')}`, '--no-first-run', '--no-default-browser-check', '--disable-gpu', 'about:blank'], { windowsHide: true, stdio: 'ignore' });
  for (let i = 0; i < 60; i++) { try { await fetch('http://127.0.0.1:9232/json/version'); break; } catch { await wait(200); } }
  const target = await (await fetch('http://127.0.0.1:9232/json/new?about:blank', { method: 'PUT' })).json();
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }));
  const pending = new Map(); let sequence = 0;
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.id) { const item = pending.get(message.id); if (item) { pending.delete(message.id); message.error ? item.reject(message.error) : item.resolve(message.result); } }
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails);
    if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') errors.push(message.params.args.map(item => item.value || item.description));
  });
  const cdp = (method, params = {}) => new Promise((resolve, reject) => { const id = ++sequence; pending.set(id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params })); });
  const evaluate = async expression => { const value = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }); if (value.exceptionDetails) throw new Error(JSON.stringify(value.exceptionDetails)); return value.result?.value; };
  const until = async (expression, timeout = 15000) => { const start = Date.now(); while (Date.now() - start < timeout) { if (await evaluate(`Boolean(${expression})`)) return; await wait(100); } throw new Error(`Timed out: ${expression}`); };
  const check = (name, value) => { assert.ok(value, name); results.push({ name, passed: true }); console.log(`PASS ${name}`); };
  const click = selector => evaluate(`(() => { const el = document.querySelector(${JSON.stringify(selector)}); el.focus(); el.click(); })()`);
  const input = (selector, text) => evaluate(`(() => { const el = document.querySelector(${JSON.stringify(selector)}); Object.getOwnPropertyDescriptor(el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype, 'value').set.call(el, ${JSON.stringify(text)}); el.dispatchEvent(new Event('input', { bubbles: true })); })()`);
  const shot = async name => { await evaluate('document.fonts.ready'); await wait(220); const value = await cdp('Page.captureScreenshot', { format: 'png' }); fs.writeFileSync(path.join(artifacts, name), Buffer.from(value.data, 'base64')); };
  const navigate = async url => { await cdp('Page.navigate', { url }); };
  const section = async id => {
    await click(`.admin-nav button:nth-child(${id})`);
    await until(`document.querySelector('.admin-nav button:nth-child(${id})').getAttribute('aria-current') === 'page'`);
    await until(`(() => { const nav = document.querySelector('.admin-nav').getBoundingClientRect(), active = document.querySelector('.admin-nav [aria-current="page"]').getBoundingClientRect(); return active.left >= nav.left - 1 && active.right <= nav.right + 1; })()`);
  };
  const contrast = selectors => evaluate(`(() => {
    const rgb = value => (value.match(/[\\d.]+/g) || []).map(Number);
    const luminance = color => { const c = color.slice(0, 3).map(n => { n /= 255; return n <= .04045 ? n / 12.92 : ((n + .055) / 1.055) ** 2.4; }); return .2126*c[0]+.7152*c[1]+.0722*c[2]; };
    return ${JSON.stringify(selectors)}.map(selector => { const el = document.querySelector(selector); const style = getComputedStyle(el); let node = el, bg;
      while (node) { const color = rgb(getComputedStyle(node).backgroundColor); if (color.length === 3 || color[3] > .99) { bg = color; break; } node = node.parentElement; }
      const a = luminance(rgb(style.color)), b = luminance(bg || [255,255,255]); return { selector, ratio: (Math.max(a,b)+.05)/(Math.min(a,b)+.05) };
    });
  })()`);
  await Promise.all([cdp('Page.enable'), cdp('Runtime.enable')]);
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });

  // Actual exported routes, using a clean headless profile and no credentials.
  await navigate('http://127.0.0.1:4173/admin');
  await until(`location.pathname === '/login' && document.querySelector('#admin-email')`, 45000);
  check('production admin route still requires authentication', true);
  await evaluate(`document.querySelector('.admin-login button[aria-label="Ativar tema claro"]')?.click()`);
  await until(`document.documentElement.dataset.theme === 'light'`);
  await shot('admin-login-light.png');
  check('login text contrast passes AA in light theme', (await contrast(['.admin-login-copy h1', '.admin-login-description', '.admin-login-card > p', '.admin-login-submit'])).every(item => item.ratio >= 4.5));
  await click('.admin-login-field button');
  check('production login can show and hide password', await evaluate(`document.querySelector('#admin-password').type === 'text'`));
  await click('.admin-login-submit');
  await until(`document.querySelector('#login-email-error')`);
  check('empty login validates locally and focuses email', await evaluate(`document.activeElement.id === 'admin-email'`));
  await navigate('http://127.0.0.1:4173/login');
  await until(`document.querySelector('#admin-email') && document.documentElement.dataset.theme === 'light'`);
  await click('.admin-login button[aria-label="Ativar tema escuro"]');
  await shot('admin-login-dark.png');

  // Real workspace component with a local in-memory repository; never production data.
  await navigate('http://127.0.0.1:4174/');
  await until(`document.querySelector('.admin-stats')`);
  check('overview metrics reflect repository data', await evaluate(`document.querySelectorAll('.admin-stat strong')[0].textContent === '4' && document.querySelectorAll('.admin-stat strong')[1].textContent === '3'`));
  await shot('admin-overview-dark.png');
  await section(2); await shot('admin-suggestions-dark.png');
  check('admin text and action contrast passes AA in dark theme', (await contrast(['.admin-heading h1', '.admin-heading p', '.admin-row-heading p', '.admin-status', '.admin-row-date', '.admin-button.primary', '.admin-button.danger'])).every(item => item.ratio >= 4.5));
  check('pending suggestions are shown initially', await evaluate(`document.querySelectorAll('.admin-suggestion').length === 3`));
  await input('.admin-search input', 'COMPUTACAO');
  await until(`document.querySelectorAll('.admin-suggestion').length === 1`);
  check('suggestion search ignores accents and case', true);
  await click('[aria-label="Limpar busca de sugestões"]');
  await click('.admin-filters button:first-child');
  await until(`document.querySelectorAll('.admin-suggestion').length === 5`);
  check('all statuses remain accessible', true);
  await click('.admin-filters button:nth-child(2)');
  await evaluate(`window.__adminTest.delay = 500; window.__adminTest.failNext = 'review'`);
  await click('[aria-label="Aprovar sugestão de Computação quântica"]');
  await until(`document.querySelector('.admin-notice.error')`);
  check('failed review keeps pending suggestion and announces error', await evaluate(`document.querySelectorAll('.admin-suggestion').length === 3`));
  await click('[aria-label="Aprovar sugestão de Computação quântica"]');
  await click('[aria-label="Aprovar sugestão de Computação quântica"]');
  await until(`document.querySelectorAll('.admin-suggestion').length === 2`);
  check('approval prevents concurrent clicks and updates pending count', await evaluate(`window.__adminTest.calls.filter(item => item === 'review').length === 2 && document.querySelector('.admin-nav-badge').textContent === '2'`));
  await click('[aria-label="Rejeitar sugestão de Edge Computing"]');
  await until(`document.querySelectorAll('.admin-suggestion').length === 1`);
  check('rejection removes suggestion from pending view', true);

  await section(3); await shot('admin-create-dark.png');
  await click('.admin-editor button[type="submit"]');
  await until(`document.querySelector('#admin-name-error')`);
  check('create form validates and focuses first invalid field', await evaluate(`document.activeElement.id === 'admin-name'`));
  await input('#admin-name', 'Novo conceito de teste');
  await input('#admin-description', 'Explicação local para validar o fluxo sem gravar no Firebase.');
  await input('#admin-examples', 'Primeiro exemplo.\nSegundo exemplo.');
  await input('#admin-category', 'Desenvolvimento');
  await evaluate(`window.__adminTest.failNext = 'create'`);
  await click('.admin-editor button[type="submit"]');
  await until(`document.querySelector('.admin-notice.error')`);
  check('failed create preserves the form', await evaluate(`document.querySelector('#admin-name').value === 'Novo conceito de teste'`));
  await click('.admin-editor button[type="submit"]');
  await until(`document.querySelector('.admin-term-row')`);
  check('successful publish opens term management', await evaluate(`document.querySelector('.admin-heading h1').textContent === 'Gerenciar dicionário'`));
  await shot('admin-terms-dark.png');
  await input('.manage-search input', 'api');
  await until(`document.querySelectorAll('.admin-term-row').length === 1`);
  await click('[aria-label="Editar termo API"]');
  await until(`document.querySelector('dialog[open] #admin-description')`);
  check('editing retains existing examples', await evaluate(`document.querySelector('#admin-examples').value === 'Integração de sistemas.'`));
  await input('#admin-description', 'Uma interface revisada pelo teste local.');
  await evaluate(`window.__adminTest.failNext = 'update'`);
  await click('dialog[open] button[type="submit"]');
  await until(`document.querySelector('dialog[open] [role="alert"]')`);
  check('edit failure is visible inside modal', true);
  await click('dialog[open] button[type="submit"]');
  await until(`!document.querySelector('dialog[open]')`);
  check('successful edit refreshes the term description', await evaluate(`document.querySelector('.admin-term-copy p').textContent === 'Uma interface revisada pelo teste local.'`));
  await click('[aria-label="Remover termo API"]');
  await until(`document.querySelector('dialog[open]')`);
  check('delete opens a confirmation without writing', await evaluate(`window.__adminTest.calls.filter(item => item === 'remove').length === 0`));
  await click('dialog[open] .admin-button.secondary');
  await until(`!document.querySelector('dialog[open]')`);
  check('cancel deletion keeps the term and restores focus', await evaluate(`document.querySelector('.admin-term-row') && document.activeElement.getAttribute('aria-label') === 'Remover termo API'`));
  await click('[aria-label="Remover termo API"]');
  await click('dialog[open] .admin-button.danger');
  await until(`!document.querySelector('dialog[open]') && !document.querySelector('.admin-term-row')`);
  check('confirmed deletion updates the local test repository', await evaluate(`window.__adminTest.calls.filter(item => item === 'remove').length === 1`));
  await click('[aria-label="Limpar busca de termos"]');
  await click('.admin-alphabet button[aria-label="Termos com a letra A"]');
  check('alphabet filters the managed terms', await evaluate(`[...document.querySelectorAll('.admin-term-copy h2')].every(el => el.textContent.startsWith('A'))`));
  await click('.admin-alphabet button:first-child');
  await click('.admin-sidebar-footer .admin-utility:nth-child(2)');
  await until(`document.documentElement.dataset.theme === 'light'`);
  await shot('admin-terms-light.png');
  check('admin text and action contrast passes AA in light theme', (await contrast(['.admin-heading h1', '.admin-term-copy p', '.admin-button.primary', '.admin-button.blue', '.admin-button.danger'])).every(item => item.ratio >= 4.5));
  await section(1); await shot('admin-overview-light.png');
  check('overview updates after local mutations', await evaluate(`document.querySelectorAll('.admin-stat strong')[0].textContent === '5' && document.querySelectorAll('.admin-stat strong')[1].textContent === '1'`));
  await section(2); await shot('admin-suggestions-light.png');
  await section(3); await shot('admin-create-light.png');
  for (const width of [1024, 768, 390, 320]) {
    await cdp('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false });
    for (let id = 1; id <= 4; id++) {
      await section(id);
      check(`admin section ${id} fits ${width}px`, await evaluate(`document.documentElement.scrollWidth <= innerWidth && document.querySelector('.admin-main').scrollWidth <= document.querySelector('.admin-main').clientWidth + 1`));
      if (width <= 390) await shot(`admin-section-${id}-${width}.png`);
    }
  }
  const accessibility = await cdp('Accessibility.getFullAXTree');
  check('admin controls have accessible names', accessibility.nodes.filter(item => !item.ignored && ['button', 'link', 'textbox', 'combobox'].includes(item.role?.value)).every(item => !!item.name?.value));
  await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  check('admin respects reduced motion', await evaluate(`getComputedStyle(document.querySelector('.admin-nav button')).transitionDuration === '0s'`));
  await evaluate(`window.__adminTest.failNext = 'logout'`);
  await click('.admin-mobile-tools [aria-label="Sair da conta"]');
  await until(`document.querySelector('.admin-notice.error')`);
  check('failed logout keeps the workspace open', await evaluate(`!window.__adminTest.loggedOut && !!document.querySelector('.admin-main')`));
  await click('.admin-mobile-tools [aria-label="Sair da conta"]');
  await until(`window.__adminTest.loggedOut`);
  check('logout action awaits the auth adapter', true);
  await navigate('http://127.0.0.1:4174/?view=login&theme=light');
  await until(`document.querySelector('#admin-email')`);
  await input('#admin-email', 'admin@example.test'); await input('#admin-password', 'local-test-only');
  await evaluate(`window.__adminTest.failNext = 'login'; window.__adminTest.delay = 500`);
  await click('.admin-login-submit'); await click('.admin-login-submit');
  await until(`document.querySelector('.admin-notice.error')`);
  check('login blocks duplicate attempts and reports failure', await evaluate(`window.__adminTest.logins === 1 && !window.__adminTest.success`));
  await click('.admin-login-submit');
  await until(`window.__adminTest.success`);
  check('login navigates only after confirmed success', true);
  await evaluate(`document.querySelector('.admin-login').scrollTo({ top: 0, behavior: 'instant' })`);
  await shot('admin-login-mobile.png');
  check('login content fits 320px viewport', await evaluate(`document.documentElement.scrollWidth <= 320 && document.querySelector('.admin-login').scrollWidth <= 320`));
  await navigate('http://127.0.0.1:4174/?failLoad=1');
  await until(`document.querySelector('.admin-error')`);
  check('load failure does not display misleading zero metrics', await evaluate(`!document.querySelector('.admin-stats')`));
  await click('.admin-error button');
  await until(`document.querySelector('.admin-stats')`);
  check('load failure can be retried', true);
  check('no JavaScript runtime errors', errors.length === 0);
  fs.writeFileSync(path.join(artifacts, 'admin-results.json'), JSON.stringify({ results, errors, note: 'Protected workspace UI exercised with an isolated in-memory adapter; no production writes or authentication bypass.' }, null, 2));
}
main().catch(error => { console.error(error); fs.writeFileSync(path.join(artifacts, 'admin-results.json'), JSON.stringify({ results, errors, failure: String(error) }, null, 2)); process.exitCode = 1; }).finally(() => { socket?.close(); chrome?.kill(); server.close(); });
