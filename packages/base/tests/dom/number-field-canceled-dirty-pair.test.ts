// Exact pin assertion703 pair; actual React package and minimal native composition. Zero original credit.
import { afterEach, expect, it } from 'vitest';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { flushSync, mount, unmount } from 'svelte';
import Native from './NumberFieldCanceledDirty.svelte';
const require = createRequire(resolve(process.cwd(), '../../apps/fixtures/package.json'));
const React = require('react');
const { createRoot } = require('react-dom/client');
const { NumberField } = require('@base-ui/react/number-field');
const reactEnvironment = globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean };
const cleanups: (() => void | Promise<void>)[] = [];
afterEach(async () => {
  for (const cleanup of cleanups.splice(0)) await cleanup();
  document.body.replaceChildren();
});
function host() {
  const node = document.createElement('div');
  document.body.append(node);
  return node;
}
it('actual immutable-package React Increment703 retains100 after canceled dirty sync', async () => {
  expect(require('@base-ui/react/package.json').version).toBe('1.8.0');
  const node = host(),
    root = createRoot(node),
    proposals: unknown[] = [],
    commits: unknown[] = [];
  reactEnvironment.IS_REACT_ACT_ENVIRONMENT = true;
  cleanups.push(async () => {
    await React.act(() => root.unmount());
    delete reactEnvironment.IS_REACT_ACT_ENVIRONMENT;
  });
  await React.act(() =>
    root.render(
      React.createElement(
        NumberField.Root,
        {
          defaultValue: 0,
          onValueChange: (value: unknown, details: { cancel: () => void }) => {
            proposals.push(value);
            details.cancel();
          },
          onValueCommitted: (value: unknown) => commits.push(value),
        },
        React.createElement(NumberField.Increment),
        React.createElement(NumberField.Input),
      ),
    ),
  );
  const input = node.querySelector<HTMLInputElement>('input[type="text"]')!;
  await React.act(() => input.focus());
  await React.act(() => {
    // testing-library fireEvent.change's native setter bypasses React's value tracker.
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, '100');
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await React.act(() =>
    node
      .querySelector('button')!
      .dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })),
  );
  expect(proposals).toEqual([100, 100, 1]);
  expect(input.value).toBe('100');
  expect(commits).toEqual([]);
});
it('actual minimal native Root Increment Input keeps exact pin703 expected100', () => {
  const node = host(),
    proposals: unknown[] = [],
    commits: unknown[] = [];
  const instance = mount(Native, {
    target: node,
    props: {
      onChange: (value: unknown, details: { cancel: () => void }) => {
        proposals.push(value);
        details.cancel();
      },
      onCommit: (value: unknown) => commits.push(value),
    },
  });
  cleanups.push(() => unmount(instance));
  flushSync();
  const input = node.querySelector<HTMLInputElement>('input[type="text"]')!;
  input.focus();
  input.value = '100';
  input.dispatchEvent(new Event('input', { bubbles: true }));
  flushSync();
  node
    .querySelector('button')!
    .dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  flushSync();
  expect(proposals).toEqual([100, 100, 1]);
  expect(input.value).toBe('100');
  expect(commits).toEqual([]);
});
