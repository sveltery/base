// Tests protect complete reference assertions; reference execution earns zero Sveltery port credit.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import test from 'node:test';
const require = createRequire(new URL('../../packages/base/package.json', import.meta.url));
const ts = require('typescript');
const repo = new URL('../../', import.meta.url);
const read = path => readFileSync(new URL(path, repo), 'utf8');
const inventory = JSON.parse(read('parity/toast/upstream-inventory.json'));
const ledger = JSON.parse(read('parity/toast/prerequisites.json'));
const hash = text => createHash('sha256').update(text).digest('hex');
function bodies(path) {
  const source = ts.createSourceFile(path, read(path), ts.ScriptTarget.Latest, true);
  const results = new Map();
  function visit(node) {
    if (ts.isCallExpression(node) && node.expression.getText(source) === 'it' && ts.isStringLiteralLike(node.arguments[0])) {
      const callback = node.arguments.find(ts.isArrowFunction);
      if (callback) results.set(node.arguments[0].text, callback.body.getText(source));
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  return { source, results };
}

test('Toast provenance placeholders stay immutable and parameterized swipe variants remain explicit', () => {
  assert.equal(inventory.upstream.commit, '47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c');
  assert.deepEqual(inventory.totals, { toastDeclarations: 196, toastVariantRecords: 199, conformanceHelperDeclarations: 15, typeSpecFiles: 2 });
  assert.equal(new Set(inventory.declarations.map(item => item.id)).size, inventory.declarations.length);
  assert.ok(inventory.declarations.every(item => item.status === 'unported' && item.port === null));
  assert.ok(inventory.typeSpecs.every(item => item.status === 'unported' && item.port === null));
  const realSwipe = inventory.declarations.find(item => item.title === 'dismisses with a real %s pointer swipe');
  assert.equal(realSwipe.variants.length, 4);
  assert.ok(realSwipe.upstreamGuards.some(guard => guard === 'describe.skipIf(isJSDOM)'));
});

test('every reference prerequisite retains the complete source body, assertions and metadata helpers', () => {
  assert.equal(ledger.executionTarget, 'pinned-upstream-reference-adaptation-only');
  assert.equal(ledger.svelteryRuntimePortCredit, 0);
  assert.equal(ledger.cases.length, 25);
  for (const entry of ledger.cases) {
    const upstream = inventory.declarations.find(item => item.id === entry.id);
    assert.ok(upstream);
    assert.equal(entry.sourceBodySha256, upstream.bodySha256);
    assert.deepEqual(entry.assertionLines, upstream.assertions.map(item => item.line));
    const body = bodies(entry.test).results.get(entry.name);
    assert.ok(body, `Missing complete case: ${entry.id}`);
    const normalized = entry.id.endsWith('createToastManager.test.tsx:53') ? body.replace('createToastManager()', 'Toast.createToastManager()') : body;
    assert.equal(hash(normalized), upstream.bodySha256, `Changed full body: ${entry.id}`);
  }
  const { source } = bodies('packages/base/tests/toast-store-prerequisites.test.ts');
  const functions = source.statements.filter(ts.isFunctionDeclaration);
  for (const name of ['createStore', 'expectToastMetadataToMatchToasts']) {
    const original = inventory.supportDeclarations.find(item => item.source.endsWith('/toast/store.test.ts') && item.name === name);
    assert.equal(functions.find(item => item.name.text === name).getText(source), original.text);
  }
});

test('complete manager data type prerequisite retains every positive and negative assertion', () => {
  const entry = ledger.typeSpecs[0];
  const original = inventory.typeSpecs.find(item => item.source === entry.source);
  assert.equal(entry.sourceSha256, original.sha256);
  const originalBody = original.text.slice(original.text.indexOf('type ToastPayload'));
  const adapted = read(entry.test);
  assert.equal(adapted.slice(adapted.indexOf('type ToastPayload')), originalBody);
  assert.equal((adapted.match(/@ts-expect-error/g) ?? []).length, 4);
  assert.equal((adapted.match(/expectType</g) ?? []).length, 4);
});
