<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';
  let { inputProps }: { inputProps: Record<string, unknown> } = $props();
</script>
<form><input {...inputProps as HTMLInputAttributes} /></form>
