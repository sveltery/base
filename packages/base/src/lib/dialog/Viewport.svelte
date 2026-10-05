<script lang="ts">
  // Original DialogViewport rendering/ref/state/keep-mounted business body (MIT).
  import RenderElement from '../internals/RenderElement.svelte';
  import { useDialogPortalContext, useDialogRootContext } from './context.js';
  import { dialogStateAttributesMapping } from './utils/stateAttributesMapping.js';
  import type { DialogViewportProps } from './types.js';
  let {
    children,
    render,
    class: className,
    style,
    ref = $bindable(),
    ...elementProps
  }: DialogViewportProps = $props();
  const portal = useDialogPortalContext();
  const store = useDialogRootContext();
  const state = $derived({
    open: store.select('open'),
    nested: store.select('nested'),
    transitionStatus: store.select('transitionStatus'),
    nestedDialogOpen: store.select('nestedOpenDialogCount') > 0,
  });
  const setViewportElement = store.useStateSetter('viewportElement');
</script>

<RenderElement
  tag="div"
  componentProps={{ render, class: className, style }}
  params={{
    enabled: portal.keepMounted || store.select('mounted'),
    state,
    ref: setViewportElement,
    stateAttributesMapping: dialogStateAttributesMapping,
    props: [
      {
        role: 'presentation',
        hidden: !store.select('mounted'),
        style: { pointerEvents: !state.open ? 'none' : undefined },
      },
      elementProps,
    ],
  }}
  {children}
  bind:element={ref}
/>
