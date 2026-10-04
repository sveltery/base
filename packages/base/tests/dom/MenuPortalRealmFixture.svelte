<script lang="ts">
  import Full from '../../src/lib/floating-ui/components/FloatingPortal.svelte';
  import { Menu } from '../../src/lib/menu/index.js';
  let { container, contextual = false }: { container: HTMLElement; contextual?: boolean } = $props();
</script>
{#if contextual}
  <Menu.Root defaultOpen>
    <Menu.Portal {container} data-testid="realm-portal"><span data-testid="realm-child">Child</span></Menu.Portal>
  </Menu.Root>
{:else}
  <Full {container} data-testid="realm-portal"><span data-testid="realm-child">Child</span></Full>
{/if}
