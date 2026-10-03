// Supplemental native lifecycle guards; no source root-store declaration credit.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import Fixture from './fixtures/AnchorController.svelte';
import type { AnchorPositioningController } from '../../src/lib/internals/anchor-positioning/controller.svelte.js';
import { positioningAttachments } from '../../src/lib/internals/anchor-positioning/attachments.js';
import { getAutoUpdateOptions } from '../../src/lib/internals/anchor-positioning/policy.js';
import type { AnchorPositioningOptions } from '../../src/lib/internals/anchor-positioning/types.js';
const engine = vi.hoisted(() => ({ compute: vi.fn(), autoUpdate: vi.fn(), cleanup: vi.fn() }));
vi.mock('@floating-ui/dom', async () => ({ ...await vi.importActual('@floating-ui/dom'), computePosition: engine.compute, autoUpdate: engine.autoUpdate }));
const base: AnchorPositioningOptions = { open: true, mounted: true, keepMounted: true, collisionAvoidance: {} };
const cleanups: (() => Promise<void>)[] = [];
const computed = (x: number) => ({ x, y: x, placement: 'bottom' as const, strategy: 'absolute' as const, middlewareData: {} });
async function settle() { await Promise.resolve(); flushSync(); }
function setup(options = base) {
  const target = document.createElement('main'); document.body.append(target);
  let controller!: AnchorPositioningController;
  const component = mount(Fixture, { target, props: { initial: options, onReady: value => controller = value } });
  cleanups.push(() => unmount(component)); flushSync();
  return { controller, component, target };
}
beforeEach(() => {
  engine.compute.mockReset(); engine.autoUpdate.mockReset(); engine.cleanup.mockReset();
  engine.compute.mockResolvedValue(computed(10));
  engine.autoUpdate.mockImplementation((_reference, _floating, update) => { update(); return engine.cleanup; });
});
afterEach(async () => { for (const cleanup of cleanups.splice(0)) await cleanup(); document.body.replaceChildren(); });

describe('native anchor lifecycle supplements', () => {
  it('keeps DOM and virtual position references separate across position replacement', async () => {
    const { controller, target } = setup(); await settle();
    const dom = target.querySelector('button')!;
    const virtual = { getBoundingClientRect: () => new DOMRect(1, 2, 3, 4), contextElement: dom };
    controller.setPositionReference(virtual); flushSync(); await settle();
    expect(controller.elements.domReference).toBe(dom); expect(controller.elements.reference).toBe(virtual);
    controller.setReference(null); flushSync(); await settle();
    expect(controller.elements.reference).toBe(virtual);
    controller.setPositionReference(dom); flushSync(); await settle();
    expect(controller.elements.reference).not.toBe(dom);
    expect(controller.elements.reference).toMatchObject({ contextElement: dom });
    controller.setPositionReference(null); flushSync();
    expect(controller.elements.reference).toBe(null);
  });
  it('ignores an obsolete request after options replacement and runs owned autoUpdate cleanup', async () => {
    let resolveOld!: (value: ReturnType<typeof computed>) => void;
    engine.compute.mockImplementationOnce(() => new Promise(resolve => resolveOld = resolve));
    const { controller, component } = setup();
    component.setOptions({ ...base, sideOffset: 12 }); flushSync(); await settle();
    expect(engine.cleanup).toHaveBeenCalledTimes(1);
    expect(controller.result.x).toBe(10);
    resolveOld(computed(999)); await settle(); expect(controller.result.x).toBe(10);
    expect(engine.compute.mock.calls.every(call => call[2].platform === undefined)).toBe(true);
  });
  it('never publishes coordinates or CSS mutations into a replaced or detached floating host', async () => {
    let resolveOld!: (value: ReturnType<typeof computed>) => void;
    engine.compute.mockImplementationOnce(() => new Promise(resolve => resolveOld = resolve));
    const { controller, target } = setup();
    const old = controller.elements.floating!;
    const oldPolicy = engine.compute.mock.calls[0][2];
    const replacement = document.createElement('div'); target.append(replacement);
    controller.setFloating(replacement); old.remove(); flushSync(); await settle();
    const size = oldPolicy.middleware.find((item: { name: string }) => item.name === 'size');
    size.options.apply({ elements: { floating: old }, availableWidth: 123, availableHeight: 456, rects: { reference: { x: 0, y: 0, width: 50, height: 20 } } });
    expect(old.style.getPropertyValue('--available-width')).toBe('100vw');
    resolveOld(computed(999)); await settle(); expect(controller.result.x).toBe(10);
    expect(replacement.style.transform).toBe('translate(10px, 10px)');
    replacement.remove(); const pending = controller.update(); await pending; await settle();
    expect(controller.result.x).toBe(10);
  });
  it('does not measure initially closed keepMounted hosts, and resets output on close', async () => {
    const { controller, component } = setup({ ...base, open: false, mounted: false }); await settle();
    expect(engine.compute).not.toHaveBeenCalled(); expect(engine.autoUpdate).not.toHaveBeenCalled();
    expect(controller.elements.floating?.style.cssText).toContain('position: fixed');
    component.setOptions(base); flushSync(); await settle(); expect(controller.isPositioned).toBe(true);
    component.setOptions({ ...base, open: false, mounted: false }); flushSync();
    expect(controller.isPositioned).toBe(false); expect(engine.cleanup).toHaveBeenCalledTimes(1);
    const style = controller.elements.floating!.style;
    expect([style.position, style.left, style.top, style.opacity, style.transform]).toEqual(['fixed', '0px', '0px', '0', '']);
  });
  it('preserves positioned output throughout logical closing until mounted presence ends', async () => {
    const { controller, component } = setup(); await settle();
    let resolveExit!: (value: ReturnType<typeof computed>) => void;
    engine.compute.mockImplementationOnce(() => new Promise(resolve => resolveExit = resolve));
    component.setOptions({ ...base, open: false, mounted: true }); flushSync();
    expect(controller.isPositioned).toBe(true);
    expect(controller.elements.floating!.style.transform).toBe('translate(10px, 10px)');
    expect(controller.elements.floating!.style.opacity).toBe('');
    resolveExit(computed(20)); await settle(); await settle();
    expect(controller.isPositioned).toBe(true);
    expect(controller.elements.floating!.style.transform).toBe('translate(20px, 20px)');
    component.setOptions({ ...base, open: false, mounted: false }); flushSync();
    expect(controller.isPositioned).toBe(false);
    expect(controller.elements.floating!.style.opacity).toBe('0');
  });
  it('publishes the latest request only and cancels pending work on teardown', async () => {
    const { controller } = setup(); await settle();
    let resolveOlder!: (value: ReturnType<typeof computed>) => void;
    engine.compute.mockImplementationOnce(() => new Promise(resolve => resolveOlder = resolve));
    const older = controller.update(); await controller.update(); await settle();
    resolveOlder(computed(500)); await older; await settle(); expect(controller.result.x).toBe(10);
    let resolveDetached!: (value: ReturnType<typeof computed>) => void;
    engine.compute.mockImplementationOnce(() => new Promise(resolve => resolveDetached = resolve));
    const detached = controller.update();
    await cleanups.pop()!(); resolveDetached(computed(600)); await detached; await settle();
    expect(controller.result.x).toBe(10); expect(engine.cleanup).toHaveBeenCalled();
  });
  it('attachment cleanup releases only its own host and never wipes middleware size variables', async () => {
    const { controller, target } = setup(); await settle();
    const attach = positioningAttachments(controller);
    const first = document.createElement('div'), second = document.createElement('div'); target.append(first, second);
    const releaseFirst = attach.floating(first); const releaseSecond = attach.floating(second);
    second.style.setProperty('--available-height', '123px'); flushSync(); await settle();
    if (typeof releaseFirst === 'function') releaseFirst();
    expect(controller.elements.floating).toBe(second); expect(second.style.getPropertyValue('--available-height')).toBe('123px');
    if (typeof releaseSecond === 'function') releaseSecond(); flushSync(); expect(controller.elements.floating).toBe(null);
  });
  it('uses the floating host owner window for observers and retains default ancestorResize', () => {
    const iframe = document.createElement('iframe'); document.body.append(iframe);
    const win = iframe.contentWindow!; const floating = win.document.createElement('div');
    Object.defineProperty(win, 'ResizeObserver', { value: class {}, configurable: true });
    Object.defineProperty(win, 'IntersectionObserver', { value: class {}, configurable: true });
    expect(getAutoUpdateOptions(floating)).toEqual({ ancestorScroll: true, elementResize: true, layoutShift: true });
    expect(getAutoUpdateOptions(floating, true)).toEqual({ ancestorScroll: false, elementResize: false, layoutShift: false });
    expect(getAutoUpdateOptions(floating, true)).not.toHaveProperty('ancestorResize');
  });
});
