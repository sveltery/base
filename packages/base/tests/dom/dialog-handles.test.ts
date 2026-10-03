// Supplemental source-store/lifecycle characterization; ordinary credit awaits full portable ports.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount, tick, unmount, type ComponentProps } from 'svelte';
import { createDialogHandle } from '../../src/lib/dialog/handle.svelte.js';
import Fixture from './DialogHandleFixture.svelte';
import BackdropStateFixture from './DialogBackdropStateFixture.svelte';
const instances: ReturnType<typeof mount>[] = [];
async function settle() { await tick(); await new Promise(resolve => setTimeout(resolve, 70)); await tick(); }
function setup(props: ComponentProps<typeof Fixture>) {
  const host = document.createElement('section'); document.body.append(host);
  const component = mount(Fixture, { target: host, props }); instances.push(component); return component;
}
function click(id: string) { document.getElementById(id)!.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 })); }
function payload() { return document.querySelector('[data-testid=payload]')!.textContent; }
afterEach(async () => { for (const instance of instances.splice(0)) await unmount(instance); document.body.replaceChildren(); vi.restoreAllMocks(); });
describe('Root-owned original Dialog popup store and handles', () => {
  for (const action of ['open', 'payload', 'close'] as const) it(`attaches before descendant committed ${action}`, async () => {
    const handle = createDialogHandle<number>(); const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    setup({ handle, mountAction: action, initial: action === 'close' }); await settle();
    expect(warn).not.toHaveBeenCalled(); expect(handle.isOpen).toBe(action !== 'close');
    if (action === 'payload') expect(payload()).toBe('8');
  });
  it('finds the requested pre-Root trigger during the initial commit', async () => {
    const handle = createDialogHandle<number>(); setup({ handle, sameCommit: true }); await settle();
    expect(handle.isOpen).toBe(true); expect(payload()).toBe('1');
    expect(document.getElementById('trigger')!.getAttribute('aria-expanded')).toBe('true');
    expect(document.getElementById('other')!.hasAttribute('aria-controls')).toBe(false);
    expect(document.getElementById('trigger')!.getAttribute('aria-controls')).toBe(document.querySelector('[role=dialog]')!.id);
  });
  it('keeps state through handle swaps and resets it on a fresh Root', async () => {
    const handle = createDialogHandle<number>(); const second = createDialogHandle<number>(); const component = setup({ handle, second }); await settle();
    click('trigger'); await settle(); const popup = document.querySelector('[role=dialog]');
    component.swap(); await settle(); expect(handle.isOpen).toBe(false); expect(second.isOpen).toBe(true); expect(payload()).toBe('1'); expect(document.querySelector('[role=dialog]')).toBe(popup);
    component.swap(); await settle(); expect(handle.isOpen).toBe(true); expect(second.isOpen).toBe(false);
    handle.close(); await settle(); expect(document.querySelector('[role=dialog]')).toBeNull(); expect(payload()).toBe('1');
    component.remove(); await settle(); expect(handle.isOpen).toBe(false);
    component.remount(); await settle(); expect(payload()).toBe('No payload'); expect(handle.isOpen).toBe(false);
    click('trigger'); await settle(); expect(payload()).toBe('1');
  });
  it('retains the payload write when imperative opening is canceled', async () => {
    const handle = createDialogHandle<number>(); setup({ handle, cancel: true }); await settle();
    handle.openWithPayload(8); await settle(); expect(handle.isOpen).toBe(false); expect(payload()).toBe('8'); expect(document.querySelector('[role=dialog]')).toBeNull();
  });
  it('preserves the pinned remount after force unmount while logically open', async () => {
    const handle = createDialogHandle<number>(); const component = setup({ handle }); await settle();
    handle.openWithPayload(8); await settle(); const popup = document.querySelector('[role=dialog]'); component.forceUnmount(); await settle();
    expect(handle.isOpen).toBe(true); expect(document.querySelector('[role=dialog]')).not.toBeNull(); expect(document.querySelector('[role=dialog]')).not.toBe(popup); expect(payload()).toBe('8');
  });
  it('returns focus to the external owner after a controlled programmatic open', async () => {
    const handle = createDialogHandle<number>(); const requests: { open: boolean; trigger: Element | undefined }[] = [];
    setup({ handle, controlled: true, onChange: (open, details) => requests.push({ open, trigger: details.trigger }) }); await settle();
    const external = [...document.querySelectorAll('button')].find(button => button.textContent === 'Open programmatically')!;
    external.focus(); external.click(); await settle(); expect(payload()).toBe('9');
    [...document.querySelectorAll('button')].find(button => button.textContent === 'Close')!.click(); await settle();
    expect(document.querySelector('[role=dialog]')).toBeNull(); expect(document.activeElement).toBe(external);
    expect(requests).toEqual([{ open: false, trigger: undefined }]);
  });
  // Native lifecycle supplement: R1399's replay-specific duplicate count remains unimplemented.
  it('native controlled lifecycle completes once per edge without synthesized effect replay', async () => {
    const handle = createDialogHandle<number>(); const completions: boolean[] = [];
    setup({ handle, controlled: true, onComplete: value => completions.push(value) }); await settle();
    const external = [...document.querySelectorAll('button')].find(button => button.textContent === 'Open programmatically')!;
    external.click(); await settle(); expect(completions).toEqual([true]);
    [...document.querySelectorAll('button')].find(button => button.textContent === 'Close')!.click(); await settle(); expect(completions).toEqual([true, false]);
  });
  for (const popup of ['absent', 'remove-on-close'] as const) it(`preserves pinned mounted state and absent close completion with Popup ${popup}`, async () => {
    const handle = createDialogHandle<number>(); const completions: boolean[] = [];
    const component = setup({ handle, popup, onComplete: value => completions.push(value) }); await settle();
    handle.openWithPayload(8); await settle(); handle.close(); await settle();
    expect(handle.isOpen).toBe(false); expect(handle.store.select('mounted')).toBe(true); expect(completions.filter(value => !value)).toHaveLength(0);
    component.forceUnmount(); await settle(); expect(handle.store.select('mounted')).toBe(false); expect(completions.filter(value => !value)).toHaveLength(1);
  });
  it('forwards reactive payload while the owning trigger is mounted', async () => {
    const handle = createDialogHandle<number>(); const component = setup({ handle }); await settle();
    click('trigger'); await settle(); expect(payload()).toBe('1'); component.updatePayload(8); await settle(); expect(payload()).toBe('8');
  });
  it('ignores calls with no attached Root and warns only in development', async () => {
    const handle = createDialogHandle<number>(); const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    handle.open('trigger'); handle.openWithPayload(8); handle.close(); expect(handle.isOpen).toBe(false); expect(warn).toHaveBeenCalledTimes(3);
    const previous = process.env.NODE_ENV;
    try { process.env.NODE_ENV = 'production'; warn.mockClear(); handle.openWithPayload(8); expect(handle.isOpen).toBe(false); expect(warn).not.toHaveBeenCalled(); }
    finally { process.env.NODE_ENV = previous; }
  });
});

// Complete D:230 body. Its original !isJSDOM guard maps to this configured JSDOM suite.
// MIT: parity/dialog/UPSTREAM_LICENSE; no module reset or production bundle substitution.
it('D:230 does not warn for a detached payload open in production', () => {
  const originalEnvironment = process.env.NODE_ENV;
  const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  process.env.NODE_ENV = 'production';
  try {
    const handle = createDialogHandle<number>();
    handle.openWithPayload(8);
    expect(handle.isOpen).toBe(false);
    expect(consoleWarn.mock.calls.length).toBe(0);
  } finally {
    process.env.NODE_ENV = originalEnvironment;
    consoleWarn.mockRestore();
  }
});

it('Backdrop forwards exactly the pinned open and transitionStatus state keys', async () => {
  const host = document.createElement('section'); document.body.append(host);
  instances.push(mount(BackdropStateFixture, { target: host })); await settle();
  expect(document.querySelector('[data-testid=state-backdrop]')!.className).toBe('open transitionStatus');
});
