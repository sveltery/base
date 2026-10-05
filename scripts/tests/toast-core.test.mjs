// Actual core evidence is separate from immutable reference-only preparation credits.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
const require = createRequire(new URL('../../packages/base/package.json', import.meta.url));
const ts = require('typescript');
const repo = new URL('../../', import.meta.url);
const read = path => readFileSync(new URL(path, repo), 'utf8');
const inventory = JSON.parse(read('parity/toast/upstream-inventory.json'));
const prerequisites = JSON.parse(read('parity/toast/prerequisites.json'));
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

test('actual Toast core runs all 25 unchanged full bodies and both metadata helpers', () => {
  for (const entry of prerequisites.cases) {
    const path = entry.test.replace('-prerequisites', '');
    const original = inventory.declarations.find(item => item.id === entry.id);
    let body = bodies(path).results.get(entry.name);
    assert.ok(body, `Missing actual runtime case: ${entry.id}`);
    if (entry.id.endsWith('createToastManager.test.tsx:53')) body = body.replace('createToastManager()', 'Toast.createToastManager()');
    assert.equal(hash(body), original.bodySha256, `Changed actual runtime full body: ${entry.id}`);
    assert.ok(read(path).includes('../src/lib/toast/'));
    assert.ok(!/from ['"].*parity\/toast\//u.test(read(path)), 'No test-only runtime target');
  }
  const { source } = bodies('packages/base/tests/toast-store.test.ts');
  for (const name of ['createStore', 'expectToastMetadataToMatchToasts']) {
    const original = inventory.supportDeclarations.find(item => item.source.endsWith('/toast/store.test.ts') && item.name === name);
    assert.equal(source.statements.find(node => ts.isFunctionDeclaration(node) && node.name.text === name).getText(source), original.text);
  }
  // Every source-derived prerequisite supplement keeps its complete assertions too.
  const supplements = bodies('packages/base/tests/toast-manager-prerequisites.test.ts').results;
  const actual = bodies('packages/base/tests/toast-manager.test.ts').results;
  for (const [name, body] of supplements) assert.equal(actual.get(name), body);
});

test('actual public manager retains the entire data spec and all expected errors', () => {
  const original = inventory.typeSpecs.find(item => item.source.endsWith('/createToastManager.spec.tsx'));
  const actual = read('packages/base/tests/toast-manager.types.ts');
  assert.equal(actual.slice(actual.indexOf('type ToastPayload')), original.text.slice(original.text.indexOf('type ToastPayload')));
  assert.ok(actual.includes('../src/lib/toast/'));
  assert.equal((actual.match(/@ts-expect-error/g) ?? []).length, 4);
});

test('core and public entry imports are SSR-safe and isolated without browser globals', () => {
  const result = spawnSync(process.execPath, ['--import', './scripts/svelte-ssr-loader.mjs', '--input-type=module', '-e', `
    import assert from 'node:assert/strict';
    assert.equal(typeof window, 'undefined');
    assert.equal(typeof document, 'undefined');
    const { createToastManager } = await import('./packages/base/src/lib/toast/index.ts');
    const { ToastStore } = await import('./packages/base/src/lib/toast/store.ts');
    const { createToastFacade } = await import('./packages/base/src/lib/toast/facade.ts');
    const { subscribeToManager } = await import('./packages/base/tests/toast-test-manager.ts');
    for (let request = 0; request < 3; request++) {
      const manager = createToastManager();
      const first = new ToastStore();
      const second = new ToastStore();
      const facade = createToastFacade(first);
      const unsubscribe = subscribeToManager(first, manager);
      assert.notEqual(first.state.toasts, second.state.toasts);
      manager.add({ id: 'ssr', title: 'Request ' + request, timeout: 0 });
      assert.equal(facade.toasts[0].title, 'Request ' + request);
      assert.equal(second.state.toasts.length, 0);
      unsubscribe();
      first.dispose();
      second.addToast({ id: 'independent', timeout: 0 });
      assert.equal(second.state.toasts.length, 1);
      second.dispose();
    }
  `], { cwd: repo, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);
});
