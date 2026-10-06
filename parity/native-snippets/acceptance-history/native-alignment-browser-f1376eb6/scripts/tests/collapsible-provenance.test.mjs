import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');
test('Collapsible ledger preserves exact ordinary inventory and portable versus Activity scope', () => {
  const trace = JSON.parse(read('parity/collapsible/upstream-inventory.json'));
  const ledger = JSON.parse(read('parity/collapsible/ports.json'));
  assert.deepEqual(ledger.upstream, trace.upstream);
  assert.equal(trace.upstream.commit, '47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c');
  assert.equal(trace.declarations.length, 47);
  assert.equal(ledger.ports.length, 47);
  assert.equal(
    trace.declarations.reduce((count, item) => count + item.variants.length, 0),
    49,
  );
  assert.equal(new Set(trace.declarations.map((item) => item.id)).size, 47);
  assert.equal(trace.conformance.length, 3);
  assert.equal(trace.typeAssertions.length, 10);
  const portable = trace.declarations.filter((item) => item.scope === 'portable');
  assert.equal(portable.length, 41);
  assert.equal(
    portable.reduce((count, item) => count + item.variants.length, 0),
    43,
  );
  assert.deepEqual(
    trace.declarations.filter((item) => item.scope !== 'portable').map((item) => item.line),
    [869, 932, 1003, 1063, 1130, 1413],
  );
  for (const source of trace.sources) assert.match(source.sha256, /^[0-9a-f]{64}$/);
  const browser = read('tests/browser/collapsible.spec.ts');
  assert.doesNotMatch(browser, /(?:test|describe)\.(?:skip|fixme|only)\s*\(/);
  for (const [index, port] of ledger.ports.entries()) {
    const source = trace.declarations[index];
    assert.equal(port.sourceId, source.id);
    assert.equal(port.sourceTitle, source.title);
    assert.equal(port.sourceBodySha256, source.bodySha256);
    assert.match(port.sourceBodySha256, /^[0-9a-f]{64}$/);
    assert.deepEqual(
      port.assertionLines,
      source.assertions.map((item) => item.line),
    );
    assert.deepEqual(port.variants, source.variants);
    assert.equal(source.status, 'unported');
    assert.equal(source.port, null);
    if (source.scope !== 'portable') {
      assert.equal(port.status, 'deferred');
      assert.equal(port.port, null);
      assert.deepEqual(port.executions, []);
      assert.equal(port.evidence, null);
    } else {
      assert.ok(['candidate', 'passing'].includes(port.status));
      assert.equal(port.port, 'tests/browser/collapsible.spec.ts');
      const prefix = { root: 'R', trigger: 'T', panel: 'P' }[source.source.split('/').at(-2)];
      const label = `${prefix}:${source.line} `;
      const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const match = browser.match(new RegExp('test\\(`' + escaped + '(.*?)`'));
      assert.ok(match, label);
      assert.deepEqual(
        port.executions,
        ['Svelte', 'React reference'].flatMap((framework) =>
          source.variants.map(
            (variant) =>
              label + match[1].replace('${framework}', framework).replace('${key}', variant ?? ''),
          ),
        ),
      );
      for (const path of [port.port, ...port.fixtures, ...port.localPorts])
        assert.ok(existsSync(new URL(`../../${path}`, import.meta.url)), path);
      if (port.status === 'passing') {
        assert.match(port.evidence.testedCommit, /^[0-9a-f]{40}$/);
        assert.ok(port.evidence.pairedSecuredBrowser);
      } else assert.equal(port.evidence, null);
    }
  }
  for (const line of [1205, 1287, 1349, 1474])
    assert.equal(
      trace.declarations.find(
        (item) => item.source.endsWith('CollapsiblePanel.test.tsx') && item.line === line,
      ).scope,
      'portable',
    );
  assert.equal(
    (read('packages/base/tests/collapsible-types.ts').match(/^\s*expectType</gm) ?? []).length,
    10,
  );
});
