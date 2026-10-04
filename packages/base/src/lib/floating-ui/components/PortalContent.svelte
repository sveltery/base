<script lang="ts">
  // Native snippet mounting boundary for FloatingPortal's child createPortal (MIT).
  import type { Snippet } from 'svelte';
  let { children }: { children?: Snippet } = $props();
</script>
{@render children?.()}
