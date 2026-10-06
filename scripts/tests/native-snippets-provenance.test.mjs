// Immutable history plus actual current API/source projection; no new product parity credit.
import { createHash } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import test from 'node:test';

const root = new URL('../../', import.meta.url);
const history = JSON.parse(
  readFileSync(new URL('parity/native-snippets/acceptance-history/manifest.json', root), 'utf8'),
);
test('native rendering retirement preserves every exact predecessor body and Source declaration scope', () => {
  assert.equal(history.pin, '47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c');
  for (const file of history.files) {
    const bytes = readFileSync(new URL(file.archive, root));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), file.sha256, file.source);
    assert.equal(file.unchangedParityCredit, 0);
  }
  const trace = JSON.parse(
    readFileSync(new URL('parity/use-render/upstream-inventory.json', root), 'utf8'),
  );
  assert.equal(
    trace.declarations.filter((site) => site.source.includes('/use-render/')).length,
    14,
  );
  assert.equal(trace.declarations.filter((site) => site.source.includes('/internals/')).length, 33);
  const parameterized = trace.declarations.filter((site) => site.expression.startsWith('it.each'));
  assert.equal(parameterized.length, 1);
  assert.equal(parameterized[0].line, 584);
  assert.match(parameterized[0].expression, /\['null', null\]/);
  assert.equal(new Set(trace.declarations.map((site) => site.id)).size, 47);
  for (const source of trace.sources) {
    assert.match(source.sha256, /^[a-f0-9]{64}$/);
    assert(source.url.includes(trace.upstream.commit));
  }
  assert.equal(trace.typeAssertions.length, 7);
  for (const assertion of trace.typeAssertions) {
    assert.equal(assertion.status, 'divergent-unported');
    assert.equal(assertion.port, null);
  }
  const cases = readFileSync(
    new URL(
      'parity/native-snippets/acceptance-history/apps/fixtures/src/lib/use-render-cases.ts',
      root,
    ),
    'utf8',
  );
  const archivedCases = (name) =>
    cases.match(new RegExp(`export const ${name} = \\[(.*?)\\];`, 's'))[1].match(/'[^']+'/g);
  assert.equal(archivedCases('publicCases').length, 14);
  assert.equal(archivedCases('internalCases').length, 21);
});
test('live public native rendering excludes the retired root/subpath API and keeps real secured acceptance', () => {
  const metadata = JSON.parse(readFileSync(new URL('packages/base/package.json', root), 'utf8'));
  assert.equal(metadata.exports['./use-render'], undefined);
  assert.equal(existsSync(new URL('packages/base/src/lib/use-render/index.ts', root)), false);
  const exports = readFileSync(new URL('packages/base/src/lib/index.ts', root), 'utf8');
  assert.doesNotMatch(exports, /\bUseRender\b|\bUseRenderProps\b/);
  const browser = readFileSync(new URL('tests/browser/native-snippets.spec.ts', root), 'utf8');
  assert.match(browser, /event-detail cancellation/);
  assert.match(browser, /SSR hydrates/);
  assert.match(
    readFileSync(new URL('playwright.config.ts', root), 'utf8'),
    /chromiumSandbox: true/,
  );
  const check = readFileSync(new URL('scripts/check-native-snippets-package.sh', root), 'utf8');
  assert.match(check, /sveltery_pack_package/);
  assert.match(check, /sveltery_prepare_consumer/);
  assert.match(check, /--conditions=browser/);
});
test('actual current native Source import graph and retirement exclusions remain coherent', () => {
  const result = execFileSync(
    process.execPath,
    [new URL('parity/native-snippets/graph.mjs', root).pathname],
    { encoding: 'utf8' },
  );
  assert.match(result, /native snippet graph:/i);
  const retired = execFileSync(
    process.execPath,
    [new URL('parity/use-render/graph.mjs', root).pathname, '--check'],
    { encoding: 'utf8' },
  );
  assert.match(retired, /21 immutable Original modules; current public API\/runtime retired/);
  const graph = JSON.parse(
    readFileSync(new URL('parity/use-render/source-graph.json', root), 'utf8'),
  );
  assert.deepEqual(graph.localClosure.roots, []);
  assert.deepEqual(graph.localClosure.modules, []);
  assert.equal(graph.localClosure.ordinaryDeclarationCredit, 0);
  for (const path of [
    'packages/base/src/lib/use-render/index.ts',
    'packages/base/src/lib/use-render/UseRender.svelte',
    'packages/base/src/lib/use-render/RenderElement.svelte',
    'packages/base/src/lib/use-render/types.ts',
    'packages/utils/src/lib/useMergedRefs.ts',
  ])
    assert(!existsSync(new URL(path, root)), path);
});
test('six-role construction checkpoint retains complete aa4 bodies and zero assertion credit', () => {
  const evidence = JSON.parse(
    readFileSync(new URL('parity/popup-utils-owners/class-successor.json', root), 'utf8'),
  );
  assert.equal(
    createHash('sha256')
      .update(readFileSync(new URL('parity/popup-utils-owners/class-successor.json', root)))
      .digest('hex'),
    'e24a6f7603aa7f6d2482214d79da3122f87f51cac3f73e79bd5247123080fcfa',
  );
  assert.equal(evidence.predecessor, 'aa4daff54ec82b96e34e1601648d1b3926ef08cf');
  assert.equal(evidence.pin, history.pin);
  assert.equal(evidence.ordinaryDeclarationCredit, 0);
  assert.equal(evidence.unchangedAssertionCredit, 0);
  assert.equal(evidence.runtime.length, 5);
  assert.equal(evidence.runtime.flatMap((record) => record.roles).length, 6);
  const hash = (body) => createHash('sha256').update(body).digest('hex');
  for (const record of evidence.runtime) {
    assert.equal(hash(record.predecessorBody), record.predecessorSha256);
    assert.equal(hash(record.currentBody), record.currentSha256);
    const predecessor = execFileSync('git', ['show', `${evidence.predecessor}:${record.path}`], {
      cwd: root,
      encoding: 'utf8',
    });
    assert.equal(record.predecessorBody, predecessor);
    assert.notEqual(record.currentBody, predecessor);
  }
});
test('focused construction checkpoint preserves immutable precode scope and graph hashes', () => {
  const projection = JSON.parse(
    readFileSync(new URL('parity/popup-utils-owners/candidate-graph.json', root), 'utf8'),
  );
  const precodeBytes = readFileSync(new URL(projection.precodeGraph, root));
  const precode = JSON.parse(precodeBytes);
  const hash = (body) => createHash('sha256').update(body).digest('hex');
  assert.equal(hash(precodeBytes), projection.precodeGraphSha256);
  assert.equal(projection.predecessor, precode.nativePrecodeHead);
  assert.equal(projection.ordinaryDeclarationCredit, 0);
  assert.equal(projection.unchangedAssertionCredit, 0);
  assert.deepEqual(
    projection.modules.map((module) => module.path),
    precode.modules.map((module) => module.path),
  );
  assert.equal(
    hash(readFileSync(new URL('parity/popup-utils-owners/candidate-graph.json', root))),
    '506c2ed53a10de4ce57dc1e3d9f9a6f99d506aa47e3dc892ca4c812afd09abec',
  );
});

test('seventh retained-state owner extension binds six actual full bodies and zero credit', () => {
  const evidence = JSON.parse(
    readFileSync(new URL('parity/popup-utils-owners/class-extension.json', root), 'utf8'),
  );
  assert.equal(evidence.predecessor, 'aa4daff54ec82b96e34e1601648d1b3926ef08cf');
  assert.equal(evidence.pin, history.pin);
  assert.equal(evidence.ordinaryDeclarationCredit, 0);
  assert.equal(evidence.unchangedAssertionCredit, 0);
  assert.equal(evidence.runtime.length, 6);
  assert.equal(evidence.runtime.flatMap((record) => record.roles).length, 7);
  const hash = (body) => createHash('sha256').update(body).digest('hex');
  for (const record of evidence.runtime) {
    assert.equal(hash(record.predecessorBody), record.predecessorSha256);
    assert.equal(hash(record.currentBody), record.currentSha256);
    assert.equal(readFileSync(new URL(record.path, root), 'utf8'), record.currentBody);
    assert.equal(
      execFileSync('git', ['show', `${evidence.predecessor}:${record.path}`], {
        cwd: root,
        encoding: 'utf8',
      }),
      record.predecessorBody,
    );
  }
  const original = evidence.anchoredOriginal;
  assert.equal(hash(readFileSync(new URL(original.archive, root))), original.sha256);
  const projection = JSON.parse(
    readFileSync(new URL('parity/popup-utils-owners/candidate-extension-graph.json', root), 'utf8'),
  );
  const expectedPaths = new Set();
  for (const graph of projection.precodeGraphs) {
    const bytes = readFileSync(new URL(graph.path, root));
    assert.equal(hash(bytes), graph.sha256);
    for (const module of JSON.parse(bytes).modules) expectedPaths.add(module.path);
  }
  assert.deepEqual(new Set(projection.modules.map((module) => module.path)), expectedPaths);
  for (const module of projection.modules)
    assert.equal(hash(readFileSync(new URL(module.path, root))), module.sha256, module.path);
});
