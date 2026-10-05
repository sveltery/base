// Source evidence only; no runtime implementation or assertion credit.
import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, posix, resolve } from 'node:path';
import { promisify } from 'node:util';

const PIN = '47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c';
const args = process.argv.slice(2);
const option = name => { const index = args.indexOf(name); return index < 0 ? undefined : args[index + 1]; };
const upstream = resolve(option('--upstream') ?? '../base-ui-upstream');
const sourceRoot = resolve(option('--source-root') ?? upstream);
const dependencyRoot = resolve(option('--dependencies') ?? 'packages/base');
const require = createRequire(resolve(dependencyRoot, 'package.json'));
const ts = require('typescript');
if (ts.version !== '5.9.3') throw new Error(`Use repository-pinned TypeScript 5.9.3, got ${ts.version}`);
const check = args.includes('--check');
const destination = import.meta.dirname;
const sha256 = value => createHash('sha256').update(value).digest('hex');
const execute = promisify(execFile);
const git = async (...arguments_) => (await execute('git', ['-C', upstream, ...arguments_], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 })).stdout;
const objects = new Map((await git('ls-tree', '-r', PIN)).trim().split('\n').map(line => { const [header, path] = line.split('\t'); return [path, header.split(' ')[2]]; }));
const files = new Set(objects.keys());
const originals = new Map();
const original = source => {
  if (!originals.has(source)) {
    const bytes = readFileSync(resolve(sourceRoot, source));
    const object = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
    if (object !== objects.get(source)) throw new Error(`Physical source does not match immutable Git blob: ${source}`);
    originals.set(source, bytes.toString('utf8'));
  }
  return originals.get(source);
};
const parsed = new Map();
const status = 'Preparation only: unported, zero source acceptance and zero assertion credit.';

function resolveImport(source, specifier) {
  let stem;
  if (specifier.startsWith('.')) stem = posix.normalize(posix.join(posix.dirname(source), specifier)).replace(/\.js$/, '');
  else if (specifier.startsWith('@base-ui/utils/')) stem = `packages/utils/src/${specifier.slice(15)}`;
  else if (specifier === '@base-ui/react') stem = 'packages/react/src/index';
  else if (specifier.startsWith('@base-ui/react/')) stem = `packages/react/src/${specifier.slice(15)}`;
  else if (specifier === '#test-utils') stem = 'packages/react/test/index';
  else return `external:${specifier}`;
  const found = [stem, `${stem}.ts`, `${stem}.tsx`, `${stem}.js`, `${stem}/index.ts`, `${stem}/index.tsx`].find(candidate => files.has(candidate));
  if (!found) throw new Error(`Unresolved ${source} -> ${specifier}`);
  return found;
}

function parse(source) {
  if (parsed.has(source)) return parsed.get(source);
  const body = original(source);
  const ast = ts.createSourceFile(source, body, ts.ScriptTarget.Latest, true, source.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const line = node => ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1;
  const imports = [], members = [], exports = [];
  const edge = (node, specifier, kind, symbols, exported = [], form = 'import') => imports.push({ line: line(node), specifier, resolved: resolveImport(source, specifier), kind, symbols, exported, form });
  function visit(node) {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      const clause = node.importClause, runtime = [], types = [];
      if (clause?.name) (clause.isTypeOnly ? types : runtime).push('default');
      if (clause?.namedBindings && ts.isNamespaceImport(clause.namedBindings)) (clause.isTypeOnly ? types : runtime).push('*');
      if (clause?.namedBindings && ts.isNamedImports(clause.namedBindings)) for (const element of clause.namedBindings.elements) (clause.isTypeOnly || element.isTypeOnly ? types : runtime).push((element.propertyName ?? element.name).text);
      if (runtime.length || !clause) edge(node, node.moduleSpecifier.text, 'runtime', runtime);
      if (types.length) edge(node, node.moduleSpecifier.text, 'type', types);
    } else if (ts.isExportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      if (node.exportClause && ts.isNamedExports(node.exportClause)) for (const element of node.exportClause.elements) edge(node, node.moduleSpecifier.text, node.isTypeOnly || element.isTypeOnly ? 'type' : 'runtime', [(element.propertyName ?? element.name).text], [element.name.text], 'reexport');
      else edge(node, node.moduleSpecifier.text, node.isTypeOnly ? 'type' : 'runtime', ['*'], [node.exportClause && ts.isNamespaceExport(node.exportClause) ? node.exportClause.name.text : '*'], 'reexport');
    } else if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument) && ts.isStringLiteral(node.argument.literal)) edge(node, node.argument.literal.text, 'type', [node.qualifier?.getText(ast) ?? '*'], [], 'import-type');
    else if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword && node.arguments[0] && ts.isStringLiteralLike(node.arguments[0])) edge(node, node.arguments[0].text, 'runtime', ['*'], [], 'dynamic-import');
    ts.forEachChild(node, visit);
  }
  visit(ast);
  for (const statement of ast.statements) {
    const declarations = ts.isVariableStatement(statement) ? statement.declarationList.declarations : [statement];
    for (const node of declarations) if (node.name && ts.isIdentifier(node.name)) {
      members.push({ name: node.name.text, line: line(node), endLine: ast.getLineAndCharacterOfPosition(node.end).line + 1, syntax: ts.SyntaxKind[node.kind], sha256: sha256(node.getText(ast)) });
      if (statement.modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword)) exports.push(node.name.text);
    }
    if (ts.isExportDeclaration(statement) && !statement.moduleSpecifier && statement.exportClause && ts.isNamedExports(statement.exportClause)) exports.push(...statement.exportClause.elements.map(element => element.name.text));
  }
  const record = { source, sha256: sha256(body), url: `https://github.com/mui/base-ui/blob/${PIN}/${source}`, lines: body.split('\n').length - 1, exports, members, imports };
  parsed.set(source, record);
  return record;
}

function provides(source, symbol, seen = new Set()) {
  if (source.startsWith('external:')) return true;
  if (seen.has(source)) return false;
  seen.add(source);
  const module = parse(source);
  if (module.exports.includes(symbol)) return true;
  return module.imports.some(edge => edge.exported.includes(symbol) || (edge.exported.includes('*') && provides(edge.resolved, symbol, new Set(seen))));
}

function graph(roots, selection) {
  const records = new Map(), queue = roots.map(source => ({ source, kind: 'runtime', symbols: ['*'] }));
  for (let cursor = 0; cursor < queue.length; cursor++) {
    const request = queue[cursor], base = parse(request.source);
    let record = records.get(request.source);
    if (!record) { record = { ...base, reachability: [], selectedSymbols: [], callers: [], followedEdges: [] }; records.set(request.source, record); }
    if (request.caller && !record.callers.some(caller => JSON.stringify(caller) === JSON.stringify(request.caller))) record.callers.push(request.caller);
    const newKind = !record.reachability.includes(request.kind), newSymbols = request.symbols.filter(symbol => !record.selectedSymbols.includes(symbol));
    if (!newKind && !newSymbols.length) continue;
    if (newKind) record.reachability.push(request.kind);
    record.selectedSymbols.push(...newSymbols);
    for (const originalEdge of base.imports) {
      let edge = originalEdge;
      if (selection && edge.form === 'reexport' && !record.selectedSymbols.includes('*')) {
        if (edge.exported.includes('*')) {
          const symbols = record.selectedSymbols.filter(symbol => !base.exports.includes(symbol) && provides(edge.resolved, symbol));
          if (!symbols.length) continue;
          edge = { ...edge, symbols };
        } else if (!edge.exported.some(symbol => record.selectedSymbols.includes(symbol))) continue;
      }
      if (!record.followedEdges.some(previous => JSON.stringify(previous) === JSON.stringify(edge))) record.followedEdges.push(edge);
      if (!edge.resolved.startsWith('external:')) queue.push({ source: edge.resolved, kind: request.kind === 'type' || edge.kind === 'type' ? 'type' : 'runtime', symbols: edge.symbols.length ? edge.symbols : ['*'], caller: { source: request.source, line: edge.line, kind: edge.kind, inheritedKind: request.kind, symbols: edge.symbols } });
    }
  }
  return { pin: PIN, status, method: selection ? 'AST import-member selection through named/star/namespace reexports; all imports and full bodies of selected non-barrel modules retained. Explicit type-only paths stay type-only. This is a review scope, not an implementation requirement for every exported helper.' : 'Conservative full runtime/type/import/reexport closure, including unselected barrel fanout; provenance only.', roots, modules: [...records.values()].sort((a, b) => a.source.localeCompare(b.source)) };
}

const family = [...files].filter(source => source.startsWith('packages/react/src/select/') && /\.tsx?$/.test(source)).sort();
const componentTests = family.filter(source => /\.(test|spec)\.tsx?$/.test(source));
const seamTests = ['packages/react/src/internals/itemEquality.test.ts', 'packages/react/src/internals/resolveValueLabel.test.ts', 'packages/react/src/utils/scrollEdges.test.ts'];
for (const source of seamTests) if (!files.has(source)) throw new Error(`Missing seam test ${source}`);
const graphs = {
  'source-graph.json': graph(['packages/react/src/select/index.ts'], false),
  'selected-source-graph.json': graph(['packages/react/src/select/index.ts'], true),
  'test-helper-graph.json': graph([...componentTests, ...seamTests], false),
  'selected-test-helper-graph.json': graph([...componentTests, ...seamTests], true),
};
const harness = graphs['selected-test-helper-graph.json'].modules.filter(module => module.source.startsWith('packages/react/test/') || module.source === 'packages/utils/src/testUtils.ts');
const inventory = [];
for (const source of [...new Set([...componentTests, ...seamTests, ...harness.map(module => module.source)])].sort()) {
  const body = original(source), ast = ts.createSourceFile(source, body, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const line = node => ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1;
  const site = node => ({ id: `${source}:${line(node)}:${node.getStart(ast)}`, line: line(node), expression: node.getText(ast), sha256: sha256(node.getText(ast)), status: 'unported', ordinaryCredit: 0 });
  const declarations = [], parameterizationSites = [], conformance = [], typeSites = [], assertions = [];
  function visit(node) {
    if (ts.isCallExpression(node)) {
      const callee = node.expression.getText(ast), callback = node.arguments.find(argument => ts.isArrowFunction(argument) || ts.isFunctionExpression(argument));
      if (/^(it|test)(\.|\(|$)/.test(callee) && callback && node.arguments.length > 1) {
        const matrices = [];
        for (let parent = node.parent; parent; parent = parent.parent) if (ts.isCallExpression(parent) && /^describe\.(each|for)\(/.test(parent.expression.getText(ast))) matrices.push({ line: line(parent), expression: parent.expression.getText(ast), sha256: sha256(parent.expression.getText(ast)) });
        declarations.push({ ...site(node), title: node.arguments[0].getText(ast), kind: /\.(each|for)/.test(callee) || matrices.length ? 'parameterized-declaration-site' : 'ordinary-declaration-site', matrices, bodySha256: sha256(callback.body.getText(ast)) });
      }
      if (/^(it|test|describe)\.(each|for)$/.test(callee)) parameterizationSites.push({ ...site(node), rows: node.arguments.map(argument => argument.getText(ast)), variants: 'Not expanded or credited; retain nesting and source matrix before porting.' });
      if (/^(describeConformance|popupConformanceTests|describeComposite)$/.test(callee)) conformance.push(site(node));
      if (/expectType|expectError|assertType/.test(callee)) typeSites.push(site(node));
      if (/^expect(?:\<[^]*?\>)?\(/.test(node.getText(ast)) && !(ts.isPropertyAccessExpression(node.parent) || ts.isCallExpression(node.parent))) assertions.push(site(node));
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
  for (const match of body.matchAll(/@ts-expect-error[^\n]*/g)) typeSites.push({ id: `${source}:${body.slice(0, match.index).split('\n').length}:directive:${match.index}`, line: body.slice(0, match.index).split('\n').length, expression: match[0], sha256: sha256(match[0]), status: 'unported', ordinaryCredit: 0 });
  inventory.push({ source, sha256: sha256(body), url: parse(source).url, scope: componentTests.includes(source) ? 'Select declarations/types/store tests' : seamTests.includes(source) ? 'Actual shared helper seam declarations' : 'Conformance/harness helper body: separate helper accounting', declarations, parameterizationSites, conformance, typeSites, assertions });
}
const products = new Map(Object.entries(graphs).map(([name, graph]) => [name, JSON.stringify(graph, null, 2) + '\n']));
const archived = [...new Set([...family, ...Object.values(graphs).flatMap(graph => graph.modules.map(module => module.source))])].sort();
const license = ['LICENSE', 'LICENSE.md'].find(source => files.has(source));
products.set('UPSTREAM_LICENSE', original(license));
products.set('archive-manifest.json', JSON.stringify({ pin: PIN, license, status, files: archived.map(source => ({ source, path: `upstream/${source}.txt`, sha256: sha256(original(source)), url: parse(source).url })) }, null, 2) + '\n');
products.set('original-assertions.json', JSON.stringify({ pin: PIN, status, ordinaryCredit: 0, files: inventory, helperScopes: harness.map(module => ({ source: module.source, sha256: module.sha256, selectedSymbols: module.selectedSymbols, callers: module.callers, status: 'Unported full helper body; no ordinary credit by expansion.' })) }, null, 2) + '\n');
for (const source of archived) products.set(`upstream/${source}.txt`, original(source));
for (const [relative, body] of products) {
  const path = resolve(destination, relative);
  if (check) { if (!existsSync(path) || readFileSync(path, 'utf8') !== body) throw new Error(`Evidence differs: ${relative}`); }
  else { mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, body); }
}
console.log(JSON.stringify({ mode: check ? 'check' : 'generate', pin: PIN, archives: archived.length, graphs: Object.fromEntries(Object.entries(graphs).map(([name, graph]) => [name, { modules: graph.modules.length, edges: graph.modules.reduce((sum, module) => sum + module.followedEdges.length, 0) }])), componentTestRoots: componentTests.length, seamTestRoots: seamTests.length, inventoryFiles: inventory.length, helperFiles: harness.length, declarations: inventory.reduce((sum, file) => sum + file.declarations.length, 0), parameterizationSites: inventory.reduce((sum, file) => sum + file.parameterizationSites.length, 0), conformanceCalls: inventory.reduce((sum, file) => sum + file.conformance.length, 0), typeSites: inventory.reduce((sum, file) => sum + file.typeSites.length, 0), ordinaryCredit: 0 }));
