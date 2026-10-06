import { resolveNativePackageSource } from '../../../scripts/native-package-source.mjs';
// Repaired current graph/body inventory; historical audit outputs remain immutable, immutable Base UI v1.8.0 source; MIT: ../UPSTREAM_LICENSE.
import { createRequire } from 'node:module';
const require = createRequire(resolve('packages/base/package.json'));
const ts = process.env.AVATAR_AUDIT_TYPESCRIPT ? require(process.env.AVATAR_AUDIT_TYPESCRIPT) : require('typescript');
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { resolve, dirname, relative, join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
const pin = '47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c';
const nativeRoot = resolve('.');
const originalRoot = '/workspace/direction-provider-upstream';
const originalGit = '/workspace/base-ui-upstream';
const output = resolve(process.env.AVATAR_AUDIT_OUTPUT ?? 'parity/avatar/source-repair');
mkdirSync(output, { recursive: true });
const hash = value => createHash('sha256').update(value).digest('hex');
const roots = {
  original: ['index.ts', 'index.parts.ts', 'root/AvatarRoot.tsx', 'image/AvatarImage.tsx', 'fallback/AvatarFallback.tsx'].map(path => `packages/react/src/avatar/${path}`),
  native: ['index.ts', 'index.parts.ts', 'Root.svelte', 'Image.svelte', 'Fallback.svelte'].map(path => `packages/base/src/lib/avatar/${path}`),
  originalTests: ['packages/react/src/avatar/root/AvatarRoot.test.tsx', 'packages/react/src/avatar/image/AvatarImage.test.tsx', 'packages/react/src/avatar/fallback/AvatarFallback.test.tsx', 'packages/react/src/avatar/Avatar.spec.tsx'],
  nativeTests: ['packages/base/tests/dom/avatar.test.ts', 'packages/base/tests/dom/avatar-animations.test.ts', 'packages/base/tests/dom/avatar-conformance.test.ts', 'packages/base/tests/dom/avatar-supplements.test.ts', 'packages/base/tests/dom/avatar-hydration.test.ts', 'packages/base/tests/avatar-types.ts', 'packages/base/tests/avatar-ssr.test.ts', 'tests/browser/avatar.spec.ts', 'apps/fixtures/src/routes/avatar/+page.svelte', 'apps/fixtures/src/routes/avatar/+page.ts', 'apps/fixtures/src/routes/avatar-reference/+page.svelte', 'apps/fixtures/src/routes/avatar-reference/+page.ts', 'apps/fixtures/src/routes/avatar-ssr/+page.svelte', 'apps/fixtures/src/routes/avatar-ssr/+page.server.ts', 'scripts/tests/avatar-ssr.test.mjs', 'scripts/tests/avatar-provenance.test.mjs', 'packages/base/tests/dom/avatar-completion-source.test.ts', 'scripts/svelte-ssr-loader.mjs'],
};
const publicMembers = ['Avatar', 'AvatarRootProps', 'AvatarRootState', 'AvatarImageProps', 'AvatarImageState', 'AvatarFallbackProps', 'AvatarFallbackState', 'ImageLoadingStatus'];
function physical(base, path, specifier, original) {
  // The installed pinned package is a test-only external boundary, like its public Avatar entry.
  if (!original && specifier.includes('node_modules/@base-ui/react/internals/useOpenChangeComplete.js')) return 'external:@base-ui/react/internals/useOpenChangeComplete.js';
  const owned = !original && resolveNativePackageSource(base, specifier);
  if (owned) return owned;
  let target;
  if (specifier.startsWith('.')) target = resolve(base, dirname(path), specifier);
  else if (original && specifier.startsWith('@base-ui/utils/')) target = resolve(base, 'packages/utils/src', specifier.slice('@base-ui/utils/'.length));
  else if (original && specifier === '@base-ui/react/avatar') target = resolve(base, 'packages/react/src/avatar/index.ts');
  else if (original && specifier === '#test-utils') target = resolve(base, 'packages/react/test/index.ts');
  else if (!original && specifier === '@sveltery/base') target = resolve(base, 'packages/base/src/lib/index.ts');
  else if (!original && specifier === '@sveltery/base/avatar') target = resolve(base, 'packages/base/src/lib/avatar/index.ts');
  else return `external:${specifier}`;
  const candidates = [target, ...(/\.js$/.test(target) ? ['.ts', '.svelte.ts', '.tsx'].map(extension => target.slice(0, -3) + extension) : []), ...['.ts', '.tsx', '.svelte', '/index.ts', '/index.tsx'].map(extension => target + extension)];
  const found = candidates.find(candidate => existsSync(candidate) && statSync(candidate).isFile());
  return found ? relative(base, found) : `unresolved:${relative(base, target)}`;
}
function body(base, path) {
  const raw = readFileSync(resolve(base, path), 'utf8');
  const code = path.endsWith('.svelte') ? [...raw.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(match => match[1]).join('\n') : raw;
  const tree = ts.createSourceFile(path, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const emitted = ts.transpileModule(code, { fileName: path.endsWith('.svelte') ? `${path}.tsx` : path, compilerOptions: { target: ts.ScriptTarget.ESNext, module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.React, verbatimModuleSyntax: false } }).outputText;
  const emittedTree = ts.createSourceFile('emitted.js', emitted, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const emittedImports = new Map();
  for (const node of emittedTree.statements) if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier) emittedImports.set(node.moduleSpecifier.text, true);
  return {raw, code, tree, emittedImports};
}
function members(node) {
  const clause = ts.isImportDeclaration(node) ? node.importClause : node.exportClause;
  if (!clause) return ['*'];
  if (ts.isNamespaceExport(clause)) return [clause.name.text];
  if (ts.isNamedExports(clause)) return clause.elements.map(item => item.name.text);
  const result = clause.name ? [clause.name.text === 'default' ? 'default' : 'default'] : [];
  if (clause.namedBindings) {
    if (ts.isNamespaceImport(clause.namedBindings)) result.push('*');
    else result.push(...clause.namedBindings.elements.map(item => item.propertyName?.text ?? item.name.text));
  }
  return result;
}
function build(base, seed, original, selections = {}) {
  const records = new Map(), selected = new Map(), pending = seed.map(source => ({source, reachability:'runtime', selected: selections[source]}));
  while (pending.length) {
    const item = pending.shift();
    if (records.has(item.source)) {
      if (item.reachability === 'runtime' && records.get(item.source).reachability === 'type') {
        records.get(item.source).reachability = 'runtime';
        for (const edge of records.get(item.source).imports) if (!edge.resolved.startsWith('external:')) pending.push({source:edge.resolved, reachability:edge.effectiveKind, selected:edge.importedMembers});
      }
      continue;
    }
    const value = body(base, item.source);
    const indexSelection = item.source === 'packages/react/test/index.ts' || item.source === 'packages/base/src/lib/index.ts';
    const wanted = item.source === 'packages/react/test/index.ts' ? ['describeConformance','createRenderer','isJSDOM','expectType'] : seed.some(source => source.includes('/tests/') || source.startsWith('tests/')) ? [...publicMembers, 'mergeProps'] : publicMembers;
    const importRecords = [], unselectedExports = [];
    for (const node of value.tree.statements) {
      if ((!ts.isImportDeclaration(node) && !ts.isExportDeclaration(node)) || !node.moduleSpecifier) continue;
      const specifier = node.moduleSpecifier.text;
      const importedMembers = members(node);
      if (indexSelection && ts.isExportDeclaration(node) && !importedMembers.includes('*') && !importedMembers.some(name => wanted.includes(name))) { unselectedExports.push({specifier, members:importedMembers}); continue; }
      if ((item.source === 'packages/base/src/lib/index.ts' || item.source === 'packages/react/test/index.ts' && specifier !== '@base-ui/utils/testUtils') && importedMembers.includes('*')) { unselectedExports.push({specifier, members:importedMembers}); continue; }
      const declaredType = node.isTypeOnly || node.importClause?.isTypeOnly || (ts.isImportDeclaration(node) && node.importClause?.namedBindings && ts.isNamedImports(node.importClause.namedBindings) && node.importClause.namedBindings.elements.every(element => element.isTypeOnly));
      const effectiveKind = (item.source.endsWith('.svelte') || value.emittedImports.has(specifier)) && !declaredType ? 'runtime' : 'type';
      const destination = physical(base, item.source, specifier, original);
      const edge = {specifier, declaredKind:declaredType ? 'type':'runtime', effectiveKind, importedMembers, resolved:destination};
      importRecords.push(edge);
      if (!destination.startsWith('external:')) {
        if (destination.startsWith('unresolved:')) throw new Error(`${item.source} -> ${destination}`);
        pending.push({source:destination, reachability:item.reachability === 'type' ? 'type':effectiveKind, selected:importedMembers});
      }
    }
    function calls(node) {
      if (ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword || node.expression.getText(value.tree) === 'vi.mock') && node.arguments[0] && ts.isStringLiteral(node.arguments[0])) {
        const specifier = node.arguments[0].text, destination = physical(base, item.source, specifier, original);
        const edge = {specifier, declaredKind:node.expression.kind === ts.SyntaxKind.ImportKeyword ? 'dynamic':'mock', effectiveKind:'runtime', importedMembers:['*'], resolved:destination};
        importRecords.push(edge);
        if (!destination.startsWith('external:')) pending.push({source:destination, reachability:item.reachability});
      }
      ts.forEachChild(node, calls);
    }
    calls(value.tree);
    // Test-only spawned SSR script imports are concrete used dependencies beyond static call syntax.
    if (!original && ['scripts/tests/avatar-ssr.test.mjs', 'packages/base/tests/dom/avatar-hydration.test.ts'].includes(item.source)) {
      for (const destination of ['scripts/svelte-ssr-loader.mjs','packages/base/tests/dom/avatar-fixture.svelte']) {
        importRecords.push({specifier:'spawned-source-import', declaredKind:'embedded-test-script', effectiveKind:'runtime', importedMembers:['*'], resolved:destination});
        pending.push({source:destination,reachability:item.reachability});
      }
    }
    records.set(item.source, {source:item.source, sha256:hash(value.raw), reachability:item.reachability, imports:importRecords, ...(unselectedExports.length ? {unselectedExports, importMemberBoundary:true}: {})});
    selected.set(item.source,item.selected);
  }
  const modules = [...records.values()].sort((a,b)=>a.source.localeCompare(b.source));
  return {roots:seed, moduleCount:modules.length, edgeCount:modules.reduce((n,module)=>n+module.imports.length,0), runtimeModules:modules.filter(module=>module.reachability==='runtime').length, typeModules:modules.filter(module=>module.reachability==='type').length, modules, external:[...new Set(modules.flatMap(module=>module.imports).filter(edge=>edge.resolved.startsWith('external:')).map(edge=>edge.resolved))].sort(), semantics:'Declared import syntax and TypeScript-emitted dependency kinds are separate. TypeScript 5.9.3 transpileModule elision identifies effective type edges in TS/TSX; non-type Svelte imports retain runtime reachability because markup also uses them. Selected public/test barrel exports are expanded by actual imported members; excluded siblings are recorded, not accepted. All reached module bodies, including type-only, are inspected.'};
}
const original = build(originalRoot, roots.original, true);
const native = build(nativeRoot, [...roots.native,'packages/base/src/lib/index.ts'], false, {'packages/base/src/lib/index.ts':publicMembers});
const originalTests = build(originalRoot, roots.originalTests, true);
const nativeTests = build(nativeRoot, roots.nativeTests, false);
const graphs = {pin, runtimeCheckpoint:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(), historicalAuditHead:'60ac5cfa5806efa6e3024d44023456460ca84b41', original,native,originalTests,nativeTests};
for(const [name,graph] of Object.entries({original,native,originalTests,nativeTests})) writeFileSync(join(output,`${name}-graph.json`),JSON.stringify(graph,null,2)+'\n');
const sources = [...new Set([...original.modules,...originalTests.modules].map(module=>module.source))].sort();
const archived = [];
for(const source of sources) {
  const data = execFileSync('git',['-C',originalGit,'show',`${pin}:${source}`]);
  if(hash(data)!==hash(readFileSync(resolve(originalRoot,source)))) throw new Error(`Physical source != pin: ${source}`);
  const destination = resolve('parity/avatar/source-audit/upstream',source);
  if(hash(data)!==hash(readFileSync(destination))) throw new Error(`Historical archive != pin: ${source}`);
  archived.push({source,sha256:hash(data),url:`https://github.com/mui/base-ui/blob/${pin}/${source}`});
}
writeFileSync(join(output,'archives.json'),JSON.stringify({pin,license:'MIT; ../UPSTREAM_LICENSE',historicalArchive:'../source-audit/upstream',sources:archived},null,2)+'\n');
writeFileSync(join(output,'scope.json'),JSON.stringify(graphs,null,2)+'\n');
console.log(JSON.stringify(Object.fromEntries(Object.entries({original,native,originalTests,nativeTests}).map(([name,graph])=>[name,{modules:graph.moduleCount,edges:graph.edgeCount,runtime:graph.runtimeModules,type:graph.typeModules,external:graph.external}]))));
