import { resolveNativePackageSource } from './native-package-source.mjs';
import { createRequire } from 'node:module';
const require = createRequire(new URL('../packages/base/package.json', import.meta.url));
const ts = require('typescript');
import { readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { resolve, relative, dirname } from 'node:path';
import { createHash } from 'node:crypto';

const [directory, output, ...entries] = process.argv.slice(2);
const source = entries[0].startsWith('packages/react/');
const records = new Map();
const queue = [...entries];
function resolveImport(file, specifier) {
  const owned = !source && resolveNativePackageSource(directory, specifier);
  if (owned) return owned;
  let base;
  if (specifier.startsWith('.')) base = resolve(directory, dirname(file), specifier);
  else if (source && specifier.startsWith('@base-ui/utils/')) base = resolve(directory, 'packages/utils/src', specifier.slice('@base-ui/utils/'.length));
  else return `external:${specifier}`;
  for (const candidate of [base, base.replace(/\.js$/, '.ts'), base.replace(/\.js$/, '.svelte.ts'), `${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`]) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return relative(directory, candidate);
  }
  throw new Error(`Unresolved ${file} → ${specifier}`);
}
while (queue.length) {
  const file = queue.shift();
  if (records.has(file)) continue;
  const body = readFileSync(resolve(directory, file), 'utf8');
  const code = file.endsWith('.svelte') ? [...body.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(match => match[1]).join('\n') : body;
  const ast = ts.createSourceFile(file, code, ts.ScriptTarget.Latest, true, file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const imports = [];
  function record(specifier, kind, members) {
    const resolved = resolveImport(file, specifier);
    const existing = imports.find(edge => edge.specifier === specifier && edge.kind === kind);
    if (existing) existing.members.push(...members);
    else imports.push({ specifier, kind, members, resolved });
    if (!resolved.startsWith('external:')) queue.push(resolved);
  }
  function visit(node) {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      const clause = node.importClause;
      const bindings = clause?.namedBindings;
      const elements = bindings && ts.isNamedImports(bindings) ? bindings.elements : undefined;
      record(node.moduleSpecifier.text, clause?.isTypeOnly || (!clause?.name && elements?.length && elements.every(element => element.isTypeOnly)) ? 'type' : 'runtime', [
        ...(clause?.name ? [{ imported: 'default', local: clause.name.text, kind: clause.isTypeOnly ? 'type' : 'runtime' }] : []),
        ...(bindings && ts.isNamespaceImport(bindings) ? [{ imported: '*', local: bindings.name.text, kind: clause.isTypeOnly ? 'type' : 'runtime' }] : []),
        ...(elements?.map(element => ({ imported: (element.propertyName ?? element.name).text, local: element.name.text, kind: clause.isTypeOnly || element.isTypeOnly ? 'type' : 'runtime' })) ?? []),
      ]);
    } else if (ts.isExportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      const elements = node.exportClause && ts.isNamedExports(node.exportClause) ? node.exportClause.elements : undefined;
      record(node.moduleSpecifier.text, node.isTypeOnly || (elements?.length && elements.every(element => element.isTypeOnly)) ? 'type' : 'runtime', elements?.map(element => ({ imported: (element.propertyName ?? element.name).text, local: element.name.text, kind: node.isTypeOnly || element.isTypeOnly ? 'type' : 'runtime' })) ?? [{ imported: '*', kind: node.isTypeOnly ? 'type' : 'runtime' }]);
    } else if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument) && ts.isStringLiteral(node.argument.literal)) record(node.argument.literal.text, 'type', [{ imported: node.qualifier?.getText(ast) ?? '*', kind: 'type' }]);
    ts.forEachChild(node, visit);
  }
  visit(ast);
  records.set(file, { path: file, sha256: createHash('sha256').update(body).digest('hex'), imports });
}
const runtime = new Set(entries);
let changed = true;
while (changed) {
  changed = false;
  for (const file of [...runtime]) for (const edge of records.get(file)?.imports ?? []) {
    if (edge.kind === 'runtime' && records.has(edge.resolved) && !runtime.has(edge.resolved)) { runtime.add(edge.resolved); changed = true; }
  }
}
const modules = [...records.values()].sort((a, b) => a.path.localeCompare(b.path)).map(record => ({ ...record, reachability: runtime.has(record.path) ? 'runtime' : 'type-only' }));
const graph = { pin: '47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c', entries, method: 'Full TypeScript AST imports/reexports/import-types, member inventory and transitive runtime reachability. Type/barrel inventory grants no selected business or assertion credit.', ordinaryDeclarationCredit: 0, modules, counts: { modules: modules.length, edges: modules.reduce((sum, record) => sum + record.imports.length, 0), runtime: runtime.size, typeOnly: modules.length - runtime.size } };
writeFileSync(output, JSON.stringify(graph, null, 2) + '\n');
console.log(JSON.stringify(graph.counts));
