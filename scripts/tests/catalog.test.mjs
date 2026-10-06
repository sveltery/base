import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
import {
  nativeCatalogCountSentence,
  verifyCurrentNativeCatalog,
} from '../native-catalog-projection.mjs';
const local = (path) => new URL(`../../${path}`, import.meta.url);
const read = (path) => readFileSync(local(path), 'utf8');

test('maintained catalog keeps every pinned module and distinguishes actual native API presence from acceptance or retirement', () => {
  const catalog = JSON.parse(read('parity/catalog.json'));
  const source = read('parity/catalog-upstream-index.ts.txt');
  assert.equal(catalog.upstream.commit, '47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c');
  assert.equal(createHash('sha256').update(source).digest('hex'), catalog.upstream.sourceSha256);
  const modules = [...source.matchAll(/export \* from '\.\/([^']+)'/g)].map((match) => match[1]);
  assert.equal(modules.length, 42);
  assert.deepEqual(
    catalog.modules.map((item) => item.upstreamModule),
    modules,
  );
  const projection = verifyCurrentNativeCatalog();
  const totals = Object.values(projection.counts).reduce((sum, value) => sum + value, 0);
  assert.equal(totals, modules.length);
  assert.equal(catalog.nativeProjection, 'parity/native-snippets/catalog-projection.json');
  for (const item of catalog.modules) {
    const current = projection.modules.find(
      (entry) => entry.upstreamModule === item.upstreamModule,
    );
    assert.ok(
      [
        'bounded',
        'native-pending-acceptance',
        'retired-native-successor',
        'unimplemented',
      ].includes(item.status),
    );
    assert.equal(current.status, item.status);
    if (item.status === 'bounded' || item.status === 'native-pending-acceptance') {
      assert.ok(current.packageSubpath, item.upstreamModule);
      assert.ok(current.rootExports.length, item.upstreamModule);
      for (const name of item.localExport.split(' / '))
        assert.ok(current.rootExports.includes(name), `${item.upstreamModule}: ${name}`);
      assert.ok(existsSync(local(item.evidence)), item.evidence);
      assert.equal(current.currentAcceptance, 'pending-exact-head-execution-and-review');
    } else {
      assert.equal(item.localExport, null);
      assert.equal(current.packageSubpath, null);
      assert.deepEqual(current.rootExports, []);
      if (item.status === 'unimplemented') assert.equal(item.evidence, null);
      else {
        assert.equal(item.upstreamModule, 'use-render');
        assert.equal(item.unchangedRendererCredit, 0);
        assert.ok(existsSync(local(item.evidence)));
      }
    }
  }
  assert.ok(!projection.rootRuntimeExports.includes('UseRender'));
  assert.equal(JSON.parse(read('packages/base/package.json')).exports['./use-render'], undefined);
  const sentence = nativeCatalogCountSentence(projection);
  assert.ok(read('docs/catalog.md').includes(sentence));
  assert.ok(read('apps/fixtures/src/lib/docs/content.ts').includes(sentence));
});
