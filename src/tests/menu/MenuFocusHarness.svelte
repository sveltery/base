<!--
	A menu whose popup returns focus to a chosen element on close (`finalFocus`).
	Derived from Base UI v1.9.0 packages/react/src/menu/popup/MenuPopup.test.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
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
