// Native actual Store/callback/DOM timing witnesses for the complete Source helper; zero declaration credit.
import { afterEach, expect, it, vi } from 'vitest';
import { flushSync, mount, tick, unmount } from 'svelte';
import { applyPopupOpenChange } from '../../src/lib/utils/popups/popupStoreUtils.svelte.js';
import { REASONS } from '../../src/lib/internals/reasons.js';
import { createStore, details } from './popup-open-change-store.js';
import Fixture from './PopupOpenChangeFixture.svelte';

const mounted: ReturnType<typeof mount>[] = [];
afterEach(async () => {
  await Promise.all(mounted.splice(0).map((component) => unmount(component)));
  document.body.replaceChildren();
});

it('notifies the caller, performs before-dispatch work, emits the real floating event, then updates state', () => {
  const store = createStore();
  const trigger = document.createElement('button');
  trigger.id = 'trigger';
  const event = new MouseEvent('click');
  const change = details(REASONS.triggerPress, event, trigger);
  const trace: string[] = [];
  store.context.onOpenChange = (open, received) => {
    expect(open).toBe(true);
    expect(received).toBe(change);
    expect(store.state.open).toBe(false);
    trace.push('caller');
  };
  store.state.floatingRootContext.context.events.on('openchange', (received) => {
    expect(received).toEqual({
      open: true,
      reason: REASONS.triggerPress,
      nativeEvent: event,
      nested: false,
      triggerElement: trigger,
    });
    expect(store.state.open).toBe(false);
    trace.push('floating');
  });
  store.subscribe((next) => {
    expect(next.open).toBe(true);
    trace.push('state');
  });
  applyPopupOpenChange(store, true, change, {
    onBeforeDispatch() {
      expect(store.state.open).toBe(false);
      trace.push('before');
    },
    extraState: { lastReason: REASONS.triggerPress },
  });
  expect(trace).toEqual(['caller', 'before', 'floating', 'state']);
  expect(store.state.activeTriggerId).toBe('trigger');
  expect(store.state.activeTriggerElement).toBe(trigger);
  expect(store.state.lastReason).toBe(REASONS.triggerPress);
  expect(store.state.floatingRootContext.context.dataRef.current.openEvent).toBe(event);
});

it('honors caller cancellation before all dispatch, extra-state, trigger and open mutations', () => {
  const store = createStore();
  const snapshot = store.state;
  const before = vi.fn();
  const floating = vi.fn();
  const updated = vi.fn();
  store.state.floatingRootContext.context.events.on('openchange', floating);
  store.subscribe(updated);
  store.context.onOpenChange = (_open, change) => {
    change.preventUnmountOnClose();
    change.cancel();
  };
  applyPopupOpenChange(store, true, details(REASONS.triggerHover), {
    onBeforeDispatch: before,
    extraState: { lastReason: 'changed' },
  });
  expect(store.state).toBe(snapshot);
  expect(before).not.toHaveBeenCalled();
  expect(floating).not.toHaveBeenCalled();
  expect(updated).not.toHaveBeenCalled();
  expect(store.state.floatingRootContext.context.dataRef.current.openEvent).toBeUndefined();
});

it('attaches preventUnmountOnClose before notifying the caller and clears its flag on the next open', () => {
  const store = createStore();
  store.set('open', true);
  store.context.onOpenChange = (open, change) => {
    if (!open) change.preventUnmountOnClose();
  };
  applyPopupOpenChange(store, false, details(REASONS.closePress));
  expect(store.state.preventUnmountingOnClose).toBe(true);
  applyPopupOpenChange(store, false, details(REASONS.none));
  expect(store.state.preventUnmountingOnClose).toBe(true);
  applyPopupOpenChange(store, true, details(REASONS.none));
  expect(store.state.preventUnmountingOnClose).toBe(false);
});

for (const reason of [REASONS.triggerPress, REASONS.escapeKey]) {
  it(`marks ${reason} closing as dismiss while the same reason opening preserves the current instant type`, () => {
    const store = createStore();
    applyPopupOpenChange(store, true, details(reason));
    expect(store.state.instantType).toBe('delay');
    applyPopupOpenChange(store, false, details(reason));
    expect(store.state.instantType).toBe('dismiss');
  });
}

it('marks focus only when opening, clears hover instant state and preserves other reasons', () => {
  const store = createStore();
  applyPopupOpenChange(store, true, details(REASONS.triggerFocus));
  expect(store.state.instantType).toBe('focus');
  applyPopupOpenChange(store, false, details(REASONS.triggerFocus));
  expect(store.state.instantType).toBe('focus');
  applyPopupOpenChange(store, true, details(REASONS.triggerHover));
  expect(store.state.instantType).toBeUndefined();
  store.set('instantType', 'delay');
  applyPopupOpenChange(store, false, details(REASONS.triggerHover));
  expect(store.state.instantType).toBeUndefined();
  store.set('instantType', 'focus');
  applyPopupOpenChange(store, true, details(REASONS.imperativeAction));
  expect(store.state.instantType).toBe('focus');
});

it('gives popup state priority over extra state and reason instant state priority over supplied instant state', () => {
  const store = createStore();
  const trigger = document.createElement('button');
  trigger.id = 'actual';
  applyPopupOpenChange(store, true, details(REASONS.triggerFocus, undefined, trigger), {
    extraState: {
      open: false,
      activeTriggerId: 'wrong',
      activeTriggerElement: null,
      preventUnmountingOnClose: true,
      instantType: 'delay',
      lastReason: 'focus',
    },
  });
  expect(store.state).toMatchObject({
    open: true,
    activeTriggerId: 'actual',
    activeTriggerElement: trigger,
    preventUnmountingOnClose: false,
    instantType: 'focus',
    lastReason: 'focus',
  });
});

it('retains trigger ownership on unassociated close and clears it on unassociated open', () => {
  const store = createStore();
  const trigger = document.createElement('button');
  trigger.id = 'owner';
  applyPopupOpenChange(store, true, details(REASONS.triggerPress, undefined, trigger));
  applyPopupOpenChange(store, false, details(REASONS.none));
  expect(store.state.activeTriggerId).toBe('owner');
  expect(store.state.activeTriggerElement).toBe(trigger);
  applyPopupOpenChange(store, true, details(REASONS.none));
  expect(store.state.activeTriggerId).toBeNull();
  expect(store.state.activeTriggerElement).toBeNull();
});

it('native hover flush exposes the new actual DOM style before an immediate getAnimations read', async () => {
  const target = document.createElement('main');
  document.body.append(target);
  const app = mount(Fixture, { target });
  mounted.push(app);
  flushSync();
  const node = app.getNode();
  const observed: string[] = [];
  node.getAnimations = () => {
    observed.push(`${node.dataset.open}:${node.style.opacity}`);
    return [];
  };
  app.change(true, REASONS.triggerHover);
  node.getAnimations();
  expect(observed).toEqual(['true:1']);
  app.change(false, REASONS.none);
  node.getAnimations();
  expect(observed).toEqual(['true:1', 'true:1']);
  await tick();
  node.getAnimations();
  expect(observed).toEqual(['true:1', 'true:1', 'false:0']);
  app.change(true, REASONS.none);
  await tick();
  app.change(false, REASONS.triggerHover);
  node.getAnimations();
  expect(observed.at(-1)).toBe('false:0');
});
