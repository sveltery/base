<script lang="ts">
	import { Popover } from '#lib';

	let { finalFocus }: { finalFocus: (closeType: string) => HTMLElement | null } = $props();
</script>

<button type="button" data-testid="outside">Outside</button>
<Popover.Root>
	<Popover.Trigger openOnHover delay={0}>Trigger</Popover.Trigger>
	<Popover.Portal>
		<Popover.Positioner>
			<Popover.Popup data-testid="popup" {finalFocus}>
				<button type="button">Inside</button>
			</Popover.Popup>
		</Popover.Positioner>
	</Popover.Portal>
</Popover.Root>
