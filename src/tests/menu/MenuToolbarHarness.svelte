<script lang="ts">
	import { Menu } from '#lib';

	let { onParentKeyDown }: { onParentKeyDown: (event: KeyboardEvent) => void } = $props();
	let container = $state<HTMLDivElement | null>(null);
</script>

<!-- svelte-ignore a11y_interactive_supports_focus -->
<div role="toolbar" onkeydown={onParentKeyDown} bind:this={container}>
	{#if container}
		<Menu.Root>
			<Menu.Portal keepMounted {container}>
				<Menu.Positioner>
					<Menu.Popup data-testid="popup" />
				</Menu.Positioner>
			</Menu.Portal>
		</Menu.Root>
	{/if}
</div>
