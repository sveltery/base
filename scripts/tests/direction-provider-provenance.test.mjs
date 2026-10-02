import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
const root = new URL('../../', import.meta.url);
const read = path => readFileSync(new URL(path, root), 'utf8');

test('DirectionProvider keeps both pinned ordinary predicates separate from the callable-reader API adaptation', () => {
  const trace = JSON.parse(read('parity/direction-provider/upstream-inventory.json'));
  const ledger = JSON.parse(read('parity/direction-provider/ports.json'));
  assert.equal(trace.upstream.commit, '47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c');
  assert.deepEqual(ledger.upstream, trace.upstream);
  assert.equal(trace.sources.length, 6);
  assert.equal(trace.declarations.length, 2);
  assert.equal(trace.typeAssertions.length, 2);
  assert.equal(ledger.ports.length, 2);
  assert.deepEqual(ledger.conformance, []);
  assert.deepEqual(ledger.ports.map(port => port.assertionLines), [[31], [37, 41]]);
  for (const source of trace.sources) {
    assert.equal(createHash('sha256').update(read(`parity/direction-provider/upstream/${source.source}`)).digest('hex'), source.sha256);
    assert.equal(source.url, `https://github.com/mui/base-ui/blob/${trace.upstream.commit}/${source.source}`);
  }
  for (const port of ledger.ports) {
    const source = trace.declarations.find(item => item.id === port.sourceId);
    assert.ok(source);
    assert.equal(port.sourceBodySha256, source.bodySha256);
    assert.deepEqual(port.assertionLines, source.assertions.map(item => item.line));
    assert.equal(source.status, 'unported');
    assert.equal(source.port, null);
    for (const path of [port.port, port.fixture, port.reference]) assert.ok(existsSync(new URL(path, root)), path);
    assert.ok(read(port.port).includes(port.pairedExecutionPrefix));
    assert.ok(['ported-pending-verification', 'passing'].includes(port.status));
    if (port.status === 'passing') {
      assert.match(port.evidence.testedCommit, /^[0-9a-f]{40}$/);
      assert.match(port.evidence.workflowRun, /^https:\/\/github\.com\/sveltery\/base\/actions\/runs\/\d+$/);
    } else assert.equal(port.evidence, null);
  }
  assert.equal(ledger.typeAssertions[0].classification, 'divergent-callable-reader-return-type');
  for (const item of ledger.typeAssertions) { assert.equal(item.status, 'unported'); assert.equal(item.unchangedParityCredit, 0); }
  assert.doesNotMatch(read('tests/browser/direction-provider.spec.ts'), /(?:test|describe)\.(?:skip|fixme|only)\s*\(/);
  assert.ok(read('parity/direction-provider/UPSTREAM_LICENSE').includes('MIT License'));
});
