<script lang="ts">
  // Base UI v1.8.0 FieldsetLegend; MIT: THIRD_PARTY_NOTICES.md.
  import Element from '../dialog/Element.svelte';
  import { resolveFieldProps } from '../field/props.js';
  import { getFieldsetContext } from './context.js';
  import type { FieldsetLegendProps } from './types.js';
  let { children, render, id: idProp, ref = $bindable(), ...props }: FieldsetLegendProps = $props();
  const context = getFieldsetContext()!;
  const instanceId = $props.id();
  const generatedId = `base-ui-${instanceId}`;
  const id = $derived(idProp ?? generatedId);
  const state = $derived({ disabled: context.disabled });
  $effect(() => {
    const currentId = id;
    context.setLegendId(currentId);
    return () => context.removeLegendId(currentId);
  });
  const internal = $derived({ id, 'data-disabled': state.disabled ? '' : undefined });
</script>
<Element tag="div" {internal} props={resolveFieldProps(props, state)} {state} {render} {children} bind:ref />
