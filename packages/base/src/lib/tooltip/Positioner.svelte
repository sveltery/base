<script lang="ts">
  // Original Base UI v1.8.0 at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT: THIRD_PARTY_NOTICES.md.
  import RenderElement from '../internals/RenderElement.svelte';
  import { useAnchorPositioning } from '../internals/anchor-positioning/useAnchorPositioning.svelte.js';
  import { usePositioner } from '../utils/usePositioner.svelte.js';
  import { POPUP_COLLISION_AVOIDANCE } from '../internals/constants.js';
  import { useTooltipRootContext, useTooltipPortalContext } from './context.js';
  import { provideTooltipPositionerContext } from './positioner/TooltipPositionerContext.js';
  import type { TooltipPositionerProps, TooltipPositionerState } from './types.js';
  let {
    render,
    class: className,
    style,
    children,
    // eslint-disable-next-line no-useless-assignment -- Native bindable ref output is published through the ordered Source ref callback.
    ref = $bindable(),
    anchor,
    positionMethod = 'absolute',
    side = 'top',
    align = 'center',
    sideOffset = 0,
    alignOffset = 0,
    collisionBoundary = 'clipping-ancestors',
    collisionPadding = 5,
    arrowPadding = 5,
    sticky = false,
    disableAnchorTracking = false,
    collisionAvoidance = POPUP_COLLISION_AVOIDANCE,
    ...elementProps
  }: TooltipPositionerProps = $props();
  const store = useTooltipRootContext();
  const portal = useTooltipPortalContext();
  const open = $derived(store.select('open'));
  const mounted = $derived(store.select('mounted'));
  const floatingRootContext = $derived(store.select('floatingRootContext'));
  const instantType = $derived(store.select('instantType'));
  const transitionStatus = $derived(store.select('transitionStatus'));
  const adaptiveOrigin = $derived(store.select('adaptiveOrigin'));
  const trackCursorAxis = $derived(store.select('trackCursorAxis'));
  const disableHoverablePopup = $derived(store.select('disableHoverablePopup'));
  const positioning = useAnchorPositioning(() => ({
    anchor,
    floatingRootContext,
    open,
    mounted,
    positionMethod,
    side,
    align,
    sideOffset,
    alignOffset,
    collisionBoundary,
    collisionPadding,
    arrowPadding,
    sticky,
    disableAnchorTracking,
    keepMounted: portal.keepMounted,
    collisionAvoidance,
    adaptiveOrigin,
  }));
  const state: TooltipPositionerState = $derived({
    open,
    side: positioning.side,
    align: positioning.align,
    anchorHidden: positioning.anchorHidden,
    instant: trackCursorAxis !== 'none' ? 'tracking-cursor' : instantType,
  });
  const forwardedRef = (node: HTMLElement | null) => {
    ref = node;
  };
  const setPositionerElement = store.useStateSetter('positionerElement');
  const element = usePositioner(
    () => state,
    () => ({
      styles: positioning.positionerStyles,
      transitionStatus,
      props: elementProps,
      refs: [forwardedRef, setPositionerElement],
      hidden: !mounted,
      inert: !open || trackCursorAxis === 'both' || disableHoverablePopup,
    }),
  );
  provideTooltipPositionerContext(positioning);
</script>

<RenderElement
  tag="div"
  componentProps={{ render, class: className, style }}
  params={element.params}
  {children}
/>
