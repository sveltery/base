import { afterEach, expect, it, vi } from 'vitest';
import { mount, tick, unmount } from 'svelte';
import Fixture from './Fixture.svelte';
import { mountDialogSourceBusinessReference, mountDialogSourcePayloadReference } from '../../../../apps/fixtures/src/lib/dialog-source-business-reference.js';
import PartsFixture from './DialogSourcePartsFixture.svelte';
import { createDialogHandle } from '../../src/lib/dialog/store/DialogHandle.svelte.js';

// Source comparison supplements; synthetic jsdom input does not establish browser parity.
const cleanup: (() => void | Promise<void>)[] = [];
async function settle() { await tick(); await new Promise(resolve => setTimeout(resolve, 60)); await tick(); }
async function setup(reference: boolean, keep = false) {
  const target = document.createElement('section'); document.body.append(target);
  const log: { channel: string; open?: boolean }[] = [];
  const record = (channel: string, open?: boolean) => log.push({ channel, open });
  if (reference) {
    const fixture = mountDialogSourceBusinessReference(target, record, keep);
    cleanup.push(fixture.stop);
  } else {
    const component = mount(Fixture, { target, props: { log: record, keep } });
    cleanup.push(() => unmount(component));
  }
  await settle(); document.getElementById('opener')!.click(); await settle();
  return log;
}
function escape(isComposing = false) { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', isComposing, bubbles: true })); }
afterEach(async () => {
  for (const stop of cleanup.splice(0)) await stop();
  await settle(); document.body.replaceChildren(); document.body.removeAttribute('style'); document.documentElement.removeAttribute('style');
});
for (const reference of [true, false]) {
  const framework = reference ? 'React reference' : 'Svelte';
  it(`${framework}: scroll locking writes viewport longhands and releases them`, async () => {
    await setup(reference);
    expect(document.body.style.overflowY).toBe('hidden');
    expect(document.body.style.overflowX).toBe('hidden');
    escape(); await settle();
    expect(document.body.style.overflowY).toBe('');
    expect(document.body.style.overflowX).toBe('');
  });
  it(`${framework}: original longhand restoration retains values and loses CSS priority`, async () => {
    document.documentElement.style.setProperty('overflow-x', 'clip', 'important');
    document.documentElement.style.setProperty('overflow-y', 'scroll');
    await setup(reference); escape(); await settle();
    expect(document.documentElement.style.overflowX).toBe('clip');
    expect(document.documentElement.style.getPropertyPriority('overflow-x')).toBe('');
    expect(document.documentElement.style.overflowY).toBe('scroll');
  });
  it(`${framework}: a preexisting viewport lock is left alone until it clears`, async () => {
    document.documentElement.style.setProperty('overflow-y', 'clip', 'important');
    await setup(reference);
    expect(document.documentElement.style.overflowY).toBe('clip');
    expect(document.documentElement.style.getPropertyPriority('overflow-y')).toBe('important');
    document.documentElement.style.removeProperty('overflow-y'); await settle();
    expect(document.body.style.overflowY).toBe('hidden');
    escape(); await settle(); expect(document.body.style.overflowY).toBe('');
  });
  it(`${framework}: composition events suppress Escape while a lone isComposing flag does not`, async () => {
    const log = await setup(reference);
    document.getElementById('closer')!.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
    escape(); await settle(); expect(document.querySelector('[role=dialog]')).not.toBeNull();
    document.getElementById('closer')!.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true }));
    escape(); await settle(); expect(document.querySelector('[role=dialog]')).not.toBeNull();
    escape(true); await settle(); expect(document.querySelector('[role=dialog]')).toBeNull();
    expect(log.filter(entry => entry.channel === 'consumer').map(entry => entry.open)).toEqual([true, false]);
  });
  it(`${framework}: root and popup completion inspect only their own animations and complete once`, async () => {
    const log = await setup(reference, true);
    const popup = document.querySelector<HTMLElement>('[role=dialog]')!;
    const calls: unknown[] = [];
    Object.defineProperty(popup, 'getAnimations', { value: (options?: GetAnimationsOptions) => {
      calls.push(options);
      return options?.subtree ? [{ playState: 'running', finished: new Promise(() => {}) }] : [];
    } });
    escape(); await settle(); expect(popup.hidden).toBe(true);
    expect(calls).toEqual([undefined, undefined]);
    expect(log.filter(entry => entry.channel === 'complete' && entry.open === false)).toHaveLength(1);
  });
  it(`${framework}: return focus waits for close completion, then reopening starts a new close cycle`, async () => {
    const log = await setup(reference, true);
    await vi.waitFor(() => expect(log.filter(entry => entry.channel === 'complete' && entry.open)).toHaveLength(1));
    const popup = document.querySelector<HTMLElement>('[role=dialog]')!;
    let finish!: () => void;
    let animations: { playState: AnimationPlayState; finished: Promise<void> }[] = [{ playState: 'running', finished: new Promise<void>(resolve => { finish = resolve; }) }];
    Object.defineProperty(popup, 'getAnimations', { value: () => animations });
    escape(); await settle();
    expect(document.activeElement?.id).toBe('closer'); expect(popup.hidden).toBe(false);
    animations = []; finish();
    await vi.waitFor(() => expect(document.activeElement?.id).toBe('opener'));
    expect(log.filter(entry => entry.channel === 'complete' && entry.open === false)).toHaveLength(1);
    document.getElementById('opener')!.click(); await settle();
    await vi.waitFor(() => expect(log.filter(entry => entry.channel === 'complete' && entry.open)).toHaveLength(2));
    escape(); await settle();
    expect(log.filter(entry => entry.channel === 'complete' && entry.open === false)).toHaveLength(2);
  });
  it(`${framework}: reopening during an outstanding physical close animation aborts its completion`, async () => {
    const log = await setup(reference, true);
    await vi.waitFor(() => expect(log.filter(entry => entry.channel === 'complete' && entry.open)).toHaveLength(1));
    const popup = document.querySelector<HTMLElement>('[role=dialog]')!;
    let cancel!: (reason?: unknown) => void;
    let animations: { playState: AnimationPlayState; finished: Promise<void> }[] = [{ playState: 'running', finished: new Promise<void>((_resolve, reject) => { cancel = reject; }) }];
    Object.defineProperty(popup, 'getAnimations', { value: () => animations });
    escape(); await settle();
    expect(document.activeElement?.id).toBe('closer'); expect(popup.hidden).toBe(false);
    document.getElementById('opener')!.click(); await settle();
    animations = []; cancel(new Error('Close animation replaced by opening')); await settle();
    expect(popup.hidden).toBe(false);
    expect(log.filter(entry => entry.channel === 'complete' && entry.open === false)).toHaveLength(0);
    escape(); await settle();
    expect(popup.hidden).toBe(true);
    expect(log.filter(entry => entry.channel === 'complete' && entry.open === false)).toHaveLength(1);
  });
  it(`${framework}: deferred close retains focus until the source focus manager actually tears down`, async () => {
    const target = document.createElement('section'); document.body.append(target);
    const fixture = reference
      ? mountDialogSourceBusinessReference(target, () => {}, false, true)
      : mount(Fixture, { target, props: { log() {}, cancel: 'defer' } });
    cleanup.push(() => 'stop' in fixture ? fixture.stop() : unmount(fixture));
    await settle(); document.getElementById('opener')!.click(); await settle();
    document.getElementById('closer')!.click(); await settle();
    expect(document.activeElement?.id).toBe('closer'); expect(document.querySelector('[role=dialog]')).not.toBeNull();
    fixture.unmountPopup(); await settle();
    expect(document.querySelector('[role=dialog]')).toBeNull(); expect(document.activeElement?.id).toBe('opener');
  });
  it(`${framework}: the sole owning trigger forwards its payload again on imperative reopening`, async () => {
    const target = document.createElement('section'); document.body.append(target);
    const source = reference ? mountDialogSourcePayloadReference(target) : null;
    const nativeHandle = createDialogHandle<number>();
    const handle = source?.handle ?? nativeHandle;
    const native = source ? null : mount(PartsFixture, { target, props: { handle: nativeHandle, report() {} } });
    cleanup.push(() => source ? source.stop() : unmount(native!));
    await settle(); document.getElementById('parts-trigger')!.click(); await settle();
    handle.close(); await settle(); handle.openWithPayload(9); await settle();
    expect(handle.isOpen).toBe(true); expect(document.querySelector('output')?.textContent).toBe('7');
  });
}
