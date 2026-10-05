// Authored Source-contract regressions; zero Original declaration credit.
// Prior local assertions remain unchanged in parity/toast/native-source-fidelity-history.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createToastManager } from '../src/lib/toast/index';
import { createToastFacade } from '../src/lib/toast/facade';
import { ToastStore, selectors } from '../src/lib/toast/store';
import { subscribeToManager } from './toast-test-manager';

const stores: ToastStore[] = [];
function setup() {
  const store = new ToastStore();
  stores.push(store);
  return store;
}
afterEach(() => {
  stores.splice(0).forEach((store) => store.dispose());
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('pinned Toast business with canonical native Store transport', () => {
  it('suppresses unchanged snapshots and interrupts stale notifications on reentry', () => {
    const store = setup();
    const initial = store.getSnapshot();
    const calls: string[] = [];
    store.subscribe((state) => {
      calls.push(`first:${state.limit}`);
      expect(store.getSnapshot()).toBe(state);
      if (state.limit === 2) store.set('limit', 1);
    });
    const unsubscribe = store.subscribe((state) => calls.push(`second:${state.limit}`));
    store.setState(initial);
    store.set('focused', false);
    store.update({ limit: 3, timeout: 5000 });
    expect(store.getSnapshot()).toBe(initial);
    expect(calls).toEqual([]);
    store.set('limit', 2);
    expect(calls).toEqual(['first:2', 'first:1', 'second:1']);
    expect(initial.limit).toBe(3);
    unsubscribe();
    unsubscribe();
    store.set('limit', 4);
    expect(calls.at(-1)).toBe('first:4');
  });

  it('shares the imperative ID sequence across managers and stores, while explicit IDs bypass allocation', () => {
    const random = vi
      .spyOn(Math, 'random')
      .mockReturnValueOnce(0.12345)
      .mockReturnValueOnce(0.54321)
      .mockReturnValueOnce(0.98765);
    const first = createToastManager();
    const store = setup();
    const second = createToastManager();
    expect(first.add({ id: 'explicit' })).toBe('explicit');
    expect(store.addToast({ id: 'store-explicit', timeout: 0 })).toBe('store-explicit');
    expect(random).not.toHaveBeenCalled();
    const ids = [first.add({}), store.addToast({ timeout: 0 }), second.add({ id: '' })];
    expect(ids.map((id) => id.split('-')[1])).toEqual(['4fzo', 'jk00', 'zjzs']);
    const counters = ids.map((id) => Number(id.split('-').at(-1)));
    expect(counters).toEqual([counters[0], counters[0] + 1, counters[0] + 2]);
    expect(random).toHaveBeenCalledTimes(3);
  });

  it('upserts active IDs in place and publishes two snapshots for ending-ID replacement', () => {
    const store = setup();
    const onRemove = vi.fn();
    store.addToast({ id: 'save', title: 'Saving', timeout: 0, onRemove });
    store.addToast({ id: 'other', timeout: 0 });
    store.addToast({ id: 'save', title: 'Saved', transitionStatus: 'ending', timeout: 0 });
    expect(store.state.toasts.map((toast) => toast.id)).toEqual(['other', 'save']);
    expect(selectors.toast(store.state, 'save')?.updateKey).toBe(1);
    expect(selectors.toast(store.state, 'save')?.transitionStatus).toBe('starting');
    store.closeToast();
    store.set('hovering', true);
    const snapshots: string[][] = [];
    store.subscribe((state) => snapshots.push(state.toasts.map((toast) => toast.id)));
    store.addToast({ id: 'save', title: 'New lifecycle', timeout: 0 });
    expect(snapshots).toEqual([['other'], ['save', 'other']]);
    expect(selectors.toast(store.state, 'save')?.updateKey).toBe(0);
    expect(onRemove).not.toHaveBeenCalled();
  });

  it('clears interaction in the intermediate empty snapshot of an ending-only replacement', () => {
    const store = setup();
    store.addToast({ id: 'save', timeout: 0 });
    store.closeToast('save');
    store.update({ hovering: true, focused: true });
    const snapshots: string[] = [];
    store.subscribe((state) =>
      snapshots.push(`${state.toasts.length}:${state.hovering}:${state.focused}`),
    );
    store.addToast({ id: 'save', timeout: 0 });
    expect(snapshots).toEqual(['0:false:false', '1:false:false']);
  });

  it('publishes add before scheduling a timeout, including synchronous close reentry', () => {
    vi.useFakeTimers();
    const store = setup();
    const onClose = vi.fn();
    const observations: { status: string | undefined; timers: number }[] = [];
    store.subscribe((state) => {
      const toast = selectors.toast(state, 'save');
      observations.push({ status: toast?.transitionStatus, timers: vi.getTimerCount() });
      if (toast?.transitionStatus === 'starting') store.closeToast('save');
    });
    store.addToast({ id: 'save', timeout: 100, onClose });
    expect(observations).toEqual([
      { status: 'starting', timers: 0 },
      { status: 'ending', timers: 0 },
    ]);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(1);
    vi.advanceTimersByTime(100);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('retains outer timer scheduling after an update subscriber changes the timeout again', () => {
    vi.useFakeTimers();
    const store = setup();
    store.addToast({ id: 'save', timeout: 1000 });
    let reentered = false;
    store.subscribe((state) => {
      if (!reentered && selectors.toast(state, 'save')?.timeout === 500) {
        reentered = true;
        store.updateToast('save', { timeout: 200 });
      }
    });
    store.updateToast('save', { timeout: 500 });
    expect(selectors.toast(store.state, 'save')?.timeout).toBe(200);
    vi.advanceTimersByTime(499);
    expect(selectors.toast(store.state, 'save')?.transitionStatus).not.toBe('ending');
    vi.advanceTimersByTime(1);
    expect(selectors.toast(store.state, 'save')?.transitionStatus).toBe('ending');
  });

  it('retains the captured removal index when onRemove prepends a sibling', () => {
    vi.useFakeTimers();
    const store = setup();
    const snapshots: string[][] = [];
    const onRemove = vi.fn(() => {
      expect(selectors.toast(store.state, 'original')).toBeDefined();
      store.addToast({ id: 'sibling', timeout: 0 });
    });
    store.addToast({ id: 'original', timeout: 100, onRemove });
    store.subscribe((state) => snapshots.push(state.toasts.map((toast) => toast.id)));
    store.removeToast('original');
    expect(snapshots).toEqual([['sibling', 'original'], ['original']]);
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(1);
  });

  it('allows bounded recursive removal and keeps the removed toast timer until it fires', () => {
    vi.useFakeTimers();
    const store = setup();
    let calls = 0;
    store.addToast({
      id: 'save',
      timeout: 100,
      onRemove: () => {
        calls += 1;
        if (calls === 1) store.removeToast('save');
      },
    });
    store.removeToast('save');
    expect(calls).toBe(2);
    expect(store.state.toasts).toEqual([]);
    expect(vi.getTimerCount()).toBe(1);
    vi.advanceTimersByTime(100);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('propagates removal errors and preserves callback mutations before the throw', () => {
    const store = setup();
    const failure = new Error('consumer');
    const callback = vi.fn<() => void>(() => {
      store.addToast({ id: 'sibling', timeout: 0 });
      throw failure;
    });
    store.addToast({ id: 'save', timeout: 0, onRemove: callback });
    expect(() => store.removeToast('save')).toThrow(failure);
    expect(store.state.toasts.map((toast) => toast.id)).toEqual(['sibling', 'save']);
    callback.mockImplementation(() => {});
    store.removeToast('save');
    expect(store.state.toasts.map((toast) => toast.id)).toEqual(['sibling']);
  });

  it('rereads after functional updates and gives recursive close callbacks ending snapshots', () => {
    const store = setup();
    const onClose = vi.fn(() => {
      expect(store.state.toasts.every((toast) => toast.transitionStatus === 'ending')).toBe(true);
      store.closeToast();
    });
    store.addToast({ id: 'a', timeout: 0, onClose });
    store.updateToast('a', () => {
      store.addToast({ id: 'b', timeout: 0, onClose });
      return { title: 'Updated' };
    });
    expect(store.state.toasts.map((toast) => toast.id)).toEqual(['b', 'a']);
    store.closeToast();
    expect(onClose).toHaveBeenCalledTimes(2);
    const updater = vi.fn(() => ({ title: 'Ignored' }));
    store.updateToast('a', updater);
    store.updateToast('missing', updater);
    expect(updater).not.toHaveBeenCalled();
  });

  it('retains live channel Set order, unattached promise identity and listener exceptions', () => {
    const manager = createToastManager();
    const calls: string[] = [];
    let detachSecond = () => {};
    manager[' subscribe'](({ action }) => {
      calls.push(`first:${action}`);
      if (action === 'add') {
        detachSecond();
        manager[' subscribe'](() => calls.push('late'));
        manager.close();
      }
    });
    detachSecond = manager[' subscribe'](() => calls.push('second'));
    manager.add({ id: 'a' });
    expect(calls).toEqual(['first:add', 'first:close', 'late', 'late']);
    const unattached = createToastManager();
    const promise = Promise.resolve(7);
    expect(
      unattached.promise(promise, { loading: 'Loading', success: 'Saved', error: 'Failed' }),
    ).toBe(promise);
    const failure = new Error('listener');
    const later = vi.fn();
    unattached[' subscribe'](() => {
      throw failure;
    });
    unattached[' subscribe'](later);
    expect(() => unattached.close()).toThrow(failure);
    expect(later).not.toHaveBeenCalled();
  });

  it('clears timers without terminal disposal and retains promise settlement result identity', async () => {
    vi.useFakeTimers();
    const store = setup();
    const facade = createToastFacade(store);
    let resolve!: (value: object) => void;
    const result = facade.promise(
      new Promise<object>((yes) => {
        resolve = yes;
      }),
      { loading: 'Loading', success: 'Saved', error: 'Failed' },
    );
    store.addToast({ id: 'timed', timeout: 100 });
    store.disposeEffect()();
    expect(vi.getTimerCount()).toBe(0);
    const value = {};
    resolve(value);
    expect(await result).toBe(value);
    expect(facade.toasts.some((toast) => toast.description === 'Saved')).toBe(true);
    expect(vi.getTimerCount()).toBe(1);
    facade.add({ id: 'retained', timeout: 0 });
    expect(facade.toasts[0].id).toBe('retained');
  });

  it('returns the last consumer promise and preserves each independent rejection branch', async () => {
    const manager = createToastManager();
    const first = setup();
    const second = setup();
    const handled: Promise<unknown>[] = [];
    manager[' subscribe'](({ action, options }) => {
      if (action !== 'promise') return;
      const handoff = options.setPromise;
      options.setPromise = (promise: Promise<unknown>) => {
        handled.push(promise);
        handoff(promise);
        // The harness owns rejection handling; runtime Provider adds no observer.
        void promise.catch(() => {});
      };
    });
    const detachFirst = subscribeToManager(first, manager);
    const detachSecond = subscribeToManager(second, manager);
    const failure = new Error('save failed');
    const error = vi.fn(() => 'Failed');
    const result = manager.promise(Promise.reject(failure), {
      loading: 'Loading',
      success: 'Saved',
      error,
    });
    expect(handled).toHaveLength(2);
    expect(handled[0]).not.toBe(handled[1]);
    expect(result).toBe(handled[1]);
    await expect(result).rejects.toBe(failure);
    await expect(handled[0]).rejects.toBe(failure);
    expect(error).toHaveBeenCalledTimes(2);
    expect(first.state.toasts[0].description).toBe('Failed');
    expect(second.state.toasts[0].description).toBe('Failed');
    detachFirst();
    detachSecond();
  });
});
