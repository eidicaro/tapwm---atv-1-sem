// Bundle the real React views with an isolated test adapter. This is never an app route.
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
module.exports = function bundle(entry) {
  const modules = [], known = new Map();
  const project = path.resolve(__dirname, '../..');
  const production = {
    react: 'react/cjs/react.production.js',
    'react/jsx-runtime': 'react/cjs/react-jsx-runtime.production.js',
    'react-dom/client': 'react-dom/cjs/react-dom-client.production.js',
    'react-dom': 'react-dom/cjs/react-dom.production.js',
    scheduler: 'scheduler/cjs/scheduler.production.js',
  };
  function resolve(request, parent) {
    if (production[request]) return path.join(project, 'node_modules', production[request]);
    const start = request.startsWith('.') ? path.resolve(path.dirname(parent), request) : null;
    if (start) for (const name of [start, `${start}.tsx`, `${start}.ts`, `${start}.js`, `${start}.json`]) if (fs.existsSync(name) && fs.statSync(name).isFile()) return name;
    return require.resolve(request, { paths: [path.dirname(parent)] });
  }
  function add(file) {
    if (known.has(file)) return known.get(file);
    const id = modules.length; known.set(file, id); modules.push(null);
    let source = fs.readFileSync(file, 'utf8');
    if (file.endsWith('.json')) source = `module.exports=${source};`;
    else if (/\.tsx?$/.test(file)) source = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
    source = source.replace(/require\(["']([^"']+)["']\)/g, (_, request) => request.endsWith('.css') ? '({})' : `require(${add(resolve(request, file))})`);
    modules[id] = `function(require,module,exports){${source}\n}`;
    return id;
  }
  const root = add(entry);
  return `(()=>{const process={env:{NODE_ENV:'production'}};const modules=[${modules.join(',')}],cache={};function require(id){if(cache[id])return cache[id].exports;const module=cache[id]={exports:{}};modules[id](require,module,module.exports);return module.exports;}require(${root});})();`;
};
