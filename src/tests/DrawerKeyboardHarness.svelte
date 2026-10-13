<script lang="ts">
	import { Drawer } from '../lib/drawer/index.js';
	import type { DrawerChangeEventDetails } from '../lib/drawer/index.js';
	import DrawerKeyboardTouchTarget from './DrawerKeyboardTouchTarget.svelte';

	let {
		open = $bindable(true),
		closable = false,
		modal = false as boolean | 'trap-focus',
		initialFocus = undefined as false | undefined,
		keyboard = true,
		backdrop = false,
		container = undefined as ShadowRoot | undefined,
		html = '',
		contentStyle = undefined as string | undefined,
		popupStyle = undefined as string | undefined,
		popupTestId = 'popup',
		nested = false,
		direct = false,
		autofocus = false
	} = $props();

	// Upstream mostly renders a controlled `open` with no setter, so the drawer ignores close
	// requests. `closable` closes it but keeps it mounted.
	function setOpen(next: boolean) {
		if (closable) open = next;
	}

	function changed(next: boolean, details: DrawerChangeEventDetails) {
		if (closable && !next) details.preventUnmountOnClose();
	}
</script>

{#snippet portal()}
	<Drawer.Portal {container}>
		{#if backdrop}
			<Drawer.Backdrop data-testid="backdrop" />
		{/if}
		<Drawer.Viewport data-testid="viewport">
			<Drawer.Popup data-testid={popupTestId} style={popupStyle} {initialFocus}>
				{#if contentStyle !== undefined}
					<Drawer.Content data-testid="scroll" style={contentStyle}>
						<!-- eslint-disable-next-line svelte/no-at-html-tags -- fixed test markup -->
						{@html html}
					</Drawer.Content>
				{:else}
					<!-- eslint-disable-next-line svelte/no-at-html-tags -- fixed test markup -->
					{@html html}
				{/if}
				{#if autofocus}
					<!-- svelte-ignore a11y_autofocus -->
					<input autofocus data-testid="input" type="text" />
				{/if}
				{#if direct}
					<DrawerKeyboardTouchTarget />
				{/if}
				{#if closable}
					<Drawer.Close>Close</Drawer.Close>
				{/if}
				{#if nested}
					<Drawer.Root open={true} modal={false}>
						<Drawer.Portal>
							<Drawer.Viewport>
								<Drawer.Popup>
									<button type="button">Nested action</button>
								</Drawer.Popup>
							</Drawer.Viewport>
						</Drawer.Portal>
					</Drawer.Root>
				{/if}
			</Drawer.Popup>
		</Drawer.Viewport>
	</Drawer.Portal>
{/snippet}

<Drawer.Root bind:open={() => open, setOpen} {modal} onOpenChange={changed}>
	{#if keyboard}
		<Drawer.VirtualKeyboardProvider>
			{@render portal()}
		</Drawer.VirtualKeyboardProvider>
	{:else}
		{@render portal()}
	{/if}
</Drawer.Root>
