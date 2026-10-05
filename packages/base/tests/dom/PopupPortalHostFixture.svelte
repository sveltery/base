<script lang="ts">
  import Full from '../../src/lib/floating-ui/components/FloatingPortal.svelte';
  import Lite from '../../src/lib/utils/FloatingPortalLite.svelte';
  import type { PortalContainer } from '../../src/lib/floating-ui/hooks/useFloatingPortalNode.svelte.js';
  let { container, lite = false }: { container?: PortalContainer; lite?: boolean } = $props();
  export function setContainer(value: PortalContainer | undefined) { container = value; }
</script>
{#if lite}<Lite {container} data-testid="realm-portal"><span data-testid="realm-child">Child</span></Lite>
{:else}<Full {container} data-testid="realm-portal"><span data-testid="realm-child">Child</span></Full>{/if}
