import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
import { execFileSync } from 'node:child_process';
const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');
test('Button ports retain complete direct declarations and selected non-composite support assertions', () => {
  const trace = JSON.parse(read('parity/button/upstream-inventory.json'));
  const ledger = JSON.parse(read('parity/button/ports.json'));
  assert.deepEqual(ledger.upstream, trace.upstream);
  assert.equal(trace.upstream.commit, '47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c');
  const direct = trace.declarations.filter((item) => item.source.includes('/button/Button.'));
  assert.equal(direct.length, 9);
  assert.equal(ledger.ports.length, 15);
  const browser = read('tests/browser/button.spec.ts');
  assert.doesNotMatch(browser, /(?:test|describe)\.(?:skip|fixme|only)\s*\(/);
  for (const port of ledger.ports) {
    const source = trace.declarations.find((item) => item.id === port.sourceId);
    assert.ok(source, port.sourceId);
    assert.equal(port.sourceBodySha256, source.bodySha256);
    assert.deepEqual(
      port.assertionLines,
      source.assertions.map((item) => item.line),
    );
    assert.equal(source.status, 'unported');
    assert.equal(source.port, null);
    assert.ok(
      browser.includes(
        `['${source.source.includes('/button/Button.') ? 'B' : 'U'}', ${source.line}, '${port.scenario}']`,
      ),
    );
    for (const path of [port.port, ...port.fixtures])
      assert.ok(existsSync(new URL(`../../${path}`, import.meta.url)), path);
    assert.ok(['ported-pending-verification', 'passing'].includes(port.status));
    if (port.status === 'passing') {
      assert.match(port.evidence.testedCommit, /^[0-9a-f]{40}$/);
      assert.match(
        port.evidence.workflowRun,
        /^https:\/\/github\.com\/sveltery\/base\/actions\/runs\/\d+$/,
      );
      assert.ok(Number.isSafeInteger(port.evidence.browserJob));
    }
  }
  for (const source of direct) assert.ok(ledger.ports.some((item) => item.sourceId === source.id));
  assert.ok(trace.declarations.some((item) => item.expression === 'it.skipIf(isJSDOM)'));
  // Standalone ledger avoids changing shared aggregate claims while Toast advances.
  const shared = JSON.parse(read('parity/manifest.json'));
  assert.ok(!shared.cases.some((item) => item.source.includes('/button/Button.')));
});

test('Button graph retains the original source pin and hashes the actual canonical closure', () => {
  const result = execFileSync(
    process.execPath,
    [new URL('../../parity/button/graph.mjs', import.meta.url).pathname, '--check'],
    { encoding: 'utf8' },
  );
  assert.match(result, /30 immutable source modules \/ 27 actual used local modules/);
});
