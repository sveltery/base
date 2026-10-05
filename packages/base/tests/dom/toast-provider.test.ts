// Assertion ports from mui/base-ui at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT, see ../../THIRD_PARTY_NOTICES.md.
import { afterEach, expect, it, vi } from 'vitest';
import { flushSync, mount, tick, unmount, type ComponentProps } from 'svelte';
import Fixture from './ToastProviderFixture.svelte';
import { createToastManager } from '../../src/lib/toast/createToastManager';
import type { ToastProviderContext } from '../../src/lib/toast/context';

const components: ReturnType<typeof mount>[] = [];
function setup(props: ComponentProps<typeof Fixture> = {}) {
  const target = document.createElement('section');
  document.body.append(target);
  const component = mount(Fixture, { target, props });
  components.push(component);
  flushSync();
  return { component, target };
}
afterEach(async () => {
  for (const component of components.splice(0)) await unmount(component);
  document.body.replaceChildren();
  vi.useRealTimers();
});

// ToastProvider.test.tsx:14. Adapter: Svelte pre effects replace descendant layout effects;
// configure batches committed inputs; fake-clock boundaries and all assertions are retained.
it('syncs a changed timeout before descendant layout effects', async () => {
  vi.useFakeTimers();
  const onClose = vi.fn();
  const { component } = setup({ onClose });
  component.configure({ timeout: 1000, active: true });
  flushSync();
  vi.advanceTimersByTime(999);
  await tick();
  expect(onClose).not.toHaveBeenCalled();
  vi.advanceTimersByTime(2);
  await tick();
  expect(onClose).toHaveBeenCalledTimes(1);
});

// ToastProvider.test.tsx:50. Separate Add/Observe descendants preserve sibling effect order.
it('syncs a changed limit before descendant layout effects', () => {
  const observeToasts = vi.fn();
  const { component } = setup({ scenario: 'limit', observe: observeToasts });
  component.configure({ limit: 1, active: true });
  flushSync();
  expect(observeToasts).toHaveBeenCalledWith([
    { id: 'second', limited: false },
    { id: 'first', limited: true },
  ]);
});

it('syncs options before a newly mounted child adds and keeps one stable facade', async () => {
  vi.useFakeTimers();
  const onClose = vi.fn();
  let context!: ToastProviderContext;
  const { component } = setup({ scenario: 'mount', onClose, capture: (value) => { context = value; } });
  const original = context;
  component.configure({ showChild: false });
  flushSync();
  component.configure({ timeout: 1000, limit: 1, active: true, showChild: true });
  flushSync();
  expect(context).toBe(original);
  expect(context.manager).toBe(original.manager);
  expect(context.store.state.timeout).toBe(1000);
  expect(context.store.state.limit).toBe(1);
  expect(context.manager.toasts.map((toast) => toast.id)).toEqual(['toast']);
  vi.advanceTimersByTime(999);
  await tick();
  expect(onClose).not.toHaveBeenCalled();
  vi.advanceTimersByTime(2);
  await tick();
  expect(onClose).toHaveBeenCalledTimes(1);
});

it('isolates Provider facades and manager replacement and disposes subscriptions and timers', async () => {
  vi.useFakeTimers();
  const shared = createToastManager();
  const replacement = createToastManager();
  let first!: ToastProviderContext;
  let second!: ToastProviderContext;
  const a = setup({ manager: shared, capture: (context) => { first = context; } });
  const b = setup({ manager: shared, capture: (context) => { second = context; } });
  const aFacade = first.manager;
  shared.add({ id: 'shared', title: 'Shared', timeout: 0 });
  flushSync();
  expect(a.target.textContent?.trim()).toBe('Shared');
  expect(b.target.textContent?.trim()).toBe('Shared');
  first.manager.update('shared', { title: 'First only' });
  flushSync();
  expect(a.target.textContent?.trim()).toBe('First only');
  expect(b.target.textContent?.trim()).toBe('Shared');
  a.component.configure({ manager: replacement });
  flushSync();
  shared.add({ id: 'old', title: 'Old channel', timeout: 0 });
  replacement.add({ id: 'new', title: 'New channel', timeout: 0 });
  flushSync();
  expect(first.manager).toBe(aFacade);
  expect(first.manager.toasts.map((toast) => toast.id)).toEqual(['new', 'shared']);
  expect(second.manager.toasts.map((toast) => toast.id)).toEqual(['old', 'shared']);
  const onClose = vi.fn();
  replacement.add({ id: 'timed', title: 'Timed', timeout: 1000, onClose });
  a.component.configure({ showProvider: false });
  flushSync();
  const snapshot = first.store.state;
  replacement.add({ id: 'after', title: 'After teardown' });
  vi.advanceTimersByTime(2000);
  await tick();
  expect(first.store.state).toBe(snapshot);
  expect(onClose).not.toHaveBeenCalled();
  shared.add({ id: 'still', title: 'Still attached', timeout: 0 });
  flushSync();
  expect(second.manager.toasts[0].id).toBe('still');
});

it('allows retained native facade writes and pending settlement after Provider timer cleanup', async () => {
  vi.useFakeTimers();
  let context!: ToastProviderContext;
  const { component } = setup({
    capture: (value) => {
      context = value;
    },
  });
  let resolve!: (value: number) => void;
  const result = context.manager.promise(
    new Promise<number>((yes) => {
      resolve = yes;
    }),
    {
      loading: 'Loading',
      success: (value) => `Saved ${value}`,
      error: 'Failed',
    },
  );
  component.configure({ showProvider: false });
  flushSync();
  expect(vi.getTimerCount()).toBe(0);
  context.manager.add({ id: 'retained', title: 'Retained facade', timeout: 0 });
  resolve(7);
  expect(await result).toBe(7);
  expect(context.manager.toasts.map((toast) => toast.description)).toContain('Saved 7');
  expect(context.manager.toasts[0].id).toBe('retained');
  expect(vi.getTimerCount()).toBe(1);
  context.store.dispose();
});
