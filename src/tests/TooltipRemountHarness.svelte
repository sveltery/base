<script lang="ts">
	import { Tooltip, type TooltipChangeEventDetails } from '#lib';

	const handle = Tooltip.createHandle();
	let showRoot = $state(true);
	let remountOpen = $state(false);
	let preventNextUnmount = true;

	function changed(open: boolean, details: TooltipChangeEventDetails) {
		if (!open && preventNextUnmount) {
			preventNextUnmount = false;
			details.preventUnmountOnClose();
		}
	}
</script>

<Tooltip.Trigger {handle} id="trigger" delay={0}>Toggle</Tooltip.Trigger>
<button type="button" onclick={() => handle.open('trigger')}>Open tooltip</button>
<button type="button" onclick={() => handle.close()}>Close tooltip</button>
<button type="button" onclick={() => (showRoot = false)}>Unmount root</button>
<button
	type="button"
	onclick={() => {
		remountOpen = true;
		showRoot = true;
	}}
>
	Remount open
</button>
{#if showRoot}
	<Tooltip.Root {handle} open={remountOpen} triggerId="trigger" onOpenChange={changed}>
		<Tooltip.Portal>
			<Tooltip.Positioner data-testid="positioner">
				<Tooltip.Popup>Content</Tooltip.Popup>
			</Tooltip.Positioner>
		</Tooltip.Portal>
	</Tooltip.Root>
{/if}
