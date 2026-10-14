<script lang="ts">
	import { Button, Popover } from '#lib';

	let { disabled }: { disabled?: boolean } = $props();
</script>

<Popover.Root>
	<Popover.Trigger {disabled}>
		{#snippet render(props)}<Button {...props}>Open</Button>{/snippet}
	</Popover.Trigger>
	<Popover.Portal>
		<Popover.Positioner>
			<Popover.Popup>Content</Popover.Popup>
		</Popover.Positioner>
	</Popover.Portal>
</Popover.Root>
