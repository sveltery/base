<script lang="ts">
  // Adapted from pinned ProgressLabel; MIT: THIRD_PARTY_NOTICES.md.
  import Element from '../dialog/Element.svelte';
  import { resolveClassValue } from '../internals/resolveClassValue.js';
  import { getProgressContext } from './context.js';
  import { statusAttributes } from './helpers.js';
  import type { ProgressLabelProps } from './types.js';
  let {
    children,
    id: idProp,
    render,
    class: classProp,
    ref = $bindable(),
    ...props
  }: ProgressLabelProps = $props();
  const context = getProgressContext();
  const state = $derived(context.state);
  const instanceId = $props.id();
  const generatedId = `base-ui-${instanceId}`;
  const id = $derived(idProp ?? generatedId);
  $effect(() => {
    const registered = id;
    context.setLabelId(registered);
    return () => context.setLabelId((current) => (current === registered ? undefined : current));
  });
  const internal = $derived({ ...statusAttributes(state.status), id, role: 'presentation' });
  const resolved = $derived({
    ...props,
    class: resolveClassValue(typeof classProp === 'function' ? classProp(state) : classProp),
  });
</script>

<Element tag="span" {internal} props={resolved} {state} {render} {children} bind:ref />
