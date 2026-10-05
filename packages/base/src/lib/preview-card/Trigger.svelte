<script lang="ts" generics="Payload = unknown">
  import { mergeComponentProps } from '../internals/mergeComponentProps.js';
  import { createAttachmentKey } from 'svelte/attachments';
  import { untrack } from 'svelte';

  // Original Base UI v1.8.0 at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT: THIRD_PARTY_NOTICES.md.
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
  let {
    render,
    class: className,
    style,
    children,
    ref = $bindable(),
    handle,
    payload,
    id: idProp,
    delay,
    closeDelay,
    ...elementProps
  }: PreviewCardTriggerProps<Payload> = $props();
  const rootStore = usePreviewCardRootContext(true);
  const handleStore = usePopupHandleStore(() => handle);
  const store: PreviewCardHandleStore<unknown> = $derived.by(() => {
    const value = handleStore.store ?? rootStore;
    if (!value)
      throw new Error(
        'Base UI: <PreviewCard.Trigger> must be either used within a <PreviewCard.Root> component or provided with a handle.',
      );
    return value;
  });
  const generatedId = $props.id();
  const thisTriggerId = $derived(useBaseUiId(idProp ?? undefined, generatedId));
  const isTriggerActive = $derived(
    store.select('isTriggerActive', thisTriggerId),
  );
  const isOpenedByThisTrigger = $derived(
    store.select('isOpenedByTrigger', thisTriggerId),
  );
  const floatingRootContext = $derived(store.select('floatingRootContext'));
  const triggerElementRef = { current: null as HTMLElement | null };
  const delayWithDefault = $derived(delay ?? OPEN_DELAY);
  const closeDelayWithDefault = $derived(closeDelay ?? CLOSE_DELAY);
  const forwarding = useTriggerDataForwarding(
    () => thisTriggerId,
    triggerElementRef,
    () => store,
    () => ({ payload, closeDelay: closeDelayWithDefault }),
  );
  const hoverProps = useHoverReferenceInteraction(
    () => floatingRootContext,
    () => ({
      mouseOnly: true,
      move: false,
      handleClose: safePolygon(),
      delay: () => ({ open: delayWithDefault, close: closeDelayWithDefault }),
      triggerElementRef,
      isActiveTrigger: isTriggerActive,
      isClosing: () => store.select('transitionStatus') === 'ending',
    }),
  );
  const focusProps = useFocus(
    () => floatingRootContext,
    () => ({ delay: delayWithDefault }),
  );
  const inlineRectTriggerProps = $derived(
    getInlineRectTriggerProps(
      store.context.inlineRectCoordsRef,
      isOpenedByThisTrigger,
    ),
  );
  const state = $derived({ open: isOpenedByThisTrigger });
  const rootTriggerProps = $derived(
    store.select('triggerProps', forwarding.isMountedByThisTrigger),
  );

  const hostAttachmentKey = createAttachmentKey();
  function attachHost(host: HTMLElement) {
    return untrack(() => {
      ref = host;
      forwarding.registerTrigger?.(host);
      triggerElementRef.current = host;
      return () =>
        untrack(() => {
          if (ref === host) ref = null;
          forwarding.registerTrigger?.(null);
          if (triggerElementRef.current === host)
            triggerElementRef.current = null;
        });
    });
  }
  const mergedProps = $derived({
    ...mergeComponentProps(
      state,
      { class: className, style: style },
      [
        hoverProps(),
        focusProps.reference,
        rootTriggerProps,
        inlineRectTriggerProps,
        { id: thisTriggerId },
        elementProps,
      ],
      triggerOpenStateMapping,
    ),
    [hostAttachmentKey]: attachHost,
  });
</script>

{#if render}
  {@render render(mergedProps, state, children)}
{:else}
  <a {...mergedProps}>{@render children?.()}</a>
{/if}
