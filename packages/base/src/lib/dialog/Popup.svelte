<script lang="ts">
  // Original DialogPopup → FloatingFocusManager business and shared renderer composition (MIT).
  import RenderElement from '../internals/RenderElement.svelte';
  import FloatingFocusManager from '../floating-ui/components/FloatingFocusManager.svelte';
  import { useOpenChangeComplete } from '../internals/useOpenChangeComplete.svelte.js';
  import { COMPOSITE_KEYS } from '../internals/composite/composite.js';
  import {
    FOCUSABLE_POPUP_PROPS,
    createDefaultInitialFocus,
  } from '../utils/popups/popupStoreUtils.svelte.js';
  import { dialogStateAttributesMapping } from './utils/stateAttributesMapping.js';
  import * as DialogPopupCssVars from './popup/DialogPopupCssVars.js';
  import { useDialogPortalContext, useDialogRootContext } from './context.js';
  import type { DialogPopupProps } from './types.js';
  let {
    children,
    render,
    class: className,
    style,
    initialFocus,
    finalFocus,
    ref = $bindable(),
    ...elementProps
  }: DialogPopupProps = $props();
  const store = useDialogRootContext();
  useDialogPortalContext();
  const open = $derived(store.select('open'));
  const mounted = $derived(store.select('mounted'));
  const nestedOpenDialogCount = $derived(store.select('nestedOpenDialogCount'));
  useOpenChangeComplete({
    get open() {
      return open;
    },
    ref: store.context.popupRef,
    onComplete() {
      if (open) store.context.onOpenChangeComplete?.(true);
    },
  });
  const defaultInitialFocus = createDefaultInitialFocus(store.context.popupRef);
  const resolvedInitialFocus = $derived(
    initialFocus === undefined ? defaultInitialFocus : initialFocus,
  );
  const state = $derived({
    open,
    nested: store.select('nested'),
    transitionStatus: store.select('transitionStatus'),
    nestedDialogOpen: nestedOpenDialogCount > 0,
  });
  const setPopupElement = store.useStateSetter('popupElement');
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
  <RenderElement
    tag="div"
    componentProps={{ render, class: className, style }}
    params={{
      state,
      ref: [store.context.popupRef, setPopupElement],
      props: [
        store.select('popupProps'),
        {
          id: store.state.floatingRootContext.select('floatingId'),
          'aria-labelledby': store.select('titleElementId'),
          'aria-describedby': store.select('descriptionElementId'),
          role: store.select('role'),
          ...FOCUSABLE_POPUP_PROPS,
          hidden: !mounted,
          onkeydown(event: KeyboardEvent) {
            if (COMPOSITE_KEYS.has(event.key)) event.stopPropagation();
          },
          style: { [DialogPopupCssVars.nestedDialogs]: nestedOpenDialogCount },
        },
        elementProps,
      ],
      stateAttributesMapping: dialogStateAttributesMapping,
    }}
    {children}
    bind:element={ref}
  />
</FloatingFocusManager>
