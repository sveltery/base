// Supplemental native selected-read/subscription evidence; zero unchanged Original assertion credit.
import { flushSync, tick } from 'svelte';
import { expect, it, vi } from 'vitest';
import { ToastStore } from '../../src/lib/toast/store';
import { observeCore } from './toast-core-reactivity.svelte';

it('tracks live facade reads per Svelte consumer and cleans up external subscriptions', async () => {
  const a = new ToastStore();
  const b = new ToastStore();
  const observerA = vi.fn();
  const observerB = vi.fn();
  const observerA2 = vi.fn();
  const cleanupA = observeCore(a, observerA);
  const cleanupA2 = observeCore(a, observerA2);
  const cleanupB = observeCore(b, observerB);
  try {
    expect(observerA).toHaveBeenLastCalledWith([]);
    expect(observerA2).toHaveBeenLastCalledWith([]);
    expect(observerB).toHaveBeenLastCalledWith([]);
    a.addToast({ id: 'a', title: 'First', timeout: 0 });
    flushSync();
    expect(observerA).toHaveBeenLastCalledWith(['First']);
    expect(observerA2).toHaveBeenLastCalledWith(['First']);
    expect(observerB).toHaveBeenCalledTimes(1);
    a.updateToast('a', { title: 'Updated' });
    flushSync();
    expect(observerA).toHaveBeenLastCalledWith(['Updated']);
    cleanupA();
    cleanupA2();
    await tick();
    a.addToast({ id: 'a2', title: 'Later', timeout: 0 });
    b.addToast({ id: 'b', title: 'Second', timeout: 0 });
    flushSync();
    expect(observerA).toHaveBeenCalledTimes(3);
    expect(observerA2).toHaveBeenCalledTimes(3);
    expect(observerB).toHaveBeenLastCalledWith(['Second']);
    b.dispose();
    b.addToast({ title: 'Retained after timer cleanup', timeout: 0 });
    flushSync();
    expect(observerB).toHaveBeenLastCalledWith(['Retained after timer cleanup', 'Second']);
    expect(observerB).toHaveBeenCalledTimes(3);
    cleanupB();
    b.addToast({ title: 'After consumer cleanup', timeout: 0 });
    flushSync();
    expect(observerB).toHaveBeenCalledTimes(3);
  } finally {
    cleanupA();
    cleanupA2();
    cleanupB();
    a.dispose();
    b.dispose();
  }
});
