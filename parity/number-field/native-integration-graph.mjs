// MIT Base UI 1.8.0 NumberField closure successor. Historical proofs stay immutable.
import ts from '../../packages/base/node_modules/typescript/lib/typescript.js';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve, relative, dirname } from 'node:path';
const root = resolve(import.meta.dirname, '../..');
const hash = (body) => createHash('sha256').update(body).digest('hex');
const load = (path) => JSON.parse(readFileSync(resolve(root, path), 'utf8'));
const original = load('parity/number-field/source-graph.json');
const previous = load('parity/number-field/source-correspondence.json');
const utils = load('packages/utils/package.json');
const entries = ['packages/base/src/lib/number-field/index.ts'];
// Actual provider composition exercised by supplied NumberField fixtures, separate
// from imports of the family itself. Type edges never become runtime edges.
const contextualEntries = [
  'packages/base/src/lib/form/Form.svelte',
  'packages/base/src/lib/field/Root.svelte',
  'packages/base/src/lib/internals/labelable-provider/LabelableProvider.svelte',
];
function resolveImport(file, specifier) {
  let base;
  if (specifier.startsWith('@sveltery/utils/')) {
    const entry = utils.exports[`./${specifier.slice('@sveltery/utils/'.length)}`];
    if (!entry) throw new Error(`Missing Utils export ${specifier}`);
    base = resolve(
      root,
      'packages/utils',
      (entry.svelte ?? entry.default).replace('./dist/', './src/lib/'),
    );
  } else if (specifier.startsWith('.')) base = resolve(root, dirname(file), specifier);
  else return `external:${specifier}`;
  const candidates = [
    base,
    base.replace(/\.js$/, '.ts'),
    base.replace(/\.js$/, '.svelte.ts'),
    `${base}.ts`,
    `${base}/index.ts`,
  ];
  const found = candidates.find((candidate) => existsSync(candidate));
  if (!found) throw new Error(`Unresolved ${file} → ${specifier}`);
  return relative(root, found);
}
const records = new Map();
const queue = [
  ...entries.map((local) => ({ local, reachability: 'runtime', scope: 'family' })),
  ...contextualEntries.map((local) => ({ local, reachability: 'runtime', scope: 'contextual' })),
];
while (queue.length) {
  const { local, reachability, scope } = queue.shift();
  let record = records.get(local);
  if (!record) {
    const body = readFileSync(resolve(root, local), 'utf8');
    // Parse Svelte scripts with TypeScript; scan markup inline type imports separately.
    const code = local.endsWith('.svelte')
      ? [...body.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map((match) => match[1]).join('\n')
      : body;
    const ast = ts.createSourceFile(local, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const imports = [],
      declarations = [];
    function edge(specifier, kind, names = []) {
      const resolved = resolveImport(local, specifier);
      const old = imports.find((item) => item.resolved === resolved && item.kind === kind);
      if (old) old.names = [...new Set([...old.names, ...names])];
      else imports.push({ specifier, kind, names, resolved });
    }
    function visit(node) {
      if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
        const clause = node.importClause,
          runtime = [],
          types = [];
        if (clause?.name) (clause.isTypeOnly ? types : runtime).push(clause.name.text);
        if (clause?.namedBindings && ts.isNamespaceImport(clause.namedBindings))
          (clause.isTypeOnly ? types : runtime).push('*');
        if (clause?.namedBindings && ts.isNamedImports(clause.namedBindings))
          for (const name of clause.namedBindings.elements)
            (clause.isTypeOnly || name.isTypeOnly ? types : runtime).push(
              (name.propertyName ?? name.name).text,
            );
        if (runtime.length || !clause) edge(node.moduleSpecifier.text, 'runtime', runtime);
        if (types.length) edge(node.moduleSpecifier.text, 'type', types);
      } else if (
        ts.isExportDeclaration(node) &&
        node.moduleSpecifier &&
        ts.isStringLiteral(node.moduleSpecifier)
      ) {
        const elements =
          node.exportClause && ts.isNamedExports(node.exportClause)
            ? node.exportClause.elements
            : undefined;
        if (!elements) edge(node.moduleSpecifier.text, node.isTypeOnly ? 'type' : 'runtime', ['*']);
        else
          for (const kind of ['runtime', 'type']) {
            const names = elements
              .filter((item) => (node.isTypeOnly || item.isTypeOnly ? 'type' : 'runtime') === kind)
              .map((item) => (item.propertyName ?? item.name).text);
            if (names.length) edge(node.moduleSpecifier.text, kind, names);
          }
      } else if (
        ts.isImportTypeNode(node) &&
        ts.isLiteralTypeNode(node.argument) &&
        ts.isStringLiteral(node.argument.literal)
      )
        edge(node.argument.literal.text, 'type');
      if (
        (ts.isFunctionDeclaration(node) ||
          ts.isClassDeclaration(node) ||
          ts.isInterfaceDeclaration(node) ||
          ts.isTypeAliasDeclaration(node)) &&
        node.name
      )
        declarations.push(node.name.text);
      ts.forEachChild(node, visit);
    }
    visit(ast);
    // Svelte markup can contain type assertions with inline import types.
    if (local.endsWith('.svelte'))
      for (const match of body.matchAll(/\bimport\(\s*['"]([^'"]+)['"]\s*\)/g))
        edge(match[1], 'type');
    record = {
      local,
      sha256: hash(body),
      reachability: [],
      contextualReachability: [],
      declarations,
      imports,
    };
    records.set(local, record);
  }
  const scopeReachability =
    scope === 'family' ? record.reachability : record.contextualReachability;
  if (scopeReachability.includes(reachability)) continue;
  scopeReachability.push(reachability);
  for (const edge of record.imports)
    if (!edge.resolved.startsWith('external:'))
      queue.push({
        local: edge.resolved,
        scope,
        reachability: reachability === 'type' || edge.kind === 'type' ? 'type' : 'runtime',
      });
}
function successorPath(path) {
  const utilsPath = path?.replace('packages/base/src/lib/utils/', 'packages/utils/src/lib/');
  if (records.has(utilsPath)) return utilsPath;
  if (records.has(path)) return path;
  return undefined;
}
const nativeReplacements = {
  'useControlled.ts': {
    local: 'packages/utils/src/lib/Controlled.svelte.ts',
    replacement:
      'Controlled class: initial mode/default, live controlled read and direct set; React diagnostic/dispatch machinery removed.',
  },
  'useIsoLayoutEffect.ts': {
    replacement:
      'Direct native $effect and cleanup at each actual owner; no explicit React dependency tuples.',
  },
  'useEventCallback.ts': {
    replacement: 'Native live closures at caller; no committed callback snapshots.',
  },
  'useRenderElement.tsx': {
    replacement:
      'Each part owns direct render(props,state,children) snippet/intrinsic branches, bindable actual hosts and native attachments; shared pure mergeComponentProps remains.',
  },
  'useForcedRerendering.ts': {
    local: 'packages/base/src/lib/number-field/root/NumberFieldRoot.svelte',
    replacement:
      'Plain imperative allowInputSyncRef business marker and native formatting effect; mutation alone does not invalidate formatting. Forced-render revision transport removed.',
  },
  'useValueChanged.ts': {
    local: 'packages/base/src/lib/internals/ValueChanged.svelte.ts',
    replacement: 'Canonical ValueChanged class with source comparison and native lifetime.',
  },
  'useValueAsRef.ts': {
    local: 'packages/base/src/lib/number-field/root/NumberFieldRoot.svelte',
    replacement:
      'Native live numeric/format readers and same-interaction transient stepper slot; actual owner values remain live without committed React snapshots.',
  },
  'usePressAndHold.ts': {
    local: 'packages/base/src/lib/internals/usePressAndHold.svelte.ts',
    replacement:
      'PressAndHold class owns complete source pointer/timer/start/stop/cancellation business; native onDestroy and direct effect cleanup; canonical Utils Timeout and Interval reused.',
  },
  'useMergedRefs.ts': {
    replacement: 'Native bindings and independent attachments; no React callback-ref fanout.',
  },
};
const currentCorrespondences = new Map();
for (const feature of ['field-form', 'boolean-controls', 'radio']) {
  const evidence = load(`parity/${feature}/source-correspondence.json`);
  function inspect(value) {
    if (!value || typeof value !== 'object') return;
    const source = value.source ?? value.original;
    if (typeof source === 'string' && typeof value.local === 'string') {
      const values = currentCorrespondences.get(source) ?? [];
      values.push(...value.local.split(/;\s*/));
      currentCorrespondences.set(source, values);
    }
    for (const child of Object.values(value))
      if (typeof child === 'object') {
        if (Array.isArray(child)) child.forEach(inspect);
        else inspect(child);
      }
  }
  inspect(evidence);
}
const mappings = original.modules.map((source) => {
  const historical = previous.sourceModules.find((item) => item.source === source.source);
  const leaf = source.source.split('/').at(-1);
  const replacement = nativeReplacements[leaf];
  const locals = new Set(
    (historical?.local ?? []).map((item) => successorPath(item.local)).filter(Boolean),
  );
  for (const path of currentCorrespondences.get(source.source) ?? []) {
    const local = successorPath(path);
    if (local) locals.add(local);
  }
  if (replacement?.local && records.has(replacement.local)) locals.add(replacement.local);
  if (source.source.startsWith('packages/utils/src/')) {
    const suffix = source.source.slice('packages/utils/src/'.length);
    for (const path of [
      `packages/utils/src/lib/${suffix}`,
      `packages/utils/src/lib/${suffix.replace(/\.ts$/, '.svelte.ts')}`,
    ])
      if (records.has(path)) locals.add(path);
  }
  return {
    source: source.source,
    url: source.url,
    sha256: source.sha256,
    declarations: source.declarations,
    local: [...locals].sort().map((local) => ({ local, sha256: records.get(local).sha256 })),
    correspondence:
      replacement?.replacement ??
      historical?.correspondence ??
      'Unselected recursive source barrel/type edge; no business implementation credit.',
    reviewStatus:
      'Actual closure inventory only; exact final-head entire-closure independent source/native/maintainability review required.',
  };
});
for (const record of records.values()) {
  record.sourceCorrespondences = mappings
    .filter((mapping) => mapping.local.some((item) => item.local === record.local))
    .map((mapping) => mapping.source);
  record.boundary = record.sourceCorrespondences.length
    ? 'Pinned correspondence listed; full exact-head business/native review required.'
    : record.local.includes('/remote-forms/')
      ? 'Native remote-form extension from actual main; type/barrel reachability is not pinned NumberField assertion credit.'
      : record.local.includes('/number-field/root/StepperButton.')
        ? 'Shared Increment/Decrement component composition extracted from pinned stepper business; native direct host branch.'
        : 'Inherited native composition/type/helper reached by actual current imports; no independent pinned business equivalence claim from this inventory. Entire-closure review must inspect this module.';
}
const output = {
  pin: original.pin,
  license: 'MIT',
  integratedMain: 'aa4daff54ec82b96e34e1601648d1b3926ef08cf',
  ordinaryDeclarationCredit: 0,
  status:
    'Additive native integration successor; historical source/assertion/red receipts and inheritance records unchanged. Structural inventory is not review or execution acceptance.',
  resolver:
    'Relative imports and actual @sveltery/utils package exports resolved to maintained source; split runtime/type imports and inline Svelte import types traversed.',
  sourceModules: mappings,
  localClosure: {
    entries,
    contextualEntries,
    reachabilityPolicy:
      'reachability describes NumberField family imports only; contextualReachability separately describes real supplied Form/Field.Root/Labelable provider roots. Type-only edges stay type-only in each scope.',
    modules: [...records.values()].sort((a, b) => a.local.localeCompare(b.local)),
  },
};
const destination = resolve(import.meta.dirname, 'native-integration-closure.json');
const text = `${JSON.stringify(output, null, 2)}\n`;
if (process.argv.includes('--check')) {
  if (readFileSync(destination, 'utf8') !== text)
    throw new Error('Native NumberField closure stale');
} else writeFileSync(destination, text);
console.log(
  `${original.modules.length} immutable source modules; ${records.size} actual runtime/type modules; zero ordinary assertion credit`,
);
