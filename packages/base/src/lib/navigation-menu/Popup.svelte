<script lang="ts">
  // Original NavigationMenuPopup state, physical-origin pinning and canonical renderer (MIT).
  import RenderElement from '../internals/RenderElement.svelte';
  import { useNavigationMenuRootContext } from './root/NavigationMenuRootContext.js';
  import { useNavigationMenuPositionerContext } from './positioner/NavigationMenuPositionerContext.js';
  import { useDirection } from '../direction-provider/context.js';
  import { useBaseUiId } from '../internals/useBaseUiId.js';
  import { popupTransitionStateMapping } from '../utils/popupStateMapping.js';
  import { getDisabledMountTransitionStyles } from '../internals/getDisabledMountTransitionStyles.js';
  import type { NavigationMenuPopupProps } from './types.js';
  let {
    // eslint-disable-next-line no-useless-assignment -- Native bind:ref publishes the host.
    ref = $bindable(null),
    render,
    class: classProp,
    style,
    children,
    id: idProp,
    ...elementProps
  }: NavigationMenuPopupProps = $props();
  const nativeId = $props.id();
  const id = $derived(useBaseUiId(idProp ?? undefined, nativeId));
  const root = useNavigationMenuRootContext();
  const positioning = useNavigationMenuPositionerContext();
  const direction = useDirection();
  const state = $derived({
    open: root.open,
    transitionStatus: root.transitionStatus,
    side: positioning.side,
    align: positioning.align,
    anchorHidden: positioning.anchorHidden,
  });
  const isPhysicalLeft = $derived(
    positioning.side === 'left' ||
      positioning.side === (direction() === 'rtl' ? 'inline-end' : 'inline-start'),
  );
  const isOriginSide = $derived(positioning.side === 'top' || isPhysicalLeft);
  const componentProps = $derived({ render, class: classProp, style });
  const refs = [
    (node: HTMLElement | null) => {
      ref = node;
      root.setPopupElement(node);
    },
  ];
  const params = $derived({
    state,
    ref: refs,
    props: [
      {
        id,
        tabindex: -1,
        style: {
          ...root.popupSizeStyles,
          ...(isOriginSide
            ? {
                position: 'absolute',
                [positioning.side === 'top' ? 'bottom' : 'top']: '0',
                [isPhysicalLeft ? 'right' : 'left']: '0',
              }
            : {}),
        },
      },
      getDisabledMountTransitionStyles(root.transitionStatus),
      elementProps,
    ],
    stateAttributesMapping: popupTransitionStateMapping,
  });
</script>
<RenderElement tag="nav" {componentProps} {params} {children} />
