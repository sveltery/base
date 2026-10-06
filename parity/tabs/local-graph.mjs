// Actual used Tabs runtime/type closure; source evidence adds no assertion credit.
import ts from '../../packages/base/node_modules/typescript/lib/typescript.js';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const destination = resolve(import.meta.dirname, 'actual-local-graph.json');
const originalGraph = JSON.parse(
  readFileSync(resolve(import.meta.dirname, 'source-graph.json'), 'utf8'),
);
const sourcePlan = JSON.parse(
  readFileSync(
    resolve(import.meta.dirname, 'source-correspondence.json'),
    'utf8',
  ),
);
const graph = { pin: originalGraph.pin };
const utilsPackage = JSON.parse(readFileSync(resolve(root, 'packages/utils/package.json'), 'utf8'));
const utilsLineage = JSON.parse(readFileSync(resolve(root, 'parity/utils-package/current-source-graph.json'), 'utf8'));
const relocatedSources = new Map(utilsLineage.currentMoves.map((item) => [item.to, [item.source]]));
relocatedSources.set('packages/utils/src/lib/Controlled.svelte.ts', ['packages/utils/src/useControlled.ts']);
relocatedSources.set('packages/utils/src/lib/PreviousValue.svelte.ts', ['packages/utils/src/usePreviousValue.ts']);
const selectedByLocal = new Map();
for (const item of sourcePlan.modules.filter((item) => item.selected)) {
  if (!item.local.startsWith('packages/')) continue;
  const previous = selectedByLocal.get(item.local) ?? [];
  selectedByLocal.set(item.local, [...previous, item.source]);
}
const nativeSources = {
  'floating-ui/utils/event.ts': [
    'packages/react/src/floating-ui-react/utils/event.ts',
  ],
  ...Object.fromEntries(
    JSON.parse(
      readFileSync(
        resolve(root, 'parity/shared-interaction-events/source-graph.json'),
        'utf8',
      ),
    ).modules
      .filter((module) => module.source.startsWith('packages/utils/src/platform/'))
      .map((module) => [
        module.source.replace('packages/utils/src/', 'utils/'),
        [module.source],
      ]),
  ),
  'direction-provider/types.ts': [
    'packages/react/src/internals/direction-context/DirectionContext.tsx',
  ],
  'internals/composite/root/gridNavigation.ts': [
    'packages/react/src/internals/composite/root/gridNavigation.ts',
  ],
  'internals/nativeProps.ts': ['packages/react/src/internals/useRenderElement.tsx'],
  'internals/mergeComponentProps.ts': [
    'packages/react/src/internals/useRenderElement.tsx',
    'packages/react/src/merge-props/mergeProps.ts',
  ],
  'internals/nativeRefAttachment.ts': [
    'packages/utils/src/useMergedRefs.ts',
    'packages/react/src/internals/useRenderElement.tsx',
  ],
  'internals/reason-parts.ts': ['packages/react/src/internals/reason-parts.ts'],
  'internals/RenderElement.svelte': [
    'packages/react/src/internals/useRenderElement.tsx',
  ],
  'internals/resolveClassValue.ts': [
    'packages/react/src/utils/resolveClassName.ts',
  ],
  'tabs/types.ts': [
    'packages/react/src/tabs/root/TabsRoot.tsx',
    'packages/react/src/tabs/list/TabsList.tsx',
    'packages/react/src/tabs/tab/TabsTab.tsx',
    'packages/react/src/tabs/panel/TabsPanel.tsx',
    'packages/react/src/tabs/indicator/TabsIndicator.tsx',
  ],
  'utils/useOnMount.ts': ['packages/utils/src/useOnMount.ts'],
  'utils/useId.ts': [
    'packages/utils/src/useId.ts',
    'packages/react/src/internals/useBaseUiId.ts',
  ],
};
const shared = JSON.parse(
  readFileSync(resolve(root, 'parity/rendering/source-graph.json'), 'utf8'),
).localClosure;
const inherited = new Map(
  shared.modules.map((module) => [module.local, module]),
);
const hash = (text) => createHash('sha256').update(text).digest('hex');
const roots = ['packages/base/src/lib/tabs/index.ts'];
const records = new Map();
const queue = roots.map((local) => ({ local, reachability: 'runtime' }));

function resolveImport(file, specifier) {
  let base;
  if (specifier.startsWith('@sveltery/utils/')) {
    const entry = utilsPackage.exports[`./${specifier.slice('@sveltery/utils/'.length)}`];
    if (!entry) throw new Error(`Undeclared Utils export ${specifier}`);
    base = resolve(root, 'packages/utils', (entry.svelte ?? entry.default).replace('./dist/', './src/lib/'));
  } else {
    if (!specifier.startsWith('.')) return `external:${specifier}`;
    base = resolve(root, dirname(file), specifier);
  }
  for (const candidate of [
    base,
    base.replace(/\.js$/, '.ts'),
    base.replace(/\.js$/, '.svelte.ts'),
    `${base}.ts`,
    `${base}/index.ts`,
  ]) {
    if (existsSync(candidate)) return relative(root, candidate);
  }
  throw new Error(`Unresolved ${file} → ${specifier}`);
}

while (queue.length) {
  const { local, reachability } = queue.shift();
  let record = records.get(local);
  if (!record) {
    const text = readFileSync(resolve(root, local), 'utf8');
    const code = local.endsWith('.svelte')
      ? [...text.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)]
          .map((match) => match[1])
          .join('\n')
      : text;
    const ast = ts.createSourceFile(
      local,
      code,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TS,
    );
    const imports = [];
    const declarations = [];
    function edge(specifier, kind, names) {
      const resolved = resolveImport(local, specifier);
      imports.push({ specifier, kind, resolved, names });
    }
    function visit(node) {
      if (
        ts.isImportDeclaration(node) &&
        ts.isStringLiteral(node.moduleSpecifier)
      ) {
        const clause = node.importClause;
        const runtime = [],
          types = [];
        if (clause?.name)
          (clause.isTypeOnly ? types : runtime).push(clause.name.text);
        if (clause?.namedBindings && ts.isNamespaceImport(clause.namedBindings))
          (clause.isTypeOnly ? types : runtime).push(
            clause.namedBindings.name.text,
          );
        if (clause?.namedBindings && ts.isNamedImports(clause.namedBindings)) {
          for (const name of clause.namedBindings.elements)
            (clause.isTypeOnly || name.isTypeOnly ? types : runtime).push(
              name.name.text,
            );
        }
        if (runtime.length || !clause)
          edge(node.moduleSpecifier.text, 'runtime', runtime);
        if (types.length) edge(node.moduleSpecifier.text, 'type', types);
      } else if (
        ts.isExportDeclaration(node) &&
        node.moduleSpecifier &&
        ts.isStringLiteral(node.moduleSpecifier)
      ) {
        const names =
          node.exportClause && ts.isNamedExports(node.exportClause)
            ? node.exportClause.elements
            : undefined;
        if (names) {
          const runtime = names
            .filter((name) => !node.isTypeOnly && !name.isTypeOnly)
            .map((name) => name.name.text);
          const types = names
            .filter((name) => node.isTypeOnly || name.isTypeOnly)
            .map((name) => name.name.text);
          if (runtime.length)
            edge(node.moduleSpecifier.text, 'runtime', runtime);
          if (types.length) edge(node.moduleSpecifier.text, 'type', types);
        } else
          edge(
            node.moduleSpecifier.text,
            node.isTypeOnly ? 'type' : 'runtime',
            ['*'],
          );
      } else if (
        ts.isImportTypeNode(node) &&
        ts.isLiteralTypeNode(node.argument) &&
        ts.isStringLiteral(node.argument.literal)
      ) {
        edge(node.argument.literal.text, 'type', []);
      }
      if (
        (ts.isFunctionDeclaration(node) ||
          ts.isInterfaceDeclaration(node) ||
          ts.isTypeAliasDeclaration(node) ||
          ts.isModuleDeclaration(node)) &&
        node.name
      )
        declarations.push(node.name.text);
      ts.forEachChild(node, visit);
    }
    visit(ast);
    const previous = inherited.get(local);
    const originals =
      relocatedSources.get(local) ??
      selectedByLocal.get(local) ??
      previous?.originalSources ??
      nativeSources[local.replace('packages/base/src/lib/', '')] ??
      [];
    const owned = local.includes('/tabs/');
    record = {
      local,
      sha256: hash(text),
      reachability: [],
      category:
        previous?.category ??
        (owned
          ? 'tabs-source-business-or-public-contract'
          : 'canonical-shared-helper-or-native-adapter'),
      provenance:
        previous?.provenance ??
        (owned
          ? 'Actual Source Tabs business port or native Svelte public/context representation.'
          : 'Canonical current-main helper or exact frozen public development dependency; body review and acceptance inheritance are recorded separately.'),
      originalSources: originals,
      declarations,
      imports,
      ...(previous?.nativePrimitives
        ? { nativePrimitives: previous.nativePrimitives }
        : {}),
    };
    records.set(local, record);
  }
  if (record.reachability.includes(reachability)) continue;
  record.reachability.push(reachability);
  for (const edge of record.imports) {
    if (!edge.resolved.startsWith('external:'))
      queue.push({
        local: edge.resolved,
        reachability:
          reachability === 'type' || edge.kind === 'type' ? 'type' : 'runtime',
      });
  }
}

graph.status =
  'Actual local runtime/type AST closure; immutable pre-code Source plan retained unchanged. Mechanical identity is not manual body review or final acceptance.';
graph.localClosure = {
  scope:
    'Actual recursive runtime and type imports from all public Tabs parts and Source component aliases. Svelte script imports are parsed with the TypeScript AST; native template imports enter through those script imports. Broad shared type edges remain distinguished from runtime.',
  roots,
  modules: [...records.values()]
    .sort((a, b) => a.local.localeCompare(b.local))
    .map((record) => ({ ...record, reachability: record.reachability.sort() })),
  externalBoundaries: [
    ...new Set(
      [...records.values()].flatMap((record) =>
        record.imports
          .filter((edge) => edge.resolved.startsWith('external:'))
          .map((edge) => edge.specifier),
      ),
    ),
  ]
    .sort()
    .map((specifier) => ({
      specifier,
      decision:
        specifier.startsWith('svelte') || specifier === 'esm-env'
          ? 'Native Svelte/runtime environment representation.'
          : 'Existing locked direct Floating UI utility dependency; selected dimensions/DOM traversal algorithms retained. No dependency or lock change.',
    })),
  nativeClassReference: shared.nativeClassReference,
  nativeRendering: {
    implementation: 'Each Tabs part owns its direct render snippet/intrinsic fallback, bindable host and native attachment lifetime. Pure mergeComponentProps/state/class/style helpers remain shared. React renderer/ref fanout machinery is removed.',
    ordinaryDeclarationCredit: 0,
    acceptance: 'Actual closure inventory only; exact-head Source/native/maintainability and execution gates pending.',
  },
};
const output = JSON.stringify(graph, null, 2) + '\n';
if (process.argv.includes('--check')) {
  if (readFileSync(destination, 'utf8') !== output)
    throw new Error('Tabs actual-used graph is stale');
  const sourceArgument = process.argv
    .slice(2)
    .find((argument) => !argument.startsWith('--'));
  if (sourceArgument) {
    const upstream = resolve(sourceArgument);
    for (const module of originalGraph.modules) {
      const original = execFileSync(
        'git',
        ['-C', upstream, 'show', `${graph.pin}:${module.source}`],
        { encoding: 'utf8' },
      );
      if (hash(original) !== module.sha256)
        throw new Error(`Original source hash changed: ${module.source}`);
    }
  }
} else writeFileSync(destination, output);
console.log(
  `Tabs graph: ${originalGraph.modules.length} immutable Source modules, ${records.size} actual used local modules`,
);
