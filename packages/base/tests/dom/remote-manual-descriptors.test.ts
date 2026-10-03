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
  const input = target.querySelector<HTMLInputElement>('input')!;
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

it('authored radio renders keep selection with the actual Group and omit checkbox-only visible-host props', async () => {
  const listeners = vi.spyOn(EventTarget.prototype, 'addEventListener');
  const view = render({ mode: 'radio', initial: { choice: 3 } });
  const first = view.target.querySelector<HTMLElement>('[data-option="3"]')!;
  const second = view.target.querySelector<HTMLElement>('[data-option="4"]')!;
  expect(first.getAttribute('aria-checked')).toBe('true');
  expect(first.getAttribute('data-render-checked')).toBe('true');
  for (const root of [first, second]) {
    expect(root.hasAttribute('checked')).toBe(false);
    expect(root.hasAttribute('defaultchecked')).toBe(false);
    expect('defaultChecked' in root).toBe(false);
  }
  expect(listeners.mock.calls.some(([type]) => type === 'CheckedChange')).toBe(false);
  expect([...new FormData(view.form)]).toEqual([['n:choice', '3']]);
  view.component.ownerSet({ choice: 4 }); flushSync();
  expect(first.getAttribute('aria-checked')).toBe('false');
  expect(second.getAttribute('aria-checked')).toBe('true');
  expect([...new FormData(view.form)]).toEqual([['n:choice', '4']]);
  first.click(); await tick();
  expect(view.read('owner')).toEqual({ choice: 3 });
  expect(view.read('changes')).toEqual([3]);
  expect([...new FormData(view.form)]).toEqual([['n:choice', '3']]);
});

it.each([{}, { choices: [] }, { choices: ['a'] }])('actual Kit manual array option preserves whole-array registration for %j', (initial) => {
  const values: unknown[] = [], view = render({ mode: 'array', initial, submitted: (value) => values.push(value) });
  view.form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); flushSync();
  expect(values).toEqual([{ choices: initial.choices ?? [] }]);
  expect(view.input.name).toBe('choices[]');
  expect(view.target.querySelector('[role="checkbox"]')).toBeNull();
});

it.each(['group', 'nested'] as const)('remote styled %s placement serializes the constant option before its one native input, with authored cancellation intact', async (mode) => {
  const view = render({ mode });
  expect(view.input.value).toBe('a');
  view.input.click(); await tick();
  expect(view.read('owner')).toEqual({ choices: ['a'] });
  expect(view.read('changes')).toEqual([['a']]);
  expect(view.read('phase')).toEqual([{ value: 'a', checked: true, successfulValues: [['choices[]', 'a']] }]);
  view.input.click(); await tick();
  expect(view.read('owner')).toEqual({ choices: [] });
  expect([...new FormData(view.form)]).toEqual([]);
  expect(view.read('phase')).toHaveLength(2);

  const canceled = render({ mode, cancel: true });
  canceled.input.click(); await tick();
  expect(canceled.input.checked).toBe(false);
  expect(canceled.read('owner')).toEqual({});
  expect(canceled.read('phase')).toEqual([]);
  expect(canceled.read('changes')).toEqual([['a']]);
});
