// Read-only proposed native helper closure. No implementation or acceptance credit.
import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { posix, resolve } from 'node:path';
import { promisify } from 'node:util';
import { gzipSync, gunzipSync } from 'node:zlib';

const args = process.argv.slice(2);
const option = name => { const i = args.indexOf(name); return i < 0 ? undefined : args[i + 1]; };
const main = resolve(option('--main') ?? '.');
const mainPin = 'abe8aa9b66ab8cd8d83dfdac28ebee94a0655f79';
const ts = createRequire(resolve(option('--dependencies') ?? 'packages/base', 'package.json'))('typescript');
if (ts.version !== '6.0.3') throw new Error(`Use repository-pinned TypeScript 6.0.3, got ${ts.version}`);
const execute = promisify(execFile);
const git = async (directory, ...argv) => (await execute('git', ['-C', directory, ...argv], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 })).stdout;
const blobMap = async (directory, pin) => new Map((await git(directory, 'ls-tree', '-r', pin)).trim().split('\n').map(line => { const [header, path] = line.split('\t'); return [path, header.split(' ')[2]]; }));
const mainFiles = await blobMap(main, mainPin);
const sha256 = body => createHash('sha256').update(body).digest('hex');
const lib = 'packages/base/src/lib/';
const roots = [
  'internals/field-root-context/FieldRootContext.ts', 'internals/form-context/FormContext.ts',
  'internals/field-register-control/useRegisterFieldControl.svelte.ts', 'internals/field-register-control/FieldControlRegistration.svelte.ts',
  'field/root/useFieldValidation.svelte.ts', 'field/Control.svelte', 'internals/field-control-name/FieldControlNameContext.ts',
  'internals/labelable-provider/useLabel.svelte.ts', 'internals/labelable-provider/useLabelableId.svelte.ts',
  'internals/composite/list/createCompositeList.svelte.ts', 'internals/composite/list/useCompositeListItem.svelte.ts',
  'internals/use-button/useButton.svelte.ts', 'internals/mergeComponentProps.ts',
  'internals/useTransitionStatus.svelte.ts', 'internals/useOpenChangeComplete.svelte.ts',
  'floating-ui/components/FloatingRootStore.svelte.ts', 'floating-ui/hooks/useClick.svelte.ts',
  'floating-ui/hooks/useFloating.svelte.ts', 'floating-ui/hooks/useSyncedFloatingRootContext.svelte.ts',
  'floating-ui/hooks/useDismiss.svelte.ts', 'floating-ui/hooks/useListNavigation.svelte.ts', 'floating-ui/hooks/useTypeahead.svelte.ts',
  'floating-ui/components/FloatingFocusManager.svelte', 'floating-ui/components/FloatingPortal.svelte',
  'internals/anchor-positioning/useAnchorPositioning.svelte.ts', 'utils/FocusGuard.svelte', 'utils/InternalBackdrop.svelte',
  'utils/usePositioner.svelte.ts', 'utils/useOpenInteractionType.svelte.ts',
  'utils/useAnchoredPopupScrollLock.svelte.ts', 'utils/scrollEdges.ts', 'utils/styles.ts',
  'internals/itemEquality.ts', 'internals/resolveValueLabel.ts',
  'utils/listbox-separator/ListboxSeparator.svelte',
  'internals/serializeValue.ts', 'internals/stateAttributesMapping.ts', 'utils/popupStateMapping.ts',
  'utils/popups/popupStoreUtils.svelte.ts', 'csp-provider/context.ts',
].map(path => lib + path);
const integrationRoots = [lib + 'form/Form.svelte'];
// Real source test fixtures, separate from Select runtime prerequisites.
const fixtureRoots = [
  'popover/Root.svelte', 'popover/Trigger.svelte', 'popover/Portal.svelte',
  'popover/Positioner.svelte', 'popover/Popup.svelte',
  'toolbar/root/ToolbarRoot.svelte', 'toolbar/button/ToolbarButton.svelte',
  'field/Root.svelte', 'field/Label.svelte', 'field/Control.svelte',
  'field/Error.svelte', 'field/Validity.svelte',
].map(path => lib + path);
const chosenProvider = () => 'accepted-main';
const has = path => mainFiles.has(path);
function resolveImport(path, specifier) {
  let stem;
  if (specifier.startsWith('@sveltery/utils/')) stem = 'packages/utils/src/lib/' + specifier.slice('@sveltery/utils/'.length);
  else if (specifier.startsWith('.')) stem = posix.normalize(posix.join(posix.dirname(path), specifier)).replace(/\.js$/, '');
  else return `external:${specifier}`;
  const found = [stem, `${stem}.ts`, `${stem}.svelte.ts`, `${stem}.svelte`, `${stem}/index.ts`].find(has);
  if (!found) throw new Error(`Unresolved native import ${path} -> ${specifier}`);
  return found;
}
const parsed = new Map();
function parse(path) {
  if (parsed.has(path)) return parsed.get(path);
  const provider = chosenProvider(path), directory = main;
  const files = mainFiles;
  if (!files.has(path)) throw new Error(`Missing proposed provider file ${provider}:${path}`);
  const bytes = readFileSync(resolve(directory, path));
  const blob = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
  if (blob !== files.get(path)) throw new Error(`Native working body differs from recorded commit ${provider}:${path}`);
  const body = bytes.toString('utf8');
  // Parse both Svelte script regions at their real line positions; markup remains archived by hash.
  let script = body;
  if (path.endsWith('.svelte')) {
    script = body.replace(/[^\n]/g, ' ');
    for (const match of body.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)) {
      const start = match.index + match[0].indexOf('>') + 1;
      script = script.slice(0, start) + match[1] + script.slice(start + match[1].length);
    }
  }
  const ast = ts.createSourceFile(path, script, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const line = node => ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1;
  const imports = [], members = [], exports = path.endsWith('.svelte') ? ['default'] : [];
  const edge = (node, specifier, kind, symbols, form, exported = []) => imports.push({ line: line(node), specifier, resolved: resolveImport(path, specifier), kind, symbols, form, exported });
  function visit(node) {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      const clause = node.importClause, runtime = [], types = [];
      if (clause?.name) (clause.isTypeOnly ? types : runtime).push('default');
      if (clause?.namedBindings && ts.isNamespaceImport(clause.namedBindings)) (clause.isTypeOnly ? types : runtime).push('*');
      if (clause?.namedBindings && ts.isNamedImports(clause.namedBindings)) for (const e of clause.namedBindings.elements) (clause.isTypeOnly || e.isTypeOnly ? types : runtime).push((e.propertyName ?? e.name).text);
      if (runtime.length || !clause) edge(node, node.moduleSpecifier.text, 'runtime', runtime, 'import');
      if (types.length) edge(node, node.moduleSpecifier.text, 'type', types, 'import');
    } else if (ts.isExportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      if (node.exportClause && ts.isNamedExports(node.exportClause)) for (const e of node.exportClause.elements) edge(node, node.moduleSpecifier.text, node.isTypeOnly || e.isTypeOnly ? 'type' : 'runtime', [(e.propertyName ?? e.name).text], 'reexport', [e.name.text]);
      else edge(node, node.moduleSpecifier.text, node.isTypeOnly ? 'type' : 'runtime', ['*'], 'reexport', [node.exportClause && ts.isNamespaceExport(node.exportClause) ? node.exportClause.name.text : '*']);
    } else if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument) && ts.isStringLiteral(node.argument.literal)) edge(node, node.argument.literal.text, 'type', [node.qualifier?.getText(ast) ?? '*'], 'import-type');
    else if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword && node.arguments[0] && ts.isStringLiteralLike(node.arguments[0])) edge(node, node.arguments[0].text, 'runtime', ['*'], 'dynamic-import');
    ts.forEachChild(node, visit);
  }
  visit(ast);
  for (const statement of ast.statements) {
    for (const node of ts.isVariableStatement(statement) ? statement.declarationList.declarations : [statement]) if (node.name && ts.isIdentifier(node.name)) {
      members.push({ name: node.name.text, line: line(node), endLine: ast.getLineAndCharacterOfPosition(node.end).line + 1, syntax: ts.SyntaxKind[node.kind], sha256: sha256(node.getText(ast)) });
      if (statement.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) exports.push(node.name.text);
      if (statement.modifiers?.some(m => m.kind === ts.SyntaxKind.DefaultKeyword)) exports.push('default');
    }
    if (ts.isExportDeclaration(statement) && !statement.moduleSpecifier && statement.exportClause && ts.isNamedExports(statement.exportClause)) exports.push(...statement.exportClause.elements.map(e => e.name.text));
  }
  const record = { source: path, provider, commit: mainPin, sha256: sha256(body), gitBlob: blob, lines: body.split('\n').length - 1, pendingChangesExistingMainFile: false, imports, members, exports };
  parsed.set(path, record);
  return record;
}
function provides(path, symbol, seen = new Set()) {
  if (path.startsWith('external:')) return true;
  if (seen.has(path)) return false;
  seen.add(path);
  const module = parse(path);
  return module.exports.includes(symbol) || module.imports.some(edge => edge.exported.includes(symbol) || (edge.exported.includes('*') && provides(edge.resolved, symbol, new Set(seen))));
}
function collect(selectedRoots) {
const queue = selectedRoots.map(source => ({ source, kind: 'runtime', symbols: ['*'] })), records = new Map();
for (let i = 0; i < queue.length; i++) {
  const request = queue[i], base = parse(request.source);
  let record = records.get(request.source);
  if (!record) { record = { ...base, reachability: [], selectedSymbols: [], callers: [], followedEdges: [] }; records.set(request.source, record); }
  if (request.caller && !record.callers.some(c => JSON.stringify(c) === JSON.stringify(request.caller))) record.callers.push(request.caller);
  const newKind = !record.reachability.includes(request.kind), newSymbols = request.symbols.filter(s => !record.selectedSymbols.includes(s));
  if (!newKind && !newSymbols.length) continue;
  if (newKind) record.reachability.push(request.kind);
  record.selectedSymbols.push(...newSymbols);
  for (const originalEdge of base.imports) {
    let edge = originalEdge;
    if (edge.form === 'reexport' && !record.selectedSymbols.includes('*')) {
      if (edge.exported.includes('*')) {
        const symbols = record.selectedSymbols.filter(s => !base.exports.includes(s) && provides(edge.resolved, s));
        if (!symbols.length) continue;
        edge = { ...edge, symbols };
      } else if (!edge.exported.some(s => record.selectedSymbols.includes(s))) continue;
    }
    if (!record.followedEdges.some(e => JSON.stringify(e) === JSON.stringify(edge))) record.followedEdges.push(edge);
    if (!edge.resolved.startsWith('external:')) queue.push({ source: edge.resolved, kind: request.kind === 'type' || edge.kind === 'type' ? 'type' : 'runtime', symbols: edge.symbols.length ? edge.symbols : ['*'], caller: { source: request.source, line: edge.line, kind: edge.kind, inheritedKind: request.kind, symbols: edge.symbols } });
  }
}
return [...records.values()].sort((a, b) => a.source.localeCompare(b.source));
}
const result = {
  status: 'Unapproved proposed helper integration only. Member-selected recursive runtime/type/reexport/dynamic-import review scope, retaining complete selected module bodies; no runtime implementation, helper lease, SourceFull or assertion credit.',
  originalPin: '47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c', acceptedMain: mainPin,
  providerSemantics: 'accepted-main/acceptedMain are legacy provenance labels for the actual immutable main pin; they do not establish postmerge CI, provider acceptance or Select runtime acceptance.',
  method: 'Verify every actual physical helper body against immutable provider Git blob. All existing providers come from the single integrated Main commit. Resolve @sveltery/utils subpaths to their real source modules; no former Popup override or renderer shim. Select import members through barrel reexports, retain whole bodies/all imports of selected non-barrels, and propagate inherited type-only reachability. External package declarations remain external and are not claimed manually read.',
  roots, integrationRoots, modules: collect([...roots, ...integrationRoots]),
};
const fixtureResult = { ...result,
  status: 'Unapproved native correspondence for actual nested Popover/Toolbar/Field test fixtures only. This is not the Select runtime helper DAG or a lease for new public features; no acceptance or assertion credit.',
  roots: fixtureRoots, integrationRoots: [], modules: collect(fixtureRoots),
};
for (const [name, graph] of [['proposed-native-helper-graph', result], ['proposed-native-fixture-graph', fixtureResult]]) {
  const serialized = Buffer.from(JSON.stringify(graph, null, 2) + '\n');
  const compressed = gzipSync(serialized, { level: 9 });
  // Normalize the gzip OS header across producer platforms; mtime is zero and no filename is stored.
  compressed[9] = 255;
  const output = resolve(import.meta.dirname, `${name}.json.gz`);
  const manifestOutput = resolve(import.meta.dirname, `${name}-storage.json`);
  const manifest = JSON.stringify({
    status: 'Lossless deterministic storage only; decompression restores the exact generated JSON. No changed graph semantics, new reading or acceptance credit.',
    originalGraphPath: `${name}.json`, storedGraphPath: `${name}.json.gz`,
    originalGitBlob: createHash('sha1').update(`blob ${serialized.length}\0`).update(serialized).digest('hex'),
    originalSha256: sha256(serialized), originalBytes: serialized.length,
    compressedSha256: sha256(compressed), compressedBytes: compressed.length,
    compression: { format: 'gzip', level: 9, mtime: 0, filename: '', osByte: 255 },
    modules: graph.modules.length, providerCommit: mainPin,
    decompressionCommand: `gzip -dc parity/select/${name}.json.gz > /tmp/${name}.json`,
    verificationCommand: `git hash-object /tmp/${name}.json`,
  }, null, 2) + '\n';
  if (args.includes('--check')) {
    if (!existsSync(output) || !gunzipSync(readFileSync(output)).equals(serialized) || !readFileSync(output).equals(compressed)
      || !existsSync(manifestOutput) || readFileSync(manifestOutput, 'utf8') !== manifest) throw new Error(`Proposed native evidence differs: ${name}`);
  } else { writeFileSync(output, compressed); writeFileSync(manifestOutput, manifest); }
  console.log(JSON.stringify({ graph: name, mode: args.includes('--check') ? 'check' : 'generate', modules: graph.modules.length, lines: graph.modules.reduce((n, m) => n + m.lines, 0), edges: graph.modules.reduce((n, m) => n + m.followedEdges.length, 0), providers: Object.fromEntries(['accepted-main'].map(p => [p, graph.modules.filter(m => m.provider === p).length])), typeOnly: graph.modules.filter(m => m.reachability.every(k => k === 'type')).length, ordinaryCredit: 0 }));
}
