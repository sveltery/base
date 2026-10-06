// Authored literal renderer characterization; pinned Base UI1.8.0/MIT, zero assertion-port credit.
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { afterEach, expect, it } from 'vitest';
import { flushSync, mount, tick, unmount } from 'svelte';
import Fixture from './NumberFieldFixture.svelte';
import PlainInvalid from './PlainNumberFieldInvalid.svelte';
const require = createRequire(resolve(process.cwd(), '../../apps/fixtures/package.json'));
const React = require('react'),
  { createRoot } = require('react-dom/client');
const { NumberField } = require('@base-ui/react/number-field'),
  { Field } = require('@base-ui/react/field'),
  { Form } = require('@base-ui/react/form');
const cleanups: (() => Promise<void>)[] = [];
afterEach(async () => {
  for (const fn of cleanups.splice(0)) await fn();
  document.body.replaceChildren();
});
const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
for (const framework of ['original', 'native'] as const) {
  it(`supplement literal invalid input-event edit bypassing keydown and later blur: ${framework}`, async () => {
    const host = document.createElement('div');
    document.body.append(host);
    const changes: unknown[] = [],
      commits: { value: number | null; reason: string }[] = [];
    if (framework === 'native') {
      const component = mount(Fixture, {
        target: host,
        props: {
          onChange(value, details) {
            changes.push({ value, reason: details.reason });
          },
          onCommit(value, details) {
            commits.push({ value, reason: details.reason });
          },
        },
      });
      cleanups.push(() => unmount(component));
      flushSync();
    } else {
      const before = Reflect.get(globalThis, 'IS_REACT_ACT_ENVIRONMENT');
      Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', true);
      const root = createRoot(host),
        h = React.createElement;
      cleanups.push(async () => {
        await React.act(async () => root.unmount());
        Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', before);
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
                  onValueChange(value: number | null, details: { reason: string }) {
                    changes.push({ value, reason: details.reason });
                  },
                  onValueCommitted(value: number | null, details: { reason: string }) {
                    commits.push({ value, reason: details.reason });
                  },
                },
                h(NumberField.Input),
              ),
            ),
          ),
        ),
      );
    }
    const settle = async (fn: () => void) => {
      if (framework === 'original') await React.act(async () => fn());
      else {
        fn();
        flushSync();
        await tick();
        flushSync();
      }
    };
    const input = host.querySelector<HTMLInputElement>('input[type="text"]')!,
      numeric = host.querySelector<HTMLInputElement>('input[type="number"]')!,
      form = host.querySelector<HTMLFormElement>('form')!;
    await settle(() => input.focus());
    await settle(() => {
      setter.call(input, 'abc');
      input.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    });
    expect(input.value).toBe(framework === 'original' ? '2' : 'abc');
    expect(numeric.value).toBe('2');
    expect(changes).toEqual([]);
    const beforeBlur = {
      visible: input.value,
      numeric: numeric.value,
      serialized: new FormData(form).get('amount'),
    };
    await settle(() => input.blur());
    expect(input.value).toBe(framework === 'original' ? '2' : 'abc');
    expect(numeric.value).toBe('2');
    expect(changes).toEqual([]);
    expect(commits).toEqual([{ value: 2, reason: 'input-blur' }]);
    console.log(
      JSON.stringify({
        framework,
        edit: 'abc',
        keydownDispatched: false,
        beforeBlur,
        afterBlur: {
          visible: input.value,
          numeric: numeric.value,
          serialized: new FormData(form).get('amount'),
        },
        changes,
        commits,
      }),
    );
  });
}
it('supplement plain Svelte text input retains rejected DOM edit until actual owner update', async () => {
  const host = document.createElement('div');
  document.body.append(host);
  const component = mount(PlainInvalid, { target: host });
  cleanups.push(() => unmount(component));
  flushSync();
  const input = host.querySelector<HTMLInputElement>('input')!;
  input.focus();
  input.value = 'abc';
  input.dispatchEvent(new Event('input', { bubbles: true }));
  flushSync();
  input.blur();
  flushSync();
  await tick();
  expect(input.value).toBe('abc');
  component.setOwner('3');
  flushSync();
  expect(input.value).toBe('3');
  console.log(
    JSON.stringify({
      framework: 'plain-native',
      edit: 'abc',
      afterInputAndBlur: 'abc',
      afterActualOwnerUpdate: input.value,
    }),
  );
});
