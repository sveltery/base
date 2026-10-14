<script lang="ts">
	import { Popover } from '#lib';

	let {
		onInnerOpenChange
	}: { onInnerOpenChange?: (open: boolean, details: { reason: string }) => void } = $props();
</script>

<Popover.Root open={true}>
	<Popover.Trigger data-testid="outer-trigger">Outer</Popover.Trigger>
	<Popover.Portal>
		<Popover.Positioner>
			<Popover.Popup data-testid="outer-popup" initialFocus={false}>
				<Popover.Root onOpenChange={onInnerOpenChange}>
					<Popover.Trigger data-testid="inner-trigger">Inner</Popover.Trigger>
					<Popover.Portal>
						<Popover.Positioner>
							<Popover.Popup data-testid="inner-popup" initialFocus={false}
								>Inner content</Popover.Popup
							>
						</Popover.Positioner>
					</Popover.Portal>
				</Popover.Root>
				<button data-testid="outer-item">Outer item</button>
			</Popover.Popup>
		</Popover.Positioner>
	</Popover.Portal>
</Popover.Root>
