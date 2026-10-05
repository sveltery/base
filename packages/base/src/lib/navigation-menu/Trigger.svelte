<script lang="ts">
  // Original NavigationMenuTrigger complete sizing, timing, cancellation and activation business body (MIT).
  import { flushSync } from 'svelte';
  import { addEventListener } from '../utils/addEventListener.js';
  import { useIsoLayoutEffect } from '../utils/useIsoLayoutEffect.svelte.js';
  import { ownerWindow } from '../utils/owner.js';
  import { useStableCallback } from '../utils/useStableCallback.js';
  import { useTimeout } from '../utils/useTimeout.js';
  import { useAnimationFrame } from '../utils/useAnimationFrame.js';
  import { safePolygon } from '../floating-ui/safePolygon.js';
  import { useClick } from '../floating-ui/hooks/useClick.svelte.js';
  import { useFloatingRootContext } from '../floating-ui/hooks/useFloatingRootContext.svelte.js';
  import { useFloatingTree } from '../floating-ui/components/FloatingTree.svelte.js';
  import { useHoverReferenceInteraction } from '../floating-ui/hooks/useHoverReferenceInteraction.svelte.js';
  import {
    applySafePolygonPointerEventsMutation,
    clearSafePolygonPointerEventsMutation,
    useHoverInteractionSharedState,
  } from '../floating-ui/hooks/useHoverInteractionSharedState.svelte.js';
  import { contains } from '../floating-ui/utils/element.js';
  import { isOutsideEvent } from '../floating-ui/utils/tabbable.js';
  import {
    getTabbableAfterElement,
    getNextTabbable,
    getPreviousTabbable,
  } from '../floating-ui/utils/tabbable.js';
  import { stopEvent } from '../floating-ui/utils/event.js';
  import type { HandleCloseContextBase } from '../floating-ui/hooks/useHoverShared.js';
  import type { HTMLProps } from '../internals/types.js';
  import { useNavigationMenuItemContext } from './item/NavigationMenuItemContext.js';
  import {
    useNavigationMenuRootContext,
    useNavigationMenuTreeContext,
  } from './root/NavigationMenuRootContext.js';
  import { createChangeEventDetails } from '../internals/createBaseUIEventDetails.js';
  import { REASONS } from '../internals/reasons.js';
  import { ownerVisuallyHidden, PATIENT_CLICK_THRESHOLD } from '../internals/constants.js';
  import FocusGuard from '../utils/FocusGuard.svelte';
  import { pressableTriggerOpenStateMapping } from '../utils/popupStateMapping.js';
  import * as TransitionStatusDataAttributes from '../internals/TransitionStatusDataAttributes.js';
  import { isOutsideMenuEvent } from './utils/isOutsideMenuEvent.js';
  import CompositeItem from '../internals/composite/item/CompositeItem.svelte';
  import { useButton } from '../internals/use-button/useButton.svelte.js';
  import { useAnimationsFinished } from '../internals/useAnimationsFinished.js';
  import { getCssDimensions } from '../utils/getCssDimensions.js';
  import { NAVIGATION_MENU_TRIGGER_IDENTIFIER } from './utils/constants.js';
  import { setSharedFixedSize } from './utils/setSharedFixedSize.js';
  import { useNavigationMenuDismissContext } from './list/NavigationMenuDismissContext.js';
  import * as NavigationMenuPopupCssVars from './popup/NavigationMenuPopupCssVars.js';
  import * as NavigationMenuPositionerCssVars from './positioner/NavigationMenuPositionerCssVars.js';
  import { mergeProps } from '../merge-props/index.js';
  import { toNativeStyle } from '../internals/nativeProps.js';
  import { useDirection } from '../direction-provider/context.js';
  import type {
    NavigationMenuTriggerProps,
    NavigationMenuTriggerState,
    NavigationMenuRootChangeEventDetails,
  } from './types.js';
  const DEFAULT_SIZE = { width: 0, height: 0 };
  let {
    // eslint-disable-next-line no-useless-assignment -- Native bind:ref publishes the host.
    ref = $bindable(null),
    render,
    class: classProp,
    style,
    children,
    nativeButton = true,
    disabled = false,
    ...elementProps
  }: NavigationMenuTriggerProps = $props();
  const nativeId = $props.id();
  const root = useNavigationMenuRootContext();
  const item = useNavigationMenuItemContext();
  const {
    value,
    setValue,
    mounted,
    open,
    positionerElement,
    setActivationDirection,
    setFloatingRootContext,
    popupElement,
    viewportElement,
    transitionStatus,
    rootRef,
    beforeOutsideRef,
    afterOutsideRef,
    afterInsideRef,
    beforeInsideRef,
    prevTriggerElementRef,
    popupAutoSizeResetRef,
    currentContentRef,
    delay,
    closeDelay,
    orientation,
    setViewportInert,
    nested,
  } = $derived(root);
  const { value: itemValue } = $derived(item);
  const nodeId = useNavigationMenuTreeContext();
  const tree = useFloatingTree();
  const getDismissProps = useNavigationMenuDismissContext();
  const dismissProps = $derived(getDismissProps?.());
  const getDirection = useDirection();
  const direction = $derived(getDirection());

  const stickIfOpenTimeout = useTimeout();
  const mutationFrame = useAnimationFrame();
  const resizeFrame = useAnimationFrame();
  const sizeFrame = useAnimationFrame();

  let triggerElement = $state.raw<HTMLElement | null>(null);
  let stickIfOpen = $state(true);
  let pointerType = $state<'mouse' | 'touch' | 'pen' | ''>('');

  const triggerElementRef = { current: null as HTMLElement | null };
  const prevSizeRef = { current: DEFAULT_SIZE };
  const skipAutoSizeSyncRef = { current: false };

  const isActiveItem = $derived(open && value === itemValue);
  const isActiveItemRef = {
    get current() {
      return isActiveItem;
    },
  };
  const interactionsEnabled = $derived((positionerElement != null || value == null) && !disabled);
  const hoverFloatingElement = $derived(positionerElement || viewportElement);
  const hoverInteractionsEnabled = $derived(
    (hoverFloatingElement != null || value == null) && !disabled,
  );

  const runOnceAnimationsFinish = useAnimationsFinished({
    get current() {
      return popupElement;
    },
  });

  function handleTriggerElement(element: HTMLElement | null) {
    triggerElementRef.current = element;
    triggerElement = element;
  }

  const cancelAutoSizeReset = useStableCallback((force = false) => {
    if (!force && popupAutoSizeResetRef.current.owner !== itemValue) {
      return;
    }

    popupAutoSizeResetRef.current.abortController?.abort();
    popupAutoSizeResetRef.current.abortController = null;
    popupAutoSizeResetRef.current.owner = null;
  });

  useIsoLayoutEffect(
    () => {
      if (isActiveItem) {
        return;
      }

      mutationFrame.cancel();
      sizeFrame.cancel();
      cancelAutoSizeReset();
    },
    () => [isActiveItem, mutationFrame, sizeFrame, cancelAutoSizeReset],
  );

  function setAutoSizes(element: HTMLElement) {
    element.style.setProperty(NavigationMenuPopupCssVars.popupWidth, 'auto');
    element.style.setProperty(NavigationMenuPopupCssVars.popupHeight, 'auto');
  }

  function clearFixedSizes(popup: HTMLElement, positioner: HTMLElement) {
    popup.style.removeProperty(NavigationMenuPopupCssVars.popupWidth);
    popup.style.removeProperty(NavigationMenuPopupCssVars.popupHeight);
    positioner.style.removeProperty(NavigationMenuPositionerCssVars.positionerWidth);
    positioner.style.removeProperty(NavigationMenuPositionerCssVars.positionerHeight);
  }

  function scheduleAutoSizeReset(popup: HTMLElement) {
    cancelAutoSizeReset(true);

    const abortController = new AbortController();
    popupAutoSizeResetRef.current.abortController = abortController;
    popupAutoSizeResetRef.current.owner = itemValue;

    runOnceAnimationsFinish(() => {
      popupAutoSizeResetRef.current.abortController = null;
      popupAutoSizeResetRef.current.owner = null;
      setAutoSizes(popup);
    }, abortController.signal);
  }

  const handleValueChange = useStableCallback(
    (popup: HTMLElement, positioner: HTMLElement, currentWidth: number, currentHeight: number) => {
      cancelAutoSizeReset(true);

      clearFixedSizes(popup, positioner);

      const { width, height } = getCssDimensions(popup);
      const measuredWidth = width || prevSizeRef.current.width;
      const measuredHeight = height || prevSizeRef.current.height;

      if (currentHeight === 0 || currentWidth === 0) {
        currentWidth = measuredWidth;
        currentHeight = measuredHeight;
      }

      popup.style.setProperty(NavigationMenuPopupCssVars.popupWidth, `${currentWidth}px`);
      popup.style.setProperty(NavigationMenuPopupCssVars.popupHeight, `${currentHeight}px`);
      positioner.style.setProperty(
        NavigationMenuPositionerCssVars.positionerWidth,
        `${measuredWidth}px`,
      );
      positioner.style.setProperty(
        NavigationMenuPositionerCssVars.positionerHeight,
        `${measuredHeight}px`,
      );

      sizeFrame.request(() => {
        if (!isActiveItemRef.current) {
          return;
        }

        popup.style.setProperty(NavigationMenuPopupCssVars.popupWidth, `${measuredWidth}px`);
        popup.style.setProperty(NavigationMenuPopupCssVars.popupHeight, `${measuredHeight}px`);

        scheduleAutoSizeReset(popup);
      });
    },
  );

  const handleInterruptedMutationResize = useStableCallback(
    (popup: HTMLElement, positioner: HTMLElement, currentWidth: number, currentHeight: number) => {
      sizeFrame.cancel();
      mutationFrame.cancel();
      cancelAutoSizeReset(true);

      if (currentWidth === 0 || currentHeight === 0) {
        return;
      }

      setSharedFixedSize(popup, positioner, currentWidth, currentHeight);

      mutationFrame.request(() => {
        mutationFrame.request(() => {
          clearFixedSizes(popup, positioner);

          const { width, height } = getCssDimensions(popup);
          const measuredWidth = width || currentWidth;
          const measuredHeight = height || currentHeight;

          setSharedFixedSize(popup, positioner, currentWidth, currentHeight);

          sizeFrame.request(() => {
            if (!isActiveItemRef.current) {
              return;
            }

            setSharedFixedSize(popup, positioner, measuredWidth, measuredHeight);
            scheduleAutoSizeReset(popup);
          });
        });
      });
    },
  );

  const syncCurrentSize = useStableCallback((popup: HTMLElement, positioner: HTMLElement) => {
    sizeFrame.cancel();
    cancelAutoSizeReset(true);

    clearFixedSizes(popup, positioner);

    const { width, height } = getCssDimensions(popup);

    if (width === 0 || height === 0) {
      return;
    }

    prevSizeRef.current = { width, height };
    setAutoSizes(popup);
    positioner.style.setProperty(NavigationMenuPositionerCssVars.positionerWidth, `${width}px`);
    positioner.style.setProperty(NavigationMenuPositionerCssVars.positionerHeight, `${height}px`);
  });

  const getMutationBaseline = useStableCallback((popup: HTMLElement) => {
    const popupWidth = popup.style.getPropertyValue(NavigationMenuPopupCssVars.popupWidth);
    const popupHeight = popup.style.getPropertyValue(NavigationMenuPopupCssVars.popupHeight);
    const isResizing =
      popupWidth !== '' && popupWidth !== 'auto' && popupHeight !== '' && popupHeight !== 'auto';

    if (!isResizing) {
      return { size: prevSizeRef.current, syncPositioner: false };
    }

    return {
      size: {
        width: popup.offsetWidth || prevSizeRef.current.width,
        height: popup.offsetHeight || prevSizeRef.current.height,
      },
      syncPositioner: true,
    };
  });

  useIsoLayoutEffect(
    () => {
      if (!open) {
        stickIfOpenTimeout.clear();
        mutationFrame.cancel();
        resizeFrame.cancel();
        sizeFrame.cancel();
        cancelAutoSizeReset(true);
        skipAutoSizeSyncRef.current = false;
        pointerType = '';
      }
    },
    () => [stickIfOpenTimeout, open, mutationFrame, resizeFrame, sizeFrame, cancelAutoSizeReset],
  );

  useIsoLayoutEffect(
    () => {
      if (!mounted) {
        prevSizeRef.current = DEFAULT_SIZE;
      }
    },
    () => [mounted],
  );

  useIsoLayoutEffect(
    () => {
      if (!popupElement || typeof ResizeObserver !== 'function') {
        return undefined;
      }

      const resizeObserver = new ResizeObserver(() => {
        prevSizeRef.current = {
          width: popupElement.offsetWidth,
          height: popupElement.offsetHeight,
        };
      });

      resizeObserver.observe(popupElement);

      return () => {
        resizeObserver.disconnect();
      };
    },
    () => [popupElement],
  );

  useIsoLayoutEffect(
    () => {
      if (!open || !isActiveItem || !popupElement || !positionerElement) {
        return undefined;
      }

      const popup = popupElement;
      const positioner = positionerElement;
      const win = ownerWindow(positioner);
      function handleResize() {
        resizeFrame.cancel();
        resizeFrame.request(() => syncCurrentSize(popup, positioner));
      }

      const unsubscribe = addEventListener(win, 'resize', handleResize);

      return () => {
        resizeFrame.cancel();
        unsubscribe();
      };
    },
    () => [open, isActiveItem, popupElement, positionerElement, resizeFrame, syncCurrentSize],
  );

  useIsoLayoutEffect(
    () => {
      const observedElement = currentContentRef.current;

      if (
        !observedElement ||
        !popupElement ||
        !positionerElement ||
        !isActiveItem ||
        typeof MutationObserver !== 'function'
      ) {
        return undefined;
      }

      const mutationObserver = new MutationObserver(() => {
        if (
          transitionStatus === 'starting' ||
          popupElement.hasAttribute(TransitionStatusDataAttributes.startingStyle)
        ) {
          syncCurrentSize(popupElement, positionerElement);
          return;
        }

        const { size, syncPositioner } = getMutationBaseline(popupElement);

        if (syncPositioner) {
          handleInterruptedMutationResize(popupElement, positionerElement, size.width, size.height);
          return;
        }

        handleValueChange(popupElement, positionerElement, size.width, size.height);
      });

      mutationObserver.observe(observedElement, {
        childList: true,
        subtree: true,
        characterData: true,
        // `keepMounted` submenu switches update dimensions by toggling hidden
        // content rather than inserting or removing content nodes.
        attributes: true,
        attributeFilter: ['hidden'],
      });

      return () => {
        mutationObserver.disconnect();
      };
    },
    () => [
      currentContentRef.current,
      popupElement,
      positionerElement,
      isActiveItem,
      transitionStatus,
      getMutationBaseline,
      handleInterruptedMutationResize,
      handleValueChange,
      syncCurrentSize,
    ],
  );

  useIsoLayoutEffect(
    () => {
      if (isActiveItemRef.current && open && popupElement && positionerElement) {
        if (skipAutoSizeSyncRef.current) {
          skipAutoSizeSyncRef.current = false;
          return undefined;
        }

        const { width, height } = getCssDimensions(popupElement);
        handleValueChange(popupElement, positionerElement, width, height);
      }
      return undefined;
    },
    () => [
      currentContentRef.current,
      handleValueChange,
      isActiveItemRef,
      open,
      popupElement,
      positionerElement,
      transitionStatus,
    ],
  );

  function handleOpenChange(nextOpen: boolean, eventDetails: NavigationMenuRootChangeEventDetails) {
    const isHover = eventDetails.reason === REASONS.triggerHover;

    if (!interactionsEnabled) {
      return;
    }

    if (pointerType === 'touch' && isHover) {
      return;
    }

    if (!nextOpen && value !== itemValue) {
      return;
    }

    function changeState() {
      if (isHover) {
        // Only allow "patient" clicks to close the popup if it's open.
        // If they clicked within 500ms of the popup opening, keep it open.
        stickIfOpen = true;
        stickIfOpenTimeout.clear();
        stickIfOpenTimeout.start(PATIENT_CLICK_THRESHOLD, () => {
          stickIfOpen = false;
        });
      }

      if (nextOpen) {
        setValue(itemValue, eventDetails);
      } else {
        setValue(null, eventDetails);
        pointerType = '';
      }
    }

    if (isHover) {
      flushSync(changeState);
    } else {
      changeState();
    }
  }

  const context = useFloatingRootContext(
    () => ({
      open,
      onOpenChange(nextOpen, details) {
        handleOpenChange(nextOpen, details as NavigationMenuRootChangeEventDetails);
      },
      elements: {
        reference: triggerElement,
        floating: hoverFloatingElement,
      },
    }),
    `${nativeId}-floating`,
  );

  const getHoverInteractionState = useHoverInteractionSharedState(() => context);
  const hoverInteractionState = $derived(getHoverInteractionState());
  const shouldBlockSafePolygonPointerEvents = $derived(pointerType !== 'touch');

  useIsoLayoutEffect(
    () => {
      if (!open) {
        context.context.dataRef.current.openEvent = undefined;
        hoverInteractionState.pointerType = undefined;
        hoverInteractionState.interactedInside = false;
        hoverInteractionState.restTimeoutPending = false;
        hoverInteractionState.openChangeTimeout.clear();
        hoverInteractionState.restTimeout.clear();
      }

      return () => {
        clearSafePolygonPointerEventsMutation(hoverInteractionState);
      };
    },
    () => [context, hoverInteractionState, open],
  );

  const getInlineHandleCloseContext = useStableCallback(() => {
    if (!nested || positionerElement || !triggerElementRef.current || !hoverFloatingElement) {
      return null;
    }

    return getHandleCloseContext(triggerElementRef.current, hoverFloatingElement, nodeId);
  });

  function getScope() {
    if (nested && positionerElement) {
      return null;
    }

    return triggerElementRef.current?.closest('ul') ?? null;
  }

  const getHoverProps = useHoverReferenceInteraction(
    () => context,
    () => ({
      enabled: hoverInteractionsEnabled,
      move: false,
      handleClose: safePolygon({
        blockPointerEvents: shouldBlockSafePolygonPointerEvents,
        getScope,
      }),
      restMs: mounted && positionerElement ? 0 : delay,
      delay: { close: closeDelay },
      triggerElementRef,
      getHandleCloseContext: getInlineHandleCloseContext,
    }),
  );

  const hover = $derived(getHoverProps() ? { reference: getHoverProps() } : undefined);
  const click = useClick(
    () => context,
    () => ({ enabled: interactionsEnabled, stickIfOpen, toggle: isActiveItem }),
  );
  const referenceProps = $derived(mergeProps(click.reference, hover?.reference));

  useIsoLayoutEffect(
    () => {
      if (isActiveItem) {
        setFloatingRootContext(context);
        prevTriggerElementRef.current = triggerElement;
      }
    },
    () => [isActiveItem, context, setFloatingRootContext, prevTriggerElementRef, triggerElement],
  );

  // Source constructs this ordinary callback in its component scope. Retain
  // those selected scalars through flushSync; refs and Store reads stay live.
  const handleActivation = $derived.by(() => {
    const { value, mounted, orientation, nested, positionerElement } = root;
    const { value: itemValue } = item;
    const activationTrigger = triggerElement;
    const activationPointerType = pointerType;
    const activationFloating = positionerElement || root.viewportElement;
    const blockPointerEvents = shouldBlockSafePolygonPointerEvents;
    return (event: MouseEvent | KeyboardEvent) => {
      flushSync(() => {
        const currentTarget = event.currentTarget as HTMLElement;
        const prevTriggerRect = prevTriggerElementRef.current?.getBoundingClientRect();

        if (mounted && prevTriggerRect && activationTrigger) {
          const nextTriggerRect = activationTrigger.getBoundingClientRect();
          const isMovingRight = nextTriggerRect.left > prevTriggerRect.left;
          const isMovingDown = nextTriggerRect.top > prevTriggerRect.top;

          if (orientation === 'horizontal' && nextTriggerRect.left !== prevTriggerRect.left) {
            setActivationDirection(isMovingRight ? 'right' : 'left');
          } else if (orientation === 'vertical' && nextTriggerRect.top !== prevTriggerRect.top) {
            setActivationDirection(isMovingDown ? 'down' : 'up');
          }
        }

        // Reset the `openEvent` to `undefined` when the active item changes so that a
        // `click` -> `hover` on new trigger -> `hover` back to old trigger doesn't unexpectedly
        // cause the popup to remain stuck open when leaving the old trigger.
        if (event.type !== 'click' && value != null) {
          context.context.dataRef.current.openEvent = undefined;
        }

        if (activationPointerType === 'touch' && event.type !== 'click') {
          return;
        }

        // Keyboard open events reach this activation path after `onkeydown` has already set
        // the value with the `listNavigation` reason.
        if (value != null && event.type !== 'keydown') {
          setValue(
            itemValue,
            createChangeEventDetails(
              event.type === 'mouseenter' ? REASONS.triggerHover : REASONS.triggerPress,
              event,
            ),
          );
        }

        if (
          event.type === 'mouseenter' &&
          blockPointerEvents &&
          (!nested || !positionerElement) &&
          activationFloating
        ) {
          const applyPointerEventsMutation = () => {
            const scopeElement = getScope() ?? currentTarget.ownerDocument.body;

            applySafePolygonPointerEventsMutation(hoverInteractionState, {
              scopeElement,
              referenceElement: currentTarget,
              floatingElement: activationFloating,
            });
          };

          if (value != null && value !== itemValue) {
            queueMicrotask(applyPointerEventsMutation);
          } else {
            applyPointerEventsMutation();
          }
        }
      });
    };
  });

  const handleOpenEvent = useStableCallback((event: MouseEvent | KeyboardEvent) => {
    if (disabled) {
      return;
    }

    if (!popupElement || !positionerElement) {
      handleActivation(event);
      return;
    }

    const { width, height } = getCssDimensions(popupElement);
    const shouldSkipAutoSizeSync =
      value != null && value !== itemValue && (event.type === 'click' || pointerType !== 'touch');

    handleActivation(event);

    if (shouldSkipAutoSizeSync) {
      skipAutoSizeSyncRef.current = true;
    }

    handleValueChange(popupElement, positionerElement, width, height);
  });

  const partState: NavigationMenuTriggerState = $derived({ open: isActiveItem, disabled });

  function handleSetPointerType(event: PointerEvent) {
    pointerType = event.pointerType as typeof pointerType;
  }

  function handleTriggerPointerDown(event: PointerEvent) {
    handleSetPointerType(event);
    clearSafePolygonPointerEventsMutation(hoverInteractionState);
  }

  const defaultProps: HTMLProps = $derived({
    tabindex: 0,
    onmouseenter: handleOpenEvent,
    onclick: handleOpenEvent,
    onpointerenter: handleSetPointerType,
    onpointerdown: handleTriggerPointerDown,
    'aria-expanded': isActiveItem,
    'aria-controls': isActiveItem ? popupElement?.id : undefined,
    [NAVIGATION_MENU_TRIGGER_IDENTIFIER as string]: '',
    onfocusin() {
      if (!isActiveItem) {
        return;
      }
      setViewportInert(false);
    },
    onmouseleave() {
      if (value == null) {
        clearSafePolygonPointerEventsMutation(hoverInteractionState);
      }
    },
    onkeydown(event: KeyboardEvent) {
      // For nested (submenu) triggers, don't intercept arrow keys that are used for
      // navigation in the parent content. The arrow keys should be handled by the
      // parent's CompositeRoot for navigating between items.
      if (nested) {
        return;
      }

      const verticalOpenKey = direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
      const openHorizontal = orientation === 'horizontal' && event.key === 'ArrowDown';
      const openVertical = orientation === 'vertical' && event.key === verticalOpenKey;

      if (openHorizontal || openVertical) {
        setValue(itemValue, createChangeEventDetails(REASONS.listNavigation, event));
        handleOpenEvent(event);
        stopEvent(event);
      }
    },
    onfocusout(event: FocusEvent) {
      if (
        positionerElement &&
        popupElement &&
        isOutsideMenuEvent(
          {
            currentTarget: event.currentTarget as HTMLElement,
            relatedTarget: event.relatedTarget as HTMLElement | null,
          },
          { popupElement, rootRef, tree, nodeId },
        )
      ) {
        setValue(null, createChangeEventDetails(REASONS.focusOut, event));
      }
    },
  });

  const { getButtonProps, buttonRef } = useButton(() => ({
    disabled,
    focusableWhenDisabled: true,
    native: nativeButton,
  }));

  const referenceElement = $derived(hoverFloatingElement);
  const refs = [
    (node: HTMLElement | null) => {
      ref = node;
    },
    handleTriggerElement,
    buttonRef,
  ];

  function getPlacementFromElements(
    domReferenceElement: Element,
    floatingElement: HTMLElement,
  ): HandleCloseContextBase['placement'] {
    const referenceRect = domReferenceElement.getBoundingClientRect();
    const floatingRect = floatingElement.getBoundingClientRect();
    const referenceCenterX = referenceRect.left + referenceRect.width / 2;
    const referenceCenterY = referenceRect.top + referenceRect.height / 2;
    const floatingCenterX = floatingRect.left + floatingRect.width / 2;
    const floatingCenterY = floatingRect.top + floatingRect.height / 2;
    const deltaX = floatingCenterX - referenceCenterX;
    const deltaY = floatingCenterY - referenceCenterY;

    if (Math.abs(deltaX) >= Math.abs(deltaY)) {
      return deltaX >= 0 ? 'right' : 'left';
    }

    return deltaY >= 0 ? 'bottom' : 'top';
  }

  function getHandleCloseContext(
    domReferenceElement: Element,
    floatingElement: HTMLElement,
    nodeId: string | undefined,
  ): HandleCloseContextBase {
    return {
      placement: getPlacementFromElements(domReferenceElement, floatingElement),
      elements: {
        domReference: domReferenceElement,
        floating: floatingElement,
      },
      nodeId,
    };
  }
</script>
<CompositeItem tag="button" {render} class={classProp} {style} state={partState} stateAttributesMapping={pressableTriggerOpenStateMapping}
  {refs}
  props={[referenceProps, dismissProps?.reference || {}, defaultProps, elementProps, getButtonProps]} {children} />
{#if isActiveItem}
  <FocusGuard ref={beforeOutsideRef} onfocus={(event) => {
    if (referenceElement && isOutsideEvent(event, referenceElement)) beforeInsideRef.current?.focus();
    else getPreviousTabbable(triggerElement)?.focus();
  }} />
  <span aria-owns={viewportElement?.id} style={toNativeStyle(ownerVisuallyHidden)}></span>
  <FocusGuard ref={afterOutsideRef} onfocus={(event) => {
    if (referenceElement && isOutsideEvent(event, referenceElement)) {
      flushSync(() => setViewportInert(false));
      (afterInsideRef.current || triggerElement)?.focus();
    } else {
      let nextTabbable = getNextTabbable(triggerElement);
      if (nested && !positionerElement && referenceElement && nextTabbable && contains(referenceElement, nextTabbable)) nextTabbable = getTabbableAfterElement(afterInsideRef.current);
      nextTabbable?.focus();
      if ((!nested || positionerElement) && !contains(rootRef.current, nextTabbable)) setValue(null, createChangeEventDetails(REASONS.focusOut, event));
    }
  }} />
{/if}
