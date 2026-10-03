// Actual used UseRender runtime/type closure; source evidence adds no assertion credit.
import ts from '../../packages/base/node_modules/typescript/lib/typescript.js';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const destination = resolve(import.meta.dirname, 'source-graph.json');
const graph = JSON.parse(readFileSync(destination, 'utf8'));
const shared = JSON.parse(readFileSync(resolve(root, 'parity/rendering/source-graph.json'), 'utf8')).localClosure;
const inherited = new Map(shared.modules.map(module => [module.local, module]));
const hash = text => createHash('sha256').update(text).digest('hex');
const roots = ['packages/base/src/lib/use-render/index.ts', 'packages/base/src/lib/use-render/RenderElement.svelte'];
const records = new Map();
const queue = roots.map(local => ({ local, reachability: 'runtime' }));

function resolveImport(file, specifier) {
  if (!specifier.startsWith('.')) return `external:${specifier}`;
  const base = resolve(root, dirname(file), specifier);
  for (const candidate of [base, base.replace(/\.js$/, '.ts'), base.replace(/\.js$/, '.svelte.ts'), `${base}.ts`, `${base}/index.ts`]) {
    if (existsSync(candidate)) return relative(root, candidate);
  }
  throw new Error(`Unresolved ${file} → ${specifier}`);
}

while (queue.length) {
  const { local, reachability } = queue.shift();
  let record = records.get(local);
  if (!record) {
    const text = readFileSync(resolve(root, local), 'utf8');
    const code = local.endsWith('.svelte') ? [...text.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(match => match[1]).join('\n') : text;
    const ast = ts.createSourceFile(local, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const imports = [];
    const declarations = [];
    function edge(specifier, kind, names) {
      const resolved = resolveImport(local, specifier);
      imports.push({ specifier, kind, resolved, names });
    }
    function visit(node) {
      if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
        const clause = node.importClause;
        const runtime = [], types = [];
        if (clause?.name) (clause.isTypeOnly ? types : runtime).push(clause.name.text);
        if (clause?.namedBindings && ts.isNamespaceImport(clause.namedBindings)) (clause.isTypeOnly ? types : runtime).push(clause.namedBindings.name.text);
        if (clause?.namedBindings && ts.isNamedImports(clause.namedBindings)) {
          for (const name of clause.namedBindings.elements) (clause.isTypeOnly || name.isTypeOnly ? types : runtime).push(name.name.text);
        }
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
      } else if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument) && ts.isStringLiteral(node.argument.literal)) {
        edge(node.argument.literal.text, 'type', []);
      }
      if ((ts.isFunctionDeclaration(node) || ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node) || ts.isModuleDeclaration(node)) && node.name) declarations.push(node.name.text);
      ts.forEachChild(node, visit);
    }
    visit(ast);
    const previous = inherited.get(local);
    record = {
      local, sha256: hash(text), reachability: [],
      category: previous?.category ?? (local.endsWith('types.ts') || local.endsWith('index.ts') ? 'native-public-types-and-entry' : 'native-call-shape-adapter'),
      provenance: previous?.provenance ?? 'UseRender public component/types and private fixture adapter reuse the canonical source renderer; native component/snippet/element types replace React representations.',
      originalSources: previous?.originalSources ?? ['packages/react/src/use-render/useRender.ts', 'packages/react/src/use-render/index.ts'],
      declarations, imports,
      ...(previous?.nativePrimitives ? { nativePrimitives: previous.nativePrimitives } : {}),
    };
    records.set(local, record);
  }
  if (record.reachability.includes(reachability)) continue;
  record.reachability.push(reachability);
  for (const edge of record.imports) {
    if (!edge.resolved.startsWith('external:')) queue.push({ local: edge.resolved, reachability: reachability === 'type' || edge.kind === 'type' ? 'type' : 'runtime' });
  }
}

graph.status = 'Immutable original runtime/type graph retained; actual current canonical runtime/type closure recorded separately. Native React-only omissions remain explicit; final-head source/native/maintainability review required.';
graph.localClosure = {
  scope: 'Actual recursive runtime and type imports from the public UseRender entry and the used private call-shape adapter. The shared source renderer/ref/types are reused unchanged from current main.',
  roots,
  modules: [...records.values()].sort((a, b) => a.local.localeCompare(b.local)).map(record => ({ ...record, reachability: record.reachability.sort() })),
  externalBoundaries: shared.externalBoundaries,
  nativeClassReference: shared.nativeClassReference,
  nativeRefCompositionRepair: {
    implementation: 'Canonical current-main internals/useRenderElement and nativeRefAttachment, normally merged in PR50. Marked library attachments join source fanout after inner refs; authored attachments retain native lifetime.',
    checks: shared.nativeRefCompositionRepair.checks,
    ordinaryDeclarationCredit: 0,
  },
};
const output = JSON.stringify(graph, null, 2) + '\n';
if (process.argv.includes('--check')) {
  if (readFileSync(destination, 'utf8') !== output) throw new Error('UseRender actual-used graph is stale');
  const sourceArgument = process.argv.slice(2).find(argument => !argument.startsWith('--'));
  if (sourceArgument) {
    const upstream = resolve(sourceArgument);
    for (const module of graph.modules) {
      const original = execFileSync('git', ['-C', upstream, 'show', `${graph.pin}:${module.source}`], { encoding: 'utf8' });
      if (hash(original) !== module.sha256) throw new Error(`Original source hash changed: ${module.source}`);
    }
  }
} else writeFileSync(destination, output);
console.log(`UseRender graph: ${graph.modules.length} immutable source modules, ${records.size} actual used local modules`);
