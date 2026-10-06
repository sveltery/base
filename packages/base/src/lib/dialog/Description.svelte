<script lang="ts">
  // Original DialogDescription id registration/cleanup and shared renderer (MIT).
  import RenderElement from '../internals/RenderElement.svelte';
  import { useBaseUiId } from '../internals/useBaseUiId.js';
  import { useDialogRootContext } from './context.js';
  import type { DialogDescriptionProps } from './types.js';
  let {
    children,
    render,
    class: className,
    style,
    id: idProp,
    ref = $bindable(),
    ...elementProps
  }: DialogDescriptionProps = $props();
  const generatedId = $props.id();
  const id = $derived(useBaseUiId(idProp ?? undefined, generatedId));
  const store = useDialogRootContext();
  store.useSyncedValueWithCleanup('descriptionElementId', () => id);
</script>

<RenderElement
  tag="p"
  componentProps={{ render, class: className, style }}
  params={{ props: [{ id }, elementProps] }}
  {children}
  bind:element={ref}
/>
