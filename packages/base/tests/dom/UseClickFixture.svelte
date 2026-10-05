<script lang="ts">
  import { untrack } from 'svelte';
  import { FloatingRootStore } from '../../src/lib/floating-ui/components/FloatingRootStore.svelte.js';
  import { PopupTriggerMap } from '../../src/lib/utils/popups/popupTriggerMap.svelte.js';
  import { useClick, type UseClickProps } from '../../src/lib/floating-ui/hooks/useClick.svelte.js';
  import { createChangeEventDetails } from '../../src/lib/internals/createBaseUIEventDetails.js';
  let { options = {}, initialOpen = false, typeable = false, cancel = false }: { options?: UseClickProps; initialOpen?: boolean; typeable?: boolean; cancel?: boolean } = $props();
  let selectedOptions = $state.raw<UseClickProps>(untrack(() => options));
  let reference = $state<HTMLElement | null>(null);
  let floating = $state<HTMLDivElement | null>(null);
  const changes: { open: boolean; reason: string; trigger: HTMLElement | undefined }[] = [];
  const store = untrack(() => new FloatingRootStore({
    open: initialOpen, transitionStatus: undefined, referenceElement: null, floatingElement: null,
    triggerElements: new PopupTriggerMap(), floatingId: 'click-fixture', syncOnly: false, nested: false,
    onOpenChange(open, details) {
      changes.push({ open, reason: details.reason, trigger: details.trigger });
      if (cancel) details.cancel();
      if (!details.isCanceled) store.update({ open });
    },
  }));
  const open = $derived(store.useState('open'));
  $effect.pre(() => { store.update({ referenceElement: reference, domReferenceElement: reference, floatingElement: floating }); });
  const click = useClick(() => store, () => selectedOptions);
  export function snapshot() { return changes; }
  export function setOptions(next: UseClickProps) { selectedOptions = next; }
  export function setOpen(next: boolean) { store.update({ open: next }); }
  export function requestHoverOpen(event: MouseEvent) { store.setOpen(true, createChangeEventDetails('trigger-hover', event, reference ?? undefined)); }
</script>
<svelte:element this={typeable ? 'input' : 'button'} {...click.reference} bind:this={reference} data-testid="reference" />
{#if open}<div role="tooltip" bind:this={floating}></div>{/if}
