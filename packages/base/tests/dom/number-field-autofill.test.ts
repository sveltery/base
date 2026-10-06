// Authored literal renderer/FormData characterization, not an Original assertion port.
// Original component authority: Base UI 1.8.0, 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c (MIT).
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { afterEach, expect, it } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import type { NumberFieldRootChangeEventDetails } from '../../src/lib/number-field/types.js';
import Fixture from './NumberFieldFixture.svelte';
import PlainNumberFieldAutofill from './PlainNumberFieldAutofill.svelte';

const require = createRequire(resolve(process.cwd(), '../../apps/fixtures/package.json'));
const React = require('react');
const { createRoot } = require('react-dom/client');
const { NumberField } = require('@base-ui/react/number-field');
const { Field } = require('@base-ui/react/field');
const { Form } = require('@base-ui/react/form');
const cleanups: (() => Promise<void>)[] = [];

afterEach(async () => {
  for (const cleanup of cleanups.splice(0)) await cleanup();
  document.body.replaceChildren();
});

for (const framework of ['original', 'native'] as const) {
  for (const mode of ['cancel', 'controlled-reject'] as const) {
    it(`supplement literal ${framework} rejected hidden autofill (${mode}) keeps its renderer and FormData values`, async () => {
      const host = document.createElement('div');
      document.body.append(host);
      const calls: { value: number | null; reason: string }[] = [];
      if (framework === 'native') {
        const component = mount(Fixture, {
          target: host,
          props: {
            cancel: mode === 'cancel',
            controlled: mode === 'controlled-reject',
            reject: true,
            onChange(value, details) {
              calls.push({ value, reason: details.reason });
            },
          },
        });
        cleanups.push(() => unmount(component));
        flushSync();
      } else {
        const previousActEnvironment = Reflect.get(globalThis, 'IS_REACT_ACT_ENVIRONMENT');
        Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', true);
        const root = createRoot(host),
          h = React.createElement;
        cleanups.push(async () => {
          await React.act(async () => root.unmount());
          Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', previousActEnvironment);
        });
        await React.act(async () =>
          root.render(
            h(
              Form,
              null,
              h(
                Field.Root,
                { name: 'amount' },
                h(
                  NumberField.Root,
                  {
                    defaultValue: 2,
                    value: mode === 'controlled-reject' ? 2 : undefined,
                    onValueChange(
                      value: number | null,
                      details: NumberFieldRootChangeEventDetails,
                    ) {
                      calls.push({ value, reason: details.reason });
                      if (mode === 'cancel') details.cancel();
                    },
                  },
                  h(NumberField.Input),
                  h(NumberField.Increment, null, 'Increase'),
                ),
              ),
            ),
          ),
        );
      }
      const hidden = host.querySelector<HTMLInputElement>('input[type="number"]')!;
      const visible = host.querySelector<HTMLInputElement>('input[type="text"]')!;
      const form = host.querySelector<HTMLFormElement>('form')!;
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
      const dispatch = () => {
        setter.call(hidden, '8');
        hidden.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
      };
      if (framework === 'original') await React.act(async () => dispatch());
      else {
        dispatch();
        flushSync();
      }
      expect(calls).toEqual([{ value: 8, reason: 'none' }]);
      const observation = {
        framework,
        mode,
        hidden: hidden.value,
        visible: visible.value,
        serialized: new FormData(form).get('amount'),
        calls,
      };
      // Literal Svelte input writes differ from React controlled-input restoration.
      expect(observation).toMatchObject({
        hidden: framework === 'original' ? '2' : '8',
        visible: '2',
        serialized: framework === 'original' ? '2' : '8',
      });
      console.log(JSON.stringify(observation));
    });
  }
}

for (const prevent of [false, true]) {
  it(`supplement plain native Svelte numeric DOM/FormData waits for an actual owner update (preventDefault=${prevent})`, () => {
    const host = document.createElement('div');
    document.body.append(host);
    const component = mount(PlainNumberFieldAutofill, { target: host, props: { prevent } });
    cleanups.push(() => unmount(component));
    flushSync();
    const input = host.querySelector<HTMLInputElement>('input')!;
    const form = host.querySelector<HTMLFormElement>('form')!;
    input.value = '8';
    input.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    flushSync();
    expect(input.value).toBe('8');
    expect(new FormData(form).get('amount')).toBe('8');
    console.log(
      JSON.stringify({
        framework: 'plain-native',
        prevent,
        hidden: input.value,
        serialized: new FormData(form).get('amount'),
      }),
    );
    component.setOwner(3);
    flushSync();
    expect(input.value).toBe('3');
    expect(new FormData(form).get('amount')).toBe('3');
  });
}
