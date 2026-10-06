// Supplemental real-component Source/native reproduction; zero unchanged assertion credit.
// Source: Base UI 1.8.0 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c, MIT.
import { afterEach, expect, it, vi } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import Fixture from './ToastContentOwnerFixture.svelte';
import { mountToastContentOwnerReference } from '../../../../apps/fixtures/src/lib/toast-content-owner-reference.js';

const cleanups: Array<() => void | Promise<void>> = [];
afterEach(async () => {
  for (const cleanup of cleanups.splice(0)) await cleanup();
  vi.unstubAllGlobals();
  document.body.replaceChildren();
});

for (const reference of [true, false]) {
  for (const mode of ['document', 'detached', 'iframe']) {
    it(`${reference ? 'Original' : 'native'} Content observes its actual host and cleans up (document mode=${mode})`, async () => {
      const callbacks: Array<() => void> = [];
      const realms: string[] = [];
      const observeResize = vi.fn();
      const observeMutation = vi.fn();
      const disconnectResize = vi.fn();
      const disconnectMutation = vi.fn();
      class Resize {
        constructor(callback: () => void, realm = 'global') {
          callbacks.push(callback);
          realms.push(realm);
        }
        observe = observeResize;
        disconnect = disconnectResize;
      }
      class Mutation {
        constructor(callback: () => void, realm = 'global') {
          callbacks.push(callback);
          realms.push(realm);
        }
        observe = observeMutation;
        disconnect = disconnectMutation;
      }
      vi.stubGlobal('ResizeObserver', Resize);
      vi.stubGlobal('MutationObserver', Mutation);
      const iframe = document.createElement('iframe');
      if (mode === 'iframe') document.body.append(iframe);
      const owner =
        mode === 'detached'
          ? document.implementation.createHTMLDocument()
          : mode === 'iframe'
            ? iframe.contentDocument!
            : document;
      if (mode === 'iframe') {
        class FrameResize extends Resize {
          constructor(callback: () => void) {
            super(callback, 'iframe');
          }
        }
        class FrameMutation extends Mutation {
          constructor(callback: () => void) {
            super(callback, 'iframe');
          }
        }
        Object.defineProperty(owner.defaultView, 'ResizeObserver', { value: FrameResize });
        Object.defineProperty(owner.defaultView, 'MutationObserver', { value: FrameMutation });
      }
      const target = owner.createElement('section');
      owner.body.append(target);
      const recalculate = vi.fn();
      const cleanup = reference
        ? mountToastContentOwnerReference(target, recalculate)
        : (() => {
            const component = mount(Fixture, {
              target,
              props: { recalculateHeight: recalculate },
            });
            flushSync();
            return () => unmount(component);
          })();
      cleanups.push(cleanup);
      const host = target.querySelector('[data-testid="content-owner"]');
      expect(host?.ownerDocument).toBe(owner);
      expect(owner.defaultView === null).toBe(mode === 'detached');
      expect(recalculate).toHaveBeenCalledWith();
      expect(observeResize).toHaveBeenCalledExactlyOnceWith(host);
      expect(observeMutation).toHaveBeenCalledExactlyOnceWith(host, {
        childList: true,
        subtree: true,
        characterData: true,
      });
      expect(callbacks).toHaveLength(2);
      // Native observers belong to the actual host realm; Original uses module globals.
      // The measured iframe boundary earns zero unchanged Original credit.
      expect(realms).toEqual(
        !reference && mode === 'iframe' ? ['iframe', 'iframe'] : ['global', 'global'],
      );
      callbacks.forEach((callback) => callback());
      expect(recalculate.mock.calls).toEqual([[], [true], [true]]);
      await cleanup();
      cleanups.pop();
      expect(disconnectResize).toHaveBeenCalledTimes(1);
      expect(disconnectMutation).toHaveBeenCalledTimes(1);
    });
  }
}
