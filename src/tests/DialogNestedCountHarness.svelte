<script lang="ts">
	import { Dialog } from '#lib';

	let {
		parentOpen = true,
		openChildInPopup = true,
		closedChildInPopup = false,
		openChildOutsidePopup = false
	}: {
		parentOpen?: boolean;
		openChildInPopup?: boolean;
		closedChildInPopup?: boolean;
		openChildOutsidePopup?: boolean;
	} = $props();
</script>

<Dialog.Root open={parentOpen} modal={false}>
	<Dialog.Portal>
		<Dialog.Popup data-testid="parent">
			Parent
			{#if openChildInPopup}
				<Dialog.Root open modal={false}>
					<Dialog.Portal>
						<Dialog.Popup data-testid="open-child">Open child</Dialog.Popup>
					</Dialog.Portal>
				</Dialog.Root>
			{/if}
			{#if closedChildInPopup}
				<Dialog.Root modal={false}>
					<Dialog.Trigger>Closed child</Dialog.Trigger>
				</Dialog.Root>
			{/if}
		</Dialog.Popup>
	</Dialog.Portal>
	{#if openChildOutsidePopup}
		<Dialog.Root open modal={false}>
			<Dialog.Portal>
				<Dialog.Popup data-testid="outside-child">Outside child</Dialog.Popup>
			</Dialog.Portal>
		</Dialog.Root>
	{/if}
</Dialog.Root>
