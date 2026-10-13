<script lang="ts">
	import { Menu, type MenuPopupProps } from '#lib';

	let {
		finalFocus,
		pick
	}: {
		finalFocus?: MenuPopupProps['finalFocus'];
		pick?: (outside: HTMLInputElement | null) => MenuPopupProps['finalFocus'];
	} = $props();

	let outside = $state<HTMLInputElement | null>(null);
	const resolved = $derived(pick ? pick(outside) : finalFocus);
</script>

<input data-testid="outside-before" />
<Menu.Root>
	<Menu.Trigger>Open</Menu.Trigger>
	<Menu.Portal>
		<Menu.Positioner>
			<Menu.Popup finalFocus={resolved}>
				<Menu.Item>Close</Menu.Item>
			</Menu.Popup>
		</Menu.Positioner>
	</Menu.Portal>
</Menu.Root>
<input data-testid="outside-target" bind:this={outside} />
