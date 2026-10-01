import { afterEach, expect, it, vi } from 'vitest';
import { flushSync, mount, tick, unmount } from 'svelte';
import Fixture from './ToastRootFixture.svelte';
import type { ToastProviderContext } from '../../src/lib/toast/context';

const mounted: ReturnType<typeof mount>[] = [];
function setup(indexKeys = false, withContent = true) {
  let context!: ToastProviderContext;
  const target = document.createElement('section'); document.body.append(target);
  mounted.push(mount(Fixture, { target, props: { capture: value => { context = value; }, indexKeys, withContent } }));
  flushSync();
  return context;
}
afterEach(async () => {
  for (const component of mounted.splice(0)) await unmount(component);
  document.body.replaceChildren(); vi.restoreAllMocks();
});

it('renders priority, registered labels, inert limits and removes only after exit completion', async () => {
  const context = setup();
  const remove = vi.fn(() => {
    expect(context.manager.toasts.some(toast => toast.id === 'high')).toBe(true);
    expect(document.querySelector('[data-toast=high]')).not.toBeNull();
  });
  context.manager.add({ id: 'high', title: 'Urgent', description: 'Details', priority: 'high', onRemove: remove });
  flushSync();
  const root = document.querySelector<HTMLElement>('[data-toast=high]')!;
  expect(root.getAttribute('role')).toBe('alertdialog');
  expect(root.getAttribute('aria-hidden')).toBe('true');
  expect(root.getAttribute('aria-modal')).toBe('false');
  expect(root.getAttribute('aria-labelledby')).toBe(root.querySelector('h2')!.id);
  expect(root.getAttribute('aria-describedby')).toBe(root.querySelector('p')!.id);
  expect(document.querySelector('[role=alert]')!.textContent).toMatch(/^Urgent\s*Details$/);
  for (let index = 0; index < 3; index += 1) context.manager.add({ id: `more${index}`, title: index });
  flushSync();
  expect(root.hasAttribute('inert')).toBe(true);
  expect(root.hasAttribute('data-limited')).toBe(true);
  context.store.set('focused', true); flushSync();
  expect(root.hasAttribute('aria-hidden')).toBe(false);
  expect(document.querySelector('[role=alert]')).toBeNull();
  let finish!: () => void;
  const animation = { finished: new Promise<void>(resolve => { finish = resolve; }), pending: false, playState: 'running' };
  Object.defineProperty(root, 'getAnimations', { value: () => [animation] });
  const frames: FrameRequestCallback[] = [];
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => { frames.push(callback); return frames.length; });
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
  context.manager.close('high'); flushSync();
  expect(root.hasAttribute('data-ending-style')).toBe(true);
  expect(remove).not.toHaveBeenCalled();
  frames.splice(0).forEach(callback => callback(0));
  expect(remove).not.toHaveBeenCalled();
  finish(); await tick(); await tick();
  expect(remove).toHaveBeenCalledTimes(1);
  expect(document.querySelector('[data-toast=high]')).toBeNull();
});

for (const indexKeys of [false, true]) it(`rejects stale exits after ending-ID replacement and rebinds refs (index keys=${indexKeys})`, async () => {
  const context = setup(indexKeys);
  const oldRemove = vi.fn();
  context.manager.add({ id: 'replace', title: 'Original', onRemove: oldRemove });
  context.manager.add({ id: 'sibling', title: 'Sibling' });
  flushSync();
  const original = document.querySelector<HTMLElement>('[data-toast=replace]')!;
  const staleToken = context.store.getLifecycle('replace');
  let finish!: () => void;
  Object.defineProperty(original, 'getAnimations', { configurable: true, value: () => [{
    finished: new Promise<void>(resolve => { finish = resolve; }), pending: false, playState: 'running',
  }] });
  const frames: FrameRequestCallback[] = [];
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => { frames.push(callback); return frames.length; });
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
  context.manager.close('replace'); flushSync();
  frames.splice(0).forEach(callback => callback(0));
  const nextRemove = vi.fn();
  context.manager.add({ id: 'replace', title: 'Replacement', onRemove: nextRemove });
  flushSync();
  expect(context.store.getLifecycle('replace')).not.toBe(staleToken);
  finish(); await tick(); await tick();
  expect(oldRemove).not.toHaveBeenCalled();
  expect(nextRemove).not.toHaveBeenCalled();
  const replacement = document.querySelector<HTMLElement>('[data-toast=replace]')!;
  expect(replacement.querySelector('h2')!.textContent).toBe('Replacement');
  expect(context.manager.toasts.find(toast => toast.id === 'replace')!.ref).toBe(replacement);
  expect(context.manager.toasts.find(toast => toast.id === 'sibling')!.ref).toBe(document.querySelector('[data-toast=sibling]'));
});

it('unregisters an ending Root node on conditional unmount while retaining its lifecycle and exit status', async () => {
  const context = setup();
  const remove = vi.fn();
  context.manager.add({ id: 'ending', title: 'Ending', onRemove: remove }); flushSync();
  const node = document.querySelector<HTMLElement>('[data-toast=ending]')!;
  Object.defineProperty(node, 'getAnimations', { value: () => [{ finished: new Promise<void>(() => {}) }] });
  const lifecycle = context.store.getLifecycle('ending');
  context.manager.close('ending'); flushSync();
  expect(context.manager.toasts[0].ref).toBe(node);
  (mounted[mounted.length - 1] as { hideRoots(): void }).hideRoots(); flushSync();
  await tick();
  expect(node.isConnected).toBe(false);
  expect(context.manager.toasts[0].ref).toBeNull();
  expect(context.manager.toasts[0].transitionStatus).toBe('ending');
  expect(context.manager.toasts[0].height).toBe(0);
  expect(context.store.getLifecycle('ending')).toBe(lifecycle);
  expect(remove).not.toHaveBeenCalled();
});
