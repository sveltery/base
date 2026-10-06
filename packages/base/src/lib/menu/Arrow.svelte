<script lang="ts">
  // Original MenuArrow positioned-context/state/render business (MIT).
  import RenderElement from '../internals/RenderElement.svelte';
  import { useMenuPositionerContext } from './positioner/MenuPositionerContext.js';
  import { useMenuRootContext } from './root/MenuRootContext.js';
  import { popupStateMapping } from '../utils/popupStateMapping.js';
  import type { MenuArrowProps } from './types.js';
  let {
    render,
    class: className,
    style,
    children,
    // eslint-disable-next-line no-useless-assignment -- Publishes native bindable host/action outputs to the owner.
    ref = $bindable(null),
    ...elementProps
  }: MenuArrowProps = $props();
  const { store } = useMenuRootContext();
  const positioner = useMenuPositionerContext();
  const componentState = $derived({
    open: store.useState('open'),
    side: positioner.side,
    align: positioner.align,
    uncentered: positioner.arrowUncentered,
  });
  const setRef = (node: HTMLElement | null) => {
    ref = node;
  };
</script>

<RenderElement
  tag="div"
  componentProps={{ render, class: className, style }}
  params={{
    state: componentState,
    stateAttributesMapping: popupStateMapping,
    ref: [positioner.arrowRef, setRef],
    props: { style: positioner.arrowStyles, 'aria-hidden': true, ...elementProps },
  }}
  {children}
/>
