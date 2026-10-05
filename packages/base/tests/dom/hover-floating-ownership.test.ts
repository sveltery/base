// Supplemental scheduled-hover ownership regression against Base UI 1.8.0 pin47b40521.
// MIT: THIRD_PARTY_NOTICES.md. Actual private hook + real RootStore in both frameworks; credit 0.
import { afterEach, expect, it, vi } from 'vitest';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { flushSync, mount, tick, unmount } from 'svelte';
import Fixture from './HoverFloatingDispatchObserver.svelte';
import { createNavigationMenuTestTransport } from '../../../../apps/fixtures/src/lib/navigation-menu-test-transport.js';
const cleanup: Array<() => void | Promise<void>> = [];
afterEach(async () => { for (const dispose of cleanup.splice(0).reverse()) await dispose(); document.body.replaceChildren(); vi.restoreAllMocks(); vi.useRealTimers(); });
for (const original of [false, true]) for (const enabled of [true, false]) it(`keeps scheduled ${original ? 'Original' : 'native'} close on its selected first Store when enabled=${enabled}`, async () => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  const target = document.createElement('section'); const floating = document.createElement('aside'); document.body.append(target, floating);
  const rows: Array<{ store: number; open: boolean; reason: string; type: string; elapsed: number }> = [];
  let elapsed = 0;
  const report = (store: number, open: boolean, details: { reason: string; event: Event }) => rows.push({ store, open, reason: details.reason, type: details.event.type, elapsed });
  const transport = createNavigationMenuTestTransport();
  let select: (next: { selection: number; enabled: boolean; closeDelay: number }) => void;
  if (original) {
    const sourceRequire = createRequire(resolve(process.cwd(), '../../apps/fixtures/package.json'));
    const sourceRoot = resolve(dirname(sourceRequire.resolve('@base-ui/react/navigation-menu')), '..');
    const { FloatingRootStore } = await import(`${sourceRoot}/floating-ui-react/components/FloatingRootStore.mjs`);
    const { PopupTriggerMap } = await import(`${sourceRoot}/utils/popups/index.mjs`);
    const { useHoverFloatingInteraction } = await import(`${sourceRoot}/floating-ui-react/hooks/useHoverFloatingInteraction.mjs`);
    const { React, renderer, referenceTransport } = await import('../../../../apps/fixtures/src/lib/navigation-menu-reference-renderer.js');
    function Reference({ selection = 0, enabled = true, closeDelay = 100 }) {
      const stores = React.useRef<Array<InstanceType<typeof FloatingRootStore>> | null>(null);
      if (!stores.current) stores.current = [0, 1].map(index => {
        const store = new FloatingRootStore({ open: true, transitionStatus: undefined, referenceElement: null, floatingElement: floating, triggerElements: new PopupTriggerMap(), floatingId: `observer-${index}`, syncOnly: false, nested: false, onOpenChange: (open: boolean, details: { reason: string; event: Event }) => report(index, open, details) });
        store.context.dataRef.current.openEvent = new MouseEvent('mouseenter');
        return store;
      });
      useHoverFloatingInteraction(stores.current[selection], { enabled, closeDelay });
      return null;
    }
    const view = renderer.render(React.createElement(Reference), { container: target, reactStrictMode: true });
    select = next => { view.rerender(React.createElement(Reference, next)); };
    transport.ready(referenceTransport, () => { view.unmount(); renderer.cleanup(); });
  } else {
    const instance = mount(Fixture, { target, props: { floating, report } }); await tick();
    select = next => { flushSync(() => instance.select(next)); };
    transport.ready(undefined, () => unmount(instance));
  }
  cleanup.push(transport.dispose);
  await transport.fire(floating, 'mouseleave', { relatedTarget: null });
  elapsed = 50; await transport.mutate(() => vi.advanceTimersByTimeAsync(50));
  expect(rows).toEqual([]);
  select({ selection: 1, closeDelay: 0, enabled }); await transport.flush();
  elapsed = 99; await transport.mutate(() => vi.advanceTimersByTimeAsync(49));
  expect(rows).toEqual([]);
  elapsed = 100; await transport.mutate(() => vi.advanceTimersByTimeAsync(1));
  expect(rows).toEqual([{ store: 0, open: false, reason: 'trigger-hover', type: 'mouseleave', elapsed: 100 }]);
});
