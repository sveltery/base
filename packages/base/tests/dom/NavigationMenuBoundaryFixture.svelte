<script lang="ts">
  import { NavigationMenu } from '../../src/lib/navigation-menu/index.js';
  let { part }: { part: string } = $props();
</script>

{#if part === 'Arrow'}
  <NavigationMenu.Root><NavigationMenu.Arrow /></NavigationMenu.Root>
{:else if part === 'Icon'}
  <NavigationMenu.Root><NavigationMenu.Icon /></NavigationMenu.Root>
{:else if part === 'List'}
  <NavigationMenu.List />
{:else if part === 'Positioner'}
  <NavigationMenu.Root value="test"><NavigationMenu.Positioner /></NavigationMenu.Root>
{:else if part === 'layout-viewport'}
  <NavigationMenu.Root value="test"
    ><NavigationMenu.Portal><NavigationMenu.Positioner /></NavigationMenu.Portal
    ></NavigationMenu.Root
  >
{/if}
