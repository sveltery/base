import { readLosslessJson } from './lossless-json.mjs';
// Current LOCAL successor projections only. Original Source and historical fields stay immutable.
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readLosslessJson(resolve(root, path));
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
successors.set(
  'packages/base/src/lib/internals/field-register-control/useFieldControlRegistration.svelte.ts',
  {
    owners: [
      'packages/base/src/lib/internals/field-register-control/FieldControlRegistration.svelte.ts',
    ].map((path) => ({ path, sha256: modules.get(path).sha256 })),
    replacement:
      'FieldControlRegistrationOwner class retains the pinned registration/source/baseline/cancellation business; its actual reactive registration wakes native Field/Form synchronization.',
  },
);
for (const path of [
  'packages/base/src/lib/dialog/Element.svelte',
  'packages/base/src/lib/internals/RenderElement.svelte',
  'packages/base/src/lib/internals/nativeRefAttachment.ts',
  'packages/base/src/lib/use-render/RenderElement.svelte',
  'packages/base/src/lib/use-render/UseRender.svelte',
  'packages/base/src/lib/use-render/index.ts',
  'packages/base/src/lib/use-render/types.ts',
])
  successors.set(path, {
    owners: [],
    replacement:
      'Runtime renderer/ref transport and public UseRender API are retired. Each actual component uses its own native snippet/intrinsic branch, binding and attachment; see parity/native-snippets/native-graph.json. No unchanged framework assertion credit.',
  });
successors.set('packages/base/src/lib/internals/useRenderElement.ts', {
  owners: ['packages/base/src/lib/internals/mergeComponentProps.ts'].map((path) => ({
    path,
    sha256: modules.get(path).sha256,
  })),
  replacement:
    'Only pure prop/appearance/event/cancellation/state-attribute composition remains in mergeComponentProps; actual rendering and DOM publication belong to each component native branch/attachment.',
});

// Rebuild the actual renderer closure from the full current AST graph, keeping its Source mapping.
const renderingPath = 'parity/rendering/source-graph.json';
const rendering = read(renderingPath);
const previous = new Map(rendering.localClosure.modules.map((module) => [module.local, module]));
previous.set('packages/base/src/lib/internals/mergeComponentProps.ts', {
  local: 'packages/base/src/lib/internals/mergeComponentProps.ts',
  source: 'packages/react/src/internals/useRenderElement.tsx',
  role: 'Retained pure prop/appearance/state/event composition only; renderer machinery retired.',
  nativeReplacementCredit: 0,
});
rendering.localClosure.roots = [
  'packages/base/src/lib/internals/mergeComponentProps.ts',
  'packages/base/src/lib/merge-props/index.ts',
];
rendering.localClosure.scope =
  'Actual retained pure-prop closure. Direct per-component hosts and complete current public closure are recorded in parity/native-snippets/native-graph.json; the exact predecessor renderer projection is archived.';
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
const useRenderPath = 'parity/use-render/source-graph.json';
const useRender = read(useRenderPath);
useRender.localClosure = {
  roots: [],
  modules: [],
  status:
    'Public UseRender API and generic runtime renderer retired in PR77. Original arrays and exact predecessor LOCAL projection remain historical; actual native host composition is parity/native-snippets/native-graph.json.',
  currentNativeHostGraph: 'parity/native-snippets/native-graph.json',
  ordinaryDeclarationCredit: 0,
};
write(useRenderPath, useRender);

// These are maintained correspondence projections, rather than frozen acceptance receipts.
const paths = [
  'parity/shared-utils/source-graph.json',
  'parity/boolean-controls/source-correspondence.json',
  'parity/dialog/source-correspondence.json',
  'parity/field-form/source-correspondence.json',
  'parity/radio/source-correspondence.json',
  'parity/scroll-area/correspondence.json',
  'parity/toggle-toolbar/source-correspondence.json',
  'parity/menu-family/source-correspondence.json',
];
for (const path of paths) {
  const data = read(path);
  const family =
    path.includes('toggle-toolbar/') || path.includes('menu-family/')
      ? new Set(
          read(
            path.includes('menu-family/')
              ? 'parity/menu-family/native-closure.json'
              : 'parity/toggle-toolbar/native-closure.json',
          ).modules.map((module) => module.source),
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
    if (replacement.length)
      record.currentNativeHostGraph = 'parity/native-snippets/native-graph.json';
  }
  for (const record of [
    ...(data.localTypeExtensions ?? []),
    ...(data.publicTypeExportEndpoints ?? []),
  ])
    if ('localSha256' in record && modules.has(record.local))
      record.localSha256 = modules.get(record.local).sha256;
  if (data.nativeRepresentationModules)
    data.nativeRepresentationModules = data.nativeRepresentationModules.flatMap((record) => {
      const replacement = successors.get(record.local);
      if (replacement) {
        if (!replacement.owners.length) {
          data.retiredNativeRepresentationModules ??= [];
          if (
            !data.retiredNativeRepresentationModules.some(
              (retired) => retired.local === record.local,
            )
          )
            data.retiredNativeRepresentationModules.push({
              ...record,
              status: replacement.replacement,
              currentNativeHostGraph: 'parity/native-snippets/native-graph.json',
              nativeReplacementCredit: 0,
            });
        }
        return replacement.owners.map((owner) => ({
          ...record,
          local: owner.path,
          sha256: modules.get(owner.path).sha256,
          nativeReplacement: replacement.replacement,
          nativeReplacementCredit: 0,
        }));
      }
      if (!modules.has(record.local))
        throw new Error(`Missing native representation owner: ${record.local}`);
      return [{ ...record, sha256: modules.get(record.local).sha256 }];
    });
  write(path, data);
}
console.log(
  'Refreshed actual renderer closure and seven current LOCAL correspondence projections; Original/historical fields unchanged.',
);
