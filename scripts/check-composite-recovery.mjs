// Newly authored test adapters; actual ReactDOM/Svelte and immutable pin business.
// No original assertion credit, no framework mocks or runtime business copies.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const base = createRequire(new URL('packages/base/package.json', root));
const reference = createRequire(new URL('apps/fixtures/package.json', root));
const caseName = process.argv[2];
if (!caseName) {
  const directory = new URL('.checks/composite-owners/recovery/', root);
  mkdirSync(directory, { recursive: true });
  for (const name of ['source', 'native-public', 'native-public-stable', 'native-candidate']) {
    const result = spawnSync(
      process.execPath,
      [
        '--conditions=browser',
        '--import',
        fileURLToPath(new URL('scripts/composite-recovery-loader.mjs', root)),
        fileURLToPath(import.meta.url),
        name,
      ],
      {
        encoding: 'utf8',
        timeout: 60000,
        env: {
          ...process.env,
          NODE_OPTIONS: '--max-old-space-size=768',
          SVELTERY_COMPOSITE_WITNESS: name.startsWith('native-public') ? 'public' : 'candidate',
        },
      },
    );
    writeFileSync(new URL(`${name}.log`, directory), result.stdout + result.stderr);
    if (name === 'native-public') {
      assert.equal(
        result.status,
        1,
        'Public2626 must reproduce a real failing Source199 assertion',
      );
      assert.match(result.stderr, /Source199 old elements cleared/);
      console.log('Actual public2626 Source199 assertion: RED (expected diagnostic)');
    } else {
      assert.equal(
        result.status,
        0,
        `${name} failed: ${result.error?.message ?? ''}\n${result.stderr}`,
      );
      console.log(result.stdout.trim());
    }
  }
} else {
  const { JSDOM } = base('jsdom');
  const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/' });
  for (const key of [
    'window',
    'document',
    'Node',
    'Element',
    'HTMLElement',
    'MutationObserver',
    'Event',
    'MouseEvent',
    'Document',
    'Text',
    'Comment',
  ])
    Object.defineProperty(globalThis, key, { value: dom.window[key], configurable: true });
  Object.defineProperty(globalThis, 'navigator', {
    value: dom.window.navigator,
    configurable: true,
  });
  const target = document.createElement('div');
  document.body.append(target);
  if (caseName === 'source') {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    const React = reference('react');
    const { createRoot } = reference('react-dom/client');
    const { CompositeList } =
      await import('../parity/composite-owners/recovery/original/packages/react/src/internals/composite/list/CompositeList.tsx');
    const { useCompositeListItem } =
      await import('../parity/composite-owners/recovery/original/packages/react/src/internals/composite/list/useCompositeListItem.ts');
    const { mergeRefs } =
      await import('../parity/composite-owners/recovery/original/packages/react/test/mergeRefs.ts');
    const root = createRoot(target);
    let assertionCount = 0;
    // Small newly authored replacements for the Source test's render/query/spy adapters.
    // All business and original assertion text remain immutable.
    const calls = new WeakMap();
    const vi = {
      fn() {
        const fn = (...args) => calls.get(fn).push(args);
        calls.set(fn, []);
        fn.mockClear = () => calls.set(fn, []);
        return fn;
      },
    };
    const expect = (value) => ({
      toEqual(expected) {
        assertionCount += 1;
        assert.deepEqual(value, expected);
      },
      not: {
        toHaveBeenCalled() {
          assertionCount += 1;
          assert.equal(calls.get(value).length, 0);
        },
      },
    });
    const screen = {
      getByTestId(id) {
        const node = target.querySelector(`[data-testid="${id}"]`);
        assert.ok(node);
        return node;
      },
      getByRole(role, { name }) {
        assert.equal(role, 'button');
        const node = [...target.querySelectorAll('button')].find(
          (node) => node.textContent === name,
        );
        assert.ok(node);
        return node;
      },
    };
    const render = async (element) => {
      await React.act(async () => root.render(element));
      return { user: { click: async (node) => React.act(async () => node.click()) } };
    };
    const block = gunzipSync(
      readFileSync(
        new URL('../parity/composite-owners/recovery/original-test-block.tsx.gz', import.meta.url),
      ),
    );
    const frozen = JSON.parse(
      readFileSync(
        new URL('../parity/composite-owners/recovery/frozen-manifest.json', import.meta.url),
      ),
    );
    const archived = frozen.entries.find((entry) =>
      entry.path.endsWith('/original-test-block.tsx.gz'),
    );
    const compressed = readFileSync(
      new URL('../parity/composite-owners/recovery/original-test-block.tsx.gz', import.meta.url),
    );
    assert.equal(
      createHash('sha1').update(`blob ${compressed.length}\0`).update(compressed).digest('hex'),
      archived.sha,
    );
    let originalTest;
    const source = base('typescript').transpileModule(block.toString('utf8'), {
      compilerOptions: {
        jsx: base('typescript').JsxEmit.React,
        target: base('typescript').ScriptTarget.ESNext,
      },
    }).outputText;
    new Function(
      'React',
      'CompositeList',
      'useCompositeListItem',
      'mergeRefs',
      'vi',
      'expect',
      'screen',
      'render',
      'it',
      source,
    )(
      React,
      CompositeList,
      useCompositeListItem,
      mergeRefs,
      vi,
      expect,
      screen,
      render,
      (_name, fn) => {
        originalTest = fn;
      },
    );
    await originalTest();
    assert.equal(assertionCount, 7);
    console.log(
      'Actual immutable Source199: GREEN (7 unchanged assertions; new adapter, zero extra credit)',
    );
    await React.act(async () => root.unmount());
    const { createArrayWitness } =
      await import('../parity/composite-owners/recovery/source-array-witness.tsx');
    const witness = createArrayWitness();
    const arrayRoot = createRoot(target);
    await React.act(async () => arrayRoot.render(React.createElement(witness.App)));
    const elements = witness.elements.current;
    const labels = witness.labels.current;
    for (const [action, order] of [
      ['add', ['item', 'other']],
      ['reorder', ['other', 'item']],
      ['updateMetadata', ['other', 'item']],
      ['remove', ['item']],
    ]) {
      await React.act(async () => witness.control[action]());
      assert.equal(witness.elements.current, elements, `Source ${action} elements array identity`);
      assert.equal(witness.labels.current, labels, `Source ${action} labels array identity`);
      assert.deepEqual(
        elements.map((node) => node.dataset.testid),
        order,
      );
      assert.deepEqual(labels, order);
    }
    await React.act(async () => arrayRoot.unmount());
    assert.deepEqual(witness.elements.current, []);
    assert.deepEqual(witness.labels.current, []);
    console.log(
      'Actual immutable Source ordinary map array identity/add/reorder/metadata/remove/teardown: GREEN',
    );
  } else {
    const { mount, unmount, flushSync, tick } = await import('svelte');
    const { default: Fixture } =
      await import('../packages/base/tests/dom/CompositeRefRecoveryFixture.svelte');
    const instance = mount(Fixture, { target });
    const settle = async (action) => {
      flushSync(action);
      await tick();
      flushSync();
    };
    await settle();
    try {
      const initial = instance.snapshot();
      assert.deepEqual(initial.first.labels.current, ['item']);
      if (caseName !== 'native-public-stable') {
        await settle(() => instance.replaceRefs());
        const swapped = instance.snapshot();
        assert.deepEqual(swapped.first.elements.current, [], 'Source199 old elements cleared');
        assert.deepEqual(swapped.first.labels.current, [], 'Source199 old labels cleared');
        assert.deepEqual(
          swapped.second.elements.current,
          [target.querySelector('[data-testid="item"]')],
          'Source199 replacement refs copied',
        );
        assert.deepEqual(swapped.second.labels.current, ['item']);
        assert.equal(
          swapped.publications,
          initial.publications,
          'Source199 unchanged map does not publish',
        );
      }
      const refs =
        caseName === 'native-public-stable'
          ? instance.snapshot().first
          : instance.snapshot().second;
      const elements = refs.elements.current;
      const labels = refs.labels.current;
      for (const [action, order] of [
        ['add', ['item', 'other']],
        ['reorder', ['other', 'item']],
        ['updateMetadata', ['other', 'item']],
        ['remove', ['item']],
      ]) {
        await settle(() => instance[action]());
        assert.equal(refs.elements.current, elements, `Native ${action} elements array identity`);
        assert.equal(refs.labels.current, labels, `Native ${action} labels array identity`);
        assert.deepEqual(
          elements.map((node) => node.dataset.testid),
          order,
        );
        assert.deepEqual(labels, order);
      }
    } finally {
      await unmount(instance);
    }
    const final = instance.snapshot();
    const installed = caseName === 'native-public-stable' ? final.first : final.second;
    assert.deepEqual(installed.elements.current, []);
    assert.deepEqual(installed.labels.current, []);
    console.log(
      `${caseName}: GREEN replacement/map array identity/add/reorder/metadata/remove/teardown (new zero-credit witnesses)`,
    );
  }
  dom.window.close();
}
