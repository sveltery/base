<script lang="ts">
	import { NavigationMenu, type NavigationMenuOrientation } from '#lib';

	let {
		orientation,
		showFirst = true,
		onOuterKeyDown
	}: {
		orientation?: NavigationMenuOrientation;
		showFirst?: boolean;
		onOuterKeyDown?: (event: KeyboardEvent) => void;
	} = $props();
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div onkeydown={onOuterKeyDown}>
	<NavigationMenu.Root {orientation}>
		<NavigationMenu.List data-testid="list">
			{#if showFirst}
				<NavigationMenu.Item>
					<NavigationMenu.Trigger data-testid="first">One</NavigationMenu.Trigger>
				</NavigationMenu.Item>
			{/if}
			<NavigationMenu.Item>
				<NavigationMenu.Trigger data-testid="middle">Two</NavigationMenu.Trigger>
			</NavigationMenu.Item>
			<NavigationMenu.Item>
				<NavigationMenu.Trigger data-testid="last">Three</NavigationMenu.Trigger>
			</NavigationMenu.Item>
		</NavigationMenu.List>
	</NavigationMenu.Root>
</div>
