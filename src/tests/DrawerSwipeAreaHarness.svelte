<script lang="ts">
	import type { DialogStore } from '../lib/dialog/store.svelte.js';
	import {
		Drawer,
		type DrawerChangeEventDetails,
		type DrawerSwipeDirection
	} from '../lib/drawer/index.js';
	import DrawerStoreProbe from './DrawerStoreProbe.svelte';

	let {
		open = $bindable(false),
		rejectOpen = false,
		modal = undefined as boolean | 'trap-focus' | undefined,
		rootSwipeDirection = undefined as DrawerSwipeDirection | undefined,
		swipeDirection = undefined as DrawerSwipeDirection | undefined,
		disabled = false,
		id = undefined as string | undefined,
		portal = true,
		provider = false,
		backdrop = false,
		keepMounted = false,
		close = false,
		outsideButton = false,
		outsideTarget = false,
		initialFocus = undefined as false | undefined,
		areaStyle = undefined as string | undefined,
		popupStyle = undefined as string | undefined,
		popupClass = undefined as string | undefined,
		onOpenChange = undefined as
			((open: boolean, details: DrawerChangeEventDetails) => void) | undefined,
		onStore = undefined as ((store: DialogStore<unknown>) => void) | undefined
	} = $props();

	// `rejectOpen` is the Svelte form of upstream's controlled `open={false}`.
	function setOpen(next: boolean) {
		if (rejectOpen && next) return;
		open = next;
	}
</script>

{#snippet drawer()}
	{#if outsideButton}
		<button type="button">Outside</button>
	{/if}
	{#if outsideTarget}
		<div
			data-testid="outside-target"
			style="position: fixed; top: 0; left: 0; width: 100%; height: 100px"
		></div>
	{/if}
	<Drawer.Root
		bind:open={() => open, setOpen}
		{modal}
		swipeDirection={rootSwipeDirection}
		{onOpenChange}
	>
		{#if onStore}
			<DrawerStoreProbe {onStore} />
		{/if}
		<Drawer.SwipeArea data-testid="swipe-area" {swipeDirection} {disabled} {id} style={areaStyle} />
		{#if portal}
			<Drawer.Portal {keepMounted}>
				{#if backdrop}
					<Drawer.Backdrop data-testid="backdrop" />
				{/if}
				<Drawer.Viewport>
					<Drawer.Popup data-testid="popup" class={popupClass} style={popupStyle} {initialFocus}>
						Drawer
						{#if close}
							<Drawer.Close>Close</Drawer.Close>
						{/if}
					</Drawer.Popup>
				</Drawer.Viewport>
			</Drawer.Portal>
		{/if}
	</Drawer.Root>
{/snippet}

{#if provider}
	<Drawer.Provider>
		<Drawer.Indent data-testid="indent" />
		{@render drawer()}
	</Drawer.Provider>
{:else}
	{@render drawer()}
{/if}
