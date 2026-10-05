<script lang="ts">
  // Original MenuGroupLabel ID/conditional-cleanup/render body (MIT).
  import RenderElement from '../internals/RenderElement.svelte';

  import { useBaseUiId } from '../internals/useBaseUiId.js';
  import { useMenuGroupRootContext } from './group/MenuGroupContext.js';
  import type { MenuGroupLabelProps } from './types.js';
  let { render, class: className, style, id: idProp, children, ref = $bindable(null), ...elementProps }: MenuGroupLabelProps = $props();
  const generatedId = $props.id();
  const id = $derived(useBaseUiId(idProp ?? undefined, generatedId));
  const setLabelId = useMenuGroupRootContext();
  $effect(() => { setLabelId(id); return () => { setLabelId(currentId => currentId === id ? undefined : currentId); }; });
</script>
<RenderElement tag="div" componentProps={{ render, class: className, style }} params={{ props: { id, 'aria-hidden': true, ...elementProps } }} bind:element={ref} {children} />
