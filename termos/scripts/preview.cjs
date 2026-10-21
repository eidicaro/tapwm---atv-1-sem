const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../dist');
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.woff2': 'font/woff2', '.json': 'application/json' };
http.createServer((request, response) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname); } catch { response.writeHead(400).end(); return; }
  const target = path.resolve(root, `.${pathname}`);
  if (target !== root && !target.startsWith(root + path.sep)) { response.writeHead(403).end(); return; }
  const candidates = [target, `${target}.html`, path.join(target, 'index.html')];
  const found = candidates.find(file => { try { return fs.statSync(file).isFile(); } catch { return false; } });
  if (!found) { response.writeHead(404).end('Not found'); return; }
  response.writeHead(200, { 'Content-Type': mime[path.extname(found)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
  fs.createReadStream(found).pipe(response);
}).listen(4173, '127.0.0.1', () => console.log('Preview: http://localhost:4173'));