<script lang="ts">
  // Ported from Base UI v1.8.0 FieldsetRoot.tsx; MIT: THIRD_PARTY_NOTICES.md.
  import RenderElement from '../internals/RenderElement.svelte';
  import { setFieldsetRootContext, useFieldsetRootContext } from './root/FieldsetRootContext.js';
  import type { FieldsetRootProps } from './types.js';
  let { children, render, class: classProp, style, disabled: disabledProp = false, ref = $bindable(), ...elementProps }: FieldsetRootProps = $props();
  let legendId = $state<string>();
  const parent = useFieldsetRootContext(true);
  const disabled = $derived(Boolean(parent?.disabled || disabledProp));
  const fieldsetState = $derived({ disabled });
  const forwardedRef = { get current() { return ref ?? null; }, set current(value: HTMLElement | null) { ref = value; } };
  const componentProps = $derived({ render, class: classProp, style });
  const params = $derived({ ref: forwardedRef, state: fieldsetState, props: [{ 'aria-labelledby': legendId, disabled }, elementProps] });
  setFieldsetRootContext({
    get legendId() { return legendId; },
    setLegendId(value) { legendId = typeof value === 'function' ? value(legendId) : value; },
    get disabled() { return disabled; },
  });
</script>
<RenderElement tag="fieldset" {componentProps} {params} {children} />
