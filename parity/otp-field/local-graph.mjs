// Actual OTP runtime/type reachability; immutable Original evidence stays separate.
import ts from '../../packages/base/node_modules/typescript/lib/typescript.js';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const revision = process.argv.find(value => value.startsWith('--ref='))?.slice(6);
const destination = process.argv.find(value => value.startsWith('--output='))?.slice(9)
  ?? resolve(import.meta.dirname, 'local-graph.json');
const roots = ['packages/base/src/lib/otp-field/index.ts'];
const modules = new Map();
const external = new Set();
const queue = roots.map(local => ({ local, reachability: 'runtime' }));
const hash = text => createHash('sha256').update(text).digest('hex');
const read = local => revision
  ? execFileSync('git', ['-C', root, 'show', `${revision}:${local}`], { encoding: 'utf8' })
  : readFileSync(resolve(root, local), 'utf8');

function resolveImport(local, specifier) {
  if (!specifier.startsWith('.')) {
    external.add(specifier);
    return `external:${specifier}`;
  }
  const base = resolve(root, dirname(local), specifier);
  const candidates = [base, base.replace(/\.js$/, '.ts'), base.replace(/\.js$/, '.svelte.ts'),
    `${base}.ts`, `${base}.svelte`, `${base}/index.ts`];
  for (const candidate of candidates) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return relative(root, candidate);
  }
  throw new Error(`Unresolved ${local} → ${specifier}`);
}

while (queue.length) {
  const { local, reachability } = queue.shift();
  let record = modules.get(local);
  if (!record) {
    const body = read(local);
    const code = local.endsWith('.svelte')
      ? [...body.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(match => match[1]).join('\n')
      : body;
    const ast = ts.createSourceFile(local, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const imports = [];
    function edge(specifier, kind, names) {
      imports.push({ specifier, kind, names, resolved: resolveImport(local, specifier) });
    }
    function visit(node) {
      if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
        const clause = node.importClause;
        const runtime = [], types = [];
        if (clause?.name) (clause.isTypeOnly ? types : runtime).push(clause.name.text);
        if (clause?.namedBindings && ts.isNamespaceImport(clause.namedBindings))
          (clause.isTypeOnly ? types : runtime).push('*');
        if (clause?.namedBindings && ts.isNamedImports(clause.namedBindings)) {
          for (const name of clause.namedBindings.elements)
            (clause.isTypeOnly || name.isTypeOnly ? types : runtime).push(name.propertyName?.text ?? name.name.text);
        }
        if (runtime.length || !clause) edge(node.moduleSpecifier.text, 'runtime', runtime);
        if (types.length) edge(node.moduleSpecifier.text, 'type', types);
      } else if (ts.isExportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
        const names = node.exportClause && ts.isNamedExports(node.exportClause) ? node.exportClause.elements : undefined;
        if (names) {
          const runtime = names.filter(name => !node.isTypeOnly && !name.isTypeOnly).map(name => name.propertyName?.text ?? name.name.text);
          const types = names.filter(name => node.isTypeOnly || name.isTypeOnly).map(name => name.propertyName?.text ?? name.name.text);
          if (runtime.length) edge(node.moduleSpecifier.text, 'runtime', runtime);
          if (types.length) edge(node.moduleSpecifier.text, 'type', types);
        } else edge(node.moduleSpecifier.text, node.isTypeOnly ? 'type' : 'runtime', ['*']);
      } else if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument) && ts.isStringLiteral(node.argument.literal)) {
        edge(node.argument.literal.text, 'type', []);
      } else if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
        if (!node.arguments[0] || !ts.isStringLiteral(node.arguments[0]))
          throw new Error(`Unresolved dynamic import in ${local}`);
        edge(node.arguments[0].text, 'runtime', []);
      }
      ts.forEachChild(node, visit);
    }
    visit(ast);
    record = { local, sha256: hash(body), reachability: [], imports };
    modules.set(local, record);
  }
  if (record.reachability.includes(reachability)) continue;
  record.reachability.push(reachability);
  for (const edge of record.imports) {
    if (!edge.resolved.startsWith('external:')) queue.push({
      local: edge.resolved,
      reachability: reachability === 'type' || edge.kind === 'type' ? 'type' : 'runtime',
    });
  }
}

const graph = {
  sourcePin: '47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c',
  scope: 'Actual public OTP runtime/type imports, including import-type queries and reexports. Reachability is structural evidence, not manual body-review or assertion credit.',
  roots,
  modules: [...modules.values()].sort((a, b) => a.local.localeCompare(b.local))
    .map(record => ({ ...record, reachability: record.reachability.sort() })),
  externalBoundaries: [...external].sort(),
};
const output = JSON.stringify(graph, null, 2) + '\n';
if (process.argv.includes('--check')) {
  if (readFileSync(destination, 'utf8') !== output) throw new Error('Actual OTP graph is stale');
} else writeFileSync(destination, output);
console.log(`Actual OTP graph: ${modules.size} modules / ${graph.modules.reduce((sum, module) => sum + module.imports.length, 0)} edges; no review or assertion credit.`);
