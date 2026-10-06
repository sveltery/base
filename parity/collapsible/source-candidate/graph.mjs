// Successor parser copied from the historical audit parser; immutable audit is unchanged.
// Audit-only graph/body inventory, immutable Base UI v1.8.0 source; MIT: ../UPSTREAM_LICENSE.
import { createRequire } from 'node:module';
const require = createRequire(resolve('packages/base/package.json'));
const ts = process.env.COLLAPSIBLE_AUDIT_TYPESCRIPT ? require(process.env.COLLAPSIBLE_AUDIT_TYPESCRIPT) : require('typescript');
import { readFileSync, existsSync, statSync } from 'node:fs';
import { resolve, dirname, relative } from 'node:path';
import { createHash } from 'node:crypto';
const hash = value => createHash('sha256').update(value).digest('hex');
const roots = {
  original: ['index.ts', 'index.parts.ts', 'root/CollapsibleRoot.tsx', 'trigger/CollapsibleTrigger.tsx', 'panel/CollapsiblePanel.tsx'].map(path => `packages/react/src/collapsible/${path}`),
  native: ['index.ts', 'index.parts.ts', 'Root.svelte', 'Trigger.svelte', 'Panel.svelte'].map(path => `packages/base/src/lib/collapsible/${path}`),
  originalTests: ['root/CollapsibleRoot.test.tsx', 'trigger/CollapsibleTrigger.test.tsx', 'panel/CollapsiblePanel.test.tsx', 'root/CollapsibleRoot.spec.tsx'].map(path => `packages/react/src/collapsible/${path}`),
  nativeTests: ['packages/base/tests/dom/collapsible.test.ts', 'packages/base/tests/dom/collapsible/Fixture.svelte', 'packages/base/tests/collapsible-types.ts', 'packages/base/tests/collapsible-ssr.test.ts', 'tests/browser/collapsible.spec.ts', 'apps/fixtures/src/routes/collapsible/+page.svelte', 'apps/fixtures/src/routes/collapsible/+page.ts', 'apps/fixtures/src/routes/collapsible-reference/+page.svelte', 'apps/fixtures/src/routes/collapsible-reference/+page.ts', 'apps/fixtures/src/routes/collapsible-ssr/+page.svelte', 'apps/fixtures/src/routes/collapsible-ssr/+page.server.ts', 'scripts/tests/collapsible-ssr.test.mjs', 'scripts/tests/collapsible-provenance.test.mjs', 'scripts/check-collapsible-package.sh', 'scripts/svelte-ssr-loader.mjs'],
};
const publicMembers = ['Collapsible', 'CollapsibleRootProps', 'CollapsibleRootState', 'CollapsibleTriggerProps', 'CollapsibleTriggerState', 'CollapsiblePanelProps', 'CollapsiblePanelState', 'CollapsibleTransitionStatus', 'CollapsibleRootChangeEventReason', 'CollapsibleRootChangeEventDetails'];
function physical(base, path, specifier, original) {
  let target;
  if (specifier.startsWith('.')) target = resolve(base, dirname(path), specifier);
  else if (original && specifier.startsWith('@base-ui/utils/')) target = resolve(base, 'packages/utils/src', specifier.slice('@base-ui/utils/'.length));
  else if (original && specifier === '@base-ui/react/collapsible') target = resolve(base, 'packages/react/src/collapsible/index.ts');
  else if (original && specifier === '#test-utils') target = resolve(base, 'packages/react/test/index.ts');
  else if (!original && specifier.startsWith('@sveltery/utils/')) target = resolve(base, 'packages/utils/src/lib', specifier.slice('@sveltery/utils/'.length));
  else if (!original && specifier === '@sveltery/base') target = resolve(base, 'packages/base/src/lib/index.ts');
  else if (!original && specifier === '@sveltery/base/collapsible') target = resolve(base, 'packages/base/src/lib/collapsible/index.ts');
  else return `external:${specifier}`;
  const candidates = [target, ...(/\.js$/.test(target) ? ['.ts', '.svelte.ts', '.tsx'].map(extension => target.slice(0, -3) + extension) : []), ...['.ts', '.svelte.ts', '.tsx', '.svelte', '/index.ts', '/index.tsx'].map(extension => target + extension)];
  const found = candidates.find(candidate => existsSync(candidate) && statSync(candidate).isFile());
  return found ? relative(base, found) : `unresolved:${relative(base, target)}`;
}
function body(base, path) {
  const raw = readFileSync(resolve(base, path), 'utf8');
  const code = path.endsWith('.svelte') ? [...raw.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(match => match[1]).join('\n') : raw;
  const tree = ts.createSourceFile(path, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const emitted = path.endsWith('.d.ts') ? '' : ts.transpileModule(code, { fileName: path.endsWith('.svelte') ? `${path}.tsx` : path, compilerOptions: { target: ts.ScriptTarget.ESNext, module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.React, verbatimModuleSyntax: false } }).outputText;
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
  const records = new Map(), selected = new Map(), pending = seed.map(source => ({source, reachability:source.endsWith('.d.ts') ? 'type':'runtime', selected: selections[source]}));
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
      if (ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword || ['vi.mock', 'require', 'baseRequire'].includes(node.expression.getText(value.tree))) && node.arguments[0] && ts.isStringLiteral(node.arguments[0])) {
        const specifier = node.arguments[0].text, destination = physical(base, item.source, specifier, original);
        const edge = {specifier, declaredKind:node.expression.kind === ts.SyntaxKind.ImportKeyword ? 'dynamic':node.expression.getText(value.tree) === 'vi.mock' ? 'mock':'require', effectiveKind:'runtime', importedMembers:['*'], resolved:destination};
        importRecords.push(edge);
        if (!destination.startsWith('external:')) pending.push({source:destination, reachability:item.reachability});
      }
      ts.forEachChild(node, calls);
    }
    calls(value.tree);
    // Shell-generated consumers and the concrete child Node program are used
    // source imports, even though they occur inside authored script strings.
    const generatedImports = {
      'scripts/tests/collapsible-ssr.test.mjs': ['react', 'react-dom/server', '@base-ui/react/collapsible', 'jsdom', 'svelte/server'],
      'scripts/check-collapsible-package.sh': ['@sveltery/base', '@sveltery/base/collapsible', 'svelte/server', 'svelte'],
    };
    if (!original && generatedImports[item.source]) {
      for (const specifier of generatedImports[item.source]) {
        const destination = physical(base, item.source, specifier, original);
        importRecords.push({specifier, declaredKind:'generated-consumer-source', effectiveKind:'runtime', importedMembers:specifier.startsWith('@sveltery/base') ? publicMembers:['*'], resolved:destination});
        if (!destination.startsWith('external:')) pending.push({source:destination, reachability:item.reachability});
      }
    }
    // Test-only spawned SSR script imports are concrete used dependencies beyond static call syntax.
    if (!original && item.source === 'scripts/tests/collapsible-ssr.test.mjs') {
      for (const destination of ['scripts/svelte-ssr-loader.mjs','packages/base/tests/ssr/Collapsible.svelte']) {
        importRecords.push({specifier:'spawned-source-import', declaredKind:'embedded-test-script', effectiveKind:'runtime', importedMembers:['*'], resolved:destination});
        pending.push({source:destination,reachability:item.reachability});
      }
    }
    records.set(item.source, {source:item.source, sha256:hash(value.raw), reachability:item.reachability, imports:importRecords, ...(unselectedExports.length ? {unselectedExports, importMemberBoundary:true}: {})});
    selected.set(item.source,item.selected);
  }
  const modules = [...records.values()].sort((a,b)=>a.source.localeCompare(b.source));
  return {roots:seed, moduleCount:modules.length, edgeCount:modules.reduce((n,module)=>n+module.imports.length,0), runtimeModules:modules.filter(module=>module.reachability==='runtime').length, typeModules:modules.filter(module=>module.reachability==='type').length, modules, external:[...new Set(modules.flatMap(module=>module.imports).filter(edge=>edge.resolved.startsWith('external:')).map(edge=>edge.resolved))].sort(), semantics:'Inventory, not manual Source acceptance. Declared import syntax and TypeScript-emitted dependency kinds are separate. TypeScript 5.9.3 transpileModule elision identifies effective type edges in TS/TSX; non-type Svelte imports retain runtime reachability because markup also uses them. Selected public/test barrel exports are expanded by actual imported members; excluded siblings are recorded, not accepted. All reached module bodies, including type-only, require separate manual inspection receipts.'};
}
// Audit-only parser reuse. Importing this module must never rewrite the
// immutable pre-repair checkpoint; its standalone command retains that scope.
export { build, roots, publicMembers };
