<script lang="ts">
  // Base UI v1.8.0 FieldItem; MIT: THIRD_PARTY_NOTICES.md.
  import Element from '../dialog/Element.svelte';
  import { resolveFieldProps } from './props.js';
  import { getFieldContext, setFieldItemContext } from './context.js';
  import { createLabelableContext } from './labelable.svelte.js';
  import { stateAttributes } from './state.js';
  import type { FieldItemProps } from './types.js';
  let { children, render, disabled: disabledProp = false, ref = $bindable(), ...props }: FieldItemProps = $props();
  const field = getFieldContext(false)!;
  const instanceId = $props.id();
  createLabelableContext(`base-ui-${instanceId}`);
  const disabled = $derived(field.state.disabled || disabledProp);
  setFieldItemContext({ get disabled() { return disabled; } });
  const itemState = $derived({ ...field.state, disabled });
</script>
<Element tag="div" internal={stateAttributes(itemState)} props={resolveFieldProps(props, itemState)} state={itemState} {render} {children} bind:ref />
