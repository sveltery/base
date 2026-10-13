<!--
	A menu portaled into a toolbar that handles keydown itself.
	Derived from Base UI v1.9.0 packages/react/src/menu/popup/MenuPopup.test.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
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
