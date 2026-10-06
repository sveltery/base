import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';
const require = createRequire(new URL('../../packages/base/package.json', import.meta.url));
const ts = require('typescript');
const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');
const sha = (value) => createHash('sha256').update(value).digest('hex');
const ledger = JSON.parse(read('parity/separator/ports.json'));
test('Separator immutable source bytes, two ordinary declarations and fifteen separate helper records remain traceable', () => {
  assert.equal(ledger.upstream.commit, '47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c');
  assert.equal(ledger.upstream.license, 'MIT');
  assert.match(read('parity/separator/UPSTREAM_LICENSE'), /Copyright \(c\) 2019 Material-UI SAS/);
  for (const [source, hash] of Object.entries(ledger.sources))
    assert.equal(sha(read(`parity/separator/upstream/${source}`)), hash, source);
  assert.equal(ledger.ordinary.length, 2);
  assert.equal(ledger.helpers.length, 15);
  assert.equal(
    ledger.evidence.ordinaryDeclarationCredit,
    ledger.ordinary.filter((item) => item.status === 'passing').length,
  );
  if (ledger.evidence.ordinaryDeclarationCredit) {
    assert.match(ledger.evidence.testedCommit, /^[a-f0-9]{40}$/);
    assert.equal(
      ledger.evidence.workflowRun,
      'https://github.com/sveltery/base/actions/runs/36978100619',
    );
    assert.equal(ledger.evidence.browserJob, 110746256952);
  }
  const browser = read(ledger.evidence.browser);
  assert.doesNotMatch(browser, /(?:test|describe)\.(?:skip|fixme|only)\s*\(/);
  for (const item of [...ledger.ordinary, ...ledger.helpers]) {
    const [source, line] = item.sourceId.split(':');
    const text = read(`parity/separator/upstream/${source}`);
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
    assert.equal(
      sha(declaration.arguments[1].body.getText(tree)),
      item.sourceBodySha256,
      item.sourceId,
    );
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
        'ported-pending-verification',
        'passing',
        'passing-secured-browser-uncredited',
        'verified-hosted-uncredited',
      ].includes(item.status),
    );
    if (item.scenarios)
      for (const path of [item.port, ...item.fixtures])
        assert.ok(existsSync(new URL(`../../${path}`, import.meta.url)), path);
    else assert.ok(browser.includes(`['${item.scenario}'`), item.scenario);
  }
  assert.ok(browser.includes('[S:14]'));
  assert.ok(browser.includes('[S:21]'));
});
