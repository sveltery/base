<script lang="ts">
	import { NavigationMenu } from '#lib';

	let {
		case: scenario
	}: {
		case:
			| 'list-without-root'
			| 'icon-without-item'
			| 'arrow-without-positioner'
			| 'positioner-without-portal';
	} = $props();
</script>

{#if scenario === 'list-without-root'}
	<NavigationMenu.List />
{:else if scenario === 'icon-without-item'}
	<NavigationMenu.Root>
		<NavigationMenu.Icon />
	</NavigationMenu.Root>
{:else if scenario === 'arrow-without-positioner'}
	<NavigationMenu.Root>
		<NavigationMenu.Arrow />
	</NavigationMenu.Root>
{:else}
	<NavigationMenu.Root value="test">
		<NavigationMenu.Positioner />
	</NavigationMenu.Root>
{/if}
