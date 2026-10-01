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
