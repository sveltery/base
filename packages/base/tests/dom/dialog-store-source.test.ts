// Supplemental business regressions for the actual pinned shared popup store port (MIT).
import { describe, expect, it, vi } from 'vitest';
import { Store } from '../../src/lib/utils/store/Store.svelte.js';
import {
  DialogStore,
  createNullDialogStore,
} from '../../src/lib/dialog/store/DialogStore.svelte.js';
import { DialogHandle } from '../../src/lib/dialog/store/DialogHandle.svelte.js';
import { createChangeEventDetails } from '../../src/lib/internals/createBaseUIEventDetails.js';

describe('original Store recursive notification and snapshot contracts', () => {
  it('stops an outer notification after a recursive update', () => {
    const store = new Store({ value: 0 });
    const seen: number[] = [];
    store.subscribe((state) => {
      seen.push(state.value);
      if (state.value === 1) store.set('value', 2);
    });
    store.subscribe((state) => seen.push(state.value * 10));
    store.set('value', 1);
    expect(seen).toEqual([1, 2, 20]);
    expect(store.getSnapshot()).toEqual({ value: 2 });
  });
  it('does not notify Object.is-equal writes and preserves a state snapshot', () => {
    const store = new Store({ value: Number.NaN, count: 0 });
    const initial = store.state;
    const listener = vi.fn();
    store.subscribe(listener);
    store.set('value', Number.NaN);
    store.update({ count: 0 });
    expect(listener).not.toHaveBeenCalled();
    store.update({ count: 1 });
    expect(store.state).not.toBe(initial);
    expect(initial.count).toBe(0);
    expect(listener).toHaveBeenCalledTimes(1);
  });
});

describe('actual DialogStore and BasePopupHandle source ownership', () => {
  it('notifies before dispatch/update, retains a canceled prevent-unmount write, then resets on accepted opening', () => {
    const store = new DialogStore<number>(undefined, 'popup', false);
    const order: string[] = [];
    store.context.onOpenChange = (open, details) => {
      order.push(`consumer:${store.select('open')}`);
      details.preventUnmountOnClose();
      if (open) details.cancel();
    };
    store.state.floatingRootContext.context.events.on('openchange', () => order.push('dispatch'));
    store.setOpen(true, createChangeEventDetails('imperative-action'));
    expect(order).toEqual(['consumer:false']);
    expect(store.select('open')).toBe(false);
    // DialogStore intentionally writes this flag immediately, before callback cancellation.
    expect(store.state.preventUnmountingOnClose).toBe(true);
    store.context.onOpenChange = () => order.push(`accepted:${store.select('open')}`);
    store.setOpen(true, createChangeEventDetails('imperative-action'));
    expect(order).toEqual(['consumer:false', 'accepted:false', 'dispatch']);
    expect(store.state.preventUnmountingOnClose).toBe(false);
  });
  it('selects controlled open/trigger state and retains internal owning trigger through close', () => {
    const trigger = document.createElement('button');
    trigger.id = 'owner';
    const store = new DialogStore<number>(
      { openProp: false, triggerIdProp: 'controlled' },
      'popup',
      false,
    );
    store.setOpen(true, createChangeEventDetails('trigger-press', undefined, trigger));
    expect(store.state.open).toBe(true);
    expect(store.select('open')).toBe(false);
    expect(store.select('activeTriggerId')).toBe('controlled');
    const change = vi.fn();
    store.context.onOpenChange = change;
    store.setOpen(false, createChangeEventDetails('imperative-action'));
    expect(change.mock.calls[0][1].trigger).toBe(trigger);
    expect(store.state.activeTriggerElement).toBe(trigger);
  });
  it('keeps the null store inert while permitting registration in its context', () => {
    const fallback = createNullDialogStore<number>();
    const trigger = document.createElement('button');
    fallback.context.triggerElements.add('before-root', trigger);
    fallback.set('payload', 4);
    fallback.update({ mounted: true });
    expect(fallback.select('payload')).toBeUndefined();
    expect(fallback.select('mounted')).toBe(false);
    expect(fallback.context.triggerElements.getById('before-root')).toBe(trigger);
  });
  it('uses shared attachment-stack lookup and preserves payload write before canceled open', () => {
    const handle = new DialogHandle<number>();
    const trigger = document.createElement('button');
    trigger.id = 'old-owner';
    handle.serverStore.context.triggerElements.add(trigger.id, trigger);
    const older = new DialogStore<number>(undefined, 'older', false);
    const newer = new DialogStore<number>(undefined, 'newer', false);
    const detachOlder = handle.attachStore(older);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const detachNewer = handle.attachStore(newer);
    handle.open(trigger.id);
    expect(newer.state.activeTriggerElement).toBe(trigger);
    newer.context.onOpenChange = (_open, details) => details.cancel();
    handle.openWithPayload(8);
    expect(newer.state.payload).toBe(8);
    detachNewer();
    expect(handle.store).toBe(older);
    detachOlder();
    expect(handle.store).toBe(handle.serverStore);
    expect(handle.isOpen).toBe(false);
    warn.mockRestore();
  });
});
