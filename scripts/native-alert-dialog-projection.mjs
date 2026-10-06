// Additive AlertDialog source projection; historical 496-body proof stays immutable.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const predecessor = 'aa4daff54ec82b96e34e1601648d1b3926ef08cf';
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const original = (path) =>
  execFileSync('git', ['show', `${predecessor}:${path}`], { cwd: root, encoding: 'utf8' });
const hash = (body) => createHash('sha256').update(body).digest('hex');
const oldGraph = JSON.parse(original('parity/native-snippets/native-graph.json'));
const graph = JSON.parse(read('parity/native-snippets/native-graph.json'));
const old = new Map(oldGraph.modules.map((module) => [module.source, module]));
const current = new Map(graph.modules.map((module) => [module.source, module]));
const additions = [
  'packages/base/src/lib/alert-dialog/Root.svelte',
  'packages/base/src/lib/alert-dialog/handle.ts',
  'packages/base/src/lib/alert-dialog/index.parts.ts',
  'packages/base/src/lib/alert-dialog/index.ts',
  'packages/base/src/lib/alert-dialog/types.ts',
  'packages/base/src/lib/dialog/root/DialogRootView.svelte',
];
const changed = ['packages/base/src/lib/dialog/Root.svelte', 'packages/base/src/lib/index.ts'];
assert.equal(old.size, 496, 'Exact historical module scope');
assert.equal(current.size, 502, 'Explicit additive successor scope');
assert.deepEqual(
  [...current.keys()].filter((path) => !old.has(path)).sort(),
  [...additions].sort(),
);
assert.deepEqual(
  [...old.keys()].filter((path) => !current.has(path)),
  [],
);
for (const [path, module] of current) {
  assert.equal(hash(read(path)), module.sha256, `Actual current graph body: ${path}`);
  if (old.has(path) && !changed.includes(path))
    assert.equal(module.sha256, old.get(path).sha256, `Unchanged inherited business body: ${path}`);
}
assert.equal(
  read('packages/base/src/lib/index.ts'),
  original('packages/base/src/lib/index.ts').replace(
    "export { Dialog } from './dialog/index.js';",
    "export { Dialog } from './dialog/index.js';\nexport { AlertDialog } from './alert-dialog/index.js';\nexport type * from './alert-dialog/types.js';",
  ),
);
const records = [...changed, ...additions].map((path) => ({
  path,
  predecessorBody: old.has(path) ? original(path) : null,
  predecessorSha256: old.get(path)?.sha256 ?? null,
  currentBody: read(path),
  currentSha256: current.get(path).sha256,
  structuralEqualityCredit: false,
  ordinaryDeclarationCredit: 0,
}));
const output = {
  immutableOriginalPin: graph.pin,
  predecessor: execFileSync('git', ['rev-parse', predecessor], {
    cwd: root,
    encoding: 'utf8',
  }).trim(),
  historicalIntegrationProofSha256: hash(
    original('parity/native-snippets/integration-current.json'),
  ),
  historicalModuleCount: 496,
  currentModuleCount: 502,
  unchangedInheritedBodies: 494,
  scope:
    'Exact complete source bodies and graph only. Dialog Root extraction and shared View are explicit business/framework composition changes, never formatter or AST equality. Historical integration-current.json remains a main-head 496-body proof; no successor runtime, types, SSR, hydration, browser, CI, review or acceptance credit.',
  records,
};
const destination = 'parity/native-snippets/alert-dialog-successor.json';
const text = JSON.stringify(output, null, 2) + '\n';
if (process.argv.includes('--write')) writeFileSync(resolve(root, destination), text);
else
  assert.equal(
    read(destination),
    text,
    'Exact successor evidence stale; inspect changed complete bodies before regeneration',
  );
console.log(
  'AlertDialog native successor: historical 496, current 502, inherited 494 exact; 6 additions and 2 explicit changed bodies; zero acceptance credit.',
);
