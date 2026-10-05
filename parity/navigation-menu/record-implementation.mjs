// Record the actual native public closure. Traversal establishes reachability, not Source acceptance.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
const evidence = import.meta.dirname;
const repo = path.resolve(evidence, '../..');
const ts = createRequire(path.join(repo, 'packages/base/package.json'))('typescript');
const hash = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');
const read = (name) => JSON.parse(fs.readFileSync(path.join(evidence, name), 'utf8'));
const original = read('source-correspondence.json');
const reuse = read('canonical-reuse-plan.json');
const transferred = read('canonical-dependency-transfer.json');
const previous = read('prospective-native-reuse-graph.json');
const authority = new Map(previous.modules.map((record) => [record.source, record]));
const canonical = new Map(reuse.modules.map((record) => [record.local, record]));
const extraction = new Map(transferred.portalExtractionFiles.map((record) => [record.path, record]));

function resolve(from, specifier) {
  if (!specifier.startsWith('.')) return `external:${specifier}`;
  const base = path.resolve(repo, path.dirname(from), specifier);
  for (const candidate of [base, base.replace(/\.js$/, '.ts'), base.replace(/\.js$/, '.svelte'), `${base}.ts`, `${base}.svelte`, `${base}/index.ts`]) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return path.relative(repo, candidate);
  }
  throw new Error(`Unresolved native import ${from} -> ${specifier}`);
}

const roots = ['packages/base/src/lib/navigation-menu/index.ts'];
const queue = roots.map((source) => ({ source, kind: 'runtime' }));
const records = new Map();
while (queue.length) {
  const { source, kind } = queue.shift();
  let record = records.get(source);
  if (!record) {
    const bytes = fs.readFileSync(path.join(repo, source));
    const body = bytes.toString();
    let code = body;
    if (source.endsWith('.svelte')) {
      code = [...body.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)]
        .map((match) => '\n'.repeat(body.slice(0, match.index).split('\n').length - 1) + match[1]).join('\n');
    }
    const ast = ts.createSourceFile(source, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const imports = [];
    const declarations = [];
    const queries = [];
    function visit(node) {
      if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteralLike(node.moduleSpecifier)) {
        const importing = ts.isImportDeclaration(node);
        const clause = importing ? node.importClause : node;
        const binding = importing ? clause?.namedBindings : node.exportClause;
        const names = [];
        if (importing && clause?.name) names.push({ imported: 'default', local: clause.name.text, kind: clause.isTypeOnly ? 'type' : 'runtime' });
        if (binding && ts.isNamespaceImport(binding)) names.push({ imported: '*', local: binding.name.text, kind: clause.isTypeOnly ? 'type' : 'runtime' });
        else if (binding && 'elements' in binding) for (const item of binding.elements) names.push({ imported: (item.propertyName ?? item.name).text, local: item.name.text, kind: clause.isTypeOnly || item.isTypeOnly ? 'type' : 'runtime' });
        if (!names.length) names.push({ imported: '*', local: null, kind: clause?.isTypeOnly ? 'type' : 'runtime' });
        imports.push({ line: ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1, specifier: node.moduleSpecifier.text, edge: importing ? 'import' : 'reexport', resolved: resolve(source, node.moduleSpecifier.text), names, kind: names.every((name) => name.kind === 'type') ? 'type' : 'runtime' });
      }
      if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument) && ts.isStringLiteralLike(node.argument.literal)) {
        queries.push({ line: ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1, kind: 'type', edge: 'import-type', resolved: resolve(source, node.argument.literal.text), expression: node.getText(ast) });
      }
      if (ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node) || ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) {
        declarations.push({ name: node.name?.getText(ast) ?? '<anonymous>', kind: ts.SyntaxKind[node.kind], line: ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1, endLine: ast.getLineAndCharacterOfPosition(node.end).line + 1, sha256: hash(node.getText(ast)) });
      }
      ts.forEachChild(node, visit);
    }
    visit(ast);
    const sha256 = hash(bytes);
    const prior = authority.get(source);
    const planned = canonical.get(source);
    const portal = extraction.get(source);
    record = {
      source, sha256, bytes: bytes.length, imports, typeQueries: queries, declarations, reachability: [],
      originalModules: planned?.selectedFromOriginal ?? [],
      exactInheritedNativeBody: prior?.sha256 === sha256,
      inheritedWholeBodyAuthority: prior?.sha256 === sha256 ? prior.completeBodyAuthority : null,
      exactReviewedPortalExtraction: portal?.sha256 === sha256,
      portalProvider: portal?.sha256 === sha256 ? transferred.portalProvider : null,
      reviewStatus: 'Final independent whole-body Source/native/maintainability review pending',
    };
    records.set(source, record);
  }
  if (record.reachability.includes(kind)) continue;
  record.reachability.push(kind);
  for (const edge of [...record.imports, ...record.typeQueries]) {
    if (!edge.resolved.startsWith('external:')) queue.push({ source: edge.resolved, kind: kind === 'type' || edge.kind === 'type' ? 'type' : 'runtime' });
  }
}
const modules = [...records.values()].sort((a, b) => a.source.localeCompare(b.source));
const graph = {
  pin: original.pin, roots, status: 'Actual public syntax runtime/type closure; member/body acceptance is separate and pending',
  moduleCount: modules.length, statementCount: modules.reduce((total, record) => total + record.imports.length + record.typeQueries.length, 0),
  ordinaryCredit: 0, modules,
};
fs.writeFileSync(path.join(evidence, 'actual-native-graph.json'), JSON.stringify(graph, null, 2) + '\n');
const inventory = read('original-assertions.json');
const priorLedgerPath = path.join(evidence, 'implementation-assertion-ledger.json');
const priorLedger = fs.existsSync(priorLedgerPath) ? JSON.parse(fs.readFileSync(priorLedgerPath, 'utf8')) : null;
const previousRows = new Map();
if (priorLedger?.pin === inventory.pin) {
  for (const kind of ['ordinaryDeclarations', 'parameterizedDeclarations', 'conformanceCalls', 'typeAssertions', 'diagnosticDirectives']) {
    for (const row of priorLedger[kind] ?? []) previousRows.set(`${row.source}:${row.kind ?? 'diagnostic'}:${row.line}:${row.sha256 ?? row.expression}`, row);
  }
}
function retainReviewedFields(row) {
  const prior = previousRows.get(`${row.source}:${row.kind ?? 'diagnostic'}:${row.line}:${row.sha256 ?? row.expression}`);
  if (!prior || prior.sourceSha256 !== row.sourceSha256) return row;
  // Source identity and source body still agree. Retain concrete mappings and
  // receipts instead of erasing them when the native import graph changes.
  for (const field of ['nativeAssertions', 'executedEvidence', 'status', 'ordinaryCredit', 'frameworkReplacements', 'review']) {
    if (field in prior) row[field] = prior[field];
  }
  return row;
}
const ledger = {
  pin: inventory.pin, ordinaryCredit: 0, status: 'Original assertion identities retained; execution/unchanged parity mapping pending',
  ordinaryDeclarations: [], parameterizedDeclarations: [], conformanceCalls: [], typeAssertions: [], diagnosticDirectives: [],
};
for (const file of inventory.files) {
  for (const site of file.sites) {
    const row = retainReviewedFields({ source: file.source, sourceSha256: file.sha256, ...site, nativeAssertions: [], executedEvidence: [], status: 'pending', ordinaryCredit: 0 });
    const target = site.kind === 'ordinary-declaration' ? ledger.ordinaryDeclarations : site.kind === 'parameterized-declaration' ? ledger.parameterizedDeclarations : site.kind === 'conformance-call' ? ledger.conformanceCalls : ledger.typeAssertions;
    target.push(row);
  }
  for (const directive of file.diagnosticDirectives) ledger.diagnosticDirectives.push(retainReviewedFields({ source: file.source, sourceSha256: file.sha256, ...directive, status: 'pending' }));
}
ledger.ordinaryCredit = ledger.ordinaryDeclarations.reduce((sum, row) => sum + row.ordinaryCredit, 0);
fs.writeFileSync(path.join(evidence, 'implementation-assertion-ledger.json'), JSON.stringify(ledger, null, 2) + '\n');
console.log(JSON.stringify({ modules: graph.moduleCount, statements: graph.statementCount, ordinary: ledger.ordinaryDeclarations.length, parameterized: ledger.parameterizedDeclarations.length, conformance: ledger.conformanceCalls.length, typeAssertions: ledger.typeAssertions.length, ordinaryCredit: 0 }));
