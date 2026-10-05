// Authored literal transport characterization for three preserved Source adaptation failures.
// Actual pinned Original and native Svelte; zero unchanged Original declaration credit.
import { afterEach, expect, it, vi } from 'vitest';
import { flushSync, mount, tick, unmount } from 'svelte';
import Fixture from './PopupRootSourceFixture.svelte';
import { actRootHoverReference, flushRootHoverReference, mountRootHoverReference } from '../../../../apps/fixtures/src/lib/popup-root-hover-reference.js';
const cleanup: (() => void | Promise<void>)[] = [];
afterEach(async () => { for (const stop of cleanup.splice(0)) await stop(); vi.useRealTimers(); vi.restoreAllMocks(); document.body.replaceChildren(); document.body.removeAttribute('style'); document.documentElement.removeAttribute('style'); });
for (const reference of [true, false]) for (const [family, leavePositioner] of [['preview-card', false], ['preview-card', true], ['tooltip', false]] as const) {
  it(`${reference ? 'actual Original' : 'literal native'} ${family} ${leavePositioner ? 'positioner' : 'trigger'} hover-close`, async () => {
    vi.useFakeTimers(); const target = document.createElement('section'); document.body.append(target); const previous: boolean[] = [];
    const instance = reference ? mountRootHoverReference(target, family, value => previous.push(value)) : mount(Fixture, { target, props: { family, arrangement: 'multiple-detached', controlledSync: true, onPreviousOpen: value => previous.push(value) } });
    cleanup.push(() => reference ? (instance as ReturnType<typeof mountRootHoverReference>).stop() : unmount(instance));
    const flush = (callback?: () => void) => reference ? flushRootHoverReference(callback) : flushSync(callback);
    if (reference) await actRootHoverReference(async () => { flush(); await vi.advanceTimersByTimeAsync(50); });
    else { flush(); await tick(); await vi.advanceTimersByTimeAsync(50); }
    const trigger = document.getElementById('trigger')!;
    const pointer = new Event('pointerdown', { bubbles: true }); Object.defineProperty(pointer, 'pointerType', { value: 'mouse' }); flush(() => trigger.dispatchEvent(pointer));
    const mouse = (element: Element, type: string) => flush(() => element.dispatchEvent(new MouseEvent(type, { bubbles: type === 'mousemove' })));
    mouse(trigger, 'mouseenter'); mouse(trigger, 'mousemove'); await vi.advanceTimersByTimeAsync(600); await tick(); flush();
    expect(document.querySelector('[data-testid=popup]')).not.toBeNull();
    if ('snapshot' in instance) expect(instance.snapshot()).toEqual({ open: true, activeTriggerId: 'trigger', referenceIsActual: true, positionerElementIsActual: true, floatingStoreElementIsActual: true, floatingElementIsPositioner: true });
    const leaveNode = leavePositioner ? document.querySelector('[data-testid=positioner]')! : trigger;
    if (leavePositioner) mouse(leaveNode, 'mouseenter'); mouse(leaveNode, 'mouseleave'); await vi.advanceTimersByTimeAsync(family === 'preview-card' ? 300 : 0); await tick(); flush();
    expect(document.querySelector('[data-testid=popup]')).toBeNull(); expect(previous).toEqual([false, true]);
  });
}
