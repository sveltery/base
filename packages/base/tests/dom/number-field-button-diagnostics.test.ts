// Paired actual source/native DEV diagnostics through NumberField, zero ordinary credit.
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { afterEach, expect, it, vi } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import { reset } from '../../src/lib/utils/error.js';
import Fixture from './NumberFieldButtonDiagnostics.svelte';

const require = createRequire(resolve(process.cwd(), '../../apps/fixtures/package.json'));
const React = require('react');
const { createRoot } = require('react-dom/client');
const { NumberField } = require('@base-ui/react/number-field');
const { Field } = require('@base-ui/react/field');
const { Form } = require('@base-ui/react/form');
const cleanups: (() => Promise<void>)[] = [];
const messages = {
  native: 'Base UI: A component that acts as a button expected a native <button> because the `nativeButton` prop is true. Rendering a non-<button> removes native button semantics, which can impact forms and accessibility. Use a real <button> in the `render` prop, or set `nativeButton` to `false`.',
  nonNative: 'Base UI: A component that acts as a button expected a non-<button> because the `nativeButton` prop is false. Rendering a <button> keeps native behavior while Base UI applies non-native attributes and handlers, which can add unintended extra attributes (such as `role` or `aria-disabled`). Use a non-<button> in the `render` prop, or set `nativeButton` to `true`.',
};

afterEach(async () => {
  for (const cleanup of cleanups.splice(0)) await cleanup();
  vi.restoreAllMocks();
  reset();
  document.body.replaceChildren();
});

for (const framework of ['original', 'native'] as const) {
  for (const nativeButton of [true, false]) {
    for (const renderButton of [true, false]) {
      it(`supplement ${framework} NumberField nativeButton=${nativeButton} actual button=${renderButton} keeps complete DEV diagnostic and numeric caller`, async () => {
        const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
        const host = document.createElement('div');
        document.body.append(host);
        if (framework === 'native') {
          const component = mount(Fixture, { target: host, props: { nativeButton, renderButton } });
          cleanups.push(() => unmount(component));
          flushSync();
        } else {
          const previousActEnvironment = Reflect.get(globalThis, 'IS_REACT_ACT_ENVIRONMENT');
          Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', true);
          const root = createRoot(host);
          const h = React.createElement;
          cleanups.push(async () => {
            await React.act(async () => root.unmount());
            Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', previousActEnvironment);
          });
          await React.act(async () => root.render(h(Form, null,
            h(Field.Root, { name: 'amount' }, h(Field.Label, null, 'Amount'),
              h(NumberField.Root, { defaultValue: 2, locale: 'en-US' },
                h(NumberField.Input),
                h(NumberField.Increment, { nativeButton, render: renderButton ? undefined : h('span') }, 'Increase'))))));
        }
        const diagnostics = errors.mock.calls.map(args => String(args[0])).filter(message => message.startsWith('Base UI: A component that acts as a button'));
        if (nativeButton === renderButton) expect(diagnostics).toEqual([]);
        else {
          expect(diagnostics).toHaveLength(1);
          const expected = nativeButton ? messages.native : messages.nonNative;
          // React may append its native owner stack. Svelte has no React owner stack.
          if (framework === 'original') expect(diagnostics[0]?.startsWith(expected)).toBe(true);
          else expect(diagnostics).toEqual([expected]);
        }
        const button = host.querySelector<HTMLElement>('[aria-label="Increase"]')!;
        expect(button.tagName).toBe(renderButton ? 'BUTTON' : 'SPAN');
        if (framework === 'original') await React.act(async () => button.click());
        else { button.click(); flushSync(); }
        expect(host.querySelector<HTMLInputElement>('input[type="number"]')!.value).toBe('3');
      });
    }
  }
}
