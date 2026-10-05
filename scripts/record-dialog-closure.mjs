import ts from '../packages/base/node_modules/typescript/lib/typescript.js';
import { readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { resolve, relative, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const pin = '47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c';
const upstream = process.argv[2] && resolve(process.argv[2]);
if (upstream && execFileSync('git', ['rev-parse', 'HEAD'], { cwd: upstream, encoding: 'utf8' }).trim() !== pin) throw new Error('Dialog source graph requires the immutable upstream pin.');
function graph(directory, entries, source = false) {
  const records = new Map();
  const queue = [...entries];
  function resolveImport(file, specifier) {
    let base;
    if (specifier.startsWith('.')) base = resolve(directory, dirname(file), specifier);
    else if (source && specifier.startsWith('@base-ui/utils/')) base = resolve(directory, 'packages/utils/src', specifier.slice('@base-ui/utils/'.length));
    else return `external:${specifier}`;
    // Append source extensions: index.parts must not be mistaken for index.ts.
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
    function record(specifier, kind) {
      const resolved = resolveImport(file, specifier);
      if (!imports.some(edge => edge.specifier === specifier && edge.kind === kind)) imports.push({ specifier, kind, resolved });
      if (!resolved.startsWith('external:')) queue.push(resolved);
    }
    function visit(node) {
      if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
        const clause = node.importClause;
        const elements = clause?.namedBindings && ts.isNamedImports(clause.namedBindings) ? clause.namedBindings.elements : undefined;
        record(node.moduleSpecifier.text, clause?.isTypeOnly || (!clause?.name && elements?.length && elements.every(element => element.isTypeOnly)) ? 'type' : 'runtime');
      } else if (ts.isExportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
        const elements = node.exportClause && ts.isNamedExports(node.exportClause) ? node.exportClause.elements : undefined;
        record(node.moduleSpecifier.text, node.isTypeOnly || (elements?.length && elements.every(element => element.isTypeOnly)) ? 'type' : 'runtime');
      }
      else if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument) && ts.isStringLiteral(node.argument.literal)) record(node.argument.literal.text, 'type');
      ts.forEachChild(node, visit);
    }
    visit(ast);
    records.set(file, { [source ? 'source' : 'local']: file, sha256: createHash('sha256').update(body).digest('hex'), ...(source ? { url: `https://github.com/mui/base-ui/blob/${pin}/${file}` } : {}), imports });
  }
  return [...records.values()].sort((a, b) => (a.source ?? a.local).localeCompare(b.source ?? b.local));
}
if (upstream) {
  const entries = ['packages/react/src/dialog/index.ts'];
  const modules = graph(upstream, entries, true);
  writeFileSync(resolve(root, 'parity/dialog/source-graph.json'), JSON.stringify({ pin, roots: entries, method: 'Complete TypeScript AST import/re-export graph, including runtime and type edges and unselected barrel fanout. The initial pre-code graph checkpoint omitted index.parts due to extension resolution; this corrected inventory retains the same immutable bodies and does not grant parity credit.', modules }, null, 2) + '\n');
  console.log(`${modules.length} original modules, ${modules.reduce((count, module) => count + module.imports.length, 0)} edges`);
}
const entries = ['packages/base/src/lib/dialog/index.ts'];
const records = graph(root, entries);
writeFileSync(resolve(root, 'parity/dialog/local-graph.json'), JSON.stringify({ pin, ordinaryDeclarationCredit: 0, status: 'actual reachable runtime/type closure; final review pending', entries, records }, null, 2) + '\n');
console.log(`${records.length} local modules, ${records.reduce((count, record) => count + record.imports.length, 0)} edges`);
