import { afterEach, describe, expect, it, vi } from 'vitest';
import { createToastManager } from '../src/lib/toast/index';
import { createToastFacade } from '../src/lib/toast/facade';
import { ToastStore, selectors } from '../src/lib/toast/store';

const stores: ToastStore[] = [];
function setup() {
  const store = new ToastStore();
  stores.push(store);
  return store;
}
function deferred<Value>() {
  let resolve!: (value: Value) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<Value>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
afterEach(() => { stores.splice(0).forEach(store => store.dispose()); vi.useRealTimers(); });

describe('actual Toast core subscription and ownership regressions (no upstream leaf credit)', () => {
  it('keeps channel events synchronous and preserves pinned live Set iteration on reentry', () => {
    const manager = createToastManager();
    const observations: string[] = [];
    let secondCleanup = () => {};
    const late = () => observations.push('late');
    manager[' subscribe'](({ action }) => {
      observations.push(`first:${action}`);
      if (action === 'add') { secondCleanup(); manager[' subscribe'](late); manager.close(); }
    });
    secondCleanup = manager[' subscribe'](() => observations.push('second'));
    manager.add({ id: 'a' });
    expect(observations).toEqual(['first:add', 'first:close', 'late', 'late']);
    expect('toasts' in manager).toBe(false);
  });

  it('returns the original unattached promise without invoking state resolvers', async () => {
    const manager = createToastManager();
    const success = vi.fn(() => 'Done');
    const error = vi.fn(() => 'Failed');
    const pending = deferred<object>();
    const result = manager.promise(pending.promise, { loading: 'Loading', success, error });
    expect(result).toBe(pending.promise);
    const value = {};
    pending.resolve(value);
    expect(await result).toBe(value);
    expect(success).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });

  it('gives subscribers consistent metadata and commits timers before synchronous close reentry', () => {
    vi.useFakeTimers();
    const store = setup();
    const before = store.getSnapshot();
    const snapshots: ReturnType<typeof store.getSnapshot>[] = [];
    const unsubscribe = store.subscribe(() => {
      const state = store.getSnapshot();
      snapshots.push(state);
      expect(selectors.toast(state, 'a')).toBe(state.toasts[0]);
      if (state.toasts[0].transitionStatus !== 'ending') {
        expect(vi.getTimerCount()).toBe(1);
        store.closeToast('a');
      }
    });
    expect(snapshots).toHaveLength(0);
    store.addToast({ id: 'a', timeout: 100 });
    expect(snapshots).toHaveLength(2);
    expect(before.toasts).toHaveLength(0);
    expect(snapshots[0].toasts[0].transitionStatus).toBe('starting');
    expect(store.state.toasts[0].transitionStatus).toBe('ending');
    expect(vi.getTimerCount()).toBe(0);
    unsubscribe();
    store.removeToast('a');
    expect(snapshots).toHaveLength(2);
  });

  it('keeps the latest rescheduled timer when a subscriber updates the same toast', () => {
    vi.useFakeTimers();
    const store = setup();
    store.addToast({ id: 'a', timeout: 1000 });
    let reentered = false;
    store.subscribe(() => {
      if (!reentered) { reentered = true; store.updateToast('a', { timeout: 200 }); }
    });
    store.updateToast('a', { timeout: 500 });
    expect(vi.getTimerCount()).toBe(1);
    vi.advanceTimersByTime(199);
    expect(selectors.toast(store.state, 'a')?.transitionStatus).not.toBe('ending');
    vi.advanceTimersByTime(1);
    expect(selectors.toast(store.state, 'a')?.transitionStatus).toBe('ending');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('preserves unrelated-update deadlines and applies new defaults only to later operations', () => {
    vi.useFakeTimers();
    const store = setup();
    store.addToast({ id: 'a' });
    vi.advanceTimersByTime(900);
    store.syncProviderProps(100, 3);
    store.updateToast('a', { title: 'updated' });
    store.addToast({ id: 'b' });
    vi.advanceTimersByTime(99);
    expect(store.state.toasts.every(toast => toast.transitionStatus !== 'ending')).toBe(true);
    vi.advanceTimersByTime(1);
    expect(selectors.toast(store.state, 'b')?.transitionStatus).toBe('ending');
    expect(selectors.toast(store.state, 'a')?.transitionStatus).not.toBe('ending');
    vi.advanceTimersByTime(3999);
    expect(selectors.toast(store.state, 'a')?.transitionStatus).not.toBe('ending');
    vi.advanceTimersByTime(1);
    expect(selectors.toast(store.state, 'a')?.transitionStatus).toBe('ending');
  });

  it('closes five toasts exactly once when onClose recursively closes all', () => {
    const store = setup();
    const onClose = vi.fn(() => {
      expect(store.state.toasts.every(toast => toast.transitionStatus === 'ending')).toBe(true);
      store.closeToast();
    });
    const onRemove = vi.fn();
    for (let i = 0; i < 5; i++) store.addToast({ id: String(i), timeout: 0, onClose, onRemove });
    expect(store.state.toasts.map(toast => toast.limited)).toEqual([false, false, false, true, true]);
    store.closeToast();
    expect(onClose).toHaveBeenCalledTimes(5);
    expect(onRemove).not.toHaveBeenCalled();
    for (let i = 0; i < 5; i++) store.removeToast(String(i));
    expect(onRemove).toHaveBeenCalledTimes(5);
  });

  it('removes before onRemove, retains callback additions and clears active timer ownership', () => {
    vi.useFakeTimers();
    const store = setup();
    const onRemove = vi.fn(() => {
      expect(selectors.toast(store.state, 'a')).toBeUndefined();
      store.removeToast('a');
      store.addToast({ id: 'b', timeout: 0 });
    });
    store.addToast({ id: 'a', timeout: 100, onRemove });
    store.removeToast('a');
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(store.state.toasts.map(toast => toast.id)).toEqual(['b']);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('replaces ending IDs atomically and ignores stale lifecycle completion', () => {
    const store = setup();
    const onRemove = vi.fn();
    store.addToast({ id: 'a', timeout: 0, onRemove });
    const oldLifecycle = store.getLifecycle('a');
    store.closeToast('a');
    const observer = vi.fn();
    store.subscribe(observer);
    store.addToast({ id: 'a', title: 'New', timeout: 0 });
    expect(observer).toHaveBeenCalledTimes(1);
    expect(onRemove).not.toHaveBeenCalled();
    expect(store.getLifecycle('a')).not.toBe(oldLifecycle);
    store.removeToast('a', false, oldLifecycle);
    expect(store.state.toasts[0].title).toBe('New');
    const lifecycle = store.getLifecycle('a');
    store.addToast({ id: 'a', title: 'Updated', timeout: 0 });
    expect(store.getLifecycle('a')).toBe(lifecycle);
    store.removeToast('a', false, lifecycle);
    expect(store.state.toasts).toHaveLength(0);
  });

  it('maintains independent stores, supports manager replacement and ignores stale detach', () => {
    const first = createToastManager();
    const second = createToastManager();
    const a = setup();
    const b = setup();
    const detach = a.attachManager(first);
    b.attachManager(first);
    first.add({ id: 'shared', timeout: 0 });
    expect(a.state.toasts).not.toBe(b.state.toasts);
    expect(a.state.toasts[0]).not.toBe(b.state.toasts[0]);
    a.updateToast('shared', { title: 'A only' });
    expect(b.state.toasts[0].title).toBeUndefined();
    a.attachManager(second);
    detach();
    first.add({ id: 'old', timeout: 0 });
    second.add({ id: 'new', timeout: 0 });
    expect(a.state.toasts.map(toast => toast.id)).toEqual(['new', 'shared']);
    expect(b.state.toasts.map(toast => toast.id)).toEqual(['old', 'shared']);
    a.dispose();
    first.close();
    expect(b.state.toasts.every(toast => toast.transitionStatus === 'ending')).toBe(true);
  });

  it('runs updater callbacks separately for each consumer with its current data', () => {
    const manager = createToastManager<{ count: number }>();
    const a = setup();
    const b = setup();
    a.attachManager(manager);
    b.attachManager(manager);
    manager.add({ id: 'a', timeout: 0, data: { count: 1 } });
    b.updateToast('a', { data: { count: 5 } });
    const updater = vi.fn((toast: { data?: { count: number } }) => ({ data: { count: toast.data!.count + 1 } }));
    manager.update('a', updater);
    expect(updater).toHaveBeenCalledTimes(2);
    expect(a.state.toasts[0].data).toEqual({ count: 2 });
    expect(b.state.toasts[0].data).toEqual({ count: 6 });
  });

  it('settles a deferred rejection in multiple consumers without orphaned rejection branches', async () => {
    const manager = createToastManager();
    const a = setup();
    const b = setup();
    a.attachManager(manager);
    b.attachManager(manager);
    const pending = deferred<number>();
    const error = new Error('no');
    const resolver = vi.fn(reason => { expect(reason).toBe(error); return 'Failed'; });
    const result = manager.promise(pending.promise, { loading: 'Loading', success: 'Done', error: resolver });
    expect(result).not.toBe(pending.promise);
    expect(a.state.toasts[0].type).toBe('loading');
    expect(b.state.toasts[0].type).toBe('loading');
    const rejection = expect(result).rejects.toBe(error);
    pending.reject(error);
    await rejection;
    expect(resolver).toHaveBeenCalledTimes(2);
    expect(a.state.toasts[0].description).toBe('Failed');
    expect(b.state.toasts[0].description).toBe('Failed');
    await new Promise(resolve => setTimeout(resolve, 0));
  });

  it('never mutates disposed state, creates no settlement timers and preserves result identity', async () => {
    vi.useFakeTimers();
    const store = setup();
    const manager = createToastManager();
    store.attachManager(manager);
    const pending = deferred<object>();
    const result = manager.promise(pending.promise, { loading: 'Loading', success: 'Done', error: 'Failed' });
    store.addToast({ id: 'timer', timeout: 100 });
    store.set('hovering', true);
    store.pauseTimers();
    const snapshot = store.getSnapshot();
    const listener = vi.fn();
    store.subscribe(listener);
    store.dispose();
    store.dispose();
    const value = {};
    pending.resolve(value);
    expect(await result).toBe(value);
    store.resumeTimers();
    store.addToast({ id: 'ignored' });
    const updater = vi.fn(() => ({}));
    store.updateToast('timer', updater);
    store.syncProviderProps(10, 1);
    store.removeToast('timer');
    store.closeToast();
    manager.add({ id: 'detached' });
    expect(store.getSnapshot()).toBe(snapshot);
    expect(listener).not.toHaveBeenCalled();
    expect(updater).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('never revives a removed promise and exposes stable live facade methods', async () => {
    const store = setup();
    const facade = createToastFacade<{ count: number }>(store);
    const initial = facade.toasts;
    const pending = deferred<number>();
    const result = facade.promise(pending.promise, { loading: { data: { count: 0 } }, success: value => ({ data: { count: value } }), error: 'Failed' });
    expect(facade.toasts).not.toBe(initial);
    expect(facade.add).toBe(store.addToast);
    expect(facade.close).toBe(store.closeToast);
    const id = facade.toasts[0].id;
    store.removeToast(id);
    pending.resolve(7);
    expect(await result).toBe(7);
    expect(facade.toasts).toHaveLength(0);
  });
});

it('preserves deferred rejection after disposal without notifying or creating timers', async () => {
  vi.useFakeTimers();
  const store = setup();
  const manager = createToastManager();
  store.attachManager(manager);
  const pending = deferred<number>();
  const error = { cause: 'original rejection' };
  const result = manager.promise(pending.promise, { loading: 'Loading', success: 'Done', error: () => 'Failed' });
  const snapshot = store.getSnapshot();
  const observer = vi.fn();
  store.subscribe(observer);
  store.dispose();
  const rejected = expect(result).rejects.toBe(error);
  pending.reject(error);
  await rejected;
  expect(store.getSnapshot()).toBe(snapshot);
  expect(observer).not.toHaveBeenCalled();
  expect(vi.getTimerCount()).toBe(0);
});
