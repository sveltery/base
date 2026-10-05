// Successor inventory only; original archives/pre-repair graphs remain unchanged.
// MIT: ../UPSTREAM_LICENSE.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { build, roots, publicMembers } from '../source-audit/generate.mjs';
const ts = createRequire(resolve('packages/base/package.json'))('typescript');
const output = resolve('parity/collapsible/source-candidate');
const archivedOriginalRoot = resolve('parity/collapsible/source-audit/upstream');
const generatedRoot = join(output, 'generated-consumer');
const hash = value => createHash('sha256').update(value).digest('hex');
const candidateHead = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const script = readFileSync('scripts/check-collapsible-package.sh', 'utf8');
const generatedSources = [];
// First definitions are the actual --public imports; the internal else branch
// is preserved in the whole script receipt but is not this public acceptance mode.
const selected = new Set();
for (const match of script.matchAll(/cat > "\$collapsible_consumer\/([^"\n]+)" <<'([^'\n]+)'\n([\s\S]*?)\n\2\n/g)) {
  const [, name, , code] = match;
  if (selected.has(name) || name === 'package.json') continue;
  selected.add(name);
  const path = join(generatedRoot, name);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${code}\n`);
  generatedSources.push({ source: path.slice(resolve('.').length + 1), sourceScript: 'scripts/check-collapsible-package.sh', sourceMode: '--public', sha256: hash(`${code}\n`) });
}
const native = build(resolve('.'), [...roots.native, 'packages/base/src/lib/index.ts'], false, { 'packages/base/src/lib/index.ts': publicMembers });
const original = build(archivedOriginalRoot, roots.original, true);
const originalTests = build(archivedOriginalRoot, roots.originalTests, true);
let nativeTests = build(resolve('.'), [...roots.nativeTests,
  'packages/base/tests/dom/collapsible-source-boundary.test.ts',
  'packages/base/tests/dom/collapsible-dimensions-boundary.test.ts',
  'packages/base/vitest.collapsible-boundary.config.ts',
  'apps/fixtures/src/routes/collapsible-css-native/+page.svelte',
  'apps/fixtures/src/routes/collapsible-dimensions/+page.svelte',
  'apps/fixtures/src/routes/collapsible-dimensions/+page.ts',
  ...generatedSources.filter(item => !item.source.endsWith('.json')).map(item => item.source),
], false);
// Kit's $lib is a real repository alias, not an external package. Expand its
// actual source closure in this successor while leaving the old graph intact.
const aliasRoots = new Set();
let expanded;
do {
  expanded = false;
  for (const module of nativeTests.modules) for (const edge of module.imports) {
    if (!edge.resolved.startsWith('external:$lib/')) continue;
    const source = `apps/fixtures/src/lib/${edge.resolved.slice('external:$lib/'.length)}`;
    const resolved = [source, source.replace(/\.js$/, '.ts')].find(path => existsSync(path));
    if (!resolved) throw new Error(`Unresolved real Kit alias: ${module.source} -> ${source}`);
    if (!aliasRoots.has(resolved)) { aliasRoots.add(resolved); expanded = true; }
  }
  if (expanded) nativeTests = build(resolve('.'), [...roots.nativeTests,
    'packages/base/tests/dom/collapsible-source-boundary.test.ts',
    'packages/base/tests/dom/collapsible-dimensions-boundary.test.ts',
    'packages/base/vitest.collapsible-boundary.config.ts',
    'apps/fixtures/src/routes/collapsible-css-native/+page.svelte',
    'apps/fixtures/src/routes/collapsible-dimensions/+page.svelte',
    'apps/fixtures/src/routes/collapsible-dimensions/+page.ts',
    ...generatedSources.filter(item => !item.source.endsWith('.json')).map(item => item.source), ...aliasRoots,
  ], false);
} while (expanded);
for (const module of nativeTests.modules) for (const edge of module.imports) {
  if (edge.resolved.startsWith('external:$lib/')) {
    edge.declaredAlias = edge.specifier;
    const source = `apps/fixtures/src/lib/${edge.resolved.slice('external:$lib/'.length)}`;
    edge.resolved = [source, source.replace(/\.js$/, '.ts')].find(path => existsSync(path));
  }
}
nativeTests.external = nativeTests.external.filter(item => !item.startsWith('external:$lib/'));
const domCheck = nativeTests.modules.find(module => module.source.endsWith('/generated-consumer/dom-check.mjs'));
if (domCheck) {
  domCheck.imports.push({ specifier: 'jsdom', declaredKind: 'createRequire-alias-call', effectiveKind: 'runtime', importedMembers: ['JSDOM'], resolved: 'external:jsdom' });
  nativeTests.edgeCount += 1;
  nativeTests.external = [...new Set([...nativeTests.external, 'external:jsdom'])].sort();
}
// The historical parser labels named reexports by exported name. Correct their
// actual imported source member in this successor without editing old receipts.
for (const [name, graph] of Object.entries({ original, originalTests, native, nativeTests })) {
  for (const module of graph.modules) {
    const isOriginal = name.startsWith('original');
    const raw = readFileSync(isOriginal ? join(archivedOriginalRoot, module.source) : module.source, 'utf8');
    const code = module.source.endsWith('.svelte') ? [...raw.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(match => match[1]).join('\n') : raw;
    const tree = ts.createSourceFile(module.source, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    for (const node of tree.statements) {
      if (!ts.isExportDeclaration(node) || !node.moduleSpecifier || !node.exportClause || !ts.isNamedExports(node.exportClause)) continue;
      const edge = module.imports.find(item => item.specifier === node.moduleSpecifier.text);
      if (!edge) continue;
      edge.exportedMembers = node.exportClause.elements.map(item => item.name.text);
      edge.importedMembers = node.exportClause.elements.map(item => item.propertyName?.text ?? item.name.text);
    }
    if (isOriginal) {
      const archived = JSON.parse(readFileSync('parity/collapsible/source-audit/archives.json', 'utf8')).sources.find(item => item.source === module.source);
      if (!archived || hash(raw) !== archived.sha256) throw new Error(`Immutable Original archive changed: ${module.source}`);
    } else if (!generatedSources.some(item => item.source === module.source)) {
      const committed = execFileSync('git', ['show', `${candidateHead}:${module.source}`]);
      if (hash(committed) !== module.sha256) throw new Error(`Commit identity changed: ${module.source}`);
    }
  }
}
for (const [name, graph] of Object.entries({ original, originalTests, native, nativeTests })) writeFileSync(join(output, `${name}-graph.json`), JSON.stringify(graph, null, 2) + '\n');
writeFileSync(join(output, 'scope.json'), JSON.stringify({
  pin: '47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c',
  preRepairHead: 'c1600456d3b4e72910d42823b9df69280c74a262', candidateHead,
  OriginalAuthorities: ['original-graph.json', 'originalTests-graph.json', '../source-audit/archives.json'],
  preservedHistoricalGraphs: ['../source-audit/original-graph.json', '../source-audit/originalTests-graph.json', '../source-audit/native-graph.json', '../source-audit/nativeTests-graph.json'],
  assertionCredit: 0, Source: 'NOT CLEAR', nativeSvelte: 'NOT CLEAR', maintainability: 'NOT CLEAR',
  generatedSources,
  correctionsToHistoricalMetadata: [
    'Named reexports now record imported source members and exported aliases separately.',
    'Real Kit $lib alias imports now resolve to repository modules.',
    'Every actual public generated consumer body is represented and hashed separately.',
  ],
  closures: Object.fromEntries(Object.entries({ original, originalTests, native, nativeTests }).map(([name, graph]) => [name, { modules: graph.moduleCount, edges: graph.edgeCount, runtime: graph.runtimeModules, type: graph.typeModules }])),
}, null, 2) + '\n');
console.log(JSON.stringify({ candidateHead, native: { modules: native.moduleCount, edges: native.edgeCount }, nativeTests: { modules: nativeTests.moduleCount, edges: nativeTests.edgeCount }, generatedSources: generatedSources.length }));
