import { afterEach, expect, it, vi } from 'vitest';
import { mount, tick, unmount } from 'svelte';
import Fixture from './PopupFamilyFixture.svelte';
import { mountPopupFamilyReference, type PopupFamilyFixtureOptions } from '../../../../apps/fixtures/src/lib/popup-family-reference.js';
// Authored actual exact-pin Source/native supplements. Ordinary Source assertion credit is zero.
const cleanup: (() => void | Promise<void>)[] = [];
async function settle() { await tick(); await new Promise(resolve => setTimeout(resolve, 70)); await tick(); }
async function setup(reference: boolean, options: PopupFamilyFixtureOptions = {}) {
  const target = document.createElement('section'); document.body.append(target);
  const log: unknown[] = [];
  const props = { ...options, log: (kind: string, value: unknown, reason?: string, triggerId?: string) => log.push([kind, value, reason, triggerId]) };
  const instance = reference ? mountPopupFamilyReference(target, props) : mount(Fixture, { target, props });
  cleanup.push(() => reference ? (instance as ReturnType<typeof mountPopupFamilyReference>).stop() : unmount(instance));
  await settle(); return { instance, log };
}
const byId = (id: string) => document.getElementById(id)!;
const popup = () => document.querySelector<HTMLElement>('[data-testid=popup]');
async function open(family: string) { if (family === 'popover') byId('opener').click(); else byId('opener').focus(); await settle(); }
function key(id: string, value: string) { byId(id).dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: value })); }
afterEach(async () => { for (const stop of cleanup.splice(0)) await stop(); await settle(); vi.restoreAllMocks(); document.body.replaceChildren(); document.body.removeAttribute('style'); document.documentElement.removeAttribute('style'); });
for (const reference of [true, false]) for (const family of ['popover', 'preview-card', 'tooltip'] as const) {
  const label = `${reference ? 'Original React' : 'Svelte'} ${family}`;
  it(`${label}: complete public composition opens and escapes`, async () => {
    const { log } = await setup(reference, { family }); await open(family);
    expect(popup()).not.toBeNull(); expect(byId('payload').textContent).toBe('Content 7');
    expect(document.querySelector('[data-testid=arrow]')).not.toBeNull();
    if (family === 'popover') { expect(popup()?.getAttribute('aria-labelledby')).toBe('title'); expect(popup()?.getAttribute('aria-describedby')).toBe('description'); }
    key('inside', 'Escape'); await settle(); expect(popup()).toBeNull();
    expect(log.some(value => JSON.stringify(value).includes('escape-key'))).toBe(true);
  });
  for (const cancel of ['open', 'close'] as const) it(`${label}: root ${cancel} cancellation preserves logical state`, async () => {
    const { instance } = await setup(reference, { family, cancel, defaultOpen: cancel === 'close' });
    if (cancel === 'open') await open(family); else { instance.command('close'); await settle(); }
    expect(!!popup()).toBe(cancel === 'close');
  });
  it(`${label}: detached handle owns payload and trigger handoff`, async () => {
    const { instance } = await setup(reference, { family, mode: 'detached' });
    instance.command('open'); await settle(); expect(instance.snapshot().isOpen).toBe(true); expect(byId('payload').textContent).toBe('Content 7');
    instance.command('second'); await settle(); expect(byId('payload').textContent).toBe('Content 9');
    expect(byId('second').hasAttribute('data-popup-open')).toBe(true); expect(byId('opener').hasAttribute('data-popup-open')).toBe(false);
    instance.command('close'); await settle(); expect(popup()).toBeNull(); expect(instance.snapshot().isOpen).toBe(false);
  });
  it(`${label}: retained close waits for the public unmount action`, async () => {
    const { instance } = await setup(reference, { family, mode: 'retain' });
    instance.command('open'); await settle(); instance.command('close'); await settle();
    expect(popup()).not.toBeNull(); expect(popup()?.hasAttribute('data-ending-style')).toBe(true);
    instance.command('unmount'); await settle(); expect(popup()).toBeNull();
  });
  it(`${label}: controlled open and close use the real Root store`, async () => {
    const { instance } = await setup(reference, { family, mode: 'controlled' });
    instance.command('controlled-open'); await settle(); expect(popup()).not.toBeNull(); expect(byId('payload').textContent).toBe('Content 7');
    instance.command('controlled-close'); await settle(); expect(popup()).toBeNull();
  });
  it(`${label}: keepMounted has a hidden closed positioner and reusable host`, async () => {
    await setup(reference, { family, keepMounted: true }); const host = popup();
    expect(host).not.toBeNull(); expect(document.querySelector('[data-testid=positioner]')?.hasAttribute('hidden')).toBe(true);
    await open(family); expect(popup()).toBe(host);
  });
  it(`${label}: viewport remounts current payload on trigger changes`, async () => {
    const { instance } = await setup(reference, { family, mode: 'viewport' });
    instance.command('open'); await settle(); const first = document.querySelector('[data-current]'); expect(first?.textContent).toContain('Content 7');
    instance.command('second'); await settle(); expect(document.querySelector('[data-current]')).not.toBe(first); expect(byId('payload').textContent).toBe('Content 9');
  });
}
