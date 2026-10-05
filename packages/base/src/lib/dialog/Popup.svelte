<script lang="ts">
import { mergeComponentProps } from '../internals/mergeComponentProps.js';
import { createAttachmentKey } from 'svelte/attachments';
import { untrack } from 'svelte';

  // Original DialogPopup → FloatingFocusManager business and shared renderer composition (MIT).
  import FloatingFocusManager from '../floating-ui/components/FloatingFocusManager.svelte';
  import { useOpenChangeComplete } from '../internals/useOpenChangeComplete.svelte.js';
  import { COMPOSITE_KEYS } from '../internals/composite/composite.js';
  import { FOCUSABLE_POPUP_PROPS, createDefaultInitialFocus } from '../utils/popups/popupStoreUtils.svelte.js';
  import { dialogStateAttributesMapping } from './utils/stateAttributesMapping.js';
  import * as DialogPopupCssVars from './popup/DialogPopupCssVars.js';
  import { useDialogPortalContext, useDialogRootContext } from './context.js';
  import type { DialogPopupProps } from './types.js';
  let { children, render, class: className, style, initialFocus, finalFocus, ref = $bindable(), ...elementProps }: DialogPopupProps = $props();
  const store = useDialogRootContext();
  useDialogPortalContext();
  const open = $derived(store.select('open'));
  const mounted = $derived(store.select('mounted'));
  const nestedOpenDialogCount = $derived(store.select('nestedOpenDialogCount'));
  useOpenChangeComplete({
    get open() { return open; },
    ref: store.context.popupRef,
    onComplete() { if (open) store.context.onOpenChangeComplete?.(true); },
  });
  const defaultInitialFocus = createDefaultInitialFocus(store.context.popupRef);
  const resolvedInitialFocus = $derived(initialFocus === undefined ? defaultInitialFocus : initialFocus);
  const state = $derived({
    open,
    nested: store.select('nested'),
    transitionStatus: store.select('transitionStatus'),
    nestedDialogOpen: nestedOpenDialogCount > 0,
  });
  const setPopupElement = store.useStateSetter('popupElement');

const hostAttachmentKey = createAttachmentKey();
function attachHost(host: HTMLElement) {
  return untrack(() => {
    ref = host;
    store.context.popupRef.current = host;
    setPopupElement?.(host);
    return () => untrack(() => {
      if (ref === host) ref = null;
      if (store.context.popupRef.current === host) store.context.popupRef.current = null;
      setPopupElement?.(null);
    });
  });
}
const mergedProps = $derived({ ...mergeComponentProps(state, { class: className, style: style }, [
        store.select('popupProps'),
        {
          id: store.state.floatingRootContext.select('floatingId'),
          'aria-labelledby': store.select('titleElementId'),
          'aria-describedby': store.select('descriptionElementId'),
          role: store.select('role'),
          ...FOCUSABLE_POPUP_PROPS,
          hidden: !mounted,
          onkeydown(event: KeyboardEvent) { if (COMPOSITE_KEYS.has(event.key)) event.stopPropagation(); },
          style: { [DialogPopupCssVars.nestedDialogs]: nestedOpenDialogCount },
        },
        elementProps,
      ], dialogStateAttributesMapping), [hostAttachmentKey]: attachHost });
</script>
<FloatingFocusManager
  context={store.select('floatingRootContext')}
  openInteractionType={store.select('openMethod')}
  disabled={!mounted}
  closeOnFocusOut={!store.select('disablePointerDismissal')}
  initialFocus={resolvedInitialFocus}
  returnFocus={finalFocus}
  modal={store.select('modal') !== false}
  restoreFocus="popup"
>
  {#if render}
  {@render render(mergedProps, state, children)}
{:else}
  <div {...mergedProps}>{@render children?.()}</div>
{/if}
</FloatingFocusManager>
