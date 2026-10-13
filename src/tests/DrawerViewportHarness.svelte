<script lang="ts">
	import { Drawer } from '../lib/drawer/index.js';
	import type {
		DrawerChangeEventDetails,
		DrawerSnapPoint,
		DrawerSnapPointChangeEventDetails,
		DrawerSwipeDirection
	} from '../lib/drawer/index.js';
	import { Slider } from '../lib/slider/index.js';
	import DrawerProviderControls from './DrawerProviderControls.svelte';

	type ChildDrawer = {
		html?: string;
		snapPoints?: DrawerSnapPoint[];
		viewportStyle?: string;
		popupStyle?: string;
	};

	let {
		open = $bindable(true),
		snapPoint = $bindable(undefined as DrawerSnapPoint | null | undefined),
		holdOpen = true,
		preventUnmountOnClose = false,
		modal = undefined as boolean | 'trap-focus' | undefined,
		swipeDirection = undefined as DrawerSwipeDirection | undefined,
		snapPoints = undefined as DrawerSnapPoint[] | undefined,
		defaultSnapPoint = undefined as DrawerSnapPoint | null | undefined,
		snapToSequentialPoints = undefined as boolean | undefined,
		keepMounted = false,
		container = undefined as ShadowRoot | undefined,
		backdrop = true,
		showViewport = true,
		showPopup = true,
		html = 'Drawer',
		content = false,
		close = false,
		slider = false,
		scrollWrap = false,
		provider = false,
		outsideText = undefined as string | undefined,
		viewportStyle = undefined as string | undefined,
		popupStyle = undefined as string | undefined,
		child = undefined as ChildDrawer | undefined,
		onOpenChange = undefined as
			((open: boolean, details: DrawerChangeEventDetails) => void) | undefined,
		onSnapPointChange = undefined as
			| ((snapPoint: DrawerSnapPoint | null, details: DrawerSnapPointChangeEventDetails) => void)
			| undefined
	} = $props();

	const prefix = $derived(child ? 'parent-' : '');

	// `holdOpen` is the Svelte form of upstream's controlled `open` with no setter.
	function setOpen(next: boolean) {
		if (holdOpen && !next) return;
		open = next;
	}

	function changed(next: boolean, details: DrawerChangeEventDetails) {
		if (preventUnmountOnClose && !next) details.preventUnmountOnClose();
		onOpenChange?.(next, details);
	}
</script>

{#snippet body()}
	{#if content}
		<Drawer.Content data-testid="content">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -- fixed test markup -->
			{@html html}
		</Drawer.Content>
	{:else}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- fixed test markup -->
		{@html html}
	{/if}
	{#if slider}
		<Slider.Root defaultValue={50}>
			<Slider.Control>
				<Slider.Track>
					<Slider.Indicator />
					<Slider.Thumb />
				</Slider.Track>
			</Slider.Control>
		</Slider.Root>
	{/if}
	{#if close}
		<Drawer.Close>Close</Drawer.Close>
	{/if}
	{#if child}
		<Drawer.Root open={true} swipeDirection="down" snapPoints={child.snapPoints}>
			<Drawer.Portal>
				<Drawer.Viewport data-testid="child-viewport" style={child.viewportStyle}>
					<Drawer.Popup data-testid="child-popup" style={child.popupStyle}>
						<!-- eslint-disable-next-line svelte/no-at-html-tags -- fixed test markup -->
						{@html child.html ?? 'Child'}
					</Drawer.Popup>
				</Drawer.Viewport>
			</Drawer.Portal>
		</Drawer.Root>
	{/if}
{/snippet}

{#snippet popup()}
	{#if showPopup}
		<Drawer.Popup data-testid="{prefix}popup" style={popupStyle}>
			{@render body()}
		</Drawer.Popup>
	{/if}
{/snippet}

{#snippet drawer()}
	{#if outsideText}
		<span data-testid="outside">{outsideText}</span>
	{/if}
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
		<Drawer.Portal {keepMounted} {container}>
			{#if backdrop}
				<Drawer.Backdrop data-testid="backdrop" />
			{/if}
			{#if showViewport}
				<Drawer.Viewport data-testid="{prefix}viewport" style={viewportStyle}>
					{#if scrollWrap}
						<div data-testid="scroll" style="overflow-y: auto; max-height: 40px">
							{@render popup()}
						</div>
					{:else}
						{@render popup()}
					{/if}
				</Drawer.Viewport>
			{/if}
		</Drawer.Portal>
	</Drawer.Root>
{/snippet}

{#if provider}
	<Drawer.Provider>
		<Drawer.Indent data-testid="indent" />
		<DrawerProviderControls />
		{@render drawer()}
	</Drawer.Provider>
{:else}
	{@render drawer()}
{/if}
