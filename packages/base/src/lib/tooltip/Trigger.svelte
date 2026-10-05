<script lang="ts" generics="Payload = unknown">
import { mergeComponentProps } from '../internals/mergeComponentProps.js';
import { createAttachmentKey } from 'svelte/attachments';

  // Original Base UI v1.8.0 at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT: THIRD_PARTY_NOTICES.md.
  import { useTooltipRootContext } from './context.js';
  import { usePopupHandleStore } from '../utils/popups/usePopupHandleStore.svelte.js';
  import { useTriggerDataForwarding } from '../utils/popups/popupStoreUtils.svelte.js';
  import { useBaseUiId } from '../internals/useBaseUiId.js';
  import { useHoverReferenceInteraction } from '../floating-ui/hooks/useHoverReferenceInteraction.svelte.js';
  import { safePolygon } from '../floating-ui/safePolygon.js';
  import { triggerOpenStateMapping } from '../utils/popupStateMapping.js';
  import { OPEN_DELAY } from './utils/constants.js';
  import type { TooltipHandleStore } from './store/TooltipStore.svelte.js';
  import type { TooltipTriggerProps } from './types.js';
  import { useFocus } from '../floating-ui/hooks/useFocus.svelte.js';
  import { onDestroy, untrack } from 'svelte';
  import { isElement } from '@floating-ui/utils/dom';
  import { Timeout } from '@sveltery/utils/useTimeout';
  import { useTooltipProviderContext } from './provider/TooltipProviderContext.js';
  import { useDelayGroup } from '../floating-ui/hooks/useDelayGroup.svelte.js';
  import { useHoverInteractionSharedState } from '../floating-ui/hooks/useHoverInteractionSharedState.svelte.js';
  import { getDelay } from '../floating-ui/hooks/useHoverShared.js';
  import { contains } from '../floating-ui/utils/element.js';
  import { isMouseLikePointerType } from '../floating-ui/utils/event.js';
  import { createChangeEventDetails } from '../internals/createBaseUIEventDetails.js';
  import { REASONS } from '../internals/reasons.js';
  const TOOLTIP_TRIGGER_IDENTIFIER = 'data-base-ui-tooltip-trigger';
  function getTargetElement(event: Event): Element | null {
    if ('composedPath' in event) {
      const path = event.composedPath();
      for (let i = 0; i < path.length; i += 1) {
        const element = path[i];
        if (isElement(element)) return element;
      }
    }
    const target = event.target;
    if (isElement(target)) return target;
    return null;
  }
  function closestEnabledTooltipTrigger(element: Element | null): Element | null {
    let current = element;
    while (current) {
      const trigger = current.closest(`[${TOOLTIP_TRIGGER_IDENTIFIER}]`);
      if (trigger) return trigger;
      const root = current.getRootNode();
      current = 'host' in root && isElement(root.host) ? root.host : null;
    }
    return null;
  }
  // eslint-disable-next-line no-useless-assignment -- Native bindable ref output is published through the ordered Source ref callback.
  let { render, class: className, style, children, ref = $bindable(), handle, payload, id: idProp, disabled: disabledProp, delay, closeOnClick = true, closeDelay, ...elementProps }: TooltipTriggerProps<Payload> = $props();
  const rootStore = useTooltipRootContext(true);
  const handleStore = usePopupHandleStore(() => handle);
  const store: TooltipHandleStore<unknown> = $derived.by(() => {
    const value = handleStore.store ?? rootStore;
    if (!value) throw new Error('Base UI: <Tooltip.Trigger> must be either used within a <Tooltip.Root> component or provided with a handle.');
    return value;
  });
  const generatedId = $props.id();
  const thisTriggerId = $derived(useBaseUiId(idProp ?? undefined, generatedId));
  const isTriggerActive = $derived(store.select('isTriggerActive', thisTriggerId));
  const isOpenedByThisTrigger = $derived(store.select('isOpenedByTrigger', thisTriggerId));
  const floatingRootContext = $derived(store.select('floatingRootContext'));
  const triggerElementRef = { current: null as HTMLElement | null };
  const closeDelayWithDefault = $derived(closeDelay ?? 0);
  const forwarding = useTriggerDataForwarding(() => thisTriggerId, triggerElementRef, () => store, () => ({ payload, closeOnClick, closeDelay: closeDelayWithDefault }));
  const providerContext = useTooltipProviderContext();
  const delayGroup = useDelayGroup(() => floatingRootContext, () => ({ open: isOpenedByThisTrigger }));
  const getHoverInteraction = useHoverInteractionSharedState(() => floatingRootContext);
  const hoverInteraction = $derived(getHoverInteraction());
  // The handle-backed Store pointer may migrate after mount. Native synchronization reads its current owner.
  $effect(() => { const currentStore = store; const instantPhase = delayGroup.isInstantPhase; untrack(() => currentStore.set('isInstantPhase', instantPhase)); });
  const rootDisabled = $derived(store.select('disabled'));
  const disabled = $derived(disabledProp ?? rootDisabled);
  const disabledRef = { get current() { return disabled; } };
  const trackCursorAxis = $derived(store.select('trackCursorAxis'));
  const disableHoverablePopup = $derived(store.select('disableHoverablePopup'));
  const isNestedTriggerHoveredRef = { current: false };
  const nestedTriggerOpenTimeout = new Timeout();
  onDestroy(nestedTriggerOpenTimeout.clear);
  const pointerTypeRef = { current: undefined as string | undefined };
  function getOpenDelay() {
    // Adjacent tooltips open instantly while the group is active.
    if (delayGroup.hasProvider && delayGroup.activeIdRef.current != null) {
      return 0;
    }
    return delay ?? providerContext?.delay ?? OPEN_DELAY;
  }

  function isEnabledNestedTriggerTarget(target: Element | null) {
    const triggerEl = triggerElementRef.current;
    if (!triggerEl || !target) {
      return false;
    }

    const nearestTrigger = closestEnabledTooltipTrigger(target);
    return (
      nearestTrigger !== null && nearestTrigger !== triggerEl && contains(triggerEl, nearestTrigger)
    );
  }

  function detectNestedTriggerHover(target: Element | null) {
    const nestedTriggerHovered = isEnabledNestedTriggerTarget(target);

    isNestedTriggerHoveredRef.current = nestedTriggerHovered;
    if (nestedTriggerHovered) {
      hoverInteraction.openChangeTimeout.clear();
      hoverInteraction.restTimeout.clear();
      hoverInteraction.restTimeoutPending = false;
      nestedTriggerOpenTimeout.clear();
    }
    return nestedTriggerHovered;
  }

  const hoverProps = useHoverReferenceInteraction(() => floatingRootContext, () => ({
    enabled: !disabled,
    mouseOnly: true,
    move: false,
    handleClose: !disableHoverablePopup && trackCursorAxis !== 'both' ? safePolygon() : null,
    restMs: getOpenDelay,
    delay() {
      if (closeDelay == null && delayGroup.hasProvider) {
        return { close: getDelay(delayGroup.delayRef.current, 'close') };
      }
      return { close: closeDelayWithDefault };
    },
    triggerElementRef,
    isActiveTrigger: isTriggerActive,
    isClosing: () => store.select('transitionStatus') === 'ending',
    shouldOpen() {
      return !isNestedTriggerHoveredRef.current;
    },
  }));

  const focus = useFocus(() => floatingRootContext, () => ({ enabled: !disabled }));

  const handleNestedTriggerHover = (event: MouseEvent) => {
    const wasNestedTriggerHovered = isNestedTriggerHoveredRef.current;
    const target = getTargetElement(event);
    const nestedTriggerHovered = detectNestedTriggerHover(target);
    const triggerEl = triggerElementRef.current as HTMLElement | null;
    const targetInsideTrigger = triggerEl && target && contains(triggerEl, target);

    // Only close hover-opened parents. Focus/click-like opens remain owned by
    // their original interaction and should not be clobbered by nested hover.
    if (
      nestedTriggerHovered &&
      store.select('open') &&
      store.select('lastOpenChangeReason') === REASONS.triggerHover
    ) {
      store.setOpen(false, createChangeEventDetails(REASONS.triggerHover, event));
      return;
    }

    if (
      wasNestedTriggerHovered &&
      !nestedTriggerHovered &&
      targetInsideTrigger &&
      !disabledRef.current &&
      !store.select('open') &&
      triggerEl &&
      // Match the hover hook's non-strict mouse fallback for mouse-only event sequences.
      isMouseLikePointerType(pointerTypeRef.current)
    ) {
      const open = () => {
        if (!isNestedTriggerHoveredRef.current && !disabledRef.current && !store.select('open')) {
          store.setOpen(true, createChangeEventDetails(REASONS.triggerHover, event, triggerEl));
        }
      };

      const openDelay = getOpenDelay();

      // With `move: false`, the hover hook only listens to mouseenter/mouseleave
      // on the parent trigger. Leaving a nested child for the parent area fires
      // no event the hook can react to, so reopen locally.
      if (openDelay === 0) {
        nestedTriggerOpenTimeout.clear();
        open();
      } else {
        nestedTriggerOpenTimeout.start(openDelay, open);
      }
    }
  };

  const shouldApplyRootTriggerProps = $derived(forwarding.isMountedByThisTrigger || trackCursorAxis !== 'none');
  const state = $derived({ open: isOpenedByThisTrigger });
  const rootTriggerProps = $derived(store.select('triggerProps', forwarding.isMountedByThisTrigger));
  

const hostAttachmentKey = createAttachmentKey();
function attachHost(host: HTMLElement) {
  return untrack(() => {
    ref = host;
    forwarding.registerTrigger?.(host);
    triggerElementRef.current = host;
    return () => untrack(() => {
      if (ref === host) ref = null;
      forwarding.registerTrigger?.(null);
      if (triggerElementRef.current === host) triggerElementRef.current = null;
    });
  });
}
const mergedProps = $derived({ ...mergeComponentProps(state, { class: className, style: style }, [
    hoverProps(), focus.reference, shouldApplyRootTriggerProps ? rootTriggerProps : undefined,
    {
      onmouseover(event: MouseEvent) { handleNestedTriggerHover(event); },
      onfocusin(event: FocusEvent & { preventBaseUIHandler(): void }) {
        if (isEnabledNestedTriggerTarget(getTargetElement(event))) event.preventBaseUIHandler();
      },
      onmouseleave() { isNestedTriggerHoveredRef.current = false; nestedTriggerOpenTimeout.clear(); pointerTypeRef.current = undefined; },
      onpointerenter(event: PointerEvent) { pointerTypeRef.current = event.pointerType; },
      onpointerdown(event: PointerEvent) {
        pointerTypeRef.current = event.pointerType;
        store.set('closeOnClick', closeOnClick);
        if (closeOnClick && !store.select('open')) store.cancelPendingOpen(event);
      },
      onclick(event: MouseEvent) { if (closeOnClick && !store.select('open')) store.cancelPendingOpen(event); },
      id: thisTriggerId,
      'data-trigger-disabled': disabled ? '' : undefined,
      [TOOLTIP_TRIGGER_IDENTIFIER]: disabled ? undefined : '',
    },
    elementProps,
  ], triggerOpenStateMapping), [hostAttachmentKey]: attachHost });
</script>
{#if render}
  {@render render(mergedProps, state, children)}
{:else}
  <button {...mergedProps}>{@render children?.()}</button>
{/if}
