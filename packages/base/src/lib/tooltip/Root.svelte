<script lang="ts" generics="Payload = unknown">
  // Original Base UI v1.8.0 business at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
  // MIT Copyright (c) 2019 Material-UI SAS; see THIRD_PARTY_NOTICES.md.
  import { onDestroy, setContext } from 'svelte';
  import PopupHandleAttachment from '../utils/popups/PopupHandleAttachment.svelte';
  import TooltipInteractions from './root/TooltipInteractions.svelte';
  import { TooltipStore, type State } from './store/TooltipStore.svelte.js';
  import { ROOT } from './context.js';
  import { createChangeEventDetails } from '../internals/createBaseUIEventDetails.js';
  import { REASONS } from '../internals/reasons.js';
  import { useIsoLayoutEffect } from '@sveltery/utils/useIsoLayoutEffect';
  import { useImplicitActiveTrigger, useOpenStateTransitions, usePopupRootStore } from '../utils/popups/popupStoreUtils.svelte.js';
  import type { TooltipRootProps, TooltipRootChangeEventDetails } from './types.js';
  // eslint-disable-next-line no-useless-assignment -- Native bind:actions publishes the imperative Source actionsRef result.
  let { actions = $bindable(null), ...props }: TooltipRootProps<Payload> = $props();
  const floatingId = $props.id();
  const disabled = $derived(props.disabled ?? false);
  const disableHoverablePopup = $derived(props.disableHoverablePopup ?? false);
  const trackCursorAxis = $derived(props.trackCursorAxis ?? 'none');
  const store = usePopupRootStore<State<Payload>, Omit<TooltipRootChangeEventDetails, 'preventUnmountOnClose'>, TooltipStore<Payload>>(
    (id, nested) => new TooltipStore<Payload>({
      open: props.defaultOpen ?? false,
      openProp: props.open,
      activeTriggerId: props.defaultTriggerId ?? null,
      triggerIdProp: props.triggerId,
    }, id, nested),
    floatingId,
  );
  store.useControlledProp('openProp', () => props.open);
  store.useControlledProp('triggerIdProp', () => props.triggerId);
  store.context.onOpenChange = (open, details) => props.onOpenChange?.(open, details);
  store.context.onOpenChangeComplete = open => props.onOpenChangeComplete?.(open);
  const openState = $derived(store.select('open'));
  const open = $derived(!disabled && openState);
  store.useSyncedValues(() => ({ trackCursorAxis, disableHoverablePopup, disabled }));
  const mounted = $derived(store.select('mounted'));
  const activeTriggerId = $derived(store.select('activeTriggerId'));
  useImplicitActiveTrigger(store, { closeOnActiveTriggerUnmount: true });
  const { forceUnmount, transitionStatus } = useOpenStateTransitions(() => open, store);
  const isInstantPhase = $derived(store.select('isInstantPhase'));
  const instantType = $derived(store.select('instantType'));
  const lastOpenChangeReason = $derived(store.select('lastOpenChangeReason'));
  const previousInstantTypeRef = { current: null as State<Payload>['instantType'] | null };
  useIsoLayoutEffect(() => {
    if (openState && disabled) store.setOpen(false, createChangeEventDetails(REASONS.disabled));
  }, () => [openState, disabled, store]);
  useIsoLayoutEffect(() => {
    if ((transitionStatus === 'ending' && lastOpenChangeReason === REASONS.none) ||
        (transitionStatus !== 'ending' && isInstantPhase)) {
      if (instantType !== 'delay') previousInstantTypeRef.current = instantType;
      store.set('instantType', 'delay');
    } else if (previousInstantTypeRef.current !== null) {
      store.set('instantType', previousInstantTypeRef.current);
      previousInstantTypeRef.current = null;
    }
  }, () => [transitionStatus, isInstantPhase, lastOpenChangeReason, instantType, store]);
  useIsoLayoutEffect(() => {
    if (open && activeTriggerId == null) store.set('payload', undefined);
  }, () => [store, activeTriggerId, open]);
  export function close() { store.setOpen(false, createChangeEventDetails(REASONS.imperativeAction)); }
  export function unmount() { forceUnmount(); }
  // eslint-disable-next-line no-useless-assignment -- Native bind:actions replaces the Source actionsRef output.
  actions = { unmount, close };
  onDestroy(() => { actions = null; });
  const shouldRenderInteractions = $derived(open || mounted || (!disabled && trackCursorAxis !== 'none'));
  setContext(ROOT, store);
</script>
{#if props.handle}<PopupHandleAttachment handle={props.handle} {store} />{/if}
{#if shouldRenderInteractions}
  <TooltipInteractions {store} {disabled} {trackCursorAxis} />
{/if}
{@render props.children?.({ payload: store.select('payload') as Payload | undefined })}
