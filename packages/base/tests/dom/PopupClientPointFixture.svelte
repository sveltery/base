<script lang="ts">
  import { FloatingRootStore } from '../../src/lib/floating-ui/components/FloatingRootStore.svelte.js';
  import { useBaseUIFloating } from '../../src/lib/floating-ui/hooks/useFloating.svelte.js';
  import { useClientPoint } from '../../src/lib/floating-ui/hooks/useClientPoint.svelte.js';
  import { PopupTriggerMap } from '../../src/lib/utils/popups/popupTriggerMap.svelte.js';
  import { createChangeEventDetails } from '../../src/lib/internals/createBaseUIEventDetails.js';
  import { REASONS } from '../../src/lib/internals/reasons.js';

  let { enabled = true, axis, useTriggerProps = false, openWithFocusEvent = false }: {
    enabled?: boolean;
    axis?: 'both' | 'x' | 'y';
    useTriggerProps?: boolean;
    openWithFocusEvent?: boolean;
  } = $props();
  // The actual Source store owns open state; the actual canonical DOM bridge owns positioning.
  const store = new FloatingRootStore({
    open: false, transitionStatus: undefined, referenceElement: null, floatingElement: null,
    triggerElements: new PopupTriggerMap(), floatingId: undefined, syncOnly: false, nested: false,
    onOpenChange(nextOpen) { store.set('open', nextOpen); },
  });
  const open = $derived(store.useState('open'));
  const floating = useBaseUIFloating(() => ({
    rootContext: store, mounted: open, open,
    getConfig: () => ({ placement: 'bottom', strategy: 'absolute' }),
    whileElementsMounted(_reference, _floating, update) { update(); return () => {}; },
  }));
  const clientPoint = useClientPoint(() => floating.context, () => ({ enabled, axis }));
  const referenceProps = $derived(useTriggerProps ? clientPoint.trigger : clientPoint.reference);
  const rect = $derived(floating.elements.reference?.getBoundingClientRect());
  function reference(node: HTMLElement) { floating.refs.setReference(node); return () => floating.refs.setReference(null); }
  function popup(node: HTMLElement) { floating.refs.setFloating(node); return () => floating.refs.setFloating(null); }
  function click() {
    // Original App's ordinary button updates its external open value directly.
    // Only the focus case invokes rootStore.setOpen and supplies an open event.
    if (!openWithFocusEvent) { store.set('open', !open); return; }
    store.setOpen(true, createChangeEventDetails(
      REASONS.triggerFocus,
      new FocusEvent('focus'),
      floating.refs.domReference.current ?? undefined,
    ));
  }
  export function setEnabled(value: boolean) { enabled = value; }
  export function getStore() { return store; }
  export function readRect() { return floating.elements.reference?.getBoundingClientRect(); }
</script>

<div data-testid="reference" {@attach reference} {...referenceProps}
  style="width: 0; height: 0; pointer-events: none;">Reference</div>
{#if open}<div data-testid="floating" {@attach popup} style="pointer-events: none;">Floating</div>{/if}
<button onclick={click}>Toggle</button>
<span data-testid="x">{rect?.x}</span><span data-testid="y">{rect?.y}</span>
<span data-testid="width">{rect?.width}</span><span data-testid="height">{rect?.height}</span>
