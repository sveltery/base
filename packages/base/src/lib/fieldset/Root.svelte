<script lang="ts">
  // Base UI v1.8.0 FieldsetRoot; MIT: THIRD_PARTY_NOTICES.md.
  import Element from '../dialog/Element.svelte';
  import { resolveFieldProps } from '../field/props.js';
  import { getFieldsetContext, setFieldsetContext } from './context.js';
  import type { FieldsetRootProps } from './types.js';
  let { children, render, disabled: disabledProp = false, ref = $bindable(), ...props }: FieldsetRootProps = $props();
  const parent = getFieldsetContext(true);
  let legendId = $state<string>();
  const disabled = $derived(Boolean(parent?.disabled || disabledProp));
  const fieldsetState = $derived({ disabled });
  setFieldsetContext({
    get disabled() { return disabled; },
    get legendId() { return legendId; },
    setLegendId(id) { legendId = id; },
    removeLegendId(id) { if (legendId === id) legendId = undefined; },
  });
  const internal = $derived({ disabled, 'aria-labelledby': legendId, 'data-disabled': disabled ? '' : undefined });
</script>
<Element tag="fieldset" {internal} props={resolveFieldProps(props, fieldsetState)} state={fieldsetState} {render} {children} bind:ref />
