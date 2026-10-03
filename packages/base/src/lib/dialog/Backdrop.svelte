<script lang="ts">
  // Original DialogBackdrop rendering/ref/state branches (MIT).
  import RenderElement from '../internals/RenderElement.svelte';
  import { popupTransitionStateMapping } from '../utils/popupStateMapping.js';
  import { useDialogRootContext } from './context.js';
  import type { DialogBackdropProps } from './types.js';
  let { children, render, class: className, style, forceRender = false, ref = $bindable(), ...elementProps }: DialogBackdropProps = $props();
  const store = useDialogRootContext();
  const state = $derived({ open: store.select('open'), transitionStatus: store.select('transitionStatus') });
</script>
<RenderElement
  tag="div"
  componentProps={{ render, class: className, style }}
  params={{
    state,
    ref: store.context.backdropRef,
    stateAttributesMapping: popupTransitionStateMapping,
    props: [
      { role: 'presentation', hidden: !store.select('mounted'), style: { userSelect: 'none', WebkitUserSelect: 'none' } },
      elementProps,
    ],
    enabled: forceRender || !store.select('nested'),
  }}
  {children}
  bind:element={ref}
/>
