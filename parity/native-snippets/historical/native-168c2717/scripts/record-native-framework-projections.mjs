// Current LOCAL successor projections only. Original Source and historical fields stay immutable.
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const read = (path) => JSON.parse(readFileSync(resolve(root, path), 'utf8'));
const write = (path, value) =>
  writeFileSync(resolve(root, path), JSON.stringify(value, null, 2) + '\n');
const hash = (path) =>
  createHash('sha256')
    .update(readFileSync(resolve(root, path)))
    .digest('hex');
const current = read('parity/utils-package/current-source-graph.json');
const modules = new Map(current.native.modules.map((module) => [module.path, module]));
for (const module of modules.values()) {
  if (hash(module.path) !== module.sha256) throw new Error(`Stale actual module: ${module.path}`);
}
const successors = new Map(
  current.currentMoves
    .filter((move) => move.currentOwners)
    .map((move) => [move.to, { owners: move.currentOwners, replacement: move.currentReplacement }]),
);
successors.set('packages/base/src/lib/internals/useValueChanged.svelte.ts', {
  owners: [modules.get('packages/base/src/lib/internals/ValueChanged.svelte.ts')].map((module) => ({
    path: module.path,
    sha256: module.sha256,
  })),
  replacement:
    'ValueChanged class retains previous-value notification ordering with a native effect.',
});

// Rebuild the actual renderer closure from the full current AST graph, keeping its Source mapping.
const renderingPath = 'parity/rendering/source-graph.json';
const rendering = read(renderingPath);
const previous = new Map(rendering.localClosure.modules.map((module) => [module.local, module]));
const reachability = new Map();
const queue = rendering.localClosure.roots.map((path) => ({ path, kind: 'runtime' }));
while (queue.length) {
  const { path, kind } = queue.shift();
  const module = modules.get(path);
  if (!module) throw new Error(`Missing used renderer owner: ${path}`);
  const kinds = reachability.get(path) ?? new Set();
  if (kinds.has(kind)) continue;
  kinds.add(kind);
  reachability.set(path, kinds);
  for (const edge of module.imports) {
    if (!edge.resolved.startsWith('external:'))
      queue.push({
        path: edge.resolved,
        kind: kind === 'type' || edge.kind === 'type' ? 'type' : 'runtime',
      });
  }
}
rendering.localClosure.modules = [...reachability.keys()].sort().map((path) => {
  const module = modules.get(path);
  const retained = previous.get(path);
  if (!retained) throw new Error(`New renderer owner needs explicit Source mapping: ${path}`);
  const record = {
    ...retained,
    sha256: module.sha256,
    reachability: [...reachability.get(path)].sort(),
    functions: module.symbols
      .filter((symbol) => symbol.kind === 'FunctionDeclaration')
      .map((symbol) => symbol.name),
    imports: module.imports.map((edge) => ({
      specifier: edge.specifier,
      kind: edge.kind,
      resolved: edge.resolved,
      runtimeNames: edge.members
        .filter((member) => !member.typeOnly)
        .map((member) => member.local ?? member.imported),
      typeNames: edge.members
        .filter((member) => member.typeOnly)
        .map((member) => member.local ?? member.imported),
    })),
  };
  const classes = module.symbols
    .filter((symbol) => symbol.kind === 'ClassDeclaration')
    .map((symbol) => symbol.name);
  if (classes.length) record.classes = classes;
  return record;
});
write(renderingPath, rendering);

// These are maintained correspondence projections, rather than frozen acceptance receipts.
const paths = [
  'parity/shared-utils/source-graph.json',
  'parity/boolean-controls/source-correspondence.json',
  'parity/dialog/source-correspondence.json',
  'parity/field-form/source-correspondence.json',
  'parity/radio/source-correspondence.json',
  'parity/scroll-area/correspondence.json',
  'parity/toggle-toolbar/source-correspondence.json',
];
for (const path of paths) {
  const data = read(path);
  const family = path.includes('toggle-toolbar/')
    ? new Set(
        read('parity/toggle-toolbar/native-closure.json').modules.map((module) => module.source),
      )
    : undefined;
  for (const record of data.records ?? data.modules ?? []) {
    const displayed = Array.isArray(record.local)
      ? record.local
      : record.local
        ? [record.local]
        : [];
    const owners = [...new Set([...displayed, ...Object.keys(record.localHashes ?? {})])];
    const replacements = owners.flatMap(
      (owner) => successors.get(owner)?.owners ?? [{ path: owner }],
    );
    const used = [...new Set(replacements.map((owner) => owner.path))].filter(
      (owner) => !family || family.has(owner),
    );
    const replacement = owners.map((owner) => successors.get(owner)?.replacement).filter(Boolean);
    if (replacement.length) {
      record.local = used.length === 1 ? used[0] : used;
      record.nativeReplacement = replacement.join(' ');
      record.nativeReplacementCredit = 0;
    }
    if ('localSha256' in record) {
      if (used.length === 1 && modules.has(used[0]))
        record.localSha256 = modules.get(used[0]).sha256;
      else delete record.localSha256;
    }
    if ('localRuntimeEdges' in record && replacement.length)
      record.localRuntimeEdges =
        used.length === 1
          ? modules
              .get(used[0])
              .imports.filter((edge) => edge.kind === 'runtime')
              .map((edge) => edge.specifier)
          : [];
    if ('localHashes' in record) {
      record.localHashes = Object.fromEntries(
        used.map((owner) => {
          const module = modules.get(owner);
          if (!module) throw new Error(`Missing current correspondence owner: ${path} -> ${owner}`);
          return [owner, module.sha256];
        }),
      );
    }
  }
  for (const record of [
    ...(data.localTypeExtensions ?? []),
    ...(data.publicTypeExportEndpoints ?? []),
  ])
    if ('localSha256' in record && modules.has(record.local))
      record.localSha256 = modules.get(record.local).sha256;
  for (const record of data.nativeRepresentationModules ?? []) {
    if (!modules.has(record.local))
      throw new Error(`Missing native representation owner: ${record.local}`);
    record.sha256 = modules.get(record.local).sha256;
  }
  write(path, data);
}
console.log(
  'Refreshed actual renderer closure and seven current LOCAL correspondence projections; Original/historical fields unchanged.',
);
