<script lang="ts">
  // Original Base UI v1.8.0 at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT: THIRD_PARTY_NOTICES.md.
  import RenderElement from '../internals/RenderElement.svelte';
  import { usePreviewCardRootContext } from './context.js';
  import { popupTransitionStateMapping } from '../utils/popupStateMapping.js';
  import type { PreviewCardBackdropProps } from './types.js';
  // eslint-disable-next-line no-useless-assignment -- Native bindable ref output is published through the ordered Source ref callback.
  let {
    render,
    class: className,
    style,
    children,
    ref = $bindable(),
    ...elementProps
  }: PreviewCardBackdropProps = $props();
  const store = usePreviewCardRootContext();
  const state = $derived({
    open: store.select('open'),
    transitionStatus: store.select('transitionStatus'),
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
    ref: forwardedRef,
    props: [
      {
        role: 'presentation',
        hidden: !store.select('mounted'),
        style: { pointerEvents: 'none', userSelect: 'none', WebkitUserSelect: 'none' },
      },
      elementProps,
    ],
    stateAttributesMapping: popupTransitionStateMapping,
  }}
  {children}
/>
