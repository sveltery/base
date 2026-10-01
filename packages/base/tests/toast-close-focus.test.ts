import { afterEach, expect, it, vi } from 'vitest';
import { ToastStore } from '../src/lib/toast/store';
import { createToastFacade } from '../src/lib/toast/facade';
import { createToastManager } from '../src/lib/toast/createToastManager';

afterEach(() => vi.useRealTimers());

it('runs registration-specific close focus synchronously after the complete callback loop', () => {
  const store = new ToastStore();
  const observations: string[] = [];
  const handler = () => observations.push(`focus:${store.state.toasts.map(toast => toast.id).join(',')}`);
  const stale = store.setCloseFocusHandler(handler);
  const cleanup = store.setCloseFocusHandler(handler);
  stale();
  store.addToast({ id: 'a', timeout: 0, onClose: () => {
    observations.push('a'); store.addToast({ id: 'fresh', timeout: 0 });
  } });
  store.addToast({ id: 'b', timeout: 0, onClose: () => observations.push('b') });
  store.closeToast();
  expect(observations).toEqual(['b', 'a', 'focus:fresh,b,a']);
  cleanup();
  store.closeToast('fresh');
  expect(observations).toHaveLength(3);
  store.dispose();
});

it('uses the fresh handler after callbacks replace a registration for facade, manager and timer closes', () => {
  vi.useFakeTimers();
  const store = new ToastStore();
  const manager = createToastManager();
  const facade = createToastFacade(store);
  const calls: string[] = [];
  store.attachManager(manager);
  for (const source of ['facade', 'manager', 'timer'] as const) {
    store.setCloseFocusHandler(() => calls.push('obsolete'));
    store.addToast({ id: source, timeout: source === 'timer' ? 20 : 0, onClose: () => {
      calls.push(`close:${source}`);
      store.setCloseFocusHandler(id => calls.push(`focus:${id}`));
    } });
    if (source === 'facade') facade.close(source);
    else if (source === 'manager') manager.close(source);
    else vi.advanceTimersByTime(20);
    expect(calls.slice(-2)).toEqual([`close:${source}`, `focus:${source}`]);
  }
  expect(calls).toHaveLength(6);
  store.dispose();
});

it('does not focus after callback teardown or an interrupted onClose loop', () => {
  const store = new ToastStore();
  const focus = vi.fn();
  store.setCloseFocusHandler(focus);
  const error = new Error('close callback');
  store.addToast({ id: 'throws', timeout: 0, onClose: () => { throw error; } });
  expect(() => store.closeToast('throws')).toThrow(error);
  expect(focus).not.toHaveBeenCalled();
  store.addToast({ id: 'dispose', timeout: 0, onClose: store.dispose });
  store.closeToast('dispose');
  expect(focus).not.toHaveBeenCalled();
  store.setCloseFocusHandler(focus);
  store.closeToast();
  expect(focus).not.toHaveBeenCalled();
});
