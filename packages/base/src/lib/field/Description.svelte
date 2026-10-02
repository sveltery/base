<script lang="ts">
  // Base UI v1.8.0 FieldDescription; MIT: THIRD_PARTY_NOTICES.md.
  import Element from '../dialog/Element.svelte';
  import { resolveFieldProps } from './props.js';
  import { untrack } from 'svelte';
  import { getFieldContext, getFieldItemContext } from './context.js';
  import { getLabelableContext } from './labelable.svelte.js';
  import { stateAttributes } from './state.js';
  import type { FieldDescriptionProps } from './types.js';
  let { children, render, id: idProp, ref = $bindable(), ...props }: FieldDescriptionProps = $props();
  const field = getFieldContext(false)!;
  const item = getFieldItemContext();
  const labelable = getLabelableContext()!;
  const instanceId = $props.id();
  const id = $derived(idProp ?? `base-ui-${instanceId}`);
  const descriptionState = $derived({ ...field.state, disabled: field.state.disabled || Boolean(item?.disabled) });
  $effect(() => { const current = id; if (current) return untrack(() => labelable.addMessage(current)); });
  const internal = $derived({ ...stateAttributes(descriptionState), id });
</script>
<Element tag="p" {internal} props={resolveFieldProps(props, descriptionState)} state={descriptionState} {render} {children} bind:ref />
