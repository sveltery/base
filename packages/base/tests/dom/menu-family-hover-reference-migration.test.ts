// Authored actual Original/native regression; zero unchanged Original declaration credit.
import {
  React,
  createRoot,
  flushSync,
  createOriginalHoverProbeStore,
  OriginalHover,
  originalReferenceHook as originalHook,
} from '../../../../apps/fixtures/src/lib/menu-family-probe-original.js';
import { expect, it, vi } from 'vitest';
import { mount, tick, unmount } from 'svelte';
import { FloatingRootStore } from '../../src/lib/floating-ui/components/FloatingRootStore.svelte.js';
import { PopupTriggerMap } from '../../src/lib/utils/popups/popupTriggerMap.svelte.js';
import { HoverInteraction } from '../../src/lib/floating-ui/hooks/useHoverInteractionSharedState.svelte.js';
import Fixture from './fixtures/MenuHoverReferenceMigration.svelte';
for (const source of [true, false])
  it(`${source ? 'Original' : 'native'} migrated reference pointer input mutates the destination's owned instance`, async () => {
    const warnings = vi.spyOn(console, 'warn');
    const HoverClass = source ? OriginalHover : HoverInteraction;
    const makeNativeStore = () =>
      new FloatingRootStore({
        open: false,
        transitionStatus: undefined,
        referenceElement: null,
        floatingElement: null,
        triggerElements: new PopupTriggerMap(),
        floatingId: undefined,
        syncOnly: true,
        nested: false,
        onOpenChange: undefined,
      });
    const originalStores = source
      ? { first: createOriginalHoverProbeStore(), second: createOriginalHoverProbeStore() }
      : null;
    const nativeStores = source ? null : { first: makeNativeStore(), second: makeNativeStore() };
    const { first, second } = originalStores ?? nativeStores!;
    second.context.dataRef.current.hoverInteractionState = HoverClass.create();
    const target = document.createElement('div');
    document.body.append(target);
    let stop: () => void | Promise<void>;
    let change: () => void;
    if (originalStores) {
      const root = createRoot(target);
      let store = originalStores.first;
      function Component() {
        return React.createElement(
          'button',
          { id: 'migrating-hover', ...originalHook(store) },
          'Hover',
        );
      }
      const render = () => flushSync(() => root.render(React.createElement(Component)));
      render();
      change = () => {
        store = originalStores.second;
        render();
      };
      stop = () => flushSync(() => root.unmount());
    } else {
      const instance = mount(Fixture, { target, props: nativeStores! });
      change = instance.change;
      stop = () => unmount(instance);
    }
    try {
      await tick();
      const initialInstance = first.context.dataRef.current.hoverInteractionState;
      const destinationInstance = second.context.dataRef.current.hoverInteractionState;
      change();
      await tick();
      const event = new MouseEvent('pointerdown', { bubbles: true });
      Object.defineProperty(event, 'pointerType', { value: 'touch' });
      document.getElementById('migrating-hover')!.dispatchEvent(event);
      await tick();
      expect(second.context.dataRef.current.hoverInteractionState).toBe(destinationInstance);
      expect(destinationInstance.pointerType).toBe('touch');
      expect(initialInstance.pointerType).toBeUndefined();
    } finally {
      await stop();
      await tick();
      first.context.dataRef.current.hoverInteractionState.dispose();
      second.context.dataRef.current.hoverInteractionState.dispose();
      target.remove();
    }
    expect(
      warnings.mock.calls.filter((args) =>
        args.some((value) => String(value).includes('derived_inert')),
      ),
    ).toEqual([]);
    vi.restoreAllMocks();
  });
