<script lang="ts">
  import { onMount } from 'svelte';
  import { usePortalContext } from '../../src/lib/floating-ui/components/FloatingPortalContext.js';
  let { report, name }: { report: (name: string, provided: boolean) => void; name: string } = $props();
  const provided = usePortalContext() !== null;
  onMount(() => report(name, provided));
</script>
