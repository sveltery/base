import { afterEach, expect, it, vi } from 'vitest';
import { mount, tick, unmount } from 'svelte';
import Native from '../../../../apps/fixtures/src/lib/DialogSourceClosureFixture.svelte';
import { mountDialogSourceClosureReference } from '../../../../apps/fixtures/src/lib/dialog-source-closure-reference.js';
// Fixture provenance checks only; these do not establish trusted browser traversal.
const cleanups: (() => void | Promise<void>)[] = [];
async function settle() { await tick(); await new Promise(resolve => setTimeout(resolve, 60)); await tick(); }
afterEach(async () => { for (const stop of cleanups.splice(0)) await stop(); document.body.replaceChildren(); });
for (const reference of [false, true]) for (const keep of [false, true]) it(`${reference ? 'React reference' : 'Svelte'} public fixture has actual ref/deferred/remount observations (${keep})`, async () => {
  const target = document.createElement('div'); document.body.append(target);
  if (reference) cleanups.push(mountDialogSourceClosureReference(target, keep));
  else { const app = mount(Native, { target, props: { keep } }); cleanups.push(() => unmount(app)); }
  await settle();
  const main = document.querySelector('main') as HTMLElement & { closureCommand(command: string): void; closureRefs(): object };
  expect(main.dataset.hydrated).toBe('true');
  document.getElementById('closure-trigger')!.click(); await settle();
  await vi.waitFor(() => expect(document.querySelector('[data-testid=closure-completed]')?.textContent).toBe('[true]'));
  const original = document.querySelector('[data-testid=closure-portal]'); expect(original?.querySelector('[role=dialog]')).not.toBeNull();
  expect(document.querySelector('[aria-owns]')?.getAttribute('aria-owns') ?? null).toBe(reference ? null : 'closure-portal');
  main.closureCommand('id'); await settle();
  expect(document.querySelector('[aria-owns]')?.getAttribute('aria-owns') ?? null).toBe(reference ? null : 'closure-renamed');
  main.closureCommand('second'); await settle();
  expect(original?.isConnected).toBe(false);
  await vi.waitFor(() => expect(document.querySelector('[data-testid=closure-completed]')?.textContent).toBe('[true,true]'));
  await vi.waitFor(() => expect(document.activeElement?.id).toBe('closure-close'));
  document.getElementById('closure-close')!.click(); await settle();
  expect(document.activeElement?.id).toBe('closure-close');
  main.closureCommand('unmount'); await settle();
  expect(document.querySelector('[role=dialog]:not([hidden])')).toBeNull();
  main.closureCommand('remove'); await settle();
  expect(main.closureRefs()).toEqual({ portal: false, viewport: false, actions: false });
  expect(document.querySelector('[data-testid=closure-wrapper]')).toBeNull();
});
