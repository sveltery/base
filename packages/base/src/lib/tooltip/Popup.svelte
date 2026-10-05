<script lang="ts">
import { mergeComponentProps } from '../internals/mergeComponentProps.js';
import { createAttachmentKey } from 'svelte/attachments';
import { untrack } from 'svelte';

  // Original Base UI v1.8.0 at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT: THIRD_PARTY_NOTICES.md.
  import { useTooltipRootContext } from './context.js';
  import { useTooltipPositionerContext } from './positioner/TooltipPositionerContext.js';
  import { popupTransitionStateMapping } from '../utils/popupStateMapping.js';
  import { useOpenChangeComplete } from '../internals/useOpenChangeComplete.svelte.js';
  import { getDisabledMountTransitionStyles } from '../internals/getDisabledMountTransitionStyles.js';
  import { useHoverFloatingInteraction } from '../floating-ui/hooks/useHoverFloatingInteraction.svelte.js';
  import { FOCUSABLE_POPUP_PROPS } from '../utils/popups/popupStoreUtils.svelte.js';
  import type { TooltipPopupProps, TooltipPopupState } from './types.js';
  // eslint-disable-next-line no-useless-assignment -- Native bindable ref output is published through the ordered Source ref callback.
  let { render, class: className, style, children, ref = $bindable(), ...elementProps }: TooltipPopupProps = $props();
  const store = useTooltipRootContext();
  const positioner = useTooltipPositionerContext();
  const open = $derived(store.select('open'));
  const instantType = $derived(store.select('instantType'));
  const transitionStatus = $derived(store.select('transitionStatus'));
  const popupProps = $derived(store.select('popupProps'));
  const floatingContext = $derived(store.select('floatingRootContext'));
  const closeDelay = $derived(store.select('closeDelay'));
  const disabled = $derived(store.select('disabled'));
  useOpenChangeComplete({
    get open() { return open; }, ref: store.context.popupRef,
    onComplete() { if (open) store.context.onOpenChangeComplete?.(true); },
  });
  useHoverFloatingInteraction(() => floatingContext, () => ({ enabled: !disabled, closeDelay }));
  const state: TooltipPopupState = $derived({ open, side: positioner.side, align: positioner.align, instant: instantType, transitionStatus });
  
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
const mergedProps = $derived({ ...mergeComponentProps(state, { class: className, style: style }, [FOCUSABLE_POPUP_PROPS, popupProps, getDisabledMountTransitionStyles(transitionStatus), elementProps], popupTransitionStateMapping), [hostAttachmentKey]: attachHost });
</script>
{#if render}
  {@render render(mergedProps, state, children)}
{:else}
  <div {...mergedProps}>{@render children?.()}</div>
{/if}
