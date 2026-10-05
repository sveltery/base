<script lang="ts" generics="Payload = unknown">
  // Original Base UI v1.8.0 at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT: THIRD_PARTY_NOTICES.md.
  import RenderElement from '../internals/RenderElement.svelte';
  import { usePreviewCardRootContext } from './context.js';
  import { usePopupHandleStore } from '../utils/popups/usePopupHandleStore.svelte.js';
  import { useTriggerDataForwarding } from '../utils/popups/popupStoreUtils.svelte.js';
  import { useBaseUiId } from '../internals/useBaseUiId.js';
  import { useHoverReferenceInteraction } from '../floating-ui/hooks/useHoverReferenceInteraction.svelte.js';
  import { safePolygon } from '../floating-ui/safePolygon.js';
  import { triggerOpenStateMapping } from '../utils/popupStateMapping.js';
  import { OPEN_DELAY, CLOSE_DELAY } from './utils/constants.js';
  import type { PreviewCardHandleStore } from './store/PreviewCardStore.svelte.js';
  import type { PreviewCardTriggerProps } from './types.js';
  import { useFocus } from '../floating-ui/hooks/useFocus.svelte.js';
  import { getInlineRectTriggerProps } from '../utils/popups/inlineRect.js';
  // eslint-disable-next-line no-useless-assignment -- Native bindable ref output is published through the ordered Source ref callback.
  let { render, class: className, style, children, ref = $bindable(), handle, payload, id: idProp, delay, closeDelay, ...elementProps }: PreviewCardTriggerProps<Payload> = $props();
  const rootStore = usePreviewCardRootContext(true);
  const handleStore = usePopupHandleStore(() => handle);
  const store: PreviewCardHandleStore<unknown> = $derived.by(() => {
    const value = handleStore.store ?? rootStore;
    if (!value) throw new Error('Base UI: <PreviewCard.Trigger> must be either used within a <PreviewCard.Root> component or provided with a handle.');
    return value;
  });
  const generatedId = $props.id();
  const thisTriggerId = $derived(useBaseUiId(idProp ?? undefined, generatedId));
  const isTriggerActive = $derived(store.select('isTriggerActive', thisTriggerId));
  const isOpenedByThisTrigger = $derived(store.select('isOpenedByTrigger', thisTriggerId));
  const floatingRootContext = $derived(store.select('floatingRootContext'));
  const triggerElementRef = { current: null as HTMLElement | null };
  const delayWithDefault = $derived(delay ?? OPEN_DELAY);
  const closeDelayWithDefault = $derived(closeDelay ?? CLOSE_DELAY);
  const forwarding = useTriggerDataForwarding(() => thisTriggerId, triggerElementRef, () => store, () => ({ payload, closeDelay: closeDelayWithDefault }));
  const hoverProps = useHoverReferenceInteraction(() => floatingRootContext, () => ({
    mouseOnly: true, move: false, handleClose: safePolygon(),
    delay: () => ({ open: delayWithDefault, close: closeDelayWithDefault }),
    triggerElementRef, isActiveTrigger: isTriggerActive,
    isClosing: () => store.select('transitionStatus') === 'ending',
  }));
  const focusProps = useFocus(() => floatingRootContext, () => ({ delay: delayWithDefault }));
  const inlineRectTriggerProps = $derived(getInlineRectTriggerProps(store.context.inlineRectCoordsRef, isOpenedByThisTrigger));
  const state = $derived({ open: isOpenedByThisTrigger });
  const rootTriggerProps = $derived(store.select('triggerProps', forwarding.isMountedByThisTrigger));
  const forwardedRef = (node: HTMLElement | null) => { ref = node; };
</script>
<RenderElement tag="a" componentProps={{ render, class: className, style }} params={{
  state,
  ref: [forwardedRef, forwarding.registerTrigger, triggerElementRef],
  props: [
    hoverProps(), focusProps.reference, rootTriggerProps, inlineRectTriggerProps, { id: thisTriggerId }, elementProps,
  ],
  stateAttributesMapping: triggerOpenStateMapping,
}} {children} />
