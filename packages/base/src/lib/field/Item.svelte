<script lang="ts">
  // Ported from Base UI v1.8.0 FieldItem.tsx; MIT: THIRD_PARTY_NOTICES.md.
  import RenderElement from '../internals/RenderElement.svelte';
  import LabelableProvider from '../internals/labelable-provider/LabelableProvider.svelte';
  import { useFieldRootContext } from '../internals/field-root-context/FieldRootContext.js';
  import { fieldValidityMapping } from '../internals/field-constants/constants.js';
  import { setFieldItemContext } from './item/FieldItemContext.js';
  import type { FieldItemProps } from './types.js';
  let { children, render, class: classProp, style, disabled: disabledProp = false, ref = $bindable(), ...elementProps }: FieldItemProps = $props();
  const field = useFieldRootContext(false);
  const disabled = $derived(field.disabled || disabledProp);
  const itemState = $derived({ ...field.state, disabled });
  setFieldItemContext({ get disabled() { return disabled; } });
  const forwardedRef = { get current() { return ref ?? null; }, set current(value: HTMLElement | null) { ref = value; } };
  const componentProps = $derived({ render, class: classProp, style });
  const params = $derived({ ref: forwardedRef, state: itemState, props: elementProps, stateAttributesMapping: fieldValidityMapping });
</script>
<LabelableProvider><RenderElement tag="div" {componentProps} {params} {children} /></LabelableProvider>
