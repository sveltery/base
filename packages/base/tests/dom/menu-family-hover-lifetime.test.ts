// Authored actual Original/native regression; zero unchanged Original declaration credit.
import {
  React,
  createRoot,
  flushSync,
  createOriginalHoverProbeStore,
  OriginalHover,
  originalHook,
} from '../../../../apps/fixtures/src/lib/menu-family-probe-original.js';
import { expect, it, vi } from 'vitest';
import { mount, tick, unmount } from 'svelte';
import { FloatingRootStore } from '../../src/lib/floating-ui/components/FloatingRootStore.svelte.js';
import { PopupTriggerMap } from '../../src/lib/utils/popups/popupTriggerMap.svelte.js';
import { HoverInteraction } from '../../src/lib/floating-ui/hooks/useHoverInteractionSharedState.svelte.js';
import Fixture from './fixtures/MenuHoverLifetime.svelte';
for (const source of [true, false])
  for (const initialOwned of [true, false])
    for (const destinationOwned of [true, false])
      it(`${source ? 'Original' : 'native'} hover migration retains actual shared identity and initial timer cleanup (${initialOwned}/${destinationOwned})`, async () => {
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
          ? {
              first: createOriginalHoverProbeStore(),
              second: createOriginalHoverProbeStore(),
              third: createOriginalHoverProbeStore(),
            }
          : null;
        const nativeStores = source
          ? null
          : { first: makeNativeStore(), second: makeNativeStore(), third: makeNativeStore() };
        const { first, second, third } = originalStores ?? nativeStores!;
        if (initialOwned) first.context.dataRef.current.hoverInteractionState = HoverClass.create();
        if (destinationOwned)
          second.context.dataRef.current.hoverInteractionState = HoverClass.create();
        const destinationInstance = second.context.dataRef.current.hoverInteractionState;
        const target = document.createElement('div');
        document.body.append(target);
        let stop: () => void | Promise<void>;
        let current: () => HoverInteraction | OriginalHover;
        let change: Record<'first' | 'second' | 'third', () => void>;
        if (originalStores) {
          const root = createRoot(target);
          let store = originalStores.first;
          let interaction: OriginalHover;
          function Component() {
            interaction = originalHook(store);
            return null;
          }
          const render = () => flushSync(() => root.render(React.createElement(Component)));
          render();
          current = () => interaction;
          change = {
            first: () => {
              store = originalStores.first;
              render();
            },
            second: () => {
              store = originalStores.second;
              render();
            },
            third: () => {
              store = originalStores.third;
              render();
            },
          };
          stop = () => flushSync(() => root.unmount());
        } else {
          const instance = mount(Fixture, { target, props: { first: nativeStores!.first } });
          current = instance.current;
          change = {
            first: () => instance.change(nativeStores!.first),
            second: () => instance.change(nativeStores!.second),
            third: () => instance.change(nativeStores!.third),
          };
          stop = () => unmount(instance);
        }
        let stopped = false;
        try {
          await tick();
          const initialInstance = current();
          expect(initialInstance).toBe(first.context.dataRef.current.hoverInteractionState);
          change.second();
          await tick();
          expect(current()).toBe(second.context.dataRef.current.hoverInteractionState);
          expect(current()).toBe(destinationOwned ? destinationInstance : initialInstance);
          current().pointerType = 'touch';
          expect(second.context.dataRef.current.hoverInteractionState.pointerType).toBe('touch');
          change.third();
          await tick();
          expect(current()).toBe(initialInstance);
          expect(third.context.dataRef.current.hoverInteractionState).toBe(initialInstance);
          change.first();
          await tick();
          expect(current()).toBe(initialInstance);
          initialInstance.openChangeTimeout.start(60000, () => {});
          initialInstance.restTimeout.start(60000, () => {});
          destinationInstance?.openChangeTimeout.start(60000, () => {});
          destinationInstance?.restTimeout.start(60000, () => {});
          await stop();
          stopped = true;
          await tick();
          expect(initialInstance.openChangeTimeout.isStarted()).toBe(false);
          expect(initialInstance.restTimeout.isStarted()).toBe(false);
          if (destinationInstance) {
            expect(destinationInstance.openChangeTimeout.isStarted()).toBe(true);
            expect(destinationInstance.restTimeout.isStarted()).toBe(true);
          }
          expect(
            warnings.mock.calls.filter((args) =>
              args.some((value) => String(value).includes('derived_inert')),
            ),
          ).toEqual([]);
        } finally {
          if (!stopped) await stop();
          first.context.dataRef.current.hoverInteractionState?.dispose();
          second.context.dataRef.current.hoverInteractionState?.dispose();
          third.context.dataRef.current.hoverInteractionState?.dispose();
          target.remove();
          vi.restoreAllMocks();
        }
      });
