<script lang="ts">
  import type { ClassValue } from 'svelte/elements';
  import Separator from '../../src/lib/separator/Separator.svelte';
  let { value }: { value?: ClassValue } = $props();
  export function setValue(next: ClassValue) {
    value = next;
  }
</script>

<div data-native class={value}></div>
<Separator class={value} data-shared />
