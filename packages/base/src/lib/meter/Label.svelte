<script lang="ts">
  // Adapted from pinned MeterLabel; MIT: THIRD_PARTY_NOTICES.md.
  import Element from '../dialog/Element.svelte';
  import { resolveClassValue } from '../internals/resolveClassValue.js';
  import { getMeterContext } from './context.js';
  import type { MeterLabelProps } from './types.js';
  let { children, id: idProp, render, class: classProp, ref = $bindable(), ...props }: MeterLabelProps = $props();
  const context = getMeterContext();
  const state = {};
  const instanceId = $props.id();
  const generatedId = `base-ui-${instanceId}`;
  const id = $derived(idProp ?? generatedId);
  $effect(() => {
    const registered = id;
    context.setLabelId(registered);
    return () => context.setLabelId(current => current === registered ? undefined : current);
  });
  const internal = $derived({ id, role: 'presentation' });
  const resolved = $derived({ ...props, class: resolveClassValue(typeof classProp === 'function' ? classProp(state) : classProp) });
</script>
<Element tag="span" {internal} props={resolved} {state} {render} {children} bind:ref />
