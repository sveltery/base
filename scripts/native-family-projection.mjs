// Current family reachability/counterpart projection; historical evidence grants no new acceptance.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root));
const json = (path) => JSON.parse(read(path));
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const output = 'parity/native-snippets/family-projection.json';
const families = {
  'toggle-toolbar': ['toggle', 'toggle-group', 'toolbar', 'separator'],
  'menu-family': ['menu', 'context-menu', 'menubar'],
};
const substitutions = {
  'packages/react/src/internals/useRenderElement.tsx': {
    local: ['packages/base/src/lib/internals/mergeComponentProps.ts'],
    native:
      'Each actual part directly renders its three-argument snippet or intrinsic fallback. Bindings and independent attachments publish actual hosts; the pure helper retains prop/state/appearance merging business.',
  },
  'packages/react/src/internals/useValueChanged.ts': {
    local: [],
    native:
      'Native tracked component values and effects replace React render-cycle change bookkeeping under the explicit native-framework directive.',
  },
  'packages/utils/src/useControlled.ts': {
    local: ['packages/utils/src/lib/Controlled.svelte.ts'],
    native:
      'The canonical Controlled class owns initial mode, live controlled reads, initial default fallback and direct value setting.',
  },
  'packages/utils/src/usePreviousValue.ts': {
    local: ['packages/utils/src/lib/PreviousValue.svelte.ts'],
    native:
      'The canonical PreviousValue class retains current/previous/Object.is business with native reactive ownership.',
  },
  'packages/utils/src/useIsoLayoutEffect.ts': {
    local: [],
    native:
      'Actual component/resource owners use SSR-safe native $effect and captured-resource cleanup; no React layout-effect wrapper remains.',
  },
  'packages/utils/src/useMergedRefs.ts': {
    local: [],
    native:
      'Actual component bindable element refs, native bindings and independent attachment lifetimes replace callback/object ref fanout. The utility export is retired.',
  },
  'packages/utils/src/useOnMount.ts': {
    local: [],
    native:
      'Native component initialization and actual $effect resource lifetimes replace the React mount-hook transport.',
  },
  'packages/utils/src/useRefWithInit.ts': {
    local: [],
    native:
      'Native component initialization directly creates the real instance-owned class/object; no React ref-initialization hook remains.',
  },
  'packages/utils/src/useStableCallback.ts': {
    local: [],
    native:
      'Native closures read live component/store business state; no React stable-callback hook or callback identity transport remains.',
  },
};

export function extractCurrentFamilyProjection(name) {
  assert.ok(Object.hasOwn(families, name), `Unknown family: ${name}`);
  const graphPath = 'parity/native-snippets/native-graph.json';
  const graph = json(graphPath);
  const modules = new Map(graph.modules.map((module) => [module.source, module]));
  const catalog = json('parity/native-snippets/catalog-projection.json');
  const roots = families[name].map((subpath) => {
    const entry = catalog.modules.find((module) => module.upstreamModule === subpath);
    assert.ok(entry?.sourceEntry, `Missing actual public family entry: ${subpath}`);
    return entry.sourceEntry;
  });
  const reached = new Set();
  function visit(source) {
    if (reached.has(source)) return;
    const module = modules.get(source);
    assert.ok(module, `Family entry/import missing from current graph: ${source}`);
    reached.add(source);
    for (const edge of module.imports)
      if (!edge.resolved.startsWith('external:')) visit(edge.resolved);
  }
  roots.forEach(visit);
  const predecessorPath = `parity/${name}/source-correspondence.json`;
  const predecessor = json(predecessorPath);
  const original = json(`parity/${name}/source-graph.json`);
  const originals = new Map(original.modules.map((module) => [module.source, module]));
  assert.equal(predecessor.pin, graph.pin);
  const records = predecessor.records.map((record) => {
    assert.equal(record.sha256, originals.get(record.source)?.sha256, record.source);
    if (name === 'menu-family')
      assert.equal(
        hash(read(`parity/${name}/upstream/${record.source}`)),
        record.sha256,
        record.source,
      );
    const before = Object.keys(record.localHashes ?? {});
    const substitution = substitutions[record.source];
    const local = substitution?.local ?? before;
    for (const source of local)
      assert.ok(
        reached.has(source),
        `Counterpart is outside actual family reachability: ${record.source} -> ${source}`,
      );
    return {
      source: record.source,
      sourceSha256: record.sha256,
      predecessorSelection: record.selection,
      local: local.map((source) => ({
        source,
        sha256: modules.get(source).sha256,
      })),
      retiredLocal: before.filter((source) => !modules.has(source)),
      ...(substitution ? { nativeReplacement: substitution.native } : {}),
      status: 'current-counterpart-projection-pending-executed-acceptance',
      unchangedParityCredit: 0,
    };
  });
  const selected = new Set(
    records.flatMap((record) => record.local.map((module) => module.source)),
  );
  return {
    pin: graph.pin,
    scope:
      'Conservative current runtime-or-mixed/type reachability over the exact public native graph. This projection neither classifies AST-only execution edges nor grants Source review, assertion or receipt credit.',
    roots,
    graph: { path: graphPath, sha256: hash(read(graphPath)) },
    predecessor: { path: predecessorPath, sha256: hash(read(predecessorPath)) },
    originalGraph: {
      path: `parity/${name}/source-graph.json`,
      sha256: hash(read(`parity/${name}/source-graph.json`)),
    },
    modules: [...reached].sort().map((source) => ({ source, sha256: modules.get(source).sha256 })),
    external: [
      ...new Set(
        [...reached].flatMap((source) =>
          modules
            .get(source)
            .imports.filter((edge) => edge.resolved.startsWith('external:'))
            .map((edge) => edge.resolved),
        ),
      ),
    ].sort(),
    records,
    nativeRepresentationModules: [...reached]
      .filter((source) => !selected.has(source))
      .sort()
      .map((source) => ({
        source,
        sha256: modules.get(source).sha256,
        status: 'native-representation-or-split-business-counterpart-no-acceptance-credit',
      })),
    hostComposition: {
      scope:
        'Authored component composition contracts, including related contracts. These records are not AST runtime import or call edges.',
      contracts: json('parity/native-snippets/original-composition.json')
        .modules.filter((module) => reached.has(module.local))
        .map((module) => ({
          source: module.source,
          sourceSha256: module.sha256,
          local: module.local,
          localSha256: modules.get(module.local).sha256,
        })),
    },
    unchangedParityCredit: 0,
  };
}

export function extractCurrentFamilyProjections() {
  return Object.fromEntries(
    Object.keys(families).map((name) => [name, extractCurrentFamilyProjection(name)]),
  );
}

export function verifyCurrentFamilyProjections() {
  assert.deepEqual(
    json(output),
    extractCurrentFamilyProjections(),
    'Current native family projection is stale',
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (process.argv.includes('--write'))
    writeFileSync(
      new URL(output, root),
      JSON.stringify(extractCurrentFamilyProjections(), null, 2) + '\n',
    );
  else verifyCurrentFamilyProjections();
  console.log(
    'Current native family reachability and counterpart projections are coherent; no new acceptance credit.',
  );
}
