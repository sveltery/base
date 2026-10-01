// Assertions adapted from mui/base-ui v1.8.0, 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c,
// packages/react/src/toast/viewport/ToastViewport.test.tsx; MIT, see THIRD_PARTY_NOTICES.md.
// Native mouseenter/leave target the owning Viewport (React synthesizes these from descendants).
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { flushSync, mount, tick, unmount } from 'svelte';
import Fixture from './ToastViewportFixture.svelte';
import { createToastManager } from '../../src/lib/toast/createToastManager.js';
const mounted: ReturnType<typeof mount>[] = [];
beforeEach(() => { vi.useFakeTimers(); vi.spyOn(document, 'hasFocus').mockReturnValue(true); });
afterEach(async () => {
  for (const component of mounted.splice(0)) await unmount(component);
  document.body.replaceChildren(); vi.restoreAllMocks(); vi.useRealTimers();
});
async function render(props: Record<string, unknown> = {}, target = document.body) {
  mounted.push(mount(Fixture, { target, props })); await tick();
  return target;
}
function get(id: string, doc = document) { return doc.querySelector<HTMLElement>(`[data-testid="${id}"]`)!; }
function root(doc = document) { return doc.querySelector('[data-testid="root"]'); }
function button(doc = document) { return [...doc.querySelectorAll('button')].find(node => node.textContent === 'add')!; }
async function add(doc = document) { button(doc).click(); await tick(); }
function mouse(type: string) { get('viewport').dispatchEvent(new MouseEvent(type)); flushSync(); }
function key(target: EventTarget, value: string, shiftKey = false) { target.dispatchEvent(new KeyboardEvent('keydown', { key: value, shiftKey, bubbles: true })); flushSync(); }
function pointer(target: EventTarget, pointerType: string) {
  const event = new Event('pointerdown', { bubbles: true });
  Object.defineProperty(event, 'pointerType', { value: pointerType }); target.dispatchEvent(event); flushSync();
}
function endPointer(target: EventTarget, type: 'pointerup' | 'pointercancel') {
  const event = new Event(type, { bubbles: true }); Object.defineProperty(event, 'pointerType', { value: 'touch' });
  target.dispatchEvent(event); flushSync();
}
async function advance(ms: number) { await vi.advanceTimersByTimeAsync(ms); await tick(); }
function ownerWindowEvent(type: 'focus' | 'blur', listener: EventListener) {
  const event = new FocusEvent(type);
  // As in the pinned JSdom owner-window tests, retain the exact owner-window target.
  Object.defineProperty(event, 'composedPath', { value: () => [window] });
  listener(event);
}

it('gets focused when F6 is pressed', async () => { // upstream V:153
  await render(); await add(); key(button(), 'F6'); expect(document.activeElement).toBe(get('viewport'));
});
it('retains owner-window focus listeners and rebinds interactions across empty store cycles', async () => { // upstream V:38
  const iframe = document.createElement('iframe'); document.body.appendChild(iframe);
  const iframeWindow = iframe.contentWindow;
  const iframeDocument = iframe.contentDocument;
  if (!iframeWindow || !iframeDocument) throw new Error('Expected iframe window and document.');
  const iframeGlobal = iframeWindow as Window & typeof globalThis;
  // Initialize jsdom's selector engine before spying: its own modality listeners are unrelated to Viewport ownership.
  iframeDocument.querySelector('body');
  const container = iframeDocument.createElement('div'); iframeDocument.body.appendChild(container);
  const addWindowListener = vi.spyOn(iframeWindow, 'addEventListener');
  const removeWindowListener = vi.spyOn(iframeWindow, 'removeEventListener');
  const addDocumentListener = vi.spyOn(iframeDocument, 'addEventListener');
  const removeDocumentListener = vi.spyOn(iframeDocument, 'removeEventListener');
  const manager = createToastManager();
  try {
    // Inline mount in the alternate owner document replaces ReactDOM.createPortal;
    // this slice deliberately has no public Portal part.
    await render({ toastManager: manager, timeout: 0 }, container);
    await add(iframeDocument); expect(root(iframeDocument)).not.toBe(null);
    expect(addWindowListener.mock.calls.filter(([type]) => type === 'keydown')).toHaveLength(1);
    expect(addWindowListener.mock.calls.filter(([type]) => type === 'blur')).toHaveLength(1);
    expect(addWindowListener.mock.calls.filter(([type]) => type === 'focus')).toHaveLength(1);
    expect(addDocumentListener.mock.calls.filter(([type]) => type === 'pointerdown')).toHaveLength(1);
    iframeWindow.dispatchEvent(new iframeGlobal.KeyboardEvent('keydown', { key: 'F6' })); await tick();
    expect(iframeDocument.activeElement).toBe(get('viewport', iframeDocument));
    manager.close(); await tick();
    expect(root(iframeDocument)).toBe(null);
    expect(removeWindowListener.mock.calls.filter(([type]) => type === 'keydown')).toHaveLength(1);
    expect(removeWindowListener.mock.calls.filter(([type]) => type === 'blur')).toHaveLength(0);
    expect(removeWindowListener.mock.calls.filter(([type]) => type === 'focus')).toHaveLength(0);
    expect(removeDocumentListener.mock.calls.filter(([type]) => type === 'pointerdown')).toHaveLength(1);
    await add(iframeDocument); expect(root(iframeDocument)).not.toBe(null);
    expect(addWindowListener.mock.calls.filter(([type]) => type === 'keydown')).toHaveLength(2);
    expect(addWindowListener.mock.calls.filter(([type]) => type === 'blur')).toHaveLength(1);
    expect(addWindowListener.mock.calls.filter(([type]) => type === 'focus')).toHaveLength(1);
    expect(addDocumentListener.mock.calls.filter(([type]) => type === 'pointerdown')).toHaveLength(2);
  } finally {
    addWindowListener.mockRestore(); removeWindowListener.mockRestore();
    addDocumentListener.mockRestore(); removeDocumentListener.mockRestore(); iframe.remove();
  }
});
it('pauses timers when hovering', async () => { // upstream V:449
  await render(); await add(); mouse('mouseenter'); await advance(5001); expect(root()).not.toBe(null);
});
it('resumes timers when not hovering', async () => { // upstream V:469
  await render(); await add(); mouse('mouseenter'); await advance(5000); mouse('mouseleave');
  await advance(4999); expect(root()).not.toBe(null); await advance(2); expect(root()).toBe(null);
});
it('pauses timers when the viewport is focused', async () => { // upstream V:497
  await render(); await add(); key(document.activeElement!, 'F6'); await advance(5001); expect(root()).not.toBe(null);
});
it('restores focus and resumes timers on shift+Tab out of the focused viewport', async () => { // upstream V:517
  await render(); button().focus(); await add(); key(button(), 'F6');
  expect(document.activeElement).toBe(get('viewport')); await advance(5001); expect(root()).not.toBe(null);
  key(get('viewport'), 'Tab', true); expect(document.activeElement).toBe(button());
  await advance(5001); expect(root()).toBe(null);
});
it('keeps timers paused when shift+Tab returns focus inside the viewport', async () => { // upstream V:547
  await render(); button().focus(); await add(); const close = document.querySelector<HTMLElement>('[aria-label="close-press"]')!;
  close.focus(); key(close, 'F6'); expect(document.activeElement).toBe(get('viewport'));
  key(get('viewport'), 'Tab', true); expect(document.activeElement).toBe(close);
  await advance(5001); expect(root()).not.toBe(null);
});
it('keeps the viewport focused when Tab is pressed without shift', async () => { // upstream V:580
  await render(); button().focus(); await add(); key(button(), 'F6'); key(get('viewport'), 'Tab');
  expect(document.activeElement).not.toBe(button()); await advance(5001); expect(root()).not.toBe(null);
});
it('collapses and resumes timers on a touch outside the viewport', async () => { // upstream V:606
  await render(); await add(); mouse('mouseenter'); expect(get('viewport').hasAttribute('data-expanded')).toBe(true);
  await advance(5001); expect(root()).not.toBe(null); pointer(document.body, 'touch');
  expect(get('viewport').hasAttribute('data-expanded')).toBe(false); await advance(5001); expect(root()).toBe(null);
});
it('stays expanded on a touch inside the viewport', async () => { // upstream V:635
  await render(); await add(); mouse('mouseenter'); pointer(get('viewport'), 'touch');
  expect(get('viewport').hasAttribute('data-expanded')).toBe(true); await advance(5001); expect(root()).not.toBe(null);
});
it('ignores a mouse pointerdown outside the viewport', async () => { // upstream V:659
  await render(); await add(); mouse('mouseenter'); pointer(document.body, 'mouse');
  expect(get('viewport').hasAttribute('data-expanded')).toBe(true); await advance(5001); expect(root()).not.toBe(null);
});
it('resumes timers when the viewport is blurred', async () => { // upstream V:684
  await render(); await add(); key(document.activeElement!, 'F6'); await advance(5001); button().focus();
  await advance(5001); expect(root()).toBe(null);
});
it('resumes timers when the window regains focus', async () => { // upstream V:708
  const spy = vi.spyOn(window, 'addEventListener'); await render(); await add(); expect(root()).not.toBe(null);
  const blur = spy.mock.calls.find(call => call[0] === 'blur' && call[2] === true)?.[1] as EventListener | undefined;
  const focus = spy.mock.calls.find(call => call[0] === 'focus' && call[2] === true)?.[1] as EventListener | undefined;
  spy.mockRestore(); expect(blur).toBeDefined(); expect(focus).toBeDefined();
  if (!blur || !focus) throw new Error('Expected window focus and blur listeners to be registered.');
  const blurEvent = new FocusEvent('blur'); Object.defineProperty(blurEvent, 'composedPath', { value: () => [window] });
  const focusEvent = new FocusEvent('focus'); Object.defineProperty(focusEvent, 'composedPath', { value: () => [window] });
  await advance(1000); blur(blurEvent); await advance(5000); expect(root()).not.toBe(null);
  focus(focusEvent); await advance(3999); expect(root()).not.toBe(null); await advance(2); expect(root()).toBe(null);
});
it('keeps timers paused on mouseleave while the window is blurred', async () => { // upstream V:774
  const spy = vi.spyOn(window, 'addEventListener'); await render(); await add();
  const blur = spy.mock.calls.find(call => call[0] === 'blur' && call[2] === true)?.[1] as EventListener | undefined; spy.mockRestore();
  if (!blur) throw new Error('Expected window blur listener to be registered.');
  const event = new FocusEvent('blur'); Object.defineProperty(event, 'composedPath', { value: () => [window] });
  mouse('mouseenter'); await advance(1000); blur(event); mouse('mouseleave'); await advance(10000); expect(root()).not.toBe(null);
});
it('keeps timers paused on viewport blur while the window is blurred', async () => { // upstream V:823
  const spy = vi.spyOn(window, 'addEventListener'); await render(); await add();
  const blur = spy.mock.calls.find(call => call[0] === 'blur' && call[2] === true)?.[1] as EventListener | undefined; spy.mockRestore();
  if (!blur) throw new Error('Expected window blur listener to be registered.');
  key(document.activeElement!, 'F6'); expect(document.activeElement).toBe(get('viewport')); await advance(1000);
  const event = new FocusEvent('blur'); Object.defineProperty(event, 'composedPath', { value: () => [window] });
  blur(event); button().focus(); await advance(10000); expect(root()).not.toBe(null);
});
it('returns focus when no toast can receive focus', async () => { // upstream V:998
  await render({ limit: 0 }); button().focus(); await add(); key(button(), 'F6');
  const viewport = get('viewport'); expect(document.activeElement).toBe(viewport);
  document.querySelector<HTMLElement>('[data-base-ui-focus-guard]')!.dispatchEvent(new FocusEvent('focus', { relatedTarget: viewport }));
  expect(document.activeElement).toBe(button());
});
it('returns focus to the trigger when every toast is closed', async () => { // upstream V:1023
  const manager = createToastManager(); await render({ toastManager: manager, timeout: 0 }); button().focus(); await add(); key(button(), 'F6');
  const viewport = get('viewport');
  document.querySelector<HTMLElement>('[data-base-ui-focus-guard]')!.dispatchEvent(new FocusEvent('focus', { relatedTarget: viewport }));
  expect(document.activeElement).toBe(get('root')); manager.close(); expect(document.activeElement).toBe(button());
});
it('leaves focus alone when it is outside the viewport', async () => { // upstream V:1098
  const manager = createToastManager(); await render({ toastManager: manager, timeout: 0 }); button().focus(); await add(); await add();
  manager.close(); expect(document.activeElement).toBe(button());
});
it('removes expanded on mouseleave when focus-visible not inside', async () => { // upstream V:237
  await render(); await add(); mouse('mouseenter'); expect(get('viewport').hasAttribute('data-expanded')).toBe(true);
  mouse('mouseleave'); expect(get('viewport').hasAttribute('data-expanded')).toBe(false);
});
it('keeps expanded on mouseleave when focus-visible is inside', async () => { // upstream V:260
  await render(); await add(); key(button(), 'F6');
  const viewport = get('viewport');
  document.querySelector<HTMLElement>('[data-base-ui-focus-guard]')!.dispatchEvent(new FocusEvent('focus', { relatedTarget: viewport }));
  mouse('mouseenter'); expect(viewport.hasAttribute('data-expanded')).toBe(true);
  mouse('mouseleave'); expect(viewport.hasAttribute('data-expanded')).toBe(true);
});
it('skips toasts animating out when tabbing into the viewport', async () => { // upstream V:961
  await render(); await add(); await add();
  const [newest, survivor] = document.querySelectorAll<HTMLElement>('[data-testid="root"]');
  Object.defineProperty(newest, 'getAnimations', { value: () => [{ finished: new Promise<void>(() => {}) }] });
  document.querySelector<HTMLButtonElement>('[aria-label="close-press"]')!.click(); await tick();
  key(document.activeElement!, 'F6');
  const viewport = get('viewport');
  document.querySelector<HTMLElement>('[data-base-ui-focus-guard]')!.dispatchEvent(new FocusEvent('focus', { relatedTarget: viewport }));
  expect(document.activeElement).toBe(survivor); expect(document.activeElement).not.toBe(newest);
});
it('moves focus past toasts animating out when one is closed', async () => { // upstream V:1052
  const manager = createToastManager(); await render({ toastManager: manager, timeout: 0 }); button().focus();
  manager.add({ title: 'oldest' }); await tick(); manager.add({ id: 'middle', title: 'middle' }); await tick();
  manager.add({ id: 'newest', title: 'newest' }); await tick();
  const [newest, middle, oldest] = document.querySelectorAll<HTMLElement>('[data-testid="root"]');
  Object.defineProperty(middle, 'getAnimations', { value: () => [{ finished: new Promise<void>(() => {}) }] });
  Object.defineProperty(newest, 'getAnimations', { value: () => [{ finished: new Promise<void>(() => {}) }] });
  expect(middle.textContent).toContain('middle'); key(button(), 'F6');
  const viewport = get('viewport');
  document.querySelector<HTMLElement>('[data-base-ui-focus-guard]')!.dispatchEvent(new FocusEvent('focus', { relatedTarget: viewport }));
  expect(document.activeElement).toBe(newest); manager.close('middle'); manager.close('newest'); await tick();
  expect(middle.hasAttribute('data-ending-style')).toBe(true); expect(document.activeElement).toBe(oldest);
});

it('cleans listeners and pending owner-window focus work when unmounted', async () => { // local regression, no parity credit
  const addListener = vi.spyOn(window, 'addEventListener');
  const removeListener = vi.spyOn(window, 'removeEventListener');
  const removePointer = vi.spyOn(document, 'removeEventListener');
  await render(); await add();
  const focus = addListener.mock.calls.find(call => call[0] === 'focus' && call[2] === true)?.[1] as EventListener;
  const event = new FocusEvent('focus'); Object.defineProperty(event, 'composedPath', { value: () => [window] });
  focus(event);
  const component = mounted.pop()!; await unmount(component);
  for (const type of ['keydown', 'blur', 'focus']) expect(removeListener.mock.calls.filter(([name]) => name === type)).toHaveLength(1);
  expect(removePointer.mock.calls.filter(([name, , capture]) => name === 'pointerdown' && capture === true)).toHaveLength(1);
  expect(vi.getTimerCount()).toBe(0);
});

it('retains observed window focus across an empty transition and immediate add', async () => {
  const spy = vi.spyOn(window, 'addEventListener');
  const manager = createToastManager();
  await render({ toastManager: manager }); await add();
  const blur = spy.mock.calls.find(call => call[0] === 'blur' && call[2] === true)![1] as EventListener;
  const focus = spy.mock.calls.find(call => call[0] === 'focus' && call[2] === true)![1] as EventListener;
  ownerWindowEvent('blur', blur);
  flushSync(); expect(button().getAttribute('data-window-focused')).toBe('false');
  ownerWindowEvent('focus', focus);
  manager.close(); flushSync();
  await add();
  await advance(4999); expect(root()).not.toBe(null);
  await advance(2); expect(root()).toBe(null);
});

it('a later window blur cancels pending focus before empty-store cleanup', async () => {
  const spy = vi.spyOn(window, 'addEventListener');
  const manager = createToastManager();
  await render({ toastManager: manager }); await add();
  const blur = spy.mock.calls.find(call => call[0] === 'blur' && call[2] === true)![1] as EventListener;
  const focus = spy.mock.calls.find(call => call[0] === 'focus' && call[2] === true)![1] as EventListener;
  ownerWindowEvent('blur', blur);
  ownerWindowEvent('focus', focus);
  ownerWindowEvent('blur', blur);
  flushSync(); expect(button().getAttribute('data-window-focused')).toBe('false');
  manager.close(); flushSync();
  expect(button().getAttribute('data-window-focused')).toBe('false');
  await add();
  expect(button().getAttribute('data-window-focused')).toBe('false');
  await advance(5001); expect(root()).not.toBe(null);
  const freshFocus = spy.mock.calls.filter(call => call[0] === 'focus' && call[2] === true).at(-1)![1] as EventListener;
  ownerWindowEvent('focus', freshFocus);
  await advance(5001); expect(root()).toBe(null);
});
for (const type of ['pointerup', 'pointercancel'] as const) it(`flushes deferred mouseleave on touch ${type}`, async () => { // source-drawn supplement, no parity credit
  await render(); await add(); mouse('mouseenter'); pointer(get('root'), 'touch'); mouse('mouseleave');
  expect(get('viewport').hasAttribute('data-expanded')).toBe(true); await advance(5001); expect(root()).not.toBe(null);
  endPointer(get('root'), type); expect(get('viewport').hasAttribute('data-expanded')).toBe(false);
  await advance(4999); expect(root()).not.toBe(null); await advance(2); expect(root()).toBe(null);
});
it('flushes deferred mouseleave after exit removal while the owner window stays blurred', async () => { // source-drawn supplement, no parity credit
  const manager = createToastManager(); const listeners = vi.spyOn(window, 'addEventListener');
  await render({ toastManager: manager });
  manager.add({ id: 'oldest', title: 'Oldest' }); manager.add({ id: 'newest', title: 'Newest' }); await tick();
  const newest = get('root'); let finish!: () => void;
  const finished = new Promise<void>(resolve => { finish = resolve; });
  Object.defineProperty(newest, 'getAnimations', { value: () => [{ finished }] });
  mouse('mouseenter'); manager.close('newest'); await tick();
  expect(newest.hasAttribute('data-ending-style')).toBe(true); mouse('mouseleave');
  expect(get('viewport').hasAttribute('data-expanded')).toBe(true);
  const blur = listeners.mock.calls.find(call => call[0] === 'blur' && call[2] === true)?.[1] as EventListener;
  const event = new FocusEvent('blur'); Object.defineProperty(event, 'composedPath', { value: () => [window] }); blur(event);
  await advance(20); finish(); await tick(); await Promise.resolve(); await tick();
  expect(document.querySelectorAll('[data-testid="root"]')).toHaveLength(1);
  expect(get('viewport').hasAttribute('data-expanded')).toBe(false);
  await advance(10000); expect(root()).not.toBe(null);
});
it('reads consumer focus changes synchronously after onClose', async () => { // local regression, no parity credit
  const manager = createToastManager(); await render({ toastManager: manager, timeout: 0 });
  const outside = document.createElement('button'); document.body.appendChild(outside);
  manager.add({ id: 'focus', title: 'Focus', onClose: () => outside.focus() }); await tick();
  button().focus(); key(button(), 'F6'); get('root').focus(); manager.close('focus');
  expect(document.activeElement).toBe(outside);
});
it('reads a sibling added by onClose before synchronously transferring focus', async () => { // local regression, no parity credit
  const manager = createToastManager(); await render({ toastManager: manager, timeout: 0 });
  manager.add({ id: 'focus', title: 'Focus', onClose: () => {
    manager.add({ id: 'sibling', title: 'Sibling' });
  } }); await tick(); button().focus(); key(button(), 'F6'); get('root').focus();
  Object.defineProperty(get('root'), 'getAnimations', { value: () => [{ finished: new Promise<void>(() => {}) }] });
  manager.close('focus');
  const newest = get('root'); expect(newest.textContent).toContain('Sibling'); expect(document.activeElement).toBe(newest);
});
it('stale Viewport teardown preserves the replacement registration and listeners', async () => { // local regression, no parity credit
  const manager = createToastManager(); const removals = vi.spyOn(window, 'removeEventListener');
  await render({ toastManager: manager, timeout: 0, showFirstViewport: true }); await add();
  (mounted[0] as { removeFirstViewport(): void }).removeFirstViewport(); await tick();
  expect(document.querySelector('[data-testid="first-viewport"]')).toBe(null);
  for (const type of ['keydown', 'blur', 'focus']) expect(removals.mock.calls.filter(([name]) => name === type)).toHaveLength(1);
  button().focus(); key(button(), 'F6'); expect(document.activeElement).toBe(get('viewport')); get('root').focus();
  manager.close(); expect(document.activeElement).toBe(button());
});

it.each([false, true])('commits a newly un-limited successor before synchronous close focus (animations=%s)', async animations => { // local regression, no parity credit
  const manager = createToastManager(); await render({ toastManager: manager, timeout: 0, limit: 1 });
  manager.add({ id: 'older', title: 'Older' }); manager.add({ id: 'newer', title: 'Newer' }); await tick();
  const roots = [...document.querySelectorAll<HTMLElement>('[data-testid="root"]')];
  const [newer, older] = roots;
  expect(older.hasAttribute('inert')).toBe(true);
  if (animations) Object.defineProperty(newer, 'getAnimations', { value: () => [{ finished: new Promise<void>(() => {}) }] });
  const focus = vi.spyOn(older, 'focus').mockImplementation(() => {
    expect(older.hasAttribute('inert')).toBe(false);
  });
  button().focus(); key(button(), 'F6'); newer.focus();
  manager.close('newer');
  expect(focus).toHaveBeenCalledTimes(1);
});
it('preserves outside focus chosen during a synchronous no-animation exit flush', async () => { // local regression, no parity credit
  const manager = createToastManager(); await render({ toastManager: manager, timeout: 0, limit: 1 });
  const outside = document.createElement('button'); document.body.appendChild(outside);
  manager.add({ id: 'older', title: 'Older' });
  manager.add({ id: 'newer', title: 'Newer', onRemove: () => outside.focus() }); await tick();
  const [newer, older] = [...document.querySelectorAll<HTMLElement>('[data-testid="root"]')];
  button().focus(); key(button(), 'F6'); newer.focus();
  manager.close('newer');
  expect(older.hasAttribute('inert')).toBe(false);
  expect(document.activeElement).toBe(outside);
});

it('does not focus stale successor refs after the viewport disconnects during exit flush', async () => { // local regression, no parity credit
  const manager = createToastManager(); await render({ toastManager: manager, timeout: 0, limit: 1 });
  manager.add({ id: 'older', title: 'Older' });
  manager.add({ id: 'newer', title: 'Newer', onRemove: () => get('viewport').remove() }); await tick();
  const [newer, older] = [...document.querySelectorAll<HTMLElement>('[data-testid="root"]')];
  const focus = vi.spyOn(older, 'focus');
  button().focus(); key(button(), 'F6'); newer.focus();
  manager.close('newer');
  expect(older.isConnected).toBe(false);
  expect(focus).not.toHaveBeenCalled();
});

it.each([false, true])('tracks real owner-window focus while empty (previous toast=%s)', async previousToast => { // local regression, no parity credit
  const manager = createToastManager(); await render({ toastManager: manager });
  if (previousToast) { await add(); }
  const dispatch = (type: 'blur' | 'focus') => {
    const event = new FocusEvent(type);
    Object.defineProperty(event, 'composedPath', { value: () => [window] });
    window.dispatchEvent(event);
  };
  dispatch('blur'); flushSync();
  if (previousToast) { manager.close(); flushSync(); }
  expect(root()).toBe(null);
  expect(button().getAttribute('data-window-focused')).toBe('false');
  dispatch('focus'); await advance(0);
  expect(button().getAttribute('data-window-focused')).toBe('true');
  await add(); await advance(4999); expect(root()).not.toBe(null);
  await advance(2); expect(root()).toBe(null);
  dispatch('blur'); flushSync();
  await add(); await advance(10000); expect(root()).not.toBe(null);
  dispatch('focus'); await advance(4999); expect(root()).not.toBe(null);
  await advance(2); expect(root()).toBe(null);
});

it.each(['hover', 'focus'])('keeps timers paused until both hover and focus end (first exit=%s)', async firstExit => { // intentional upstream correction, no parity credit
  await render(); await add(); mouse('mouseenter'); key(button(), 'F6');
  await advance(1000);
  if (firstExit === 'hover') mouse('mouseleave'); else button().focus();
  await advance(10000); expect(root()).not.toBe(null);
  if (firstExit === 'hover') button().focus(); else mouse('mouseleave');
  await advance(4999); expect(root()).not.toBe(null);
  await advance(2); expect(root()).toBe(null);
});
it('starts paused when the owner document is already blurred at mount', async () => { // intentional upstream correction, no parity credit
  vi.mocked(document.hasFocus).mockReturnValue(false);
  await render(); expect(button().getAttribute('data-window-focused')).toBe('false');
  await add(); await advance(10000); expect(root()).not.toBe(null);
  vi.mocked(document.hasFocus).mockReturnValue(true);
  const event = new FocusEvent('focus');
  Object.defineProperty(event, 'composedPath', { value: () => [window] });
  window.dispatchEvent(event);
  await advance(4999); expect(root()).not.toBe(null);
  await advance(2); expect(root()).toBe(null);
});
it('outside touch clears interactions without resuming a blurred owner window', async () => { // intentional upstream correction, no parity credit
  await render(); await add(); mouse('mouseenter');
  const event = new FocusEvent('blur');
  Object.defineProperty(event, 'composedPath', { value: () => [window] });
  window.dispatchEvent(event); pointer(document.body, 'touch');
  await advance(10000); expect(root()).not.toBe(null);
  const focusEvent = new FocusEvent('focus');
  Object.defineProperty(focusEvent, 'composedPath', { value: () => [window] });
  window.dispatchEvent(focusEvent);
  await advance(4999); expect(root()).not.toBe(null);
  await advance(2); expect(root()).toBe(null);
});
it('descendant focus cannot resume timers while the owner document remains blurred', async () => { // intentional upstream correction, no parity credit
  vi.mocked(document.hasFocus).mockReturnValue(false);
  await render(); await add(); button().focus();
  await advance(10000); expect(document.hasFocus()).toBe(false); expect(root()).not.toBe(null);
  vi.mocked(document.hasFocus).mockReturnValue(true);
  const event = new FocusEvent('focus');
  Object.defineProperty(event, 'composedPath', { value: () => [window] });
  window.dispatchEvent(event);
  await advance(4999); expect(root()).not.toBe(null);
  await advance(2); expect(root()).toBe(null);
});

it.each([false, true])('commits callback additions before selecting refs (index keys=%s)', async indexKeys => { // local regression, no parity credit
  const manager = createToastManager(); await render({ toastManager: manager, timeout: 0, indexKeys });
  manager.add({ id: 'older', title: 'Older' });
  manager.add({ id: 'closing', title: 'Closing', onClose: () => manager.add({ id: 'fresh', title: 'Fresh' }) }); await tick();
  const closing = get('root');
  for (const node of document.querySelectorAll('[data-testid="root"]')) {
    Object.defineProperty(node, 'getAnimations', { value: () => [{ finished: new Promise<void>(() => {}) }] });
  }
  button().focus(); key(button(), 'F6'); closing.focus(); manager.close('closing'); flushSync();
  const older = [...document.querySelectorAll<HTMLElement>('[data-testid="root"]')].find(node => node.textContent?.includes('Older'))!;
  expect(document.activeElement).toBe(older);
});
it.each([false, true])('keeps a same-ID callback replacement focused and its timer paused (index keys=%s)', async indexKeys => { // local regression, no parity credit
  const manager = createToastManager(); await render({ toastManager: manager, indexKeys });
  manager.add({ id: 'replace', title: 'Old', onClose: () => manager.add({ id: 'replace', title: 'Fresh', timeout: 50, priority: 'high' }) }); await tick();
  button().focus(); key(button(), 'F6'); get('root').focus(); manager.close('replace'); flushSync();
  expect(get('root').textContent).toContain('Fresh'); expect(document.activeElement).toBe(get('root'));
  expect(get('viewport').hasAttribute('data-expanded')).toBe(true);
  expect(document.querySelector('[role="alert"]')).toBe(null);
  await advance(100); expect(root()).not.toBe(null);
  button().focus(); await advance(51); expect(root()).toBe(null);
});
it('aborts close focus when an exit callback disposes the still-connected owner', async () => { // local regression, no parity credit
  const manager = createToastManager(); let store: import('../../src/lib/toast/store.js').ToastStore;
  await render({ toastManager: manager, timeout: 0, limit: 1, onStore: (value: typeof store) => { store = value; } });
  manager.add({ id: 'older', title: 'Older' }); manager.add({ id: 'closing', title: 'Closing', onRemove: () => store.dispose() }); await tick();
  const [closing, older] = [...document.querySelectorAll<HTMLElement>('[data-testid="root"]')];
  const focus = vi.spyOn(older, 'focus'); button().focus(); key(button(), 'F6'); closing.focus(); manager.close('closing');
  expect(get('viewport').isConnected).toBe(true); expect(focus).not.toHaveBeenCalled();
});
