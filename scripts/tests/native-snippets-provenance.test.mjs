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
  assert.equal(trace.typeAssertions.length, 7);
  for (const assertion of trace.typeAssertions) {
    assert.equal(assertion.status, 'divergent-unported');
    assert.equal(assertion.port, null);
  }
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
});
