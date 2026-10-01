<script lang="ts">
  // Derived from Base UI v1.8.0 Toast parts; MIT, see ../../../THIRD_PARTY_NOTICES.md.
  import type { ToastContent } from './types.js';
  let { content }: { content?: ToastContent } = $props();
</script>
{#if typeof content === 'function'}
  {@render content()}
{:else if typeof content === 'string' || typeof content === 'number'}
  {content}
{/if}
