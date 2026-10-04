// Evidence-only immutable Source preparation. No runtime implementation is emitted.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';

const ts = createRequire(process.env.NAVIGATION_SOURCE_REQUIRE_FROM ?? path.resolve(import.meta.dirname, '../../packages/base/package.json'))('typescript');
const pin = '47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c';
const upstream = '/workspace/base-ui-upstream';
const physical = '/workspace/direction-provider-upstream';
const out = import.meta.dirname;
const prefix = 'packages/react/src/navigation-menu/';
const sha256 = (body) => crypto.createHash('sha256').update(body).digest('hex');
const tree = execFileSync('git', ['-C', upstream, 'ls-tree', '-r', pin], { encoding: 'utf8' });
const blobs = new Map(tree.trim().split('\n').map((row) => {
  const [metadata, file] = row.split('\t');
  return [file, metadata.split(' ')[2]];
}));
const cache = new Map();
function body(file) {
  if (!cache.has(file)) {
    const bytes = fs.readFileSync(path.join(physical, file));
    const blob = crypto.createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
    if (blob !== blobs.get(file)) throw Error(`Physical body differs from immutable Git: ${file}`);
    cache.set(file, bytes);
  }
  return cache.get(file);
}
function resolve(file, spec) {
  let base;
  if (spec.startsWith('.')) base = path.posix.normalize(path.posix.join(path.posix.dirname(file), spec));
  else if (spec.startsWith('@base-ui/utils/')) base = 'packages/utils/src/' + spec.slice('@base-ui/utils/'.length);
  else if (spec.startsWith('@base-ui/react/')) base = 'packages/react/src/' + spec.slice('@base-ui/react/'.length);
  else if (spec === '#test-utils') base = 'packages/react/test/index';
  else return 'external:' + spec;
  base = base.replace(/\/$/, '');
  for (const candidate of [base, base.replace(/\.js$/, '.ts'), base + '.ts', base + '.tsx', base + '.js', base + '.json', base + '/index.ts', base + '/index.tsx']) {
    if (blobs.has(candidate)) return candidate;
  }
  throw Error(`Unresolved ${file} -> ${spec}`);
}
const asts = new Map();
function ast(file) {
  if (!asts.has(file)) asts.set(file, ts.createSourceFile(file, body(file).toString(), ts.ScriptTarget.Latest, true, file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS));
  return asts.get(file);
}
const records = new Map();
function parse(file) {
  if (records.has(file)) return records.get(file);
  const source = ast(file), imports = [], declarations = [], namespaceMembers = [];
  const line = (node) => source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1;
  function visit(node) {
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteralLike(node.moduleSpecifier)) {
      const importing = ts.isImportDeclaration(node);
      const clause = importing ? node.importClause : node;
      const bindings = importing ? clause?.namedBindings : node.exportClause;
      const names = [];
      if (importing && clause?.name) names.push({ imported: 'default', local: clause.name.text, kind: clause.isTypeOnly ? 'type' : 'runtime' });
      if (bindings && ts.isNamespaceImport(bindings)) names.push({ imported: '*', local: bindings.name.text, kind: clause.isTypeOnly ? 'type' : 'runtime', namespace: true });
      else if (bindings && ts.isNamespaceExport(bindings)) names.push({ imported: '*', local: bindings.name.text, kind: clause.isTypeOnly ? 'type' : 'runtime', namespace: true });
      else if (bindings && 'elements' in bindings) for (const name of bindings.elements) names.push({ imported: (name.propertyName ?? name.name).text, local: name.name.text, kind: clause.isTypeOnly || name.isTypeOnly ? 'type' : 'runtime' });
      if (!names.length) names.push({ imported: '*', local: null, kind: clause?.isTypeOnly ? 'type' : 'runtime' });
      imports.push({ edge: importing ? 'import' : 'reexport', line: line(node), specifier: node.moduleSpecifier.text, resolved: resolve(file, node.moduleSpecifier.text), kind: names.every((name) => name.kind === 'type') ? 'type' : 'runtime', names });
    } else if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument) && ts.isStringLiteralLike(node.argument.literal)) {
      imports.push({ edge: 'import-type', line: line(node), specifier: node.argument.literal.text, resolved: resolve(file, node.argument.literal.text), kind: 'type', names: [{ imported: node.qualifier?.getText(source) ?? '*', local: null, kind: 'type' }] });
    } else if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword && ts.isStringLiteralLike(node.arguments[0])) {
      imports.push({ edge: 'dynamic-import', line: line(node), specifier: node.arguments[0].text, resolved: resolve(file, node.arguments[0].text), kind: 'runtime', names: [{ imported: '*', local: null, kind: 'runtime' }] });
    }
    if ((ts.isFunctionDeclaration(node) || ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node) || ts.isClassDeclaration(node) || ts.isModuleDeclaration(node)) && node.name) declarations.push({ name: node.name.text, kind: ts.SyntaxKind[node.kind], line: line(node), endLine: source.getLineAndCharacterOfPosition(node.end).line + 1, sha256: sha256(node.getText(source)) });
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer && (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer) || (ts.isCallExpression(node.initializer) && node.initializer.arguments.some((argument) => ts.isArrowFunction(argument) || ts.isFunctionExpression(argument))))) declarations.push({ name: node.name.text, kind: 'FunctionBinding', line: line(node), endLine: source.getLineAndCharacterOfPosition(node.end).line + 1, sha256: sha256(node.getText(source)) });
    if ((ts.isMethodDeclaration(node) || ts.isGetAccessor(node) || ts.isSetAccessor(node) || (ts.isPropertyDeclaration(node) && node.initializer && ts.isArrowFunction(node.initializer))) && node.name) declarations.push({ name: node.name.getText(source), kind: ts.SyntaxKind[node.kind], line: line(node), endLine: source.getLineAndCharacterOfPosition(node.end).line + 1, sha256: sha256(node.getText(source)) });
    if (ts.isPropertyAccessExpression(node)) {
      const memberPath = []; let root = node;
      while (ts.isPropertyAccessExpression(root)) { memberPath.unshift(root.name.text); root = root.expression; }
      if (ts.isIdentifier(root)) namespaceMembers.push({ local: root.text, member: memberPath[0], memberPath, expression: node.getText(source), line: line(node) });
    }
    if (ts.isQualifiedName(node)) {
      const memberPath = []; let root = node;
      while (ts.isQualifiedName(root)) { memberPath.unshift(root.right.text); root = root.left; }
      if (ts.isIdentifier(root)) namespaceMembers.push({ local: root.text, member: memberPath[0], memberPath, expression: node.getText(source), line: line(node), type: true });
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  const record = { source: file, url: `https://github.com/mui/base-ui/blob/${pin}/${file}`, sha256: sha256(body(file)), gitBlob: blobs.get(file), bytes: body(file).length, lineCount: body(file).toString().split('\n').length - 1, declarations, imports, namespaceMembers };
  records.set(file, record);
  return record;
}
function closure(roots) {
  const reached = new Map(), queue = roots.map((source) => ({ source, kind: 'runtime' }));
  while (queue.length) {
    const { source, kind } = queue.shift();
    const kinds = reached.get(source) ?? new Set();
    if (kinds.has(kind)) continue;
    kinds.add(kind); reached.set(source, kinds);
    for (const edge of parse(source).imports) if (!edge.resolved.startsWith('external:')) queue.push({ source: edge.resolved, kind: kind === 'type' || edge.kind === 'type' ? 'type' : 'runtime' });
  }
  return [...reached].map(([source, kinds]) => ({ ...parse(source), reachability: [...kinds].sort() })).sort((a, b) => a.source.localeCompare(b.source));
}
// Resolve named exports through reexports. For pure barrels select actual requested
// members, while preserving every import of the reached complete business body.
function exportsOf(file, member, seen = new Set()) {
  const key = file + ':' + member;
  if (seen.has(key)) return [];
  seen = new Set(seen).add(key);
  const a = ast(file), result = [];
  for (const node of a.statements) {
    if (!ts.isExportDeclaration(node)) continue;
    if (!node.moduleSpecifier || !ts.isStringLiteralLike(node.moduleSpecifier)) continue;
    const target = resolve(file, node.moduleSpecifier.text);
    if (node.exportClause && ts.isNamedExports(node.exportClause)) {
      for (const item of node.exportClause.elements) if (member === '*' || item.name.text === member) result.push({ source: target, member: (item.propertyName ?? item.name).text, kind: node.isTypeOnly || item.isTypeOnly ? 'type' : 'runtime' });
    } else if (node.exportClause && ts.isNamespaceExport(node.exportClause)) {
      if (member === '*' || node.exportClause.name.text === member) result.push({ source: target, member: '*', kind: node.isTypeOnly ? 'type' : 'runtime' });
    } else if (!target.startsWith('external:')) result.push(...exportsOf(target, member, seen));
  }
  const direct = new Set();
  for (const node of a.statements) {
    const modifiers = node.modifiers?.map((m) => m.kind) ?? [];
    if (modifiers.includes(ts.SyntaxKind.ExportKeyword)) {
      if (modifiers.includes(ts.SyntaxKind.DefaultKeyword)) direct.add('default');
      if (node.name?.text) direct.add(node.name.text);
      if (ts.isVariableStatement(node)) for (const declaration of node.declarationList.declarations) if (ts.isIdentifier(declaration.name)) direct.add(declaration.name.text);
    }
    if (ts.isExportAssignment(node)) direct.add('default');
    if (ts.isExportDeclaration(node) && !node.moduleSpecifier && node.exportClause && ts.isNamedExports(node.exportClause)) for (const item of node.exportClause.elements) direct.add(item.name.text);
  }
  if (member === '*' || direct.has(member)) result.push({ source: file, member, kind: 'runtime' });
  return result;
}
function isBarrel(file) { return ast(file).statements.every((n) => ts.isExportDeclaration(n) || ts.isExpressionStatement(n)); }
function selected(roots) {
  const reached = new Map(), members = new Map(), queue = roots.map((source) => ({ source, member: '*', kind: 'runtime' }));
  const processedExports = new Set();
  const chosenEdges = [];
  while (queue.length) {
    const { source, member, kind } = queue.shift();
    const selectedNames = members.get(source) ?? new Set(); selectedNames.add(member); members.set(source, selectedNames);
    const kinds = reached.get(source) ?? new Set();
    if (isBarrel(source)) {
      const k = kind + ':' + member; if (kinds.has(k)) continue; kinds.add(k); reached.set(source, kinds);
      for (const target of exportsOf(source, member)) {
        if (target.source === source) continue;
        chosenEdges.push({ from: source, requested: member, ...target });
        if (target.source.startsWith('external:')) continue;
        queue.push({ ...target, kind: kind === 'type' || target.kind === 'type' ? 'type' : 'runtime' });
      }
      continue;
    }
    const exportKey = source + ':' + kind + ':' + member;
    if (!processedExports.has(exportKey)) {
      processedExports.add(exportKey);
      for (const target of exportsOf(source, member)) if (target.source !== source) {
        chosenEdges.push({ from: source, requested: member, ...target });
        if (target.source.startsWith('external:')) continue;
        queue.push({ ...target, kind: kind === 'type' || target.kind === 'type' ? 'type' : 'runtime' });
      }
    }
    if (kinds.has(kind)) continue; kinds.add(kind); reached.set(source, kinds);
    const record = parse(source);
    for (const edge of record.imports) {
      if (edge.edge === 'reexport') continue;
      if (edge.resolved.startsWith('external:')) continue;
      for (const name of edge.names) {
        const actual = name.namespace ? [...new Set(record.namespaceMembers.filter((use) => use.local === name.local).map((use) => use.member))] : [name.imported.split('.')[0]];
        for (const requested of actual.length ? actual : ['*']) {
          chosenEdges.push({ from: source, line: edge.line, specifier: edge.specifier, source: edge.resolved, requested, kind: name.kind });
          queue.push({ source: edge.resolved, member: requested, kind: kind === 'type' || name.kind === 'type' ? 'type' : 'runtime' });
        }
      }
    }
  }
  return { modules: [...reached].map(([source, kinds]) => ({ ...parse(source), selectedMembers: [...members.get(source)].sort(), reachability: [...new Set([...kinds].map((k) => k.startsWith('type') ? 'type' : 'runtime'))].sort(), barrel: isBarrel(source) })).sort((a, b) => a.source.localeCompare(b.source)), edges: chosenEdges };
}
const sourceRoots = [...blobs.keys()].filter((file) => file.startsWith(prefix) && /\.tsx?$/.test(file) && !/\.(test|spec)\.tsx?$/.test(file)).sort();
const sourceGraph = closure(sourceRoots);
const selection = selected([prefix + 'index.ts']);
const testFiles = [...blobs.keys()].filter((file) => file.startsWith(prefix) && /\.(test|spec)\.tsx?$/.test(file)).sort();
const assertionFiles = testFiles.map((source) => {
  const a = ast(source), sites = [], assertions = [], helperCalls = [], publicMemberUses = [];
  const helperNames = new Set(parse(source).imports.filter((edge) => edge.specifier === '#test-utils').flatMap((edge) => edge.names.map((name) => name.local)));
  function visit(node) {
    const line = a.getLineAndCharacterOfPosition(node.getStart(a)).line + 1;
    if (ts.isCallExpression(node)) {
      const callee = node.expression.getText(a), text = node.getText(a);
      let base = node.expression;
      while (ts.isCallExpression(base) || ts.isPropertyAccessExpression(base) || ts.isElementAccessExpression(base)) base = base.expression;
      const baseName = ts.isIdentifier(base) ? base.text : null;
      const factory = ts.isPropertyAccessExpression(node.expression) && ['each', 'for', 'skipIf', 'runIf'].includes(node.expression.name.text);
      if (['it', 'test'].includes(baseName) && !factory && node.arguments.length > 1) sites.push({ line, endLine: a.getLineAndCharacterOfPosition(node.end).line + 1, callee, title: node.arguments[0].getText(a), kind: /\.(each|for)\b/.test(callee) ? 'parameterized-declaration' : 'ordinary-declaration', sha256: sha256(text), ordinaryCredit: 0, status: 'unported' });
      if (/^describeConformance(\.|$)/.test(callee)) sites.push({ line, callee, title: node.arguments[0]?.getText(a), kind: 'conformance-call', sourceSkipped: callee.includes('.skip'), configuration: node.arguments.slice(1).map((arg) => arg.getText(a)), sha256: sha256(text), ordinaryCredit: 0, status: 'unported' });
      if (/expectType|expectAssignable|expectNotAssignable|expectError/.test(callee)) sites.push({ line, callee, expression: text, kind: 'type-assertion', typeArguments: node.typeArguments?.map((arg) => arg.getText(a)) ?? [], sha256: sha256(text), ordinaryCredit: 0, status: 'unported' });
      if (baseName === 'expect' && /\.(to|not\.)/.test(callee)) assertions.push({ line, callee, expression: text, sha256: sha256(text) });
      if (helperNames.has(baseName)) helperCalls.push({ line, callee, expression: text, sha256: sha256(text) });
    }
    if (ts.isPropertyAccessExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'NavigationMenu') publicMemberUses.push({ line, member: node.name.text, expression: node.getText(a) });
    if (ts.isQualifiedName(node) && ts.isIdentifier(node.left) && node.left.text === 'NavigationMenu') publicMemberUses.push({ line, member: node.right.text, expression: node.getText(a), type: true });
    ts.forEachChild(node, visit);
  }
  visit(a);
  const diagnosticDirectives = body(source).toString().split('\n').flatMap((text, index) => /@ts-expect-error|@ts-ignore/.test(text) ? [{ line: index + 1, text, sha256: sha256(text) }] : []);
  return { source, url: parse(source).url, sha256: sha256(body(source)), sites, assertions, diagnosticDirectives, helperCalls, publicMemberUses, imports: parse(source).imports };
});
const testGraph = closure(testFiles);
const testSelection = selected(testFiles);
const memberResolutionAudit = [];
for (const module of [...sourceGraph, ...testGraph]) for (const edge of module.imports) {
  if (edge.resolved.startsWith('external:')) continue;
  for (const name of edge.names) if (name.imported !== '*') {
    const requested = name.imported.split('.')[0];
    const resolutions = exportsOf(edge.resolved, requested);
    memberResolutionAudit.push({ from: module.source, line: edge.line, imported: name.imported, kind: name.kind, resolvedModule: edge.resolved, exports: resolutions, resolves: resolutions.length > 0 });
  }
}
const unresolvedMembers = memberResolutionAudit.filter((row) => !row.resolves);
if (unresolvedMembers.length) throw Error('Unresolved immutable imported members: ' + JSON.stringify(unresolvedMembers));
const allPublic = [];
for (const node of ast(prefix + 'index.parts.ts').statements) if (ts.isExportDeclaration(node) && node.exportClause && ts.isNamedExports(node.exportClause)) for (const item of node.exportClause.elements) allPublic.push({ part: item.name.text, originalSymbol: (item.propertyName ?? item.name).text, source: resolve(prefix + 'index.parts.ts', node.moduleSpecifier.text) });
const publicApi = allPublic.map((part) => ({ ...part, declarations: parse(part.source).declarations.filter((declaration) => declaration.name.startsWith(part.originalSymbol)), sourceSha256: parse(part.source).sha256, namespaceUses: assertionFiles.flatMap((file) => file.publicMemberUses.filter((use) => use.member === part.part).map((use) => ({ source: file.source, ...use }))) }));
const helperSelections = assertionFiles.flatMap((file) => file.imports.filter((edge) => edge.specifier === '#test-utils').flatMap((edge) => edge.names.map((name) => ({ test: file.source, line: edge.line, imported: name.imported, kind: name.kind, resolved: exportsOf(edge.resolved, name.imported), calls: file.helperCalls.filter((call) => call.callee === name.local || call.callee.startsWith(name.local + '.')) }))));
const helperAssertionFiles = testSelection.modules.filter((module) => module.source.startsWith('packages/react/test/') || module.source === 'packages/utils/src/testUtils.ts').map((module) => {
  const a = ast(module.source), sites = [], assertions = [];
  function visit(node) {
    if (ts.isCallExpression(node)) {
      const callee = node.expression.getText(a), text = node.getText(a), line = a.getLineAndCharacterOfPosition(node.getStart(a)).line + 1;
      if (/^(it|test)(\.|$)/.test(callee)) sites.push({ line, callee, title: node.arguments[0]?.getText(a), sha256: sha256(text), kind: 'helper-declaration', ordinaryCredit: 0 });
      if (/^expect\(/.test(callee)) assertions.push({ line, callee, expression: text, sha256: sha256(text) });
    }
    ts.forEachChild(node, visit);
  }
  visit(a);
  return { source: module.source, sha256: module.sha256, declarations: module.declarations, sites, assertions };
});
const testNamespaceResolutions = [];
for (const file of assertionFiles) {
  const rec = parse(file.source);
  for (const edge of rec.imports) {
    if (!edge.specifier.startsWith('@base-ui/react/')) continue;
    for (const name of edge.names) for (const use of rec.namespaceMembers.filter((use) => use.local === name.local)) {
      const publicParts = exportsOf(edge.resolved, name.imported);
      for (const partBarrel of publicParts) for (const target of exportsOf(partBarrel.source, use.member)) {
        const declarations = parse(target.source).declarations;
        const terminalMembers = use.memberPath.slice(1);
        const terminalDeclarations = terminalMembers.length ? declarations.filter((declaration) => declaration.name === terminalMembers.at(-1)) : declarations.filter((declaration) => declaration.name === target.member);
        if (!terminalDeclarations.length) throw Error(`Unresolved test namespace member ${file.source}:${use.line} ${use.expression}`);
        testNamespaceResolutions.push({ test: file.source, importLine: edge.line, useLine: use.line, expression: use.expression, importedNamespace: name.imported, member: use.member, memberPath: use.memberPath, exportedOriginalSymbol: target.member, resolved: target.source, sourceSha256: parse(target.source).sha256, terminalDeclarations, kind: use.type ? 'type-namespace-use' : 'runtime-or-JSX-namespace-use' });
      }
    }
  }
}
// Actual Source sibling consumers of the selected shared bodies, excluding unrelated
// namespace/barrel members. This scans AST imports without executing tests.
const selectedBodies = new Set(selection.modules.filter((module) => !module.barrel && !module.source.startsWith(prefix)).map((module) => module.source));
const siblingConsumers = [];
for (const file of blobs.keys()) if (/\.(tsx?|jsx?)$/.test(file) && /^(packages\/(react|utils)\/(src|test)\/|test\/)/.test(file) && !file.startsWith(prefix)) {
  const rec = parse(file);
  for (const edge of rec.imports) if (!edge.resolved.startsWith('external:')) for (const name of edge.names) {
    const actual = name.namespace ? [...new Set(rec.namespaceMembers.filter((use) => use.local === name.local).map((use) => use.member))] : [name.imported];
    for (const requested of actual.length ? actual : ['*']) for (const target of isBarrel(edge.resolved) ? exportsOf(edge.resolved, requested) : [{ source: edge.resolved, member: requested }]) if (selectedBodies.has(target.source)) siblingConsumers.push({ consumer: file, consumerSha256: rec.sha256, line: edge.line, specifier: edge.specifier, imported: requested, resolved: target.source, member: target.member, kind: name.kind });
  }
}
const write = (name, data) => fs.writeFileSync(path.join(out, name), JSON.stringify(data, null, 2) + '\n');
const metadata = { pin, immutablePhysicalBodiesVerified: true, ordinaryCredit: 0, status: 'Phase 1 source preparation only; no implementation or Source CLEAR claim' };
write('source-graph.json', { ...metadata, roots: sourceRoots, moduleCount: sourceGraph.length, edgeCount: sourceGraph.reduce((n, module) => n + module.imports.length, 0), modules: sourceGraph });
write('selected-source.json', { ...metadata, roots: [prefix + 'index.ts'], moduleCount: selection.modules.length, edgeCount: selection.edges.length, ...selection });
write('original-assertions.json', { ...metadata, files: assertionFiles });
write('test-helper-graph.json', { ...metadata, roots: testFiles, moduleCount: testGraph.length, edgeCount: testGraph.reduce((n, module) => n + module.imports.length, 0), modules: testGraph });
write('selected-test-helpers.json', { ...metadata, moduleCount: testSelection.modules.length, edgeCount: testSelection.edges.length, helperSelections, ...testSelection });
write('helper-assertions.json', { ...metadata, note: 'Conformance helper declarations are separate from component ordinary sites and are not multiplied into parity credit.', files: helperAssertionFiles });
write('test-namespace-resolutions.json', { ...metadata, resolutions: testNamespaceResolutions });
write('member-resolution-audit.json', { ...metadata, allImportedMembersResolve: true, unresolvedMembers, resolutions: memberResolutionAudit });
write('public-api.json', { ...metadata, publicPartNames: allPublic.map((part) => part.part), parts: publicApi });
write('sibling-consumers.json', { ...metadata, selectedSharedBodies: [...selectedBodies].sort(), boundaries: siblingConsumers });
const archiveFiles = [...new Set([...sourceGraph, ...testGraph].map((module) => module.source).concat('LICENSE'))].sort();
const archiveManifest = [];
for (const source of archiveFiles) {
  const target = path.join(out, 'original', source);
  fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, body(source));
  archiveManifest.push({ source, gitBlob: blobs.get(source), sha256: sha256(body(source)), bytes: body(source).length });
}
write('archive-manifest.json', { ...metadata, note: 'Immutable archive is provenance only. Its body counts do not imply manual reading or acceptance.', fileCount: archiveFiles.length, files: archiveManifest });
fs.writeFileSync(path.join(out, 'UPSTREAM_LICENSE'), body('LICENSE'));
execFileSync('tar', ['--sort=name', '--mtime=@0', '--owner=0', '--group=0', '--numeric-owner', '-czf', path.join(out, 'original-source.tar.gz'), '-C', path.join(out, 'original'), '.']);
fs.rmSync(path.join(out, 'original'), { recursive: true });
const siteCounts = {};
for (const file of assertionFiles) for (const site of file.sites) siteCounts[site.kind] = (siteCounts[site.kind] ?? 0) + 1;
console.log(JSON.stringify({ publicParts: allPublic.map((part) => part.part), sourceModules: sourceGraph.length, selectedSourceModules: selection.modules.length, testFiles: testFiles.length, siteCounts, assertionExpressions: assertionFiles.reduce((n, file) => n + file.assertions.length, 0), testGraphModules: testGraph.length, selectedTestModules: testSelection.modules.length, siblingImportBoundaries: siblingConsumers.length, archiveFiles: archiveFiles.length }, null, 2));
