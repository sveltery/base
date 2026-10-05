<script lang="ts" generics="Payload">
  // Original DialogInteractions/useDialogRoot business body; native effects and DOM events (MIT).
  import { untrack } from 'svelte';

  import { useScrollLock } from '@sveltery/utils/useScrollLock';
  import { useDismiss } from '../../floating-ui/hooks/useDismiss.svelte.js';
  import { contains, getTarget } from '../../floating-ui/utils/element.js';
  import { usePopupInteractionProps } from '../../utils/popups/popupStoreUtils.svelte.js';
  import type { DialogStore } from '../store/DialogStore.svelte.js';
  let { store, parentContext, isDrawer }: { store: DialogStore<Payload>; parentContext?: DialogStore<unknown>['context']; isDrawer: boolean } = $props();
  let ownNestedOpenDialogs = $state(0);
  let ownNestedOpenDrawers = $state(0);
  const open = $derived(store.select('open'));
  const disablePointerDismissal = $derived(store.select('disablePointerDismissal'));
  const modal = $derived(store.select('modal'));
  const popupElement = $derived(store.select('popupElement'));
  const isTopmost = $derived(ownNestedOpenDialogs === 0);
  const dismiss = useDismiss(() => store.select('floatingRootContext'), () => ({
    outsidePressEvent() {
      if (store.context.internalBackdropRef.current || store.context.backdropRef.current) return 'intentional';
      return { mouse: modal === 'trap-focus' ? 'sloppy' : 'intentional', touch: 'sloppy' };
    },
    outsidePress(event) {
      if (!store.context.outsidePressEnabledRef.current) return false;
      if ('button' in event && event.button !== 0) return false;
      if ('touches' in event) {
        if (event.type === 'touchend') { if (event.changedTouches.length !== 1 || event.touches.length !== 0) return false; }
        else if (event.touches.length !== 1) return false;
      }
      const target = getTarget(event) as Element | null;
      if (isTopmost && !disablePointerDismissal) {
        if (modal) {
          const internalBackdrop = store.context.internalBackdropRef.current;
          const backdrop = store.context.backdropRef.current;
          return internalBackdrop || backdrop ? internalBackdrop === target || backdrop === target || (contains(target, popupElement) && !target?.hasAttribute('data-base-ui-portal')) : true;
        }
        return true;
      }
      return false;
    },
    escapeKey: isTopmost,
  }));
  useScrollLock(() => open && modal === true, () => popupElement);
  const initialStore = untrack(() => store);
  initialStore.context.onNestedDialogOpen = (dialogCount, drawerCount) => { ownNestedOpenDialogs = dialogCount; ownNestedOpenDrawers = drawerCount; };
  $effect(() => {
    const parent = parentContext;
    const isOpen = open;
    if (parent?.onNestedDialogOpen) {
      if (isOpen) {
        const dialogs = ownNestedOpenDialogs + 1;
        const drawers = ownNestedOpenDrawers + (isDrawer ? 1 : 0);
        untrack(() => parent.onNestedDialogOpen?.(dialogs, drawers));
      }
      else untrack(() => parent.onNestedDialogOpen?.(0, 0));
    }
    return () => { if (parent?.onNestedDialogOpen && isOpen) parent.onNestedDialogOpen(0, 0); };
  });
  usePopupInteractionProps(initialStore, () => ({ activeTriggerProps: dismiss.reference!, inactiveTriggerProps: dismiss.trigger!, popupProps: dismiss.floating!, nestedOpenDialogCount: ownNestedOpenDialogs, nestedOpenDrawerCount: ownNestedOpenDrawers }));
</script>
