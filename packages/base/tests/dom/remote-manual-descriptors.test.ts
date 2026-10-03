import { afterEach, expect, it, vi } from 'vitest';
import { flushSync, mount, tick, unmount, type ComponentProps } from 'svelte';
import Fixture from './RemoteManualDescriptorFixture.svelte';

const disposals: (() => Promise<void>)[] = [];
afterEach(async () => {
  for (const dispose of disposals.splice(0)) await dispose();
  document.body.replaceChildren(); vi.restoreAllMocks();
});
function render(props: ComponentProps<typeof Fixture>) {
  const target = document.createElement('div'); document.body.append(target);
  const component = mount(Fixture, { target, props }); flushSync();
  disposals.push(() => unmount(component));
  const form = target.querySelector('form')!;
  const input = target.querySelector<HTMLInputElement>('input[type="checkbox"]')!;
  const read = (name: string) => JSON.parse(target.querySelector(`[data-${name}]`)!.textContent!);
  return { target, component, form, input, read };
}

it('actual Kit manual boolean descriptor stays controlled through initially undefined/set/activation', async () => {
  const warn = vi.spyOn(console, 'error').mockImplementation(() => {});
  const view = render({ mode: 'boolean' });
  expect(view.input.checked).toBe(false);
  view.component.ownerSet({ enabled: true }); flushSync();
  expect(view.input.checked).toBe(true);
  view.component.ownerSet({ enabled: false }); flushSync();
  expect(view.input.checked).toBe(false);
  view.input.click(); await tick();
  expect(view.read('phase')).toEqual([{ value: 'on', checked: true, successfulValues: [['b:enabled', 'on']] }]);
  expect(warn).not.toHaveBeenCalled();
});

it.each([{}, { choices: [] }, { choices: ['a'] }])('actual Kit manual array option preserves whole-array registration for %j', (initial) => {
  const values: unknown[] = [], view = render({ mode: 'array', initial, submitted: (value) => values.push(value) });
  view.form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); flushSync();
  expect(values).toEqual([{ choices: initial.choices ?? [] }]);
  expect(view.input.name).toBe('choices[]');
  expect(view.target.querySelector('[role="checkbox"]')).toBeNull();
});

it('remote styled group serializes the constant option before its one native input, with authored cancellation intact', async () => {
  const view = render({ mode: 'group' });
  expect(view.input.value).toBe('a');
  view.input.click(); await tick();
  expect(view.read('owner')).toEqual({ choices: ['a'] });
  expect(view.read('changes')).toEqual([['a']]);
  expect(view.read('phase')).toEqual([{ value: 'a', checked: true, successfulValues: [['choices[]', 'a']] }]);
  view.input.click(); await tick();
  expect(view.read('owner')).toEqual({ choices: [] });
  expect([...new FormData(view.form)]).toEqual([]);
  expect(view.read('phase')).toHaveLength(2);

  const canceled = render({ mode: 'group', cancel: true });
  canceled.input.click(); await tick();
  expect(canceled.input.checked).toBe(false);
  expect(canceled.read('owner')).toEqual({});
  expect(canceled.read('phase')).toEqual([]);
  expect(canceled.read('changes')).toEqual([['a']]);
});
