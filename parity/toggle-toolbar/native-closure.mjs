import { resolveNativePackageSource } from '../../scripts/native-package-source.mjs';
// Reproducible exact native runtime/type import graph for the owned family.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(new URL('../../', import.meta.url));
const require = createRequire(new URL('../../packages/base/package.json', import.meta.url));
const ts = require('typescript');
const roots = ['toggle/index.ts', 'toggle-group/index.ts', 'toolbar/index.ts', 'separator/index.ts'].map(path => `packages/base/src/lib/${path}`);
const hash = text => createHash('sha256').update(text).digest('hex');
function resolveImport(source, specifier) {
  const owned = resolveNativePackageSource(repo, specifier);
  if (owned) return owned;
  if (!specifier.startsWith('.')) return `external:${specifier}`;
  const raw = resolve(repo, dirname(source), specifier);
  const candidates = [raw, raw.replace(/\.js$/, '.ts'), raw.replace(/\.js$/, '.svelte'), `${raw}.ts`, `${raw}.svelte`, `${raw}/index.ts`];
  const found = candidates.find(path => existsSync(path));
  if (!found) throw new Error(`Unresolved ${source} -> ${specifier}`);
  return relative(repo, found);
}
export function extractNativeClosure() {
  const modules = new Map();
  function walk(source, reachability) {
    const known = modules.get(source);
    if (known) {
      if (known.reachability === 'type' && reachability === 'runtime') {
        known.reachability = 'runtime';
        for (const edge of known.imports) if (!edge.resolved.startsWith('external:')) walk(edge.resolved, edge.kind === 'type' ? 'type' : 'runtime');
      }
      return;
    }
    const body = readFileSync(resolve(repo, source), 'utf8');
    const code = source.endsWith('.svelte') ? [...body.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(match => match[1]).join('\n') : body;
    const ast = ts.createSourceFile(source, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const imports = [];
    for (const node of ast.statements) {
      if (!((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteralLike(node.moduleSpecifier))) continue;
      const bindings = ts.isImportDeclaration(node) ? node.importClause?.namedBindings : node.exportClause;
      const allType = bindings && 'elements' in bindings && bindings.elements.length > 0 && bindings.elements.every(binding => binding.isTypeOnly);
      const kind = node.isTypeOnly || node.importClause?.isTypeOnly || allType ? 'type' : 'runtime';
      const specifier = node.moduleSpecifier.text;
      imports.push({ specifier, kind, resolved: resolveImport(source, specifier), edge: ts.isExportDeclaration(node) ? 'export' : 'import' });
    }
    modules.set(source, { source, sha256: hash(body), reachability, imports });
    for (const edge of imports) if (!edge.resolved.startsWith('external:')) walk(edge.resolved, reachability === 'type' || edge.kind === 'type' ? 'type' : 'runtime');
  }
  for (const root of roots) walk(root, 'runtime');
  return { pin: '47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c', roots, scope: 'Actual native family public runtime/type closure, with immutable local bytes. External Svelte/esm-env/DOM dependencies are native framework boundaries; no React runtime.', modules: [...modules.values()].sort((a, b) => a.source.localeCompare(b.source)), external: [...new Set([...modules.values()].flatMap(module => module.imports.filter(edge => edge.resolved.startsWith('external:')).map(edge => edge.resolved)))].sort() };
}
export function checkNativeClosure() {
  if (readFileSync(new URL('./native-closure.json', import.meta.url), 'utf8') !== JSON.stringify(extractNativeClosure(), null, 2) + '\n') throw new Error('Native family closure differs from reviewed bytes');
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (process.argv.includes('--check')) checkNativeClosure();
  else writeFileSync(new URL('./native-closure.json', import.meta.url), JSON.stringify(extractNativeClosure(), null, 2) + '\n');
}
