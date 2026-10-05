<script lang="ts">
  // Original Base UI v1.8.0 at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT: THIRD_PARTY_NOTICES.md.
  import RenderElement from '../internals/RenderElement.svelte';
  import { useAnchorPositioning } from '../internals/anchor-positioning/useAnchorPositioning.svelte.js';
  import { usePositioner } from '../utils/usePositioner.svelte.js';
  import { POPUP_COLLISION_AVOIDANCE } from '../internals/constants.js';
  import { usePreviewCardRootContext, usePreviewCardPortalContext } from './context.js';
  import { providePreviewCardPositionerContext } from './positioner/PreviewCardPositionerContext.js';
  import type { PreviewCardPositionerProps, PreviewCardPositionerState } from './types.js';
  import { useFloatingNodeId, provideFloatingNode } from '../floating-ui/components/FloatingTree.svelte.js';
  import { createInlineMiddleware } from '../utils/popups/inlineRect.js';
  import { useIsoLayoutEffect } from '../utils/useIsoLayoutEffect.svelte.js';
  // eslint-disable-next-line no-useless-assignment -- Native bindable ref output is published through the ordered Source ref callback.
  let { render, class: className, style, children, ref = $bindable(), anchor, positionMethod = 'absolute', side = 'bottom', align = 'center', sideOffset = 0, alignOffset = 0, collisionBoundary = 'clipping-ancestors', collisionPadding = 5, arrowPadding = 5, sticky = false, disableAnchorTracking = false, collisionAvoidance = POPUP_COLLISION_AVOIDANCE, ...elementProps }: PreviewCardPositionerProps = $props();
  const store = usePreviewCardRootContext();
  const portal = usePreviewCardPortalContext();
  const open = $derived(store.select('open'));
  const mounted = $derived(store.select('mounted'));
  const floatingRootContext = $derived(store.select('floatingRootContext'));
  const instantType = $derived(store.select('instantType'));
  const transitionStatus = $derived(store.select('transitionStatus'));
  const adaptiveOrigin = $derived(store.select('adaptiveOrigin'));
  const nativeNodeId = $props.id();
  const nodeId = useFloatingNodeId(nativeNodeId);
  const inline = createInlineMiddleware(store.context.inlineRectCoordsRef);
  const positioning = useAnchorPositioning(() => ({
    anchor, floatingRootContext, open, mounted, positionMethod, side, align, sideOffset, alignOffset,
    collisionBoundary, collisionPadding, arrowPadding, sticky, disableAnchorTracking,
    keepMounted: portal.keepMounted, collisionAvoidance, adaptiveOrigin, nodeId, inline,
  }));
  useIsoLayoutEffect(() => { if (open && mounted) positioning.update(); }, () => [open, mounted, positioning.update]);
  const state: PreviewCardPositionerState = $derived({ open, side: positioning.side, align: positioning.align, anchorHidden: positioning.anchorHidden, instant: instantType });
  const forwardedRef = (node: HTMLElement | null) => { ref = node; };
  const setPositionerElement = store.useStateSetter('positionerElement');
  const element = usePositioner(() => state, () => ({ styles: positioning.positionerStyles, transitionStatus, props: elementProps, refs: [forwardedRef, setPositionerElement], hidden: !mounted, inert: !open }));
  providePreviewCardPositionerContext(positioning);
  provideFloatingNode(() => nodeId);
</script>
<RenderElement tag="div" componentProps={{ render, class: className, style }} params={element.params} {children} />
