<script lang="ts">
  // Original Base UI v1.8.0 at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT: THIRD_PARTY_NOTICES.md.
  import RenderElement from '../internals/RenderElement.svelte';
  import { usePreviewCardRootContext } from './context.js';
  import { usePreviewCardPositionerContext } from './positioner/PreviewCardPositionerContext.js';
  import { popupStateMapping } from '../utils/popupStateMapping.js';
  import type { PreviewCardArrowProps } from './types.js';
  let {
    render,
    class: className,
    style,
    children,
    // eslint-disable-next-line no-useless-assignment -- Native bindable ref output is published through the ordered Source ref callback.
    ref = $bindable(),
    ...elementProps
  }: PreviewCardArrowProps = $props();
  const store = usePreviewCardRootContext();
  const positioner = usePreviewCardPositionerContext();
  const state = $derived({
    open: store.select('open'),
    side: positioner.side,
    align: positioner.align,
    uncentered: positioner.arrowUncentered,
  });
  const forwardedRef = (node: HTMLElement | null) => {
    ref = node;
  };
</script>

<RenderElement
  tag="div"
  componentProps={{ render, class: className, style }}
  params={{
    state,
    ref: [positioner.arrowRef, forwardedRef],
    props: [{ style: positioner.arrowStyles, 'aria-hidden': true }, elementProps],
    stateAttributesMapping: popupStateMapping,
  }}
  {children}
/>
