<script lang="ts">
  import { mergeComponentProps } from '../internals/mergeComponentProps.js';
  import { createAttachmentKey } from 'svelte/attachments';

  // Original Base UI v1.8.0 at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT: THIRD_PARTY_NOTICES.md.
  import { usePopoverRootContext } from './context.js';
  import { usePopoverPositionerContext } from './positioner/PopoverPositionerContext.js';
  import { popupTransitionStateMapping } from '../utils/popupStateMapping.js';
  import { useOpenChangeComplete } from '../internals/useOpenChangeComplete.svelte.js';
  import { getDisabledMountTransitionStyles } from '../internals/getDisabledMountTransitionStyles.js';
  import { useHoverFloatingInteraction } from '../floating-ui/hooks/useHoverFloatingInteraction.svelte.js';
  import { FOCUSABLE_POPUP_PROPS } from '../utils/popups/popupStoreUtils.svelte.js';
  import type { PopoverPopupProps, PopoverPopupState } from './types.js';
  import { setContext, untrack } from 'svelte';
  import { isHTMLElement } from '@floating-ui/utils/dom';
  import FloatingFocusManager from '../floating-ui/components/FloatingFocusManager.svelte';
  import { useToolbarRootContext } from '../toolbar/root/ToolbarRootContext.js';
  import { COMPOSITE_KEYS } from '../internals/composite/composite.js';
  import { ClosePartContext, ClosePartCount } from '../utils/closePart.svelte.js';
  import { createDefaultInitialFocus } from '../utils/popups/popupStoreUtils.svelte.js';
  import { REASONS } from '../internals/reasons.js';
  let {
    render,
    class: className,
    style,
    children,
    ref = $bindable(),
    initialFocus,
    finalFocus,
    ...elementProps
  }: PopoverPopupProps = $props();
  const store = usePopoverRootContext();
  const positioner = usePopoverPositionerContext();
  const open = $derived(store.select('open'));
  const instantType = $derived(store.select('instantType'));
  const transitionStatus = $derived(store.select('transitionStatus'));
  const popupProps = $derived(store.select('popupProps'));
  const floatingContext = $derived(store.select('floatingRootContext'));
  const closeDelay = $derived(store.select('closeDelay'));
  const disabled = $derived(store.select('disabled'));
  useOpenChangeComplete({
    get open() {
      return open;
    },
    ref: store.context.popupRef,
    onComplete() {
      if (open) store.context.onOpenChangeComplete?.(true);
    },
  });
  const insideToolbar = useToolbarRootContext(true) != null;
  const closePart = new ClosePartCount();
  setContext(ClosePartContext, closePart.context);
  const openMethod = $derived(store.select('openMethod'));
  const titleId = $derived(store.select('titleElementId'));
  const descriptionId = $derived(store.select('descriptionElementId'));
  const modal = $derived(store.select('modal'));
  const mounted = $derived(store.select('mounted'));
  const openReason = $derived(store.select('openChangeReason'));
  const activeTriggerElement = $derived(store.select('activeTriggerElement'));
  const floatingId = $derived(floatingContext.useState('floatingId'));
  const openOnHover = $derived(store.select('openOnHover'));
  const defaultInitialFocus = createDefaultInitialFocus(store.context.popupRef);
  const resolvedInitialFocus = $derived(
    initialFocus === undefined ? defaultInitialFocus : initialFocus,
  );
  const focusManagerModal = $derived(modal !== false && closePart.hasClosePart);
  store.useSyncedValue('focusManagerModal', () => focusManagerModal);
  useHoverFloatingInteraction(
    () => floatingContext,
    () => ({ enabled: openOnHover && !disabled, closeDelay }),
  );
  const state: PopoverPopupState = $derived({
    open,
    side: positioner.side,
    align: positioner.align,
    instant: instantType,
    transitionStatus,
  });

  const setPopupElement = store.useStateSetter('popupElement');

  const hostAttachmentKey = createAttachmentKey();
  function attachHost(host: HTMLElement) {
    return untrack(() => {
      ref = host;
      store.context.popupRef.current = host;
      setPopupElement?.(host);
      return () =>
        untrack(() => {
          if (ref === host) ref = null;
          if (store.context.popupRef.current === host) store.context.popupRef.current = null;
          setPopupElement?.(null);
        });
    });
  }
  const mergedProps = $derived({
    ...mergeComponentProps(
      state,
      { class: className, style: style },
      [
        popupProps,
        {
          id: floatingId,
          role: 'dialog',
          ...FOCUSABLE_POPUP_PROPS,
          'aria-labelledby': titleId,
          'aria-describedby': descriptionId,
          onkeydown(event: KeyboardEvent) {
            if (insideToolbar && COMPOSITE_KEYS.has(event.key)) event.stopPropagation();
          },
        },
        getDisabledMountTransitionStyles(transitionStatus),
        elementProps,
      ],
      popupTransitionStateMapping,
    ),
    [hostAttachmentKey]: attachHost,
  });
</script>

<FloatingFocusManager
  context={floatingContext}
  openInteractionType={openMethod}
  modal={focusManagerModal}
  disabled={!mounted || openReason === REASONS.triggerHover}
  initialFocus={resolvedInitialFocus}
  returnFocus={finalFocus}
  restoreFocus="popup"
  previousFocusableElement={isHTMLElement(activeTriggerElement) ? activeTriggerElement : undefined}
  nextFocusableElement={store.context.triggerFocusTargetRef}
  beforeContentFocusGuardRef={store.context.beforeContentFocusGuardRef}
>
  {#if render}
    {@render render(mergedProps, state, children)}
  {:else}
    <div {...mergedProps}>{@render children?.()}</div>
  {/if}
</FloatingFocusManager>
