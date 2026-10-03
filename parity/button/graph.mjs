// Button's complete immutable-source and actual-used native import graphs. MIT source provenance.
import ts from '../../packages/base/node_modules/typescript/lib/typescript.js';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';

const pin = '47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c';
const root = resolve(import.meta.dirname, '../..');
const sourceArgument = process.argv.slice(2).find(argument => !argument.startsWith('--'));
const upstream = sourceArgument ? resolve(sourceArgument) : undefined;
const destination = resolve(import.meta.dirname, 'source-graph.json');
const originals = upstream ? new Set(execFileSync('git', ['-C', upstream, 'ls-tree', '-r', '--name-only', pin], { encoding: 'utf8' }).trim().split('\n')) : undefined;
const hash = text => createHash('sha256').update(text).digest('hex');

function trace(roots, original) {
  const modules = new Map();
  const queue = roots.map(file => ({ file, reachability: 'runtime' }));
  function resolveImport(file, specifier) {
    let base;
    if (specifier.startsWith('.')) base = resolve('/', dirname(file), specifier).slice(1);
    else if (original && specifier.startsWith('@base-ui/utils/')) base = `packages/utils/src/${specifier.slice('@base-ui/utils/'.length)}`;
    else return `external:${specifier}`;
    for (const candidate of [base, base.replace(/\.js$/, '.ts'), base.replace(/\.js$/, '.svelte.ts'), `${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`]) {
      if (original ? originals.has(candidate) : existsSync(resolve(root, candidate))) return candidate;
    }
    throw new Error(`Unresolved ${file} → ${specifier}`);
  }
  while (queue.length) {
    const { file, reachability } = queue.shift();
    let record = modules.get(file);
    if (!record) {
      const body = original ? execFileSync('git', ['-C', upstream, 'show', `${pin}:${file}`], { encoding: 'utf8' }) : readFileSync(resolve(root, file), 'utf8');
      const code = file.endsWith('.svelte') ? [...body.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(match => match[1]).join('\n') : body;
      const ast = ts.createSourceFile(file, code, ts.ScriptTarget.Latest, true, file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
      const imports = [], declarations = [];
      function edge(specifier, kind, names) { imports.push({ specifier, kind, resolved: resolveImport(file, specifier), names }); }
      function visit(node) {
        if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
          const clause = node.importClause, runtime = [], types = [];
          if (clause?.name) (clause.isTypeOnly ? types : runtime).push(clause.name.text);
          if (clause?.namedBindings && ts.isNamespaceImport(clause.namedBindings)) (clause.isTypeOnly ? types : runtime).push(clause.namedBindings.name.text);
          if (clause?.namedBindings && ts.isNamedImports(clause.namedBindings)) for (const name of clause.namedBindings.elements) (clause.isTypeOnly || name.isTypeOnly ? types : runtime).push(name.name.text);
          if (runtime.length || !clause) edge(node.moduleSpecifier.text, 'runtime', runtime);
          if (types.length) edge(node.moduleSpecifier.text, 'type', types);
        } else if (ts.isExportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
          const names = node.exportClause && ts.isNamedExports(node.exportClause) ? node.exportClause.elements : undefined;
          if (names) {
            const runtime = names.filter(name => !node.isTypeOnly && !name.isTypeOnly).map(name => name.name.text);
            const types = names.filter(name => node.isTypeOnly || name.isTypeOnly).map(name => name.name.text);
            if (runtime.length) edge(node.moduleSpecifier.text, 'runtime', runtime);
            if (types.length) edge(node.moduleSpecifier.text, 'type', types);
          } else edge(node.moduleSpecifier.text, node.isTypeOnly ? 'type' : 'runtime', ['*']);
        } else if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument) && ts.isStringLiteral(node.argument.literal)) edge(node.argument.literal.text, 'type', []);
        if ((ts.isFunctionDeclaration(node) || ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node) || ts.isModuleDeclaration(node)) && node.name) declarations.push(node.name.text);
        ts.forEachChild(node, visit);
      }
      visit(ast);
      record = { [original ? 'source' : 'local']: file, sha256: hash(body), ...(original ? { url: `https://github.com/mui/base-ui/blob/${pin}/${file}` } : {}), declarations, reachability: [], imports };
      modules.set(file, record);
    }
    if (record.reachability.includes(reachability)) continue;
    record.reachability.push(reachability);
    for (const edge of record.imports) if (!edge.resolved.startsWith('external:')) queue.push({ file: edge.resolved, reachability: reachability === 'type' || edge.kind === 'type' ? 'type' : 'runtime' });
  }
  return [...modules.values()].sort((a, b) => (a.source ?? a.local).localeCompare(b.source ?? b.local)).map(record => ({ ...record, reachability: record.reachability.sort() }));
}

const roots = ['packages/react/src/button/index.ts'];
const graph = {
  pin,
  recordedBeforeImplementation: true,
  scope: 'Complete original Button module import/export closure, runtime and type-only edges separately. Type barrel reachability conservatively includes declarations not selected by Button. No assertion credit or structural acceptance is conferred by this evidence.',
  roots,
  modules: upstream ? trace(roots, true) : JSON.parse(readFileSync(destination, 'utf8')).modules,
  externalBoundaries: {
    original: ['React framework/hooks/elements/types → native Svelte runes/context/snippets/attachments/element declarations', '@floating-ui/utils/dom isHTMLElement → existing canonical native helper host tag checks; no Floating UI runtime in Button', 'JavaScript and native DOM built-ins'],
    native: ['svelte public APIs and rune compiler', 'svelte/attachments', 'svelte/elements type declarations', 'esm-env DEV/BROWSER', 'JavaScript and native DOM built-ins'],
  },
};
if (!process.argv.includes('--source-only')) {
  const localRoots = ['packages/base/src/lib/button/index.ts'];
  graph.localClosure = { scope: 'Actual recursive runtime and type imports from the public Button entry. Shared implementations are imported rather than duplicated.', roots: localRoots, modules: trace(localRoots, false) };
}
const output = JSON.stringify(graph, null, 2) + '\n';
if (process.argv.includes('--check')) {
  if (readFileSync(destination, 'utf8') !== output) throw new Error('Button immutable or actual-used source graph is stale');
} else writeFileSync(destination, output);
console.log(`Button graph: ${graph.modules.length} immutable source modules / ${graph.localClosure?.modules.length ?? 0} actual used local modules`);
