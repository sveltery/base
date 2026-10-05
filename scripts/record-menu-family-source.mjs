import ts from '../packages/base/node_modules/typescript/lib/typescript.js';
import { readFileSync, writeFileSync, existsSync, statSync, mkdirSync, copyFileSync, readdirSync } from 'node:fs';
import { resolve, relative, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const pin = '47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c';
const upstream = resolve(process.argv[2]);
if (execFileSync('git', ['rev-parse', 'HEAD'], { cwd: upstream, encoding: 'utf8' }).trim() !== pin) throw new Error('The source archive requires the immutable Base UI pin.');
const runtimeRoots = ['menu', 'context-menu', 'menubar'].map(name => `packages/react/src/${name}/index.ts`);
const testRoots = [];
function walk(directory) {
  for (const entry of readdirSync(resolve(upstream, directory), { withFileTypes: true })) {
    const path = `${directory}/${entry.name}`;
    if (entry.isDirectory()) walk(path);
    else if (/\.(?:test|spec)(?:\.[\w-]+)?\.tsx?$/.test(path)) testRoots.push(path);
  }
}
for (const name of ['menu', 'context-menu', 'menubar']) walk(`packages/react/src/${name}`);
testRoots.push('test/public-types/menu.tsx');
function graph(entries) {
  const records = new Map();
  const queue = [...entries];
  function resolveImport(file, specifier) {
    let base;
    if (specifier.startsWith('.')) base = resolve(upstream, dirname(file), specifier);
    else if (specifier.startsWith('@base-ui/utils/')) base = resolve(upstream, 'packages/utils/src', specifier.slice('@base-ui/utils/'.length));
    else if (specifier.startsWith('@base-ui/react/')) base = resolve(upstream, 'packages/react/src', specifier.slice('@base-ui/react/'.length));
    else if (specifier === '@base-ui/react') base = resolve(upstream, 'packages/react/src/index');
    else if (specifier === '#test-utils') base = resolve(upstream, 'packages/react/test/index');
    else return `external:${specifier}`;
    for (const candidate of [base, base.replace(/\.js$/, '.ts'), `${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`]) {
      if (existsSync(candidate) && statSync(candidate).isFile()) return relative(upstream, candidate);
    }
    throw new Error(`Unresolved ${file} → ${specifier}`);
  }
  while (queue.length) {
    const file = queue.shift();
    if (records.has(file)) continue;
    const body = readFileSync(resolve(upstream, file), 'utf8');
    const ast = ts.createSourceFile(file, body, ts.ScriptTarget.Latest, true, file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
    const imports = [];
    function record(specifier, kind, symbols) {
      const resolved = resolveImport(file, specifier);
      imports.push({ specifier, kind, symbols, resolved });
      if (!resolved.startsWith('external:')) queue.push(resolved);
    }
    function visit(node) {
      if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
        const clause = node.importClause;
        const elements = clause?.namedBindings && ts.isNamedImports(clause.namedBindings) ? clause.namedBindings.elements : undefined;
        record(node.moduleSpecifier.text, clause?.isTypeOnly || (!clause?.name && elements?.length && elements.every(element => element.isTypeOnly)) ? 'type' : 'runtime', elements?.map(element => (element.propertyName ?? element.name).text) ?? ['*']);
      } else if (ts.isExportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
        const elements = node.exportClause && ts.isNamedExports(node.exportClause) ? node.exportClause.elements : undefined;
        record(node.moduleSpecifier.text, node.isTypeOnly || (elements?.length && elements.every(element => element.isTypeOnly)) ? 'type' : 'runtime', elements?.map(element => (element.propertyName ?? element.name).text) ?? ['*']);
      } else if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument) && ts.isStringLiteral(node.argument.literal)) record(node.argument.literal.text, 'type', ['*']);
      ts.forEachChild(node, visit);
    }
    visit(ast);
    records.set(file, { source: file, sha256: createHash('sha256').update(body).digest('hex'), url: `https://github.com/mui/base-ui/blob/${pin}/${file}`, imports });
  }
  return [...records.values()].sort((a, b) => a.source.localeCompare(b.source));
}
const runtime = graph(runtimeRoots);
const tests = graph(testRoots);
mkdirSync(resolve(root, 'parity/menu-family/upstream'), { recursive: true });
for (const module of new Map([...runtime, ...tests].map(record => [record.source, record])).values()) {
  const target = resolve(root, 'parity/menu-family/upstream', module.source);
  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(resolve(upstream, module.source), target);
}
copyFileSync(resolve(upstream, 'LICENSE'), resolve(root, 'parity/menu-family/UPSTREAM_LICENSE'));
for (const [name, entries, modules] of [['source', runtimeRoots, runtime], ['test-helper', testRoots, tests]]) {
  writeFileSync(resolve(root, `parity/menu-family/${name}-graph.json`), JSON.stringify({ pin, ordinaryDeclarationCredit: 0, roots: entries, method: 'Complete TypeScript AST runtime/type/import/re-export closure. Barrel fanout is an explicit conservative superset; symbols retain selection evidence. Archival bodies are immutable source evidence, never substitute for used local business ports.', modules }, null, 2) + '\n');
  console.log(`${name}: ${modules.length} modules, ${modules.reduce((sum, module) => sum + module.imports.length, 0)} edges`);
}
