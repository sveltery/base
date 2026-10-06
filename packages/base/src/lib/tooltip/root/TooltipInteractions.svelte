<script lang="ts" generics="Payload">
  // Original Base UI v1.8.0 business at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
  // MIT Copyright (c) 2019 Material-UI SAS; see THIRD_PARTY_NOTICES.md.
  import { untrack } from 'svelte';
  import { useDismiss } from '../../floating-ui/hooks/useDismiss.svelte.js';
  import { usePopupInteractionProps } from '../../utils/popups/popupStoreUtils.svelte.js';
  import type { TooltipStore } from '../store/TooltipStore.svelte.js';
  import { useClientPoint } from '../../floating-ui/hooks/useClientPoint.svelte.js';
  import { mergeProps } from '../../merge-props/index.js';
  import { EMPTY_OBJECT } from '@sveltery/utils/empty';
  let {
    store,
    disabled,
    trackCursorAxis,
  }: {
    store: TooltipStore<Payload>;
    disabled: boolean;
    trackCursorAxis: 'none' | 'x' | 'y' | 'both';
  } = $props();
  const dismiss = useDismiss(
    () => store.select('floatingRootContext'),
    () => ({ enabled: !disabled, referencePress: () => store.select('closeOnClick') }),
  );
  const clientPoint = useClientPoint(
    () => store.select('floatingRootContext'),
    () => ({
      enabled: !disabled && trackCursorAxis !== 'none',
      axis: trackCursorAxis === 'none' ? undefined : trackCursorAxis,
    }),
  );
  const triggerProps = $derived(mergeProps(clientPoint.reference, dismiss.reference));
  // The conditional interactions instance belongs to this Root-owned store.
  const initialStore = untrack(() => store);
  usePopupInteractionProps(initialStore, () => ({
    activeTriggerProps: triggerProps,
    inactiveTriggerProps: triggerProps,
    popupProps: dismiss.floating ?? EMPTY_OBJECT,
  }));
</script>
