import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';
const require = createRequire(new URL('../../packages/base/package.json', import.meta.url));
const ts = require('typescript');
const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');
const sha = (value) => createHash('sha256').update(value).digest('hex');
const inventory = JSON.parse(read('parity/input/upstream-inventory.json'));
const ledger = JSON.parse(read('parity/input/conformance.json'));
const nativeDefaults = JSON.parse(read('parity/input/native-defaults/provenance.json'));
// Historical evidence remains byte-exact; current native suites are separate executions.
function historicalRead(path, hash) {
  const snapshot = nativeDefaults.historicalRecords.find(
    (record) => record.originalFile === path && record.sha256 === hash,
  );
  return read(snapshot?.historicalFile ?? path);
}
test('Input accepted reset limitation keeps its narrow decision, negative assertions and zero credit visible', () => {
  const evidence = JSON.parse(read('parity/input/reset-limit/evidence.json'));
  const decision = JSON.parse(read('parity/input/reset-limit/decision.json'));
  assert.equal(evidence.kind, 'accepted-unsupported-characterization');
  assert.equal(decision.status, 'user-approved-narrow-unsupported-boundary');
  assert.equal(decision.difference_id, 'I-04');
  assert.equal(decision.source_thread, '01a0f8d2-3e91-7455-b184-d3a30c452008');
  assert.equal(decision.assistant_message_id, 'Sentinel_64f8098c2d348191823aa010844ef6bf');
  assert.equal(decision.user_message_id, 'Sentinel_fa42654e8f8c81918a530c2685f8df87');
  assert.equal(decision.user_message_text, 'Svelte native is ok');
  assert.equal(decision.user_message_timestamp_utc, '2026-10-02T16:40:55Z');
  assert.equal(decision.runtime_changed, false);
  assert.equal(evidence.runtime.unchanged, true);
  assert.deepEqual(evidence.credits, { ordinary_input: 0, field: 0 });
  for (const [path, hash] of Object.entries(evidence.hashes))
    assert.equal(sha(historicalRead(path, hash)), hash, path);
  assert.equal(evidence.focused.total, 36);
  assert.equal(evidence.focused.passing, 32);
  assert.equal(evidence.focused.expected_failures, 4);
  assert.equal(evidence.focused.unexpected_failures, 0);
  const results = JSON.parse(read(evidence.focused.results));
  assert.equal(results.length, 36);
  assert.equal(results.filter((result) => result.approvedUnsupported).length, 4);
  for (const result of results) {
    assert.equal(result.immediate, result.expectedImmediate);
    if (result.approvedUnsupported) {
      assert.equal(result.native, false);
      assert.equal(result.cancel, false);
      assert.ok(result.stop === true || result.stop === 'propagation');
      assert.ok(result.move === 'out' || result.move === 'in');
      assert.notEqual(result.settled, result.expectedSettled);
    } else assert.equal(result.settled, result.expectedSettled);
  }
  const port = historicalRead(evidence.focused.test, evidence.hashes[evidence.focused.test]);
  assert.match(port, /approvedUnsupported \? it\.fails : it/);
  assert.match(port, /expect\(input\.value\)\.toBe\(successful \? 'seed' : 'edit'\)/);
  assert.match(
    port,
    /expect\(input\.value\)\.toBe\(successful \? 'seed' : native \? 'edit' : 'owner'\)/,
  );
  assert.doesNotMatch(port, /(?:it|test|describe)\.(?:skip|only|todo)\s*\(/);
  assert.match(
    read('docs/upstream-differences.md'),
    /## I-04: accepted stopped imperative reset reassociation limit/,
  );
});
test('Input source bytes and fifteen separate helper mappings retain zero ordinary declaration credit', () => {
  assert.equal(inventory.upstream.commit, '47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c');
  assert.equal(inventory.upstream.license, 'MIT');
  assert.match(read('parity/input/UPSTREAM_LICENSE'), /Copyright \(c\) 2019 Material-UI SAS/);
  for (const [source, hash] of Object.entries(inventory.sources))
    assert.equal(sha(read(`parity/input/upstream/${source}`)), hash, source);
  assert.equal(inventory.ordinaryDeclarationCount, 0);
  assert.equal(inventory.creditedOrdinaryPorts, 0);
  assert.equal(ledger.helpers.length, 15);
  assert.equal(ledger.invocation.refInstanceof, 'HTMLInputElement');
  assert.equal(ledger.invocation.testRenderPropWith, 'div');
  assert.equal(ledger.invocation.wrappingAllowed, true);
  assert.equal(ledger.invocation.button, false);
  assert.deepEqual(ledger.invocation.skip, []);
  assert.doesNotMatch(
    read('parity/input/upstream/packages/react/src/input/Input.test.tsx'),
    /\b(?:it|test)\s*\(/,
  );
  for (const item of ledger.helpers) {
    const [source, line] = item.sourceId.split(':');
    const text = read(`parity/input/upstream/${source}`);
    const tree = ts.createSourceFile(source, text, ts.ScriptTarget.Latest, true);
    let declaration;
    function visit(node) {
      if (
        ts.isCallExpression(node) &&
        node.expression.getText(tree) === 'it' &&
        tree.getLineAndCharacterOfPosition(node.getStart(tree)).line + 1 === Number(line)
      )
        declaration = node;
      ts.forEachChild(node, visit);
    }
    visit(tree);
    assert.ok(declaration, item.sourceId);
    assert.equal(sha(declaration.arguments[1].body.getText(tree)), item.sourceBodySha256);
    assert.equal(sha(declaration.arguments[1].getText(tree)), item.sourceCallbackSha256);
    const assertionLines = [];
    function assertions(node) {
      if (
        ts.isCallExpression(node) &&
        ts.isPropertyAccessExpression(node.expression) &&
        node.expression.getText(tree).startsWith('expect(')
      )
        assertionLines.push(tree.getLineAndCharacterOfPosition(node.getStart(tree)).line + 1);
      ts.forEachChild(node, assertions);
    }
    assertions(declaration);
    assert.deepEqual(assertionLines, item.assertionLines, item.sourceId);
    assert.ok(
      [
        'ported-pending-browser-verification-uncredited',
        'passing-secured-browser-uncredited',
      ].includes(item.status),
    );
    for (const path of [item.port, ...item.fixtures])
      assert.ok(existsSync(new URL(`../../${path}`, import.meta.url)), path);
    assert.ok(read(item.port).includes(`'${item.scenario}'`), item.scenario);
  }
});
test('Input supplemental native reset and real remote evidence cannot silently claim Field conformance', () => {
  const remote = read('apps/fixtures/src/routes/input-remote/+page.svelte');
  assert.match(remote, /\.fields\.email\.as\('email', 'seed@example\.com'\)/);
  assert.match(remote, /<input/);
  assert.match(remote, /<Input/);
  const baseline = JSON.parse(read('parity/input/reset-baseline.json'));
  assert.equal(baseline.versions.kit, '2.70.3');
  assert.equal(baseline.observations[0].React.afterReset, 'owner');
  assert.equal(baseline.observations[0].Svelte.afterReset, '');
  for (const file of ['input.spec.ts', 'input-conformance.spec.ts', 'input-remote.spec.ts'])
    assert.doesNotMatch(
      read(`tests/browser/${file}`),
      /(?:test|describe)\.(?:skip|fixme|only)\s*\(/,
    );
});
test('Input timing characterization preserves hashed raw phase observations and the explicit native decision', () => {
  const evidence = JSON.parse(read('parity/input/timing/evidence.json'));
  assert.equal(evidence.upstreamCommit, inventory.upstream.commit);
  assert.equal(evidence.decision.status, 'accepted');
  for (const [source, hash] of Object.entries(evidence.sources))
    assert.equal(sha(historicalRead(source, hash)), hash, source);
  assert.equal(
    sha(read(`parity/input/timing/${evidence.localRun.results}`)),
    evidence.localRun.resultsSha256,
  );
  assert.equal(
    sha(read(`parity/input/timing/${evidence.ownedWrapperPrototype.baseline}`)),
    evidence.ownedWrapperPrototype.baselineSha256,
  );
  assert.equal(
    sha(read(`parity/input/timing/${evidence.ownedWrapperPrototype.diff}`)),
    evidence.ownedWrapperPrototype.diffSha256,
  );
  const results = JSON.parse(read('parity/input/timing/dom-results.json'));
  assert.equal(results.length, 24);
  assert.deepEqual(
    new Set(results.map((result) => result.framework)),
    new Set([
      'react',
      'input',
      'native-value',
      'native-bind',
      'native-bind-accessor',
      'input-final-wrapper',
      'input-owned-final-wrapper',
    ]),
  );
  for (const result of results) {
    assert.equal(result.immediate.at(-1).stage, 'dispatch:return');
    assert.equal(result.settled[0].stage, 'after:tick');
    for (const observation of [...result.immediate, ...result.settled])
      assert.equal(observation.formData, observation.value);
  }
  assert.doesNotMatch(
    read(evidence.browserRun.test),
    /(?:test|describe)\.(?:skip|fixme|only)\s*\(/,
  );
  assert.equal(inventory.creditedOrdinaryPorts, 0);
});

test('Current Input native-default source suites retain historical assertions without active failure waivers', () => {
  for (const record of nativeDefaults.historicalRecords)
    assert.equal(sha(read(record.historicalFile)), record.sha256);
  assert.equal(nativeDefaults.retainedHistoricalExpectedFailureWitnesses, 4);
  assert.equal(nativeDefaults.currentExpectedFailureExemptions, 0);
  const current = read('packages/base/tests/dom/input-reset-limit.test.ts');
  assert.doesNotMatch(current, /(?:it|test)\.(?:fails|skip|only|todo)/);
  assert.match(current, /for \(const native of \[false, true\]\)/);
  assert.match(current, /expect\(observations\[0\]\)\.toEqual\(observations\[1\]\)/);
  assert.match(read('packages/base/src/lib/input/Input.svelte'), /<FieldControl/);
  assert.equal(nativeDefaults.ordinaryCredit, 0);
});
