import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
const root = new URL('../../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf8');
test('Progress keeps immutable 20 ordinary declarations, 7 parameterized variants and separate conformance', () => {
  const trace = JSON.parse(read('parity/progress/upstream-inventory.json')),
    ledger = JSON.parse(read('parity/progress/ports.json'));
  assert.equal(trace.upstream.commit, '47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c');
  assert.deepEqual(ledger.upstream, trace.upstream);
  assert.equal(trace.declarations.length, 23);
  assert.equal(ledger.ports.filter((port) => port.kind === 'ordinary').length, 20);
  assert.equal(
    ledger.ports
      .filter((port) => port.kind === 'parameterized')
      .reduce((count, port) => count + port.variants, 0),
    7,
  );
  assert.equal(ledger.ports.filter((port) => port.sourceId.includes('/track/')).length, 0);
  for (const source of trace.sources)
    assert.equal(
      createHash('sha256')
        .update(read(`parity/progress/upstream/${source.source}`))
        .digest('hex'),
      source.sha256,
    );
  for (const port of ledger.ports) {
    const source = trace.declarations.find((item) => item.id === port.sourceId);
    assert.ok(source);
    assert.equal(port.sourceBodySha256, source.bodySha256);
    assert.deepEqual(
      port.assertionLines,
      source.assertions.map((item) => item.line),
    );
    assert.equal(source.status, 'unported');
    assert.equal(source.port, null);
    assert.ok(['ported-pending-verification', 'passing'].includes(port.status));
    assert.ok(existsSync(new URL(port.port, root)));
    assert.ok(
      read(port.port).includes(port.pairedExecutionPrefix) ||
        (source.source.includes('/root/') &&
          [140, 160].includes(source.line) &&
          read(port.port).includes('Root:${line}')),
      port.sourceId,
    );
    if (port.status === 'passing') {
      assert.match(port.evidence.testedCommit, /^[0-9a-f]{40}$/);
      assert.match(
        port.evidence.workflowRun,
        /^https:\/\/github\.com\/sveltery\/base\/actions\/runs\/\d+$/,
      );
    } else assert.equal(port.evidence, null);
  }
  assert.equal(ledger.conformance.length, 15);
  for (const helper of ledger.conformance) {
    assert.equal(helper.ordinaryCredit, 0);
    assert.deepEqual(helper.parts, ['Root', 'Label', 'Track', 'Indicator', 'Value']);
    assert.ok(trace.sources.some((source) => source.source === helper.source));
  }
  assert.doesNotMatch(
    read('tests/browser/progress.spec.ts'),
    /(?:test|describe)\.(?:skip|fixme|only)\s*\(/,
  );
});
