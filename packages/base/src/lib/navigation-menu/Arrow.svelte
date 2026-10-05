<script lang="ts">
  // Original NavigationMenuArrow refs/styles/state and canonical renderer (MIT).
  import RenderElement from '../internals/RenderElement.svelte';
  import { useNavigationMenuPositionerContext } from './positioner/NavigationMenuPositionerContext.js';
  import { useNavigationMenuRootContext } from './root/NavigationMenuRootContext.js';
  import { popupStateMapping } from '../utils/popupStateMapping.js';
  import { getDisabledMountTransitionStyles } from '../internals/getDisabledMountTransitionStyles.js';
  import type { NavigationMenuArrowProps } from './types.js';
  let {
    // eslint-disable-next-line no-useless-assignment -- Native bind:ref publishes the host.
    ref = $bindable(null),
    render,
    class: classProp,
    style,
    children,
    ...elementProps
  }: NavigationMenuArrowProps = $props();
  const root = useNavigationMenuRootContext();
  const positioning = useNavigationMenuPositionerContext();
  const state = $derived({
    open: root.open,
    side: positioning.side,
    align: positioning.align,
    uncentered: positioning.arrowUncentered,
  });
  const componentProps = $derived({ render, class: classProp, style });
  const refs = [
    (node: HTMLElement | null) => {
      ref = node;
    },
    positioning.arrowRef,
  ];
  const params = $derived({
    state,
    ref: refs,
    props: [
      { style: positioning.arrowStyles, 'aria-hidden': true },
      getDisabledMountTransitionStyles(root.transitionStatus),
      elementProps,
    ],
    stateAttributesMapping: popupStateMapping,
  });
</script>
<RenderElement tag="div" {componentProps} {params} {children} />
