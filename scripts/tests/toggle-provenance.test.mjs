import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
const read = path => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');
test('Toggle ledger preserves five complete standalone ports and two deferred group declarations', () => {
  const trace = JSON.parse(read('parity/toggle/upstream-inventory.json'));
  const ledger = JSON.parse(read('parity/toggle/ports.json'));
  assert.deepEqual(ledger.upstream, trace.upstream);
  assert.equal(trace.upstream.commit, '47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c');
  assert.equal(trace.declarations.length, 7); assert.equal(ledger.ports.length, 7);
  const browser = read('tests/browser/toggle.spec.ts');
  assert.doesNotMatch(browser, /(?:test|describe)\.(?:skip|fixme|only)\s*\(/);
  for (const port of ledger.ports) {
    const source = trace.declarations.find(item => item.id === port.sourceId);
    assert.ok(source); assert.equal(port.sourceBodySha256, source.bodySha256);
    assert.deepEqual(port.assertionLines, source.assertions.map(item => item.line));
    assert.equal(source.status, 'unported'); assert.equal(source.port, null);
    if ([103, 150].includes(source.line)) {
      assert.equal(port.status, 'deferred'); assert.equal(port.port, null); assert.deepEqual(port.executions, []);
    } else {
      assert.ok(['ported-pending-verification', 'passing'].includes(port.status));
      assert.ok(browser.includes(`T:${source.line} \${framework} ${source.title}`));
      assert.deepEqual(port.executions, ['Svelte', 'React reference'].map(framework => `T:${source.line} ${framework} ${source.title}`));
      for (const path of [port.port, ...port.fixtures]) assert.ok(existsSync(new URL(`../../${path}`, import.meta.url)), path);
      if (port.status === 'passing') {
        assert.match(port.evidence.testedCommit, /^[0-9a-f]{40}$/);
        assert.match(port.evidence.workflowRun, /^https:\/\/github\.com\/sveltery\/base\/actions\/runs\/\d+$/);
        assert.ok(Number.isSafeInteger(port.evidence.browserJob));
      } else assert.equal(port.evidence, null);
    }
  }
  assert.equal(ledger.ports.filter(item => item.status !== 'deferred').length, 5);
});
