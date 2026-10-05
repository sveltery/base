<script lang="ts" generics="Payload = unknown">
  // Original Base UI v1.8.0 business at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
  // MIT Copyright (c) 2019 Material-UI SAS; see THIRD_PARTY_NOTICES.md.
  import { onDestroy, setContext } from 'svelte';
  import PopupHandleAttachment from '../utils/popups/PopupHandleAttachment.svelte';
  import PopoverInteractions from './root/PopoverInteractions.svelte';
  import { PopoverStore, type State } from './store/PopoverStore.svelte.js';
  import { ROOT, usePopoverRootContext } from './context.js';
  import { createChangeEventDetails } from '../internals/createBaseUIEventDetails.js';
  import { REASONS } from '../internals/reasons.js';
  
  import { useImplicitActiveTrigger, useOpenStateTransitions, usePopupRootStore, usePopupRootSync } from '../utils/popups/popupStoreUtils.svelte.js';
  import type { PopoverRootProps, PopoverRootChangeEventDetails } from './types.js';
  import { provideFloatingTree } from '../floating-ui/components/FloatingTree.svelte.js';
  // eslint-disable-next-line no-useless-assignment -- Native bind:actions publishes the imperative Source actionsRef result.
  let { actions = $bindable(null), ...props }: PopoverRootProps<Payload> = $props();
  const floatingId = $props.id();
  const parentStore = usePopoverRootContext(true);
  if (!parentStore) provideFloatingTree();
  const modal = $derived(props.modal ?? false);
  const store = usePopupRootStore<State<Payload>, Omit<PopoverRootChangeEventDetails, 'preventUnmountOnClose'>, PopoverStore<Payload>>(
    (id, nested) => new PopoverStore<Payload>({
      open: props.defaultOpen ?? false,
      openProp: props.open,
      activeTriggerId: props.defaultTriggerId ?? null,
      triggerIdProp: props.triggerId,
      modal,
    }, id, nested),
    floatingId,
  );
  store.useControlledProp('openProp', () => props.open);
  store.useControlledProp('triggerIdProp', () => props.triggerId);
  store.context.onOpenChange = (open, details) => props.onOpenChange?.(open, details);
  store.context.onOpenChangeComplete = open => props.onOpenChangeComplete?.(open);
  const open = $derived(store.select('open'));
  const mounted = $derived(store.select('mounted'));
  usePopupRootSync(store, () => open);
  useImplicitActiveTrigger(store);
  const { forceUnmount } = useOpenStateTransitions(() => open, store, () => {
    store.update({ stickIfOpen: true, openChangeReason: null });
  });
  store.useSyncedValues(() => ({ modal }));
  $effect(() => { if (!open) store.context.stickIfOpenTimeout.clear(); });
  onDestroy(store.context.stickIfOpenTimeout.disposeEffect());
  export function close() { store.setOpen(false, createChangeEventDetails(REASONS.imperativeAction)); }
  export function unmount() { forceUnmount(); }
  // eslint-disable-next-line no-useless-assignment -- Native bind:actions replaces the Source actionsRef output.
  actions = { unmount, close };
  onDestroy(() => { actions = null; });
  const shouldRenderInteractions = $derived(open || mounted);
  setContext(ROOT, store);
</script>
{#if props.handle}<PopupHandleAttachment handle={props.handle} {store} />{/if}
{#if shouldRenderInteractions}
  <PopoverInteractions {store} {modal} />
{/if}
{@render props.children?.({ payload: store.select('payload') as Payload | undefined })}
