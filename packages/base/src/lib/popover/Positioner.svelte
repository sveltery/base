<script lang="ts">
  // Original Base UI v1.8.0 at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT: THIRD_PARTY_NOTICES.md.
  import RenderElement from '../internals/RenderElement.svelte';
  import { useAnchorPositioning } from '../internals/anchor-positioning/useAnchorPositioning.svelte.js';
  import { usePositioner } from '../utils/usePositioner.svelte.js';
  import { POPUP_COLLISION_AVOIDANCE } from '../internals/constants.js';
  import { usePopoverRootContext, usePopoverPortalContext } from './context.js';
  import { providePopoverPositionerContext } from './positioner/PopoverPositionerContext.js';
  import type { PopoverPositionerProps, PopoverPositionerState } from './types.js';
  import { useFloatingNodeId, provideFloatingNode } from '../floating-ui/components/FloatingTree.svelte.js';
  import InternalBackdrop from '../utils/InternalBackdrop.svelte';
  import { useAnimationsFinished } from '../internals/useAnimationsFinished.js';
  import { useAnchoredPopupScrollLock } from '../utils/useAnchoredPopupScrollLock.svelte.js';
  import { useIsoLayoutEffect } from '@sveltery/utils/useIsoLayoutEffect';
  import { REASONS } from '../internals/reasons.js';
  // eslint-disable-next-line no-useless-assignment -- Native bindable ref output is published through the ordered Source ref callback.
  let { render, class: className, style, children, ref = $bindable(), anchor, positionMethod, side, align, sideOffset, alignOffset, collisionBoundary = 'clipping-ancestors', collisionPadding, arrowPadding, sticky, disableAnchorTracking = false, collisionAvoidance = POPUP_COLLISION_AVOIDANCE, ...elementProps }: PopoverPositionerProps = $props();
  const store = usePopoverRootContext();
  const portal = usePopoverPortalContext();
  const open = $derived(store.select('open'));
  const mounted = $derived(store.select('mounted'));
  const floatingRootContext = $derived(store.select('floatingRootContext'));
  const instantType = $derived(store.select('instantType'));
  const transitionStatus = $derived(store.select('transitionStatus'));
  const adaptiveOrigin = $derived(store.select('adaptiveOrigin'));
  const nativeNodeId = $props.id();
  const nodeId = useFloatingNodeId(nativeNodeId);
  const openReason = $derived(store.select('openChangeReason'));
  const triggerElement = $derived(store.select('activeTriggerElement'));
  const modal = $derived(store.select('modal'));
  const openMethod = $derived(store.select('openMethod'));
  const positionerElement = $derived(store.select('positionerElement'));
  const prevTriggerElementRef = { current: null as Element | null };
  const runOnceAnimationsFinish = useAnimationsFinished({ get current() { return positionerElement; } });
  const positioning = useAnchorPositioning(() => ({
    anchor, floatingRootContext, open, mounted, positionMethod, side, align, sideOffset, alignOffset,
    collisionBoundary, collisionPadding, arrowPadding, sticky, disableAnchorTracking,
    keepMounted: portal.keepMounted, collisionAvoidance, adaptiveOrigin, nodeId,
  }));
  const domReference = $derived(floatingRootContext.useState('domReferenceElement'));
  useIsoLayoutEffect(() => {
    const currentTriggerElement = domReference;
    const prevTriggerElement = prevTriggerElementRef.current;
    if (currentTriggerElement) prevTriggerElementRef.current = currentTriggerElement;
    if (prevTriggerElement && currentTriggerElement && currentTriggerElement !== prevTriggerElement) {
      store.set('instantType', undefined);
      const ac = new AbortController();
      runOnceAnimationsFinish(() => store.set('instantType', 'trigger-change'), ac.signal);
      return () => ac.abort();
    }
    return undefined;
  }, () => [domReference, runOnceAnimationsFinish, store]);
  const trueModalNonHover = $derived(modal === true && openReason !== REASONS.triggerHover);
  useAnchoredPopupScrollLock(() => open && trueModalNonHover, () => openMethod === 'touch', () => positionerElement, () => triggerElement);
  const state: PopoverPositionerState = $derived({ open, side: positioning.side, align: positioning.align, anchorHidden: positioning.anchorHidden, instant: instantType });
  const forwardedRef = (node: HTMLElement | null) => { ref = node; };
  const setPositionerElement = store.useStateSetter('positionerElement');
  const element = usePositioner(() => state, () => ({ styles: positioning.positionerStyles, transitionStatus, props: elementProps, refs: [forwardedRef, setPositionerElement], hidden: !mounted, inert: !open }));
  providePopoverPositionerContext(positioning);
  provideFloatingNode(() => nodeId);
</script>
{#if mounted && trueModalNonHover}
  <InternalBackdrop inert={!open} cutout={triggerElement} />
{/if}
<RenderElement tag="div" componentProps={{ render, class: className, style }} params={element.params} {children} />
