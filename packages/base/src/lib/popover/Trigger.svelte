<script lang="ts" generics="Payload = unknown">
  import { mergeComponentProps } from '../internals/mergeComponentProps.js';
  import { createAttachmentKey } from 'svelte/attachments';
  import { untrack } from 'svelte';

  // Original Base UI v1.8.0 at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT: THIRD_PARTY_NOTICES.md.
  import { usePopoverRootContext } from './context.js';
  import { usePopupHandleStore } from '../utils/popups/usePopupHandleStore.svelte.js';
  import { useTriggerDataForwarding } from '../utils/popups/popupStoreUtils.svelte.js';
  import { useBaseUiId } from '../internals/useBaseUiId.js';
  import { useHoverReferenceInteraction } from '../floating-ui/hooks/useHoverReferenceInteraction.svelte.js';
  import { safePolygon } from '../floating-ui/safePolygon.js';
  import {
    triggerOpenStateMapping,
    pressableTriggerOpenStateMapping,
  } from '../utils/popupStateMapping.js';
  import { OPEN_DELAY } from './utils/constants.js';
  import type { PopoverHandleStore } from './store/PopoverStore.svelte.js';
  import type { PopoverTriggerProps } from './types.js';
  import FocusGuard from '../utils/FocusGuard.svelte';
  import { useButton } from '../internals/use-button/useButton.svelte.js';
  import { useClick } from '../floating-ui/hooks/useClick.svelte.js';
  import { CLICK_TRIGGER_IDENTIFIER } from '../internals/constants.js';
  import { REASONS } from '../internals/reasons.js';
  import { useTriggerFocusGuards } from '../utils/popups/useTriggerFocusGuards.svelte.js';
  import { useOpenMethodTriggerProps } from '../utils/useOpenInteractionType.svelte.js';
  let {
    render,
    class: className,
    style,
    children,
    ref = $bindable(),
    handle,
    payload,
    id: idProp,
    disabled = false,
    nativeButton = true,
    openOnHover = false,
    delay = OPEN_DELAY,
    closeDelay = 0,
    ...elementProps
  }: PopoverTriggerProps<Payload> = $props();
  const rootStore = usePopoverRootContext(true);
  const handleStore = usePopupHandleStore(() => handle);
  const store: PopoverHandleStore<unknown> = $derived.by(() => {
    const value = handleStore.store ?? rootStore;
    if (!value)
      throw new Error(
        'Base UI: <Popover.Trigger> must be either used within a <Popover.Root> component or provided with a handle.',
      );
    return value;
  });
  const generatedId = $props.id();
  const thisTriggerId = $derived(useBaseUiId(idProp ?? undefined, generatedId));
  const isTriggerActive = $derived(store.select('isTriggerActive', thisTriggerId));
  const isOpenedByThisTrigger = $derived(store.select('isOpenedByTrigger', thisTriggerId));
  const floatingRootContext = $derived(store.select('floatingRootContext'));
  const triggerElementRef = { current: null as HTMLElement | null };
  const forwarding = useTriggerDataForwarding(
    () => thisTriggerId,
    triggerElementRef,
    () => store,
    () => ({ payload, disabled, openOnHover, closeDelay }),
  );
  const openReason = $derived(store.select('openChangeReason'));
  const stickIfOpen = $derived(store.select('stickIfOpen'));
  const openMethod = $derived(store.select('openMethod'));
  const focusManagerModal = $derived(store.select('focusManagerModal'));
  const hoverProps = useHoverReferenceInteraction(
    () => floatingRootContext,
    () => ({
      enabled:
        !disabled && openOnHover && (openMethod !== 'touch' || openReason !== REASONS.triggerPress),
      mouseOnly: true,
      move: false,
      handleClose: safePolygon(),
      restMs: delay,
      delay: { close: closeDelay },
      triggerElementRef,
      isActiveTrigger: isTriggerActive,
      isClosing: () => store.select('transitionStatus') === 'ending',
    }),
  );
  const click = useClick(
    () => floatingRootContext,
    () => ({ stickIfOpen }),
  );
  const interactionTypeProps = useOpenMethodTriggerProps(
    () => store.select('open'),
    (interactionType) => store.set('openMethod', interactionType),
  );
  const { getButtonProps, buttonRef } = useButton(() => ({
    disabled,
    native: nativeButton,
  }));
  const stateAttributesMapping = {
    open(value: boolean) {
      if (value && openReason === REASONS.triggerPress)
        return pressableTriggerOpenStateMapping.open(value);
      return triggerOpenStateMapping.open(value);
    },
  };
  const focusGuards = useTriggerFocusGuards(() => store, triggerElementRef);
  const state = $derived({ disabled, open: isOpenedByThisTrigger });
  const rootTriggerProps = $derived(
    store.select('triggerProps', forwarding.isMountedByThisTrigger),
  );

  const hostAttachmentKey = createAttachmentKey();
  function attachHost(host: HTMLElement) {
    return untrack(() => {
      buttonRef?.(host);
      ref = host;
      forwarding.registerTrigger?.(host);
      triggerElementRef.current = host;
      return () =>
        untrack(() => {
          buttonRef?.(null);
          if (ref === host) ref = null;
          forwarding.registerTrigger?.(null);
          if (triggerElementRef.current === host) triggerElementRef.current = null;
        });
    });
  }
  const mergedProps = $derived({
    ...mergeComponentProps(
      state,
      { class: className, style: style },
      [
        click.reference,
        hoverProps(),
        rootTriggerProps,
        interactionTypeProps,
        {
          [CLICK_TRIGGER_IDENTIFIER]: '',
          id: thisTriggerId,
          'aria-haspopup': 'dialog',
          'aria-expanded': isOpenedByThisTrigger,
          'aria-controls': store.select('triggerPopupId', thisTriggerId),
        },
        elementProps,
        getButtonProps,
      ],
      stateAttributesMapping,
    ),
    [hostAttachmentKey]: attachHost,
  });
</script>

{#if forwarding.isMountedByThisTrigger && !focusManagerModal}
  <FocusGuard
    bind:ref={focusGuards.preFocusGuardRef.current}
    onfocusin={focusGuards.handlePreFocusGuardFocus}
  />
{/if}
{#if render}
  {@render render(mergedProps, state, children)}
{:else}
  <button type="button" {...mergedProps}>{@render children?.()}</button>
{/if}
{#if forwarding.isMountedByThisTrigger && !focusManagerModal}
  <FocusGuard
    bind:ref={store.context.triggerFocusTargetRef.current}
    onfocusin={focusGuards.handleFocusTargetFocus}
  />
{/if}
