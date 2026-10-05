<script lang="ts">
  // Original MenuPopup complete business and focus-manager composition (MIT).
  import RenderElement from '../internals/RenderElement.svelte';
  import FloatingFocusManager from '../floating-ui/components/FloatingFocusManager.svelte';
  import { useHoverFloatingInteraction } from '../floating-ui/hooks/useHoverFloatingInteraction.svelte.js';
  import { useMenuRootContext } from './root/MenuRootContext.js';
  import { useMenuPositionerContext } from './positioner/MenuPositionerContext.js';
  import { popupTransitionStateMapping } from '../utils/popupStateMapping.js';
  import { useOpenChangeComplete } from '../internals/useOpenChangeComplete.svelte.js';
  import { createChangeEventDetails } from '../internals/createBaseUIEventDetails.js';
  import { REASONS } from '../internals/reasons.js';
  import { getDisabledMountTransitionStyles } from '../internals/getDisabledMountTransitionStyles.js';
  
  import { useToolbarRootContext } from '../toolbar/root/ToolbarRootContext.js';
  import { COMPOSITE_KEYS } from '../internals/composite/composite.js';
  import type { MenuPopupProps, MenuRoot } from './types.js';
  // eslint-disable-next-line no-useless-assignment -- Publishes native bindable host/action outputs to the owner.
  let { render, class: className, style, finalFocus, children, ref = $bindable(null), ...elementProps }: MenuPopupProps = $props();
  const insideToolbar = useToolbarRootContext(true) != null;
  const { store } = useMenuRootContext();
  const positioner = useMenuPositionerContext();
  const open = $derived(store.useState('open'));
  const transitionStatus = $derived(store.useState('transitionStatus'));
  const popupProps = $derived(store.useState('popupProps'));
  const mounted = $derived(store.useState('mounted'));
  const instantType = $derived(store.useState('instantType'));
  const activeTriggerElement = $derived(store.useState('activeTriggerElement'));
  const parent = $derived(store.useState('parent'));
  const rootId = $derived(store.useState('rootId'));
  const floatingContext = $derived(store.useState('floatingRootContext'));
  const floatingTreeRoot = $derived(store.useState('floatingTreeRoot'));
  const closeDelay = $derived(store.useState('closeDelay'));
  const hoverEnabled = $derived(store.useState('hoverEnabled'));
  const disabled = $derived(store.useState('disabled'));
  const openMethod = $derived(store.useState('openMethod'));
  const isContextMenu = $derived(parent.type === 'context-menu');
  useOpenChangeComplete({ get open() { return open; }, ref: store.context.popupRef, onComplete() { if (open) store.context.onOpenChangeComplete?.(true); } });
  $effect(() => {
    function handleClose(event: { domEvent: Event | undefined; reason: MenuRoot.ChangeEventReason }) {
      store.setOpen(false, createChangeEventDetails(event.reason, event.domEvent));
    }
    floatingTreeRoot.events.on('close', handleClose);
    return () => { floatingTreeRoot.events.off('close', handleClose); };
  });
  useHoverFloatingInteraction(() => floatingContext, () => ({ enabled: hoverEnabled && !disabled && !isContextMenu && parent.type !== 'menubar', closeDelay }));
  const setPopupElement = store.useStateSetter('popupElement');
  const state = $derived({ transitionStatus, side: positioner.side, align: positioner.align, open, nested: parent.type === 'menu', instant: instantType });
  function getDefaultReturnFocus(state = store.state) {
    let value = state.parent.type === undefined || state.parent.type === 'context-menu';
    if (state.activeTriggerElement || (state.parent.type === 'menubar' && state.openChangeReason !== REASONS.outsidePress)) value = true;
    return value;
  }
  let mountedReturnFocus = getDefaultReturnFocus();
  $effect(() => store.observe(
    state => state.mounted ? getDefaultReturnFocus(state) : null,
    value => { if (value !== null) mountedReturnFocus = value; },
  ));
  const returnFocus = $derived.by(() => {
    const isMounted = store.select('mounted');
    return isMounted ? getDefaultReturnFocus() : mountedReturnFocus;
  });
  const setRef = (node: HTMLElement | null) => { ref = node; };
</script>
<FloatingFocusManager context={floatingContext} openInteractionType={openMethod} modal={isContextMenu} disabled={!mounted} returnFocus={finalFocus === undefined ? returnFocus : finalFocus} initialFocus={parent.type !== 'menu'} restoreFocus={true} externalTree={parent.type !== 'menubar' ? floatingTreeRoot : undefined} previousFocusableElement={activeTriggerElement as HTMLElement | null} nextFocusableElement={parent.type === undefined ? store.context.triggerFocusTargetRef : undefined} beforeContentFocusGuardRef={parent.type === undefined ? store.context.beforeContentFocusGuardRef : undefined}>
  <RenderElement tag="div" componentProps={{ render, class: className, style }} params={{ state, ref: [setRef, store.context.popupRef, setPopupElement], stateAttributesMapping: popupTransitionStateMapping, props: [popupProps, { onkeydown(event: KeyboardEvent) { if (insideToolbar && COMPOSITE_KEYS.has(event.key)) event.stopPropagation(); } }, getDisabledMountTransitionStyles(transitionStatus), elementProps, { 'data-rootownerid': rootId }] }} {children} />
</FloatingFocusManager>
