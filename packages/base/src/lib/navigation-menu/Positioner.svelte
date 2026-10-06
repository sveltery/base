<script lang="ts">
  // Original NavigationMenuPositioner timing, focus capture and public anchor path (MIT).
  import { flushSync, untrack, onDestroy } from 'svelte';
  import { addEventListener } from '@sveltery/utils/addEventListener';
  import { mergeCleanups } from '@sveltery/utils/mergeCleanups';
  import { ownerWindow } from '@sveltery/utils/owner';
  import { Timeout } from '@sveltery/utils/useTimeout';

  import { disableFocusInside, enableFocusInside } from '../floating-ui/utils/tabbable.js';
  import { isOutsideEvent } from '../floating-ui/utils/tabbable.js';
  import { getEmptyRootContext } from '../floating-ui/utils/getEmptyRootContext.js';
  import {
    useNavigationMenuRootContext,
    useNavigationMenuTreeContext,
  } from './root/NavigationMenuRootContext.js';
  import { useNavigationMenuPortalContext } from './portal/NavigationMenuPortalContext.js';
  import { useNavigationMenuAnchorPositioning } from './utils/useNavigationMenuAnchorPositioning.svelte.js';
  import { provideNavigationMenuPositionerContext } from './positioner/NavigationMenuPositionerContext.js';
  import {
    DROPDOWN_COLLISION_AVOIDANCE,
    POPUP_COLLISION_AVOIDANCE,
  } from '../internals/constants.js';
  import { adaptiveOrigin } from '../internals/anchor-positioning/adaptive-origin.js';
  import { usePositioner } from '../utils/usePositioner.svelte.js';
  import { mergeComponentProps } from '../internals/mergeComponentProps.js';
  import { createAttachmentKey } from 'svelte/attachments';
  import type { NavigationMenuPositionerProps } from './types.js';
  const EMPTY_ROOT_CONTEXT = getEmptyRootContext();
  let {
    ref = $bindable(null),
    render,
    class: classProp,
    style,
    children,
    anchor,
    positionMethod = 'absolute',
    side = 'bottom',
    align = 'center',
    sideOffset = 0,
    alignOffset = 0,
    collisionBoundary = 'clipping-ancestors',
    collisionPadding = 5,
    collisionAvoidance,
    arrowPadding = 5,
    sticky = false,
    disableAnchorTracking = false,
    ...elementProps
  }: NavigationMenuPositionerProps = $props();
  const nativeId = $props.id();
  const root = useNavigationMenuRootContext();
  const getKeepMounted = useNavigationMenuPortalContext();
  const nodeId = useNavigationMenuTreeContext();
  const initialInstantTimeout = new Timeout();
  const resizeTimeout = new Timeout();
  let instant = $state(untrack(() => root.open));
  let needsInitialInstantReset = untrack(() => root.open);
  $effect(() => {
    const positionerElement = root.positionerElement;
    if (!positionerElement) return;
    function onFocus(event: FocusEvent) {
      if (positionerElement && isOutsideEvent(event)) {
        const manageFocus = event.type === 'focusin' ? enableFocusInside : disableFocusInside;
        manageFocus(positionerElement);
      }
    }
    return mergeCleanups(
      addEventListener(positionerElement, 'focusin', onFocus, true),
      addEventListener(positionerElement, 'focusout', onFocus, true),
    );
  });
  const domReference = $derived(
    (root.floatingRootContext || EMPTY_ROOT_CONTEXT).useState('domReferenceElement'),
  );
  const positioning = useNavigationMenuAnchorPositioning(
    () => ({
      open: root.open,
      anchor: anchor ?? domReference,
      positionMethod,
      mounted: root.mounted,
      side,
      sideOffset,
      align,
      alignOffset,
      arrowPadding,
      collisionBoundary,
      collisionPadding,
      sticky,
      disableAnchorTracking,
      keepMounted: getKeepMounted(),
      floatingRootContext: root.floatingRootContext,
      collisionAvoidance:
        collisionAvoidance ??
        (root.nested ? POPUP_COLLISION_AVOIDANCE : DROPDOWN_COLLISION_AVOIDANCE),
      shift: { rootBoundary: 'layoutViewport' },
      nodeId,
      adaptiveOrigin,
    }),
    `${nativeId}-floating`,
  );
  provideNavigationMenuPositionerContext(positioning);
  const partState = $derived({
    open: root.open,
    side: positioning.side,
    align: positioning.align,
    anchorHidden: positioning.anchorHidden,
    instant,
  });
  $effect(() => {
    if (!root.open) return;
    if (needsInitialInstantReset)
      initialInstantTimeout.start(0, () => {
        needsInitialInstantReset = false;
        if (!resizeTimeout.isStarted()) instant = false;
      });
    function handleResize() {
      flushSync(() => {
        instant = true;
      });
      resizeTimeout.start(100, () => {
        instant = false;
      });
    }
    return addEventListener(ownerWindow(root.positionerElement), 'resize', handleResize);
  });
  const hostAttachmentKey = createAttachmentKey();
  function attachHost(host: HTMLElement) {
    return untrack(() => {
      ref = host;
      root.setPositionerElement(host);
      positioning.setFloating(host);

      return () =>
        untrack(() => {
          if (ref === host) ref = null;
          if (root.positionerElement === host) root.setPositionerElement(null);
          if (positioning.elements.floating === host) positioning.setFloating(null);
        });
    });
  }
  const element = usePositioner(
    () => partState,
    () => ({
      styles: positioning.positionerStyles,
      transitionStatus: root.transitionStatus,
      props: elementProps,
      hidden: !root.mounted,
      inert: !root.open,
    }),
  );
  const mergedProps = $derived({
    ...mergeComponentProps(
      element.state,
      { class: classProp, style },
      element.props,
      element.stateAttributesMapping,
    ),
    [hostAttachmentKey]: attachHost,
  });

  onDestroy(() => {
    resizeTimeout.clear();
    initialInstantTimeout.clear();
  });
</script>

{#if render}{@render render(mergedProps, partState, children)}{:else}<div {...mergedProps}
    >{@render children?.()}</div
  >{/if}
