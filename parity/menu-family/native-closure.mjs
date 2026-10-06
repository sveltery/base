import { resolveNativePackageSource } from '../../scripts/native-package-source.mjs';
// Exact native public runtime/type import closure. Provenance alone grants no acceptance.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(new URL('../../', import.meta.url));
const require = createRequire(new URL('../../packages/base/package.json', import.meta.url));
const ts = require('typescript');
const roots = ['menu', 'context-menu', 'menubar'].map(name => `packages/base/src/lib/${name}/index.ts`);
const hash = body => createHash('sha256').update(body).digest('hex');
function resolveImport(source, specifier) {
  const owned = resolveNativePackageSource(repo, specifier);
  if (owned) return owned;
  if (!specifier.startsWith('.')) return `external:${specifier}`;
  const raw = resolve(repo, dirname(source), specifier);
  const candidates = [raw, raw.replace(/\.js$/, '.ts'), raw.replace(/\.js$/, '.svelte'), `${raw}.ts`, `${raw}.svelte`, `${raw}/index.ts`];
  const found = candidates.find(path => existsSync(path) && statSync(path).isFile());
  if (!found) throw new Error(`Unresolved ${source} → ${specifier}`);
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
    function record(specifier, kind, symbols, edge) {
      imports.push({ specifier, kind, symbols, resolved: resolveImport(source, specifier), edge });
    }
    function visit(node) {
      if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteralLike(node.moduleSpecifier)) {
        const clause = ts.isImportDeclaration(node) ? node.importClause : node;
        const bindings = ts.isImportDeclaration(node) ? clause?.namedBindings : node.exportClause;
        const elements = bindings && 'elements' in bindings ? bindings.elements : undefined;
        const allType = elements?.length > 0 && elements.every(element => element.isTypeOnly);
        const kind = clause?.isTypeOnly || allType ? 'type' : 'runtime';
        const symbols = elements?.map(element => ({ imported: (element.propertyName ?? element.name).text, typeOnly: !!element.isTypeOnly })) ?? ['*'];
        record(node.moduleSpecifier.text, kind, symbols, ts.isExportDeclaration(node) ? 'export' : 'import');
      } else if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument) && ts.isStringLiteralLike(node.argument.literal)) {
        record(node.argument.literal.text, 'type', ['*'], 'import-type');
      } else if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword && ts.isStringLiteralLike(node.arguments[0])) {
        record(node.arguments[0].text, 'runtime', ['*'], 'dynamic-import');
      }
      ts.forEachChild(node, visit);
    }
    visit(ast);
    modules.set(source, { source, sha256: hash(body), reachability, imports });
    for (const edge of imports) if (!edge.resolved.startsWith('external:')) walk(edge.resolved, reachability === 'type' || edge.kind === 'type' ? 'type' : 'runtime');
  }
  for (const root of roots) walk(root, 'runtime');
  return {
    pin: '47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c', roots,
    scope: 'Complete actual native public runtime/type AST closure, including mixed symbol imports, import-type and dynamic imports. Svelte script blocks are parsed as TypeScript; full file bytes are hashed. External dependencies remain explicit. This inventory does not establish source fidelity or assertion parity.',
    modules: [...modules.values()].sort((a, b) => a.source.localeCompare(b.source)),
    external: [...new Set([...modules.values()].flatMap(module => module.imports.filter(edge => edge.resolved.startsWith('external:')).map(edge => edge.resolved)))].sort(),
  };
}
export function checkNativeClosure() {
  if (readFileSync(new URL('./native-closure.json', import.meta.url), 'utf8') !== JSON.stringify(extractNativeClosure(), null, 2) + '\n') throw new Error('Native Menu family closure differs from recorded bytes');
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (process.argv.includes('--check')) checkNativeClosure();
  else writeFileSync(new URL('./native-closure.json', import.meta.url), JSON.stringify(extractNativeClosure(), null, 2) + '\n');
}
