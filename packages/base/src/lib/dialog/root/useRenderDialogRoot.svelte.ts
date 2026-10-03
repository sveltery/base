// Original useRenderDialogRoot business orchestration with native once-only setup/live props.
// MIT: THIRD_PARTY_NOTICES.md; pin 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
import { DialogStore, type State } from '../store/DialogStore.svelte.js';
import { useDialogRootContext } from '../context.js';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails.js';
import { REASONS } from '../../internals/reasons.js';
import { useImplicitActiveTrigger, useOpenStateTransitions, usePopupRootStore, usePopupRootSync } from '../../utils/popups/popupStoreUtils.svelte.js';
import type { RootProps, ChangeEventDetails } from '../types.js';
export function useRenderDialogRoot<Payload>(mode: 'dialog' | 'drawer' | 'alert-dialog', getProps: () => RootProps<Payload>, floatingId: string) {
  const parentStore = useDialogRootContext(true);
  const nested = parentStore != null;
  const modal = $derived(mode === 'alert-dialog' ? true : getProps().modal ?? true);
  const disablePointerDismissal = $derived(mode === 'alert-dialog' || (getProps().disablePointerDismissal ?? false));
  const role = mode === 'alert-dialog' ? 'alertdialog' : 'dialog';
  const store = usePopupRootStore<State<Payload>, Omit<ChangeEventDetails, 'preventUnmountOnClose'>, DialogStore<Payload>>(
    (id, floatingNested) => new DialogStore<Payload>({
      open: getProps().defaultOpen ?? false,
      openProp: getProps().open,
      activeTriggerId: getProps().defaultTriggerId ?? null,
      triggerIdProp: getProps().triggerId,
      modal,
      disablePointerDismissal,
      nested,
      role,
    }, id, floatingNested),
    floatingId,
    true,
  );
  store.useControlledProp('openProp', () => getProps().open);
  store.useControlledProp('triggerIdProp', () => getProps().triggerId);
  store.useSyncedValues(() => ({ modal, disablePointerDismissal, nested, role }));
  store.context.onOpenChange = (open, details) => getProps().onOpenChange?.(open, details);
  store.context.onOpenChangeComplete = open => getProps().onOpenChangeComplete?.(open);
  const open = $derived(store.select('open'));
  usePopupRootSync(store, () => open);
  useImplicitActiveTrigger(store);
  const { forceUnmount } = useOpenStateTransitions(() => open, store);
  store.context.onInternalOpenChange = (open, details) => getProps().onInternalOpenChange?.(open, details);
  return {
    store,
    parentStore,
    isDrawer: mode === 'drawer',
    close: () => store.setOpen(false, createChangeEventDetails(REASONS.imperativeAction)),
    unmount: forceUnmount,
    get shouldRenderInteractions() { return store.select('open') || store.select('mounted'); },
  };
}
