// Actual native shared-renderer source-contract probes; supplemental, no ordinary credit.
import { afterEach, expect, it, vi } from 'vitest';
import { flushSync, mount, unmount, type ComponentProps } from 'svelte';
import { createAttachmentKey } from 'svelte/attachments';
import Fixture from './SharedRenderElementFixture.svelte';
import type { MergedRef } from '../../src/lib/utils/useMergedRefs.js';
const apps: ReturnType<typeof mount>[] = [];
afterEach(async () => {
  for (const app of apps.splice(0)) await unmount(app);
  document.body.replaceChildren();
});
function render(props: ComponentProps<typeof Fixture>) {
  const target = document.createElement('main');
  document.body.append(target);
  const app = mount(Fixture, { target, props });
  apps.push(app);
  flushSync();
  return { target, app, host: () => target.firstElementChild! };
}
it('uses source ordered getter ownership, mapping and component class/style on the actual host', () => {
  const order: string[] = [];
  const state = { active: true };
  const { host } = render({
    tag: 'button',
    params: {
      state,
      stateAttributesMapping: { active: (value) => (value ? { 'data-active': 'mapped' } : null) },
      props: [
        { id: 'before', class: 'internal', onclick: () => order.push('internal') },
        (previous) => ({ ...previous, id: 'after' }),
        { class: 'external', onclick: () => order.push('external') },
      ],
    },
    componentProps: {
      class: (current) => (current.active ? 'active' : 'inactive'),
      style: 'color:red',
    },
  });
  expect(host().id).toBe('after');
  expect(host().getAttribute('data-active')).toBe('mapped');
  expect(host().getAttribute('class')).toBe('active external internal');
  expect((host() as HTMLElement).style.color).toBe('red');
  expect(host().getAttribute('type')).toBe('button');
  host().dispatchEvent(new MouseEvent('click', { bubbles: true }));
  expect(order).toEqual(['external', 'internal']);
});
it('preserves source absent embedded-ref slot memoization across fixed and matching N shapes', () => {
  const cleanup = vi.fn(),
    callback = vi.fn(() => cleanup);
  const { app, host } = render({ params: { ref: callback } });
  const original = host();
  // Fixed [propsRef, null, callback, undefined] and N [propsRef, null, callback, undefined] match.
  app.setParams({ ref: [callback, undefined], props: { class: 'changed' } });
  flushSync();
  expect(host()).toBe(original);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(cleanup).not.toHaveBeenCalled();
  app.setParams({ ref: [callback] });
  flushSync();
  expect(callback).toHaveBeenCalledTimes(2);
  expect(cleanup).toHaveBeenCalledTimes(1);
});
it('lets native attachments observe updated attributes and removed hosts during cleanup', () => {
  const observations: unknown[] = [];
  function observer(label: string): MergedRef<Element> {
    return (node) => {
      if (node)
        return () => observations.push([label, node.isConnected, node.getAttribute('title')]);
    };
  }
  const first = observer('first'),
    second = observer('second');
  const { app } = render({ params: { ref: first, props: { title: 'before' } } });
  app.setParams({ ref: second, props: { title: 'after' } });
  flushSync();
  expect(observations).toEqual([['first', true, 'after']]);
  app.setParams({ enabled: false });
  flushSync();
  expect(observations).toEqual([
    ['first', true, 'after'],
    ['second', false, 'after'],
  ]);
});
it('preserves enumerable native attachments from all source objects and their teardown', async () => {
  const firstKey = createAttachmentKey(),
    secondKey = createAttachmentKey(),
    hiddenKey = createAttachmentKey();
  const firstCleanup = vi.fn(),
    secondCleanup = vi.fn(),
    first = vi.fn(() => firstCleanup),
    second = vi.fn(() => secondCleanup),
    hidden = vi.fn();
  const laterProps = Object.defineProperty({ [secondKey]: second }, hiddenKey, {
    value: hidden,
    enumerable: false,
  });
  const { app, host } = render({ params: { props: [{ [firstKey]: first }, laterProps] } });
  expect(first).toHaveBeenCalledWith(host());
  expect(second).toHaveBeenCalledWith(host());
  expect(hidden).not.toHaveBeenCalled();
  await unmount(app);
  apps.splice(apps.indexOf(app), 1);
  expect(firstCleanup).toHaveBeenCalledTimes(1);
  expect(secondCleanup).toHaveBeenCalledTimes(1);
  expect(hidden).not.toHaveBeenCalled();
});
it('uses native literal input default and reset ownership without a controlled restore layer', () => {
  const { host } = render({ tag: 'input', params: { props: { defaultValue: 'default' } } });
  const input = host() as HTMLInputElement;
  const form = document.createElement('form');
  document.body.append(form);
  form.append(input);
  expect(input.value).toBe('default');
  input.value = 'edited';
  input.dispatchEvent(new Event('input', { bubbles: true }));
  expect(input.value).toBe('edited');
  form.reset();
  expect(input.value).toBe('default');
});
