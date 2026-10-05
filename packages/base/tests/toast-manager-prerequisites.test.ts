// Derived from pinned createToastManager/store source; MIT, see ../../../parity/toast/UPSTREAM_LICENSE.
// One complete manager leaf; remaining tests are source-derived supplements, not upstream ports.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createToastManager } from '../../../parity/toast/manager-prerequisite';
import { ToastStore, selectors } from '../../../parity/toast/store-prerequisite';

function attached() {
  const manager = createToastManager();
  const store = new ToastStore({ toasts: [], timeout: 5000, limit: 3, hovering: false, focused: false, isWindowFocused: true, viewport: null, prevFocusElement: null });
  const unsubscribe = manager[' subscribe'](({ action, options }) => {
    if (action === 'promise') store.promiseToast(options.promise, options);
    else if (action === 'update') store.updateToast(options.id, options.updates);
    else if (action === 'close') store.closeToast(options.id);
    else store.addToast(options);
  });
  return { manager, store, dispose: () => { unsubscribe(); store.disposeEffect()(); } };
}

describe('complete createToastManager add prerequisite at pinned source :53', () => {
    // Preserve the immutable full callback body used by the Source gate.
    // prettier-ignore
    it('returns a toast id', async () => {
      const toastManager = createToastManager();

      const toastId = toastManager.add({
        title: 'title',
      });

      expect(toastId).toBeTypeOf('string');
    });
});

// These supplement the complete store leaves. They do not stand in for Provider/DOM mounting.
describe('source-derived manager channel and timer prerequisites', () => {
  afterEach(() => { vi.useRealTimers(); });

  it('does not queue events before subscription and unsubscribes cleanly', () => {
    const manager = createToastManager();
    manager.add({ id: 'before' });
    const listener = vi.fn();
    const unsubscribe = manager[' subscribe'](listener);
    expect(listener).not.toHaveBeenCalled();
    expect(manager.add({ id: 'during' })).toBe('during');
    expect(listener).toHaveBeenCalledWith({ action: 'add', options: { id: 'during', transitionStatus: 'starting' } });
    unsubscribe();
    manager.close();
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('upserts in place and refreshes the timer without changing stack order', () => {
    vi.useFakeTimers();
    const { manager, store, dispose } = attached();
    manager.add({ id: 'save', title: 'Saving', timeout: 1000 });
    manager.add({ id: 'other', timeout: 0 });
    vi.advanceTimersByTime(900);
    manager.add({ id: 'save', title: 'Saved', timeout: 1000 });
    expect(store.state.toasts.map(toast => toast.id)).toEqual(['other', 'save']);
    expect(selectors.toast(store.state, 'save')?.updateKey).toBe(1);
    vi.advanceTimersByTime(999);
    expect(selectors.toast(store.state, 'save')?.transitionStatus).not.toBe('ending');
    vi.advanceTimersByTime(1);
    expect(selectors.toast(store.state, 'save')?.transitionStatus).toBe('ending');
    dispose();
  });

  it('publishes ending state before reentrant onClose and separates removal', () => {
    const { manager, store, dispose } = attached();
    const onRemove = vi.fn();
    const onClose = vi.fn(() => {
      expect(selectors.toast(store.state, 'a')?.transitionStatus).toBe('ending');
      manager.close();
    });
    manager.add({ id: 'a', timeout: 0, onClose, onRemove });
    manager.close('a');
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onRemove).not.toHaveBeenCalled();
    store.removeToast('a');
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(store.state.toasts).toHaveLength(0);
    dispose();
  });

  it('preserves promise settlement and resets loading timeout to provider default', async () => {
    vi.useFakeTimers();
    const { manager, store, dispose } = attached();
    const value = { saved: true };
    const pending = manager.promise(Promise.resolve(value), { loading: { description: 'Loading', timeout: 0 }, success: result => ({ description: String(result.saved) }), error: 'Failed' });
    expect(store.state.toasts[0]?.type).toBe('loading');
    expect(await pending).toBe(value);
    const id = store.state.toasts[0].id;
    expect(selectors.toast(store.state, id)?.type).toBe('success');
    expect(selectors.toast(store.state, id)?.timeout).toBe(undefined);
    vi.advanceTimersByTime(4999);
    expect(selectors.toast(store.state, id)?.transitionStatus).not.toBe('ending');
    vi.advanceTimersByTime(1);
    expect(selectors.toast(store.state, id)?.transitionStatus).toBe('ending');
    const error = new Error('failed');
    await expect(manager.promise(Promise.reject(error), { loading: 'Loading', success: 'Done', error: result => ({ description: result.message }) })).rejects.toBe(error);
    expect(store.state.toasts[0]?.description).toBe('failed');
    dispose();
  });

  it('does not revive a dismissed pending promise toast', async () => {
    const { manager, store, dispose } = attached();
    let resolve!: (result: number) => void;
    const pending = manager.promise(new Promise<number>(callback => { resolve = callback; }), { loading: 'Loading', success: 'Done', error: 'Failed' });
    const id = store.state.toasts[0].id;
    manager.close(id);
    resolve(7);
    expect(await pending).toBe(7);
    expect(selectors.toast(store.state, id)?.transitionStatus).toBe('ending');
    expect(selectors.toast(store.state, id)?.description).toBe('Loading');
    dispose();
  });

  it('adds timers paused while blurred and clears active timers on disposal', () => {
    vi.useFakeTimers();
    const { manager, store, dispose } = attached();
    store.set('isWindowFocused', false);
    manager.add({ id: 'blurred', timeout: 100 });
    vi.advanceTimersByTime(200);
    expect(selectors.toast(store.state, 'blurred')?.transitionStatus).not.toBe('ending');
    store.set('isWindowFocused', true);
    store.resumeTimers();
    vi.advanceTimersByTime(99);
    expect(selectors.toast(store.state, 'blurred')?.transitionStatus).not.toBe('ending');
    dispose();
    vi.advanceTimersByTime(200);
    expect(selectors.toast(store.state, 'blurred')?.transitionStatus).not.toBe('ending');
    expect(vi.getTimerCount()).toBe(0);
    manager.add({ id: 'after-dispose' });
    expect(selectors.toast(store.state, 'after-dispose')).toBe(undefined);
  });
});
