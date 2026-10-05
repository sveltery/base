<script lang="ts">
  // Original DialogTitle id registration/cleanup and shared renderer (MIT).
  import RenderElement from '../internals/RenderElement.svelte';
  import { useBaseUiId } from '../internals/useBaseUiId.js';
  import { useDialogRootContext } from './context.js';
  import type { DialogTitleProps } from './types.js';
  let {
    children,
    render,
    class: className,
    style,
    id: idProp,
    ref = $bindable(),
    ...elementProps
  }: DialogTitleProps = $props();
  const generatedId = $props.id();
  const id = $derived(useBaseUiId(idProp ?? undefined, generatedId));
  const store = useDialogRootContext();
  store.useSyncedValueWithCleanup('titleElementId', () => id);
</script>

<RenderElement
  tag="h2"
  componentProps={{ render, class: className, style }}
  params={{ props: [{ id }, elementProps] }}
  {children}
  bind:element={ref}
/>
