// Pinned ScrollArea original assertion ports and explicitly labeled native supplements; MIT.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { flushSync, mount, tick, unmount } from 'svelte';
import Fixture from './ScrollAreaFixture.svelte';
import { ScrollArea } from '../../src/lib/scroll-area/index.js';
const mounted: ReturnType<typeof mount>[] = [];
const observers = new Set<Observer>();
class Observer {
  constructor(readonly callback: ResizeObserverCallback) {}
  observe() { observers.add(this); }
  disconnect() { observers.delete(this); }
  unobserve() {}
}
function node(id: string) { return document.querySelector<HTMLElement>(`[data-testid="${id}"]`)!; }
function pointer(id: string, type: string, init: Partial<PointerEventInit> = {}) {
  const event = new MouseEvent(type, { bubbles: true, cancelable: true, button: 0, buttons: 1, ...init });
  Object.defineProperties(event, { pointerId: { value: init.pointerId ?? 1 }, pointerType: { value: init.pointerType ?? 'mouse' } });
  node(id).dispatchEvent(event); flushSync(); return event;
}
async function setup(props: Record<string, unknown> = {}) {
  const target = document.createElement('div'); document.body.append(target);
  mounted.push(mount(Fixture, { target, props })); flushSync();
  document.querySelectorAll<HTMLElement>('[data-testid]').forEach(element => {
    for (const key of ['marginInlineStart', 'marginInlineEnd', 'marginBlockStart', 'marginBlockEnd', 'paddingInlineStart', 'paddingInlineEnd', 'paddingBlockStart', 'paddingBlockEnd']) element.style.setProperty(key.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`), '0px');
  });
  if (!props.noViewport) Object.defineProperties(node('viewport'), { clientHeight: { value: 200, configurable: true }, clientWidth: { value: 200, configurable: true }, scrollHeight: { value: 1000, configurable: true }, scrollWidth: { value: 1000, configurable: true } });
  for (const axis of ['vertical', 'horizontal']) {
    Object.defineProperties(node(axis), { offsetHeight: { value: 200, configurable: true }, offsetWidth: { value: 200, configurable: true } });
    const thumb = node(`${axis}-thumb`);
    Object.defineProperties(thumb, { offsetHeight: { value: 40, configurable: true }, offsetWidth: { value: 40, configurable: true }, setPointerCapture: { value: vi.fn() }, hasPointerCapture: { value: vi.fn(() => false) }, releasePointerCapture: { value: vi.fn() } });
  }
  await tick(); observers.forEach(observer => observer.callback([], observer as unknown as ResizeObserver)); await tick();
}
beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal('ResizeObserver', Observer);
  Object.defineProperty(Element.prototype, 'getAnimations', { configurable: true, value: () => [] });
});
afterEach(async () => { for (const component of mounted.splice(0)) await unmount(component); document.body.replaceChildren(); expect(observers.size).toBe(0); vi.useRealTimers(); vi.unstubAllGlobals(); });
describe('ScrollArea pinned rendered assertion ports', () => {
  it('R:67/V:139/V:270/S:76/T:579 user scrolling tracks independent axes and expires at500ms', async () => {
    await setup();
    pointer('viewport', 'pointerenter');
    node('viewport').scrollTop = 1; node('viewport').dispatchEvent(new Event('scroll')); flushSync();
    expect(node('root').hasAttribute('data-scrolling')).toBe(true);
    expect(node('viewport').hasAttribute('data-scrolling')).toBe(true);
    expect(node('vertical').hasAttribute('data-scrolling')).toBe(true);
    expect(node('vertical-thumb').hasAttribute('data-scrolling')).toBe(true);
    expect(node('horizontal').hasAttribute('data-scrolling')).toBe(false);
    await vi.advanceTimersByTimeAsync(499); flushSync(); expect(node('vertical').hasAttribute('data-scrolling')).toBe(true);
    pointer('viewport', 'pointerenter'); node('viewport').scrollLeft = 1; node('viewport').dispatchEvent(new Event('scroll')); flushSync();
    await vi.advanceTimersByTimeAsync(1); flushSync(); expect(node('vertical').hasAttribute('data-scrolling')).toBe(false); expect(node('horizontal').hasAttribute('data-scrolling')).toBe(true);
    await vi.advanceTimersByTimeAsync(499); flushSync(); expect(node('root').hasAttribute('data-scrolling')).toBe(false);
  });
  it('V:172/193/220/241 programmatic suppression, touch modality and return to mouse', async () => {
    await setup();
    node('viewport').scrollTop = 1; node('viewport').dispatchEvent(new Event('scroll')); flushSync(); expect(node('viewport').hasAttribute('data-scrolling')).toBe(false);
    pointer('viewport','pointerdown',{ pointerType:'touch' }); await vi.advanceTimersByTimeAsync(200);
    node('viewport').scrollTop = 2; node('viewport').dispatchEvent(new Event('scroll')); flushSync(); expect(node('viewport').hasAttribute('data-scrolling')).toBe(true);
    await vi.advanceTimersByTimeAsync(500); pointer('root','pointermove',{pointerType:'mouse'});
    node('viewport').scrollTop = 3; node('viewport').dispatchEvent(new Event('scroll')); flushSync(); expect(node('viewport').hasAttribute('data-scrolling')).toBe(false);
  });
  it('T:490/504/518/536/556 snap restore, second pointer guard, capture takeover and primary press', async () => {
    await setup();
    const thumb = node('vertical-thumb'); let active: number | null = null;
    vi.mocked(thumb.setPointerCapture).mockImplementation(id => { active = id; });
    vi.mocked(thumb.hasPointerCapture).mockImplementation(id => active === id);
    vi.mocked(thumb.releasePointerCapture).mockImplementation(() => { active = null; });
    pointer('vertical-thumb','pointerdown',{button:2}); expect(node('viewport').style.scrollSnapType).toBe('y mandatory');
    pointer('vertical-thumb','pointerdown'); expect(node('viewport').style.scrollSnapType).toBe('none');
    pointer('vertical-thumb','pointerdown',{pointerId:2}); pointer('vertical-thumb','pointerup',{pointerId:2}); expect(node('viewport').style.scrollSnapType).toBe('none');
    pointer('vertical-thumb','pointerup'); expect(node('viewport').style.scrollSnapType).toBe('y mandatory');
    pointer('vertical-thumb','pointerdown'); active = null; pointer('vertical-thumb','pointerdown',{pointerId:2}); pointer('vertical-thumb','pointercancel',{pointerId:2}); expect(node('viewport').style.scrollSnapType).toBe('y mandatory');
  });
  it('T:236/374 and missed release preserve drag math and clear scrolling without stale release', async () => {
    await setup();
    pointer('vertical-thumb','pointerdown'); pointer('vertical-thumb','pointermove',{ clientY:20 });
    expect(node('viewport').scrollTop).toBe(100); expect(node('vertical-thumb').hasAttribute('data-scrolling')).toBe(true);
    pointer('vertical-thumb','pointermove',{ pointerId:2, clientY:60, buttons:0 }); expect(node('viewport').scrollTop).toBe(100);
    pointer('vertical-thumb','pointermove',{ clientY:60 }); expect(node('viewport').scrollTop).toBe(300);
    pointer('vertical-thumb','pointermove',{ clientY:100, buttons:0 }); expect(node('viewport').scrollTop).toBe(300); expect(node('vertical-thumb').hasAttribute('data-scrolling')).toBe(false); expect(node('viewport').style.scrollSnapType).toBe('y mandatory');
    pointer('horizontal-thumb','pointerdown'); pointer('horizontal-thumb','pointermove',{clientX:20}); expect(node('horizontal').hasAttribute('data-scrolling')).toBe(true);
    pointer('horizontal-thumb','pointercancel'); expect(node('horizontal').hasAttribute('data-scrolling')).toBe(false); expect(thumbRelease()).toBe(0);
  });
  it('T:43/S:245/S:260 gestures without viewport or thumb remain inert', async () => {
    await setup({noViewport:true}); pointer('vertical-thumb','pointerdown'); const move = pointer('vertical-thumb','pointermove',{clientY:20}); expect(move.defaultPrevented).toBe(false); expect(node('vertical-thumb').hasAttribute('data-scrolling')).toBe(false); pointer('vertical-thumb','pointerup');
    pointer('vertical','pointerdown',{clientY:100}); expect(node('vertical').hasAttribute('data-scrolling')).toBe(false);
  });
  it('S:493 parameterized press buttons and S:509 thumb press retain native focus prevention', async () => {
    await setup(); for (const button of [0,1,2]) { const event=new MouseEvent('mousedown',{bubbles:true,cancelable:true,button}); node('vertical').dispatchEvent(event); expect(event.defaultPrevented).toBe(true); }
    const event=new MouseEvent('mousedown',{bubbles:true,cancelable:true}); node('vertical-thumb').dispatchEvent(event); expect(event.defaultPrevented).toBe(true);
  });
  it('S:19/39/C:50 states and aria default belong to actual rendered parts', async () => {
    await setup(); expect(node('vertical').getAttribute('aria-hidden')).toBe('true'); expect(node('horizontal').getAttribute('data-orientation')).toBe('horizontal'); expect(node('corner').getAttribute('aria-hidden')).toBe('true');
  });
  it('native supplement consumer preventBaseUIHandler precedes and suppresses drag movement', async () => {
    await setup({preventMove:true}); pointer('vertical-thumb','pointerdown'); pointer('vertical-thumb','pointermove',{clientY:20}); expect(node('viewport').scrollTop).toBe(0);
  });
  it('native supplement real CSP style suppression, nonce and cleanup', async () => {
    await setup({nonce:'scroll-nonce'}); const styles=[...document.querySelectorAll('style')]; expect(styles).toHaveLength(1); expect(styles[0]?.getAttribute('nonce')).toBe('scroll-nonce'); expect(styles[0]?.textContent).toBe('.base-ui-disable-scrollbar{scrollbar-width:none}.base-ui-disable-scrollbar::-webkit-scrollbar{display:none}');
  });
  it('native supplement every live observer disconnects and timers clear at unmount', async () => {
    await setup(); pointer('viewport','pointerenter'); node('viewport').scrollTop = 1; node('viewport').dispatchEvent(new Event('scroll')); flushSync(); expect(observers.size).toBe(2);
    for(const component of mounted.splice(0)) await unmount(component); expect(observers.size).toBe(0); await vi.advanceTimersByTimeAsync(1000); expect(vi.getTimerCount()).toBe(0);
  });
  it('V:488/T:25 required contexts throw exact pinned errors', () => {
    const target=document.createElement('div');
    expect(() => mount(ScrollArea.Viewport,{target})).toThrow('Base UI: ScrollAreaRootContext is missing. ScrollArea parts must be placed within <ScrollArea.Root>.');
    expect(() => mount(ScrollArea.Thumb,{target})).toThrow('Base UI: ScrollAreaRootContext is missing. ScrollArea parts must be placed within <ScrollArea.Root>.');
  });
});
function thumbRelease() { return vi.mocked(node('vertical-thumb').releasePointerCapture).mock.calls.length + vi.mocked(node('horizontal-thumb').releasePointerCapture).mock.calls.length; }
