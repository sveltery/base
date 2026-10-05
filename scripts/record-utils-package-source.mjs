// Current two-package Source closure inventory. Inventory grants zero parity credit.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, relative, resolve, posix } from 'node:path';
import { resolveNativePackageSource } from './native-package-source.mjs';
const root = resolve(import.meta.dirname, '..');
const ts = createRequire(resolve(root, 'packages/base/package.json'))('typescript');
const pin = '47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c';
const upstream = resolve(process.argv[2] ?? '/workspace/direction-provider-upstream');
const hash = body => createHash('sha256').update(body).digest('hex');
const git = (...args) => execFileSync('git', ['-C', upstream, ...args], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
if (git('rev-parse', `${pin}^{commit}`).trim() !== pin) throw new Error('Immutable upstream unavailable.');
const files = new Set(git('ls-tree', '-r', '--name-only', pin).trim().split('\n'));
const extraction = JSON.parse(readFileSync(resolve(root, 'parity/utils-package/extraction.json'), 'utf8'));
const manifest = JSON.parse(readFileSync(resolve(root, 'packages/utils/package.json'), 'utf8'));
const nativeFrameworkCleanup = JSON.parse(readFileSync(resolve(root, 'parity/utils-package/native-framework-status.json'), 'utf8'));
function resolveImport(file, specifier, original) {
  if (!original) {
    const owned = resolveNativePackageSource(root, specifier);
    if (owned) return owned;
  }
  let base;
  if (specifier.startsWith('.')) base = original ? posix.normalize(posix.join(posix.dirname(file), specifier)) : relative(root, resolve(root, dirname(file), specifier));
  else if (original && specifier.startsWith('@base-ui/utils/')) base = `packages/utils/src/${specifier.slice('@base-ui/utils/'.length)}`;
  else return `external:${specifier}`;
  const candidates = [base, base.replace(/\.js$/, '.ts'), base.replace(/\.js$/, '.svelte.ts'), `${base}.ts`, `${base}.tsx`, `${base}/index.ts`];
  const target = candidates.find(path => original ? files.has(path) : existsSync(resolve(root, path)) && statSync(resolve(root, path)).isFile());
  if (!target) throw new Error(`Unresolved ${file} -> ${specifier}`);
  return target;
}
function graph(entries, original = false) {
  const modules = new Map(); const queue = [...entries];
  while (queue.length) {
    const file = queue.shift(); if (modules.has(file)) continue;
    const body = original ? git('show', `${pin}:${file}`) : readFileSync(resolve(root, file), 'utf8');
    const code = file.endsWith('.svelte') ? [...body.matchAll(/<script\b(?:[^>"']|"[^"]*"|'[^']*')*>([\s\S]*?)<\/script>/g)].map(match => match[1]).join('\n') : body;
    const ast = ts.createSourceFile(file, code, ts.ScriptTarget.Latest, true, file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
    const imports = []; const symbols = [];
    function add(_node, specifier, kind, members, syntax) {
      const resolved = resolveImport(file, specifier, original);
      imports.push({ specifier, kind, members, syntax, resolved });
      if (!resolved.startsWith('external:')) queue.push(resolved);
    }
    function visit(node) {
      if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
        const clause = ts.isImportDeclaration(node) ? node.importClause : node;
        const named = ts.isImportDeclaration(node) ? clause?.namedBindings && ts.isNamedImports(clause.namedBindings) ? clause.namedBindings.elements : undefined : node.exportClause && ts.isNamedExports(node.exportClause) ? node.exportClause.elements : undefined;
        const members = named?.map(item => ({ imported: (item.propertyName ?? item.name).text, local: item.name.text, typeOnly: !!clause?.isTypeOnly || item.isTypeOnly })) ?? [];
        if (clause?.name) members.push({ imported: 'default', local: clause.name.text, typeOnly: !!clause.isTypeOnly });
        if (clause?.namedBindings && ts.isNamespaceImport(clause.namedBindings)) members.push({ imported: '*', local: clause.namedBindings.name.text, typeOnly: !!clause.isTypeOnly });
        const kind = clause?.isTypeOnly || members.length && members.every(item => item.typeOnly) ? 'type' : 'runtime';
        add(node, node.moduleSpecifier.text, kind, members, ts.isImportDeclaration(node) ? 'import' : 'reexport');
      } else if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument) && ts.isStringLiteral(node.argument.literal)) add(node, node.argument.literal.text, 'type', [{ imported: node.qualifier?.getText(ast) ?? '*' }], 'import-type');
      else if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
        if (!ts.isStringLiteral(node.arguments[0])) throw new Error(`Nonliteral Source import in ${file}`);
        add(node, node.arguments[0].text, 'runtime', [{ imported: '*' }], 'dynamic-import');
      }
      if (node.parent === ast && node.name && (ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node) || ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node))) symbols.push({ name: node.name.text, kind: ts.SyntaxKind[node.kind], sha256: hash(node.getText(ast)) });
      ts.forEachChild(node, visit);
    }
    visit(ast); modules.set(file, { path: file, sha256: hash(body), symbols, imports });
  }
  const runtime = new Set(entries); let changed = true;
  while (changed) { changed = false; for (const file of runtime) for (const edge of modules.get(file)?.imports ?? []) if (edge.kind === 'runtime' && modules.has(edge.resolved) && !runtime.has(edge.resolved)) { runtime.add(edge.resolved); changed = true; } }
  return { entries, modules: [...modules.values()].sort((a,b) => a.path.localeCompare(b.path)).map(module => ({ ...module, reachability: runtime.has(module.path) ? 'runtime' : 'type-only' })), external: [...new Set([...modules.values()].flatMap(module => module.imports.map(edge => edge.resolved).filter(path => path.startsWith('external:'))))].sort() };
}
const utilsEntries = Object.keys(manifest.exports).map(key => resolveNativePackageSource(root, `@sveltery/utils/${key.slice(2)}`));
const native = graph(['packages/base/src/lib/index.ts', ...utilsEntries]);
const original = graph([...new Set(extraction.moves.map(move => move.source).concat(['packages/utils/src/formatNumber.ts','packages/utils/src/stringifyLocale.ts']))], true);
const originalInventory = [...files].filter(file => file.startsWith('packages/utils/src/') && /\.(ts|tsx)$/.test(file) && !/\.(test|spec)\./.test(file)).sort().map(file => ({ path: file, sha256: hash(git('show', `${pin}:${file}`)) }));
const currentByPath = new Map(native.modules.map(module => [module.path, module]));
const currentMoves = extraction.moves.map(move => ({ ...move, currentLocalSha256: currentByPath.get(move.to)?.sha256 ?? hash(readFileSync(resolve(root, move.to))), reviewStatus: 'Source/native/maintainability final-head review pending; extraction hash is immutable initial lineage.' }));
const output = { immutableOriginalPin: pin, ordinaryDeclarationCredit: 0, method: `TypeScript ${ts.version} full AST import/reexport/import-type/literal dynamic graph; actual declared Utils export targets resolve to current source owners across both packages for audit only. Published dist remains build/consumer authority. Conservative barrel closure is not selected-body acceptance.`, basePublicExportsUnchanged: JSON.stringify(JSON.parse(readFileSync(resolve(root,'packages/base/package.json'),'utf8')).exports) === JSON.stringify(extraction.baseExports), utilsExports: manifest.exports, currentMoves, originalInventory, original, native, inheritedLimits: ['No new ordinary component assertion credit.', 'Existing Toast private store/ID and unaudited feature algorithms remain outside acceptance.', 'Native SvelteStore used surface is not a complete ReactStore/useStore/selector/inspector API port.', 'Historical exact-head source/audit/review/run receipts and immutable source archives remain historical.'], finalGates: 'Source/native/maintainability independent review, actual dual-tarball SSR/types/Svelte/browser consumers, secured hosted browser execution and CI remain pending.' };
output.nativeFrameworkCleanup = nativeFrameworkCleanup;
writeFileSync(resolve(root,'parity/utils-package/current-source-graph.json'), JSON.stringify(output,null,2)+'\n');
console.log(`Current Source ${original.modules.length} modules; native ${native.modules.length} modules; ${Object.keys(manifest.exports).length} actual utility exports; stable Base exports ${output.basePublicExportsUnchanged}.`);
