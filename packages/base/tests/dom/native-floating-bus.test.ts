// Actual handle-store resource migration, not a renderer/ref transport simulation.
import { expect, it, vi } from 'vitest';
import { flushSync, mount, tick, unmount } from 'svelte';
import { DialogHandle } from '../../src/lib/dialog/store/DialogHandle.svelte.js';
import { DialogStore } from '../../src/lib/dialog/store/DialogStore.svelte.js';
import Fixture from './NativeFloatingBusFixture.svelte';

for (const kind of ['focus', 'hover', 'dismiss'] as const)
  it(`cleans the installed ${kind} event bus when an actual handle migrates stores and when its consumer unmounts`, async () => {
    const handle = new DialogHandle<number>();
    const subscribeStore = handle.subscribeStore.bind(handle);
    const watcherCleanups: ReturnType<typeof vi.fn>[] = [];
    vi.spyOn(handle, 'subscribeStore').mockImplementation((listener) => {
      const dispose = vi.fn(subscribeStore(listener));
      watcherCleanups.push(dispose);
      return dispose;
    });
    const first = new DialogStore<number>(undefined, 'first', false);
    const second = new DialogStore<number>(undefined, 'second', false);
    const firstBus = first.state.floatingRootContext.context.events;
    const secondBus = second.state.floatingRootContext.context.events;
    const firstOn = vi.spyOn(firstBus, 'on');
    const firstOff = vi.spyOn(firstBus, 'off');
    const secondOn = vi.spyOn(secondBus, 'on');
    const secondOff = vi.spyOn(secondBus, 'off');
    const detachFirst = handle.attachStore(first);
    const target = document.createElement('main');
    document.body.append(target);
    const app = mount(Fixture, { target, props: { handle, kind } });
    flushSync();
    await tick();
    let detachSecond: (() => void) | undefined;
    let stopped = false;
    try {
      const host = target.querySelector<HTMLButtonElement>('#native-floating-reference')!;
      const firstListeners = firstOn.mock.calls
        .filter(([event]) => event === 'openchange')
        .map(([, listener]) => listener);
      expect(firstListeners.length).toBeGreaterThan(0);
      detachSecond = handle.attachStore(second);
      flushSync();
      await tick();
      expect(target.querySelector('#native-floating-reference')).toBe(host);
      expect(second.state.floatingRootContext.state.domReferenceElement).toBe(host);
      for (const listener of firstListeners)
        expect(firstOff).toHaveBeenCalledWith('openchange', listener);
      const secondListeners = secondOn.mock.calls
        .filter(([event]) => event === 'openchange')
        .map(([, listener]) => listener);
      expect(secondListeners.length).toBeGreaterThan(0);
      if (kind === 'focus') {
        firstBus.emit('openchange', {
          open: false,
          reason: 'escape-key',
          nativeEvent: new KeyboardEvent('keydown', { key: 'Escape' }),
          nested: false,
        });
        host.focus();
        flushSync();
        await tick();
        expect(second.select('open')).toBe(true);
        expect(first.select('open')).toBe(false);
      }
      await unmount(app);
      stopped = true;
      await tick();
      for (const listener of secondListeners)
        expect(secondOff).toHaveBeenCalledWith('openchange', listener);
      expect(second.state.floatingRootContext.state.domReferenceElement).toBeNull();
      expect(watcherCleanups.length).toBeGreaterThan(0);
      for (const dispose of watcherCleanups) expect(dispose).toHaveBeenCalledOnce();
    } finally {
      if (!stopped) await unmount(app);
      detachSecond?.();
      detachFirst();
      target.remove();
      vi.restoreAllMocks();
    }
  });
