<script lang="ts">
  // Original Base UI v1.8.0 at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT: THIRD_PARTY_NOTICES.md.
  import RenderElement from '../internals/RenderElement.svelte';
  import { usePreviewCardRootContext } from './context.js';
  import { usePreviewCardPositionerContext } from './positioner/PreviewCardPositionerContext.js';
  import { popupTransitionStateMapping } from '../utils/popupStateMapping.js';
  import { useOpenChangeComplete } from '../internals/useOpenChangeComplete.svelte.js';
  import { getDisabledMountTransitionStyles } from '../internals/getDisabledMountTransitionStyles.js';
  import { useHoverFloatingInteraction } from '../floating-ui/hooks/useHoverFloatingInteraction.svelte.js';
  import { FOCUSABLE_POPUP_PROPS } from '../utils/popups/popupStoreUtils.svelte.js';
  import type { PreviewCardPopupProps, PreviewCardPopupState } from './types.js';
  // eslint-disable-next-line no-useless-assignment -- Native bindable ref output is published through the ordered Source ref callback.
  let {
    render,
    class: className,
    style,
    children,
    ref = $bindable(),
    ...elementProps
  }: PreviewCardPopupProps = $props();
  const store = usePreviewCardRootContext();
  const positioner = usePreviewCardPositionerContext();
  const open = $derived(store.select('open'));
  const instantType = $derived(store.select('instantType'));
  const transitionStatus = $derived(store.select('transitionStatus'));
  const popupProps = $derived(store.select('popupProps'));
  const floatingContext = $derived(store.select('floatingRootContext'));
  const closeDelay = $derived(store.select('closeDelay'));
  useOpenChangeComplete({
    get open() {
      return open;
    },
    ref: store.context.popupRef,
    onComplete() {
      if (open) store.context.onOpenChangeComplete?.(true);
    },
  });
  useHoverFloatingInteraction(
    () => floatingContext,
    () => ({ closeDelay }),
  );
  const state: PreviewCardPopupState = $derived({
    open,
    side: positioner.side,
    align: positioner.align,
    instant: instantType,
    transitionStatus,
  });
  const forwardedRef = (node: HTMLElement | null) => {
    ref = node;
  };
  const setPopupElement = store.useStateSetter('popupElement');
</script>

<RenderElement
  tag="div"
  componentProps={{ render, class: className, style }}
  params={{
    state,
    ref: [forwardedRef, store.context.popupRef, setPopupElement],
    props: [
      FOCUSABLE_POPUP_PROPS,
      popupProps,
      getDisabledMountTransitionStyles(transitionStatus),
      elementProps,
    ],
    stateAttributesMapping: popupTransitionStateMapping,
  }}
  {children}
/>
