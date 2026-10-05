<script lang="ts">
  import { untrack } from 'svelte';
  import { FloatingRootStore } from '../../src/lib/floating-ui/components/FloatingRootStore.svelte.js';
  import { useDelayGroup } from '../../src/lib/floating-ui/hooks/useDelayGroup.svelte.js';
  import { PopupTriggerMap } from '../../src/lib/utils/popups/popupTriggerMap.svelte.js';
  import { createChangeEventDetails } from '../../src/lib/internals/createBaseUIEventDetails.js';
  import { REASONS } from '../../src/lib/internals/reasons.js';

  let { label, onRequest }: {
    label: string;
    onRequest: (label: string, open: boolean, reason: string) => void;
  } = $props();

  const store = new FloatingRootStore({
    open: false,
    transitionStatus: undefined,
    referenceElement: null,
    floatingElement: null,
    triggerElements: new PopupTriggerMap(),
    floatingId: untrack(() => label),
    syncOnly: false,
    nested: false,
    onOpenChange(nextOpen, details) {
      onRequest(label, nextOpen, details.reason);
      store.set('open', nextOpen);
    },
  });
  const open = $derived(store.useState('open'));
  const group = useDelayGroup(() => store, () => ({ open }));

  export function setOpen(value: boolean) {
    store.setOpen(value, createChangeEventDetails(REASONS.none));
  }

  export function readState() {
    return {
      open: store.select('open'),
      activeId: group.activeIdRef.current,
      delay: group.delayRef.current,
      isInstantPhase: group.isInstantPhase,
      hasProvider: group.hasProvider,
    };
  }
</script>

<output data-consumer={label} data-instant-phase={group.isInstantPhase ? '' : undefined}>
  {String(open)}
</output>
