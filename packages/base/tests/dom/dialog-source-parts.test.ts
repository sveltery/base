import { afterEach, expect, it } from 'vitest';
import { flushSync, mount, tick, unmount } from 'svelte';
import Fixture from './DialogSourcePartsFixture.svelte';
import { createDialogHandle } from '../../src/lib/dialog/store/DialogHandle.svelte.js';

// Native framework/actual source composition probes, zero ordinary declaration credit.
const cleanup: (() => Promise<void>)[] = [];
async function settle() {
  await tick();
  await new Promise((resolve) => setTimeout(resolve, 60));
  await tick();
}
afterEach(async () => {
  for (const stop of cleanup.splice(0)) await stop();
  document.body.replaceChildren();
});
it('ports children into an actual replacement host independently of snippet child forwarding', async () => {
  const target = document.createElement('main');
  const destination = document.createElement('section');
  document.body.append(target, destination);
  const handle = createDialogHandle<number>();
  const contexts: [string, boolean][] = [];
  const component = mount(Fixture, {
    target,
    props: {
      handle,
      container: destination,
      report: (name, provided) => contexts.push([name, provided]),
    },
  });
  cleanup.push(() => unmount(component));
  await settle();
  const { portal, viewport } = component.refs();
  expect(portal).toBe(destination.querySelector('section'));
  expect(portal?.parentElement).toBe(destination.querySelector('[data-testid=portal-wrapper]'));
  expect(viewport?.parentElement).toBe(portal);
  expect(contexts).toEqual([
    ['replacement', false],
    ['children', true],
  ]);
  expect(viewport?.hidden).toBe(true);
  expect(viewport?.style.pointerEvents).toBe('none');
  expect(viewport?.style.getPropertyValue('--open')).toBe('0');
  document.getElementById('parts-trigger')!.click();
  await settle();
  expect(handle.isOpen).toBe(true);
  expect(handle.store.state.viewportElement).toBe(viewport);
  expect(viewport?.hidden).toBe(false);
  expect(viewport?.style.pointerEvents).toBe('');
  expect(viewport?.className).toBe('native-viewport active');
  expect(viewport?.style.getPropertyValue('--open')).toBe('1');
  expect(document.querySelector('[aria-owns]')?.getAttribute('aria-owns')).toBe(
    'replacement-portal',
  );
  component.setId('changed-portal');
  await settle();
  expect(document.querySelector('[aria-owns]')?.getAttribute('aria-owns')).toBe('changed-portal');
  component.setId(undefined);
  await settle();
  expect(document.querySelector('[aria-owns]')).toBeNull();
  handle.close();
  await settle();
  expect(handle.isOpen).toBe(false);
  expect(viewport?.hidden).toBe(true);
  expect(handle.store.state.viewportElement).toBe(viewport);
  await unmount(component);
  cleanup.pop();
  expect(component.refs()).toEqual({ portal: null, viewport: null });
  expect(destination.children).toHaveLength(0);
});
it('Viewport exposes the source state keys and removes its store ref on actual teardown', async () => {
  const handle = createDialogHandle<number>();
  const component = mount(Fixture, {
    target: document.body,
    props: { handle, keep: false, report() {} },
  });
  cleanup.push(() => unmount(component));
  flushSync();
  expect(component.refs()).toEqual({ portal: null, viewport: null });
  handle.openWithPayload(8);
  await settle();
  const viewport = component.refs().viewport;
  expect(viewport).not.toBeNull();
  expect(handle.store.state.viewportElement).toBe(viewport);
  handle.close();
  await settle();
  expect(component.refs().viewport).toBeNull();
  expect(handle.store.state.viewportElement).toBeNull();
  expect(handle.isOpen).toBe(false);
  expect(handle.store.select('mounted')).toBe(false);
});
