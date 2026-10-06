<script lang="ts" generics="Payload">
  // Original Base UI v1.8.0 business at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
  // MIT Copyright (c) 2019 Material-UI SAS; see THIRD_PARTY_NOTICES.md.
  import { untrack } from 'svelte';
  import { useDismiss } from '../../floating-ui/hooks/useDismiss.svelte.js';
  import { usePopupInteractionProps } from '../../utils/popups/popupStoreUtils.svelte.js';
  import type { PopoverStore } from '../store/PopoverStore.svelte.js';
  let { store, modal }: { store: PopoverStore<Payload>; modal: boolean | 'trap-focus' } = $props();
  const dismiss = useDismiss(
    () => store.select('floatingRootContext'),
    () => ({
      outsidePressEvent: {
        mouse: modal === 'trap-focus' ? 'sloppy' : 'intentional',
        touch: 'sloppy',
      },
    }),
  );
  // The conditional interactions instance belongs to this Root-owned store.
  const initialStore = untrack(() => store);
  usePopupInteractionProps(initialStore, () => ({
    activeTriggerProps: dismiss.reference!,
    inactiveTriggerProps: dismiss.reference!,
    popupProps: dismiss.floating!,
  }));
</script>
