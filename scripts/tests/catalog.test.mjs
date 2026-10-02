import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

test('catalog accounts for every pinned non-type root module without complete parity claims', () => {
  const local = path => new URL(`../../${path}`, import.meta.url);
  const catalog = JSON.parse(readFileSync(local('parity/catalog.json'), 'utf8'));
  const source = readFileSync(local('parity/catalog-upstream-index.ts.txt'), 'utf8');
  assert.equal(catalog.upstream.commit, '47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c');
  assert.equal(createHash('sha256').update(source).digest('hex'), catalog.upstream.sourceSha256);
  const modules = [...source.matchAll(/export \* from '\.\/([^']+)'/g)].map(match => match[1]);
  assert.equal(modules.length, 42);
  assert.deepEqual(catalog.modules.map(item => item.upstreamModule), modules);
  for (const item of catalog.modules) {
    assert.ok(['bounded', 'unimplemented'].includes(item.status));
    if (item.status === 'bounded') {
      assert.ok(item.localExport);
      assert.ok(existsSync(local(item.evidence)), item.evidence);
    } else {
      assert.equal(item.localExport, null);
      assert.equal(item.evidence, null);
    }
  }
  for (const name of ['field', 'form', 'toggle']) assert.equal(catalog.modules.find(item => item.upstreamModule === name).status, 'unimplemented');
});
