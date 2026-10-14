<script lang="ts">
	import { Popover } from '#lib';

	let { onOpenChange }: { onOpenChange?: (open: boolean, reason: string) => void } = $props();
	let canceledFocusOut = false;
</script>

<button data-testid="outside">outside</button>
<div data-testid="blank">blank</div>
<Popover.Root
	onOpenChange={(open, details) => {
		onOpenChange?.(open, details.reason);
		if (open || details.reason !== 'focus-out' || canceledFocusOut) return;
		canceledFocusOut = true;
		details.cancel();
	}}
>
	<Popover.Trigger data-testid="trigger">Open</Popover.Trigger>
	<Popover.Portal>
		<Popover.Positioner>
			<Popover.Popup data-testid="popup"><button data-testid="inside">inside</button></Popover.Popup
			>
		</Popover.Positioner>
	</Popover.Portal>
</Popover.Root>
