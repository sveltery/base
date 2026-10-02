<script lang="ts">
  import { onDestroy } from 'svelte';
  import Element from './Element.svelte';
  import { root } from './context.js';
  import type { ElementProps } from './types.js';
  let { children, render, id, ref = $bindable(), ...props }: ElementProps = $props();
  const controller = root();
  const generated = $props.id();
  const resolvedId = $derived(id ?? `base-ui-${generated}`);
  const key = {};
  controller.descriptions.set(key, () => resolvedId);
  onDestroy(() => controller.descriptions.delete(key));
</script>
<Element tag="p" internal={{ id: resolvedId }} {props} {render} {children} bind:ref/>
