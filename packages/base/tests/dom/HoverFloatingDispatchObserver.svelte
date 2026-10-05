<script lang="ts">
  // Supplemental real RootStore/shared hover fixture; no upstream ordinary assertion credit.
  import { untrack } from 'svelte';
  import { FloatingRootStore } from '../../src/lib/floating-ui/components/FloatingRootStore.svelte.js';
  import { PopupTriggerMap } from '../../src/lib/utils/popups/popupTriggerMap.svelte.js';
  import { useHoverFloatingInteraction } from '../../src/lib/floating-ui/hooks/useHoverFloatingInteraction.svelte.js';
  let { floating, report }: { floating: HTMLElement; report(store: number, open: boolean, details: { reason: string; event: Event }): void } = $props();
  let selection = $state(0);
  let enabled = $state(true);
  let closeDelay = $state(100);
  const stores = untrack(() => [0, 1].map(index => {
    const store = new FloatingRootStore({ open: true, transitionStatus: undefined, referenceElement: null, floatingElement: floating, triggerElements: new PopupTriggerMap(), floatingId: `observer-${index}`, syncOnly: false, nested: false, onOpenChange: (open, details) => report(index, open, details) });
    store.context.dataRef.current.openEvent = new MouseEvent('mouseenter');
    return store;
  }));
  useHoverFloatingInteraction(() => stores[selection], () => ({ enabled, closeDelay }));
  export function select(next: { selection: number; enabled: boolean; closeDelay: number }) {
    selection = next.selection; enabled = next.enabled; closeDelay = next.closeDelay;
  }
</script>
