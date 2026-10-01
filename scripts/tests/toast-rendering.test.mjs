import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import test from 'node:test';
const path = value => new URL(`../../${value}`, import.meta.url);
const read = value => readFileSync(path(value), 'utf8');
const source = JSON.parse(read('parity/toast/upstream-inventory.json'));

test('rendering evidence preserves complete pinned provenance without crediting supplements', () => {
  const records = ['rendering-ports', 'parts-ports', 'provider-viewport-ports'].map(name => JSON.parse(read(`parity/toast/${name}.json`)));
  assert.deepEqual(records.map(record => record.cases.length), [13, 13, 24]);
  for (const record of records) {
    assert.equal(record.upstream.commit, source.upstream.commit);
    for (const entry of record.cases) {
      const original = source.declarations.find(item => item.id === entry.sourceId);
      assert.ok(original, entry.sourceId);
      assert.equal(entry.title, original.title);
      assert.equal(entry.sourceBodySha256, original.bodySha256);
      assert.deepEqual(entry.assertionLines, original.assertions.map(item => item.line));
      assert.deepEqual(entry.fixtureVariants, original.variants);
      assert.deepEqual(entry.upstreamGuards, original.upstreamGuards);
      assert.deepEqual(entry.sourceConditions, original.sourceConditions);
      assert.equal(original.status, 'unported');
      assert.equal(original.port, null);
      const port = entry.port ?? entry.execution?.port ?? record.port;
      assert.ok(existsSync(path(port)), port);
      const portText = read(port);
      const line = original.line;
      if (entry.part === 'P') assert.ok(portText.includes(`ToastProvider.test.tsx:${line}`));
      else if (entry.part === 'V') assert.ok(portText.includes(`upstream V:${line}`));
      else if (entry.execution) assert.ok(portText.includes(entry.execution.title));
      else assert.ok(portText.includes(`, ${line}, '${entry.scenario}'`));
    }
    for (const fixture of record.fixtures ?? []) assert.ok(existsSync(path(fixture)), fixture);
  }
});

test('the context manager retains the full pinned data type spec with only its import adaptation', () => {
  const original = source.typeSpecs.find(item => item.source.endsWith('/useToastManager.spec.tsx'));
  const actual = read('packages/base/tests/toast-context-manager.types.ts');
  assert.equal(actual.slice(actual.indexOf('type ToastPayload')), original.text.slice(original.text.indexOf('type ToastPayload')));
  assert.ok(actual.includes('getToastManager as useToastManager'));
  assert.equal((actual.match(/@ts-expect-error/g) ?? []).length, 4);
});

test('shared Toast credit includes only the thirteen complete hosted paired declarations', () => {
  const manifest = JSON.parse(read('parity/manifest.json'));
  const record = JSON.parse(read('parity/toast/rendering-ports.json'));
  const credited = manifest.cases.filter(item => item.source.includes('/toast/') && item.status === 'passing');
  assert.equal(credited.length, 13);
  assert.deepEqual(new Set(credited.map(item => item.sourceId)), new Set(record.cases.map(item => item.sourceId)));
  for (const item of credited) {
    const entry = record.cases.find(candidate => candidate.sourceId === item.sourceId);
    assert.equal(item.port, record.port);
    assert.equal(item.sourceBodySha256, entry.sourceBodySha256);
    assert.deepEqual(item.assertionLines, entry.assertionLines);
    assert.deepEqual(item.evidence.executions, entry.executions);
    assert.match(item.evidence.testedCommit, /^[0-9a-f]{40}$/);
    assert.match(item.evidence.workflowRun, /^https:\/\/github\.com\/sveltery\/base\/actions\/runs\/\d+$/);
    assert.ok(Number.isSafeInteger(item.evidence.browserJob));
  }
  assert.ok(read('parity/README.md').includes('28 passing ports / 605 unported'));
  assert.ok(read('parity/README.md').includes('13 complete ports / 183 unported declarations'));
  assert.ok(read('parity/toast/rendering-interface.md').includes('28 passing ports / 605 unported'));
  assert.equal(record.evidence.toastTests, 36);
  assert.equal(record.evidence.baselineCommit, 'de6b35688d23c818dd240e9b73eee6bce53e0490');
  assert.equal(record.evidence.baselineBrowserTests, 189);
  assert.equal(record.evidence.browserTests, record.evidence.baselineBrowserTests + record.evidence.toastTests);
});
