// Immutable Base UI 1.8 Slider runtime/type closure and declaration inventory.
import ts from '../../packages/base/node_modules/typescript/lib/typescript.js';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { writeFileSync, readFileSync } from 'node:fs';
import { posix, resolve } from 'node:path';

const pin = '47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c';
const upstream = resolve(process.argv[2] ?? '/workspace/base-ui-upstream');
const files = new Set(execFileSync('git', ['-C', upstream, 'ls-tree', '-r', '--name-only', pin], { encoding: 'utf8' }).trim().split('\n'));
const hash = (body) => createHash('sha256').update(body).digest('hex');
const original = (file) => execFileSync('git', ['-C', upstream, 'show', `${pin}:${file}`], { encoding: 'utf8' });
function resolveImport(file, specifier) {
  let base;
  if (specifier.startsWith('.')) base = posix.normalize(posix.join(posix.dirname(file), specifier));
  else if (specifier.startsWith('@base-ui/utils/')) base = `packages/utils/src/${specifier.slice('@base-ui/utils/'.length)}`;
  else if (specifier === '#prehydration/slider/thumb') base = 'packages/react/src/slider/thumb/prehydrationScript.min';
  else return `external:${specifier}`;
  for (const candidate of [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`]) if (files.has(candidate)) return candidate;
  throw new Error(`Unresolved ${file} → ${specifier}`);
}
const roots = ['packages/react/src/slider/index.ts', 'packages/react/src/slider/thumb/prehydrationScript.template.js', 'packages/react/src/internals/prehydrationScript.stub.ts'];
const queue = roots.map((source) => ({ source, reachability: 'runtime' }));
const records = new Map();
while (queue.length) {
  const { source, reachability } = queue.shift();
  let record = records.get(source);
  if (!record) {
    const body = original(source);
    const ast = ts.createSourceFile(source, body, ts.ScriptTarget.Latest, true, source.endsWith('tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
    const imports = [], declarations = [];
    function edge(specifier, kind, names) { imports.push({ specifier, kind, names, resolved: resolveImport(source, specifier) }); }
    function visit(node) {
      if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
        const clause = node.importClause, runtime = [], types = [];
        if (clause?.name) (clause.isTypeOnly ? types : runtime).push(clause.name.text);
        if (clause?.namedBindings && ts.isNamespaceImport(clause.namedBindings)) (clause.isTypeOnly ? types : runtime).push(clause.namedBindings.name.text);
        if (clause?.namedBindings && ts.isNamedImports(clause.namedBindings)) for (const name of clause.namedBindings.elements) (clause.isTypeOnly || name.isTypeOnly ? types : runtime).push((name.propertyName ?? name.name).text);
        if (runtime.length || !clause) edge(node.moduleSpecifier.text, 'runtime', runtime);
        if (types.length) edge(node.moduleSpecifier.text, 'type', types);
      } else if (ts.isExportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
        const elements = node.exportClause && ts.isNamedExports(node.exportClause) ? node.exportClause.elements : undefined;
        if (elements) {
          const runtime = elements.filter((item) => !node.isTypeOnly && !item.isTypeOnly).map((item) => (item.propertyName ?? item.name).text);
          const types = elements.filter((item) => node.isTypeOnly || item.isTypeOnly).map((item) => (item.propertyName ?? item.name).text);
          if (runtime.length) edge(node.moduleSpecifier.text, 'runtime', runtime);
          if (types.length) edge(node.moduleSpecifier.text, 'type', types);
        } else edge(node.moduleSpecifier.text, node.isTypeOnly ? 'type' : 'runtime', ['*']);
      } else if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument) && ts.isStringLiteral(node.argument.literal)) edge(node.argument.literal.text, 'type', []);
      if ((ts.isFunctionDeclaration(node) || ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node) || ts.isModuleDeclaration(node)) && node.name) declarations.push(node.name.text);
      ts.forEachChild(node, visit);
    }
    visit(ast);
    record = { source, url: `https://github.com/mui/base-ui/blob/${pin}/${source}`, sha256: hash(body), reachability: [], declarations, imports };
    records.set(source, record);
  }
  if (record.reachability.includes(reachability)) continue;
  record.reachability.push(reachability);
  for (const edge of record.imports) if (!edge.resolved.startsWith('external:')) queue.push({ source: edge.resolved, reachability: reachability === 'type' || edge.kind === 'type' ? 'type' : 'runtime' });
}
const graph = { pin, roots, status: 'Pre-implementation immutable complete import closure. Barrel reachability does not mean every barrel export is selected by Slider.', modules: [...records.values()].sort((a, b) => a.source.localeCompare(b.source)) };
writeFileSync(resolve(import.meta.dirname, 'source-graph.json'), JSON.stringify(graph, null, 2) + '\n');
const testFiles = [...files].filter((file) => file.startsWith('packages/react/src/slider/') && /\.(test|spec)\.tsx?$/.test(file));
const inventory = [];
for (const file of testFiles) {
  const body = original(file), ast = ts.createSourceFile(file, body, ts.ScriptTarget.Latest, true, file.endsWith('tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const declarations = [];
  function visit(node) {
    if (ts.isCallExpression(node)) {
      const callee = node.expression.getText(ast);
      if (/^(it|test)(\.|$)/.test(callee) || callee === 'describeConformance' || callee.includes('expectType')) {
        const start = node.getStart(ast), line = ast.getLineAndCharacterOfPosition(start).line + 1;
        const name = node.arguments[0]?.getText(ast);
        declarations.push({ line, callee, name, sha256: hash(node.getText(ast)), kind: callee === 'describeConformance' ? 'conformance' : callee.includes('expectType') ? 'type' : /\.each|\.for/.test(callee) ? 'parameterized' : 'ordinary', status: 'unported', ordinaryCredit: 0 });
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
  inventory.push({ source: file, url: `https://github.com/mui/base-ui/blob/${pin}/${file}`, sha256: hash(body), declarations });
}
writeFileSync(resolve(import.meta.dirname, 'original-assertions.json'), JSON.stringify({ pin, ordinaryDeclarationCredit: 0, status: 'immutable original declaration sites; variants and execution counts stay separate', files: inventory }, null, 2) + '\n');
const inherited = new Map();
for (const feature of ['field-form', 'boolean-controls', 'radio']) {
  const data = JSON.parse(readFileSync(resolve(import.meta.dirname, `../${feature}/source-correspondence.json`), 'utf8'));
  for (const item of data.modules ?? data.records ?? []) inherited.set(item.source ?? item.original, item);
}
const correspondence = graph.modules.map((item) => ({ source: item.source, sha256: item.sha256, declarations: item.declarations, plannedBoundary: item.source.includes('/slider/') ? 'Slider family source business port; native runes/context/snippets/attachments replace React representation.' : inherited.has(item.source) ? 'Reuse canonical accepted business dependency; independent final review covers the inherited body.' : item.source.startsWith('packages/utils/') ? 'Inspect selected imported symbol: reuse canonical local helper, source-port missing business helper, or direct native framework primitive.' : 'Recursive barrel/type closure: only actual selected functions are imported locally; unrelated barrel exports are explicitly unselected.', inherited: inherited.get(item.source) ?? null, status: 'pre-implementation mapping; implementation/review pending' }));
writeFileSync(resolve(import.meta.dirname, 'source-correspondence.json'), JSON.stringify({ pin, status: 'pre-implementation source correspondence', modules: correspondence }, null, 2) + '\n');
console.log(`${records.size} source modules; ${inventory.length} original test/type files; ${inventory.flatMap((file) => file.declarations).length} recorded sites`);
