const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawn } = require('node:child_process');
const assert = require('node:assert/strict');
const artifacts = path.resolve(__dirname, '../.artifacts');
fs.mkdirSync(artifacts, { recursive: true });
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const chromePath = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const chrome = spawn(chromePath, ['--headless=new', '--remote-debugging-port=9231', `--user-data-dir=${path.join(os.tmpdir(), 'dicionario-tech-qa')}`, '--no-first-run', '--no-default-browser-check', '--disable-gpu', 'about:blank'], { windowsHide: true, stdio: 'ignore' });
let socket;
const results = [];
const errors = [];
async function main() {
  for (let attempt = 0; attempt < 60; attempt++) { try { await fetch('http://127.0.0.1:9231/json/version'); break; } catch { await wait(250); } }
  const target = await (await fetch('http://127.0.0.1:9231/json/new?about:blank', { method: 'PUT' })).json();
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }));
  const pending = new Map();
  let nextId = 0;
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.id) { const promise = pending.get(message.id); if (!promise) return; pending.delete(message.id); message.error ? promise.reject(message.error) : promise.resolve(message.result); }
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails);
    if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') errors.push(message.params.args.map(item => item.value || item.description));
  });
  const cdp = (method, params = {}) => new Promise((resolve, reject) => { const id = ++nextId; pending.set(id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params })); });
  const evaluate = async expression => { const response = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }); if (response.exceptionDetails) throw new Error(JSON.stringify(response.exceptionDetails)); return response.result?.value; };
  const until = async (expression, timeout = 10000) => { const start = Date.now(); while (Date.now() - start < timeout) { if (await evaluate(`Boolean(${expression})`)) return; await wait(150); } throw new Error(`Timed out: ${expression}`); };
  const check = (name, condition) => { assert.ok(condition, name); results.push({ name, passed: true }); console.log(`PASS ${name}`); };
  const screenshot = async name => { await wait(250); const shot = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false }); fs.writeFileSync(path.join(artifacts, name), Buffer.from(shot.data, 'base64')); };
  const click = async selector => evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
  const input = async (selector, value) => evaluate(`(() => { const el = document.querySelector(${JSON.stringify(selector)}); const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, ${JSON.stringify(value)}); el.dispatchEvent(new Event('input', { bubbles: true })); el.focus(); })()`);
  const key = async (value, modifiers = 0) => { await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key: value, modifiers }); await cdp('Input.dispatchKeyEvent', { type: 'keyUp', key: value, modifiers }); await wait(100); };
  await Promise.all([cdp('Page.enable'), cdp('Runtime.enable')]);
  const metrics = () => evaluate(`(() => { const page = document.querySelector('.tech-page'); return { pageTop: page.scrollTop, windowTop: window.scrollY, scrollHeight: page.scrollHeight, clientHeight: page.clientHeight, overflow: getComputedStyle(page).overflowY }; })()`);
  const wheel = async () => { await cdp('Input.dispatchMouseEvent', { type: 'mouseWheel', x: 180, y: 500, deltaX: 0, deltaY: 650 }); await wait(500); };
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1100, deviceScaleFactor: 1, mobile: false });
  await cdp('Page.navigate', { url: 'http://127.0.0.1:4173/' });
  await until(`document.querySelector('.term-grid')`, 45000);
  for (const width of [1440, 390, 320]) {
    await cdp('Emulation.setDeviceMetricsOverride', { width, height: 650, deviceScaleFactor: 1, mobile: false });
    for (const route of ['/', '/sugestao']) {
      if (await evaluate(`location.pathname !== ${JSON.stringify(route)}`)) {
        await click(route === '/' ? '.brand' : '.nav-link[aria-label="Sugerir termo"]');
      }
      await until(`location.pathname === ${JSON.stringify(route)} && document.querySelector('.tech-page')`);
      await until(`document.readyState === 'complete' && document.documentElement.dataset.theme`);
      if (route === '/') await until(`document.querySelector('.term-grid')`, 45000);
      await wait(300);
      const before = await metrics();
      await wheel();
      const after = await metrics();
      console.log('SCROLL', JSON.stringify({ width, route, before, after }));
      check(`mouse wheel scrolls ${route} at ${width}px`, after.pageTop > before.pageTop || after.windowTop > before.windowTop);
      await evaluate(`document.querySelector('.site-footer').scrollIntoView({ block: 'end', behavior: 'instant' })`);
      check(`footer is reachable on ${route} at ${width}px`, await evaluate(`(() => { const r = document.querySelector('.site-footer').getBoundingClientRect(); return r.bottom <= innerHeight + 2 && r.bottom > 0; })()`));
      if (width <= 390) {
        await evaluate(`document.querySelector('.tech-page').scrollTo({ top: 0, behavior: 'instant' })`);
        await cdp('Emulation.setTouchEmulationEnabled', { enabled: true });
        await cdp('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 180, y: 500 }] });
        for (let y = 470; y >= 170; y -= 30) {
          await cdp('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 180, y }] });
          await wait(25);
        }
        await cdp('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        await wait(300);
        check(`touch swipe scrolls ${route} at ${width}px`, (await metrics()).pageTop > 0);
        await cdp('Emulation.setTouchEmulationEnabled', { enabled: false });
      }
      if (route === '/') {
        await evaluate(`document.querySelector('.tech-page').scrollTo({ top: 0, behavior: 'instant' })`);
        await click('.nav-tools button[aria-label="Pesquisar no dicionário"]');
        await until(`document.querySelector('dialog[open]')`);
        await click('dialog[open] [aria-label="Fechar pesquisa"]');
        await wheel();
        check(`scroll works after closing search at ${width}px`, (await metrics()).pageTop > 0 || (await metrics()).windowTop > 0);
      }
    }
  }
  check('no runtime errors', errors.length === 0);
  fs.writeFileSync(path.join(artifacts, 'scroll-results.json'), JSON.stringify({ results, errors }, null, 2));
}
main().catch(error => { console.error(error); fs.writeFileSync(path.join(artifacts, 'scroll-results.json'), JSON.stringify({ results, errors, failure: String(error) }, null, 2)); process.exitCode = 1; }).finally(() => { socket?.close(); chrome.kill(); });