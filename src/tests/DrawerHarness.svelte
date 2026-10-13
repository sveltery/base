<script lang="ts">
	import type { Snippet } from 'svelte';
	import {
		Drawer,
		type DrawerChangeEventDetails,
		type DrawerSnapPoint,
		type DrawerSnapPointChangeEventDetails,
		type DrawerSwipeDirection
	} from '../lib/drawer/index.js';

	let {
		open = $bindable(true),
		snapPoint = $bindable(undefined as DrawerSnapPoint | null | undefined),
		holdOpen = false,
		cancelSwipeClose = false,
		cancelClose = false,
		modal = undefined as boolean | 'trap-focus' | undefined,
		swipeDirection = undefined as DrawerSwipeDirection | undefined,
		snapPoints = undefined as DrawerSnapPoint[] | undefined,
		defaultSnapPoint = undefined as DrawerSnapPoint | null | undefined,
		snapToSequentialPoints = undefined as boolean | undefined,
		keepMounted = false,
		backdrop = false,
		trigger = false,
		close = false,
		viewportStyle = undefined as string | undefined,
		popupStyle = undefined as string | undefined,
		onOpenChange = undefined as
			((open: boolean, details: DrawerChangeEventDetails) => void) | undefined,
		onSnapPointChange = undefined as
			| ((snapPoint: DrawerSnapPoint | null, details: DrawerSnapPointChangeEventDetails) => void)
			| undefined,
		content = undefined as Snippet | undefined
	} = $props();

	// `holdOpen` is a parent that refuses to close, the Svelte form of a controlled `open` that ignores `false`.
	function setOpen(next: boolean) {
		if (holdOpen && !next) return;
		open = next;
	}

	function changed(next: boolean, details: DrawerChangeEventDetails) {
		if (cancelClose && !next) details.cancel();
		if (cancelSwipeClose && !next && details.reason === 'swipe') details.cancel();
		onOpenChange?.(next, details);
	}
</script>

<output data-testid="active-snap">{String(snapPoint)}</output>
<Drawer.Root
	bind:open={() => open, setOpen}
	bind:snapPoint
	{modal}
	{swipeDirection}
	{snapPoints}
	{defaultSnapPoint}
	{snapToSequentialPoints}
	{onSnapPointChange}
	onOpenChange={changed}
>
	{#if trigger}
		<Drawer.Trigger data-testid="trigger">Open</Drawer.Trigger>
	{/if}
	<Drawer.Portal {keepMounted}>
		{#if backdrop}
			<Drawer.Backdrop data-testid="backdrop" />
		{/if}
		<Drawer.Viewport data-testid="viewport" style={viewportStyle}>
			<Drawer.Popup data-testid="popup" style={popupStyle}>
				Drawer
				{@render content?.()}
				{#if close}
					<Drawer.Close data-testid="close">Close</Drawer.Close>
				{/if}
			</Drawer.Popup>
		</Drawer.Viewport>
	</Drawer.Portal>
</Drawer.Root>
