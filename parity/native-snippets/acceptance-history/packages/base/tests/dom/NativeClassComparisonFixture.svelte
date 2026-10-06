<script lang="ts">
  import type { ClassValue } from 'svelte/elements';
  import RenderElement from '../../src/lib/internals/RenderElement.svelte';
  let { value }: { value?: ClassValue } = $props();
  export function setValue(next: ClassValue) { value = next; }
</script>

<div data-native class={value}></div>
<RenderElement componentProps={{ class: value }} params={{ props: { 'data-shared': '' } }} />
