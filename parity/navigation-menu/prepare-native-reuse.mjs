// Prospective reuse closure of real canonical bodies; NavigationMenu does not exist yet.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
const ts = createRequire(process.env.NAVIGATION_SOURCE_REQUIRE_FROM ?? path.resolve(import.meta.dirname, '../../packages/base/package.json'))('typescript');
const out = import.meta.dirname;
const repo = path.resolve(out, '../..');
const root = '/workspace/menu-family-repair-review';
const head = '1dc439d3a36495dbc4fc19f3f85c6e253dcfc0af';
const plan = JSON.parse(fs.readFileSync(out + '/canonical-reuse-plan.json'));
const authority = JSON.parse(fs.readFileSync('/workspace/sveltery-tmp/menu-family-repair-review-1dc439d/audit.json'));
const authorityByPath = new Map(authority.nativeModules.map((row) => [row.source, row]));
const hash = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');
function resolve(from, spec) {
  if (!spec.startsWith('.')) return 'external:' + spec;
  const base = path.resolve(root, path.dirname(from), spec);
  for (const candidate of [base, base.replace(/\.js$/, '.ts'), base.replace(/\.js$/, '.svelte'), base + '.ts', base + '.svelte', base + '/index.ts']) if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return path.relative(root, candidate);
  throw Error('Unresolved canonical import ' + from + ' -> ' + spec);
}
const roots = plan.modules.map((row) => row.local).filter((file) => file !== 'packages/base/src/lib/utils/popups/index.ts');
const queue = roots.map((source) => ({ source, kind: 'runtime' }));
const records = new Map();
while (queue.length) {
  const { source, kind } = queue.shift();
  let record = records.get(source);
  if (!record) {
    const bytes = fs.readFileSync(root + '/' + source);
    const gitBytes = execFileSync('git', ['-C', repo, 'show', `${head}:${source}`]);
    if (!bytes.equals(gitBytes)) throw Error('Physical canonical/Git mismatch: ' + source);
    const body = bytes.toString();
    let code = body;
    if (source.endsWith('.svelte')) code = [...body.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map((match) => '\n'.repeat(body.slice(0, match.index).split('\n').length - 1) + match[1]).join('\n');
    const ast = ts.createSourceFile(source, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const imports = [];
    function visit(node) {
      if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteralLike(node.moduleSpecifier)) {
        const importing = ts.isImportDeclaration(node), clause = importing ? node.importClause : node, binding = importing ? clause?.namedBindings : node.exportClause;
        const names = [];
        if (importing && clause?.name) names.push({ imported: 'default', local: clause.name.text, kind: clause.isTypeOnly ? 'type' : 'runtime' });
        if (binding && ts.isNamespaceImport(binding)) names.push({ imported: '*', local: binding.name.text, kind: clause.isTypeOnly ? 'type' : 'runtime' });
        else if (binding && 'elements' in binding) for (const item of binding.elements) names.push({ imported: (item.propertyName ?? item.name).text, local: item.name.text, kind: clause.isTypeOnly || item.isTypeOnly ? 'type' : 'runtime' });
        if (!names.length) names.push({ imported: '*', local: null, kind: clause?.isTypeOnly ? 'type' : 'runtime' });
        imports.push({ line: ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1, specifier: node.moduleSpecifier.text, edge: importing ? 'import' : 'reexport', resolved: resolve(source, node.moduleSpecifier.text), names, kind: names.every((name) => name.kind === 'type') ? 'type' : 'runtime' });
      }
      ts.forEachChild(node, visit);
    }
    visit(ast);
    const prior = authorityByPath.get(source);
    if (!prior || prior.sha256 !== hash(bytes)) throw Error('No exact authoritative full-body scope: ' + source);
    record = { source, sha256: hash(bytes), bytes: bytes.length, imports, reachability: [], canonicalHead: head, completeBodyAuthority: prior, freshManualReadClaim: false };
    records.set(source, record);
  }
  if (record.reachability.includes(kind)) continue;
  record.reachability.push(kind);
  for (const edge of record.imports) if (!edge.resolved.startsWith('external:')) queue.push({ source: edge.resolved, kind: kind === 'type' || edge.kind === 'type' ? 'type' : 'runtime' });
}
const result = { status: 'Prospective canonical reuse closure only, before implementation. Roots are planned reusable modules, not a claim that a NavigationMenu public entry already reaches them.', canonicalHead: head, base: plan.base, roots, moduleCount: records.size, edgeCount: [...records.values()].reduce((n, module) => n + module.imports.length, 0), modules: [...records.values()].sort((a, b) => a.source.localeCompare(b.source)) };
fs.writeFileSync(out + '/prospective-native-reuse-graph.json', JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ modules: result.moduleCount, edges: result.edgeCount, everyBodyHasExactAuthoritativeScope: true }));
