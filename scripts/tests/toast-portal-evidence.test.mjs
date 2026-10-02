import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = path => JSON.parse(readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8'));
test('Portal helper evidence retains immutable invocation/hashes without ordinary leaf credit', () => {
  const ledger = read('parity/toast/portal-ports.json');
  const inventory = read('parity/toast/upstream-inventory.json');
  assert.equal(ledger.upstream.commit, inventory.upstream.commit);
  assert.equal(ledger.evidence.ordinaryDeclarationCredit, 0);
  assert.equal(ledger.helpers.length, 15);
  assert.equal(new Set(ledger.helpers.map(helper => helper.scenario)).size, 15);
  const invocation = inventory.conformanceCalls.find(call => call.source.endsWith('/portal/ToastPortal.test.tsx'));
  assert.equal(ledger.invocation.source, `${invocation.source}:${invocation.line}`);
  assert.deepEqual(ledger.invocation.skip, []);
  assert.deepEqual(ledger.invocation.only, ['propsSpread', 'refForwarding', 'renderProp', 'className']);
  assert.equal(ledger.invocation.refInstanceof, 'HTMLDivElement');
  for (const source of inventory.sources) {
    if (source.source in ledger.sources) assert.equal(ledger.sources[source.source], source.sha256);
  }
  for (const helper of ledger.helpers) {
    const original = inventory.declarations.find(item => item.id === helper.sourceId);
    assert.equal(helper.sourceBodySha256, original.bodySha256);
    assert.deepEqual(helper.assertionLines, original.assertions.map(item => item.line));
    assert.match(helper.sourceCallbackSha256, /^[a-f0-9]{64}$/);
    assert.equal(original.status, 'unported');
    const [file] = helper.sourceId.split(':');
    assert.match(ledger.sources[file], /^[a-f0-9]{64}$/);
  }
  const shared = read('parity/manifest.json');
  assert(!JSON.stringify(shared).includes('ToastPortal.test.tsx'));
});
