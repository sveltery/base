<script lang="ts">
	import { Drawer, type DrawerChangeEventDetails, type DrawerHandle } from '../lib/drawer/index.js';

	let {
		scenario,
		open = $bindable(undefined as boolean | undefined),
		handle = undefined as DrawerHandle<number> | undefined,
		showDrawer = true,
		text = 'Drawer',
		steps = undefined as number | undefined,
		oneWay = false,
		onOpenChange = undefined as
			((open: boolean, details: DrawerChangeEventDetails) => void) | undefined
	}: {
		scenario:
			| 'borrowed-parts'
			| 'detached'
			| 'remount'
			| 'aria-controls'
			| 'provider-registration'
			| 'close-watcher';
		open?: boolean;
		handle?: DrawerHandle<number>;
		showDrawer?: boolean;
		text?: string;
		steps?: number;
		oneWay?: boolean;
		onOpenChange?: (open: boolean, details: DrawerChangeEventDetails) => void;
	} = $props();

	let mounted = $state(true);
	// svelte-ignore state_referenced_locally
	let step = $state(steps);

	// Each cancelable back press steps back through the content until one cannot be prevented.
	function watcherChange(next: boolean, details: DrawerChangeEventDetails) {
		onOpenChange?.(next, details);
		if (step !== undefined && step > 0 && details.event.cancelable) {
			details.cancel();
			step -= 1;
		}
	}
</script>

{#if scenario === 'borrowed-parts'}
	<Drawer.Root modal={false}>
		<Drawer.Trigger>Open</Drawer.Trigger>
		<Drawer.Trigger disabled>Disabled</Drawer.Trigger>
		<Drawer.Close disabled>Close</Drawer.Close>
	</Drawer.Root>
{:else if scenario === 'detached'}
	<Drawer.Trigger {handle} id="trigger-1" payload={1}>Trigger 1</Drawer.Trigger>
	<Drawer.Trigger {handle} id="trigger-2" payload={2}>Trigger 2</Drawer.Trigger>
	<Drawer.Root {handle}>
		{#snippet children({ payload })}
			<Drawer.Portal>
				<Drawer.Viewport>
					<Drawer.Popup data-testid="content">
						<span data-testid="payload">{payload}</span>
						<Drawer.Close>Close</Drawer.Close>
					</Drawer.Popup>
				</Drawer.Viewport>
			</Drawer.Portal>
		{/snippet}
	</Drawer.Root>
{:else if scenario === 'remount'}
	<Drawer.Trigger {handle} id="trigger" payload={1}>Trigger</Drawer.Trigger>
	{#if !mounted}
		<button type="button" onclick={() => (mounted = true)}>Remount root</button>
	{:else}
		<Drawer.Root {handle}>
			{#snippet children({ payload })}
				<span data-testid="payload">{payload ?? 'No payload'}</span>
				<Drawer.Portal>
					<Drawer.Viewport>
						<Drawer.Popup>
							Drawer content
							<button type="button" onclick={() => (mounted = false)}>Unmount root</button>
						</Drawer.Popup>
					</Drawer.Viewport>
				</Drawer.Portal>
			{/snippet}
		</Drawer.Root>
	{/if}
{:else if scenario === 'aria-controls'}
	<Drawer.Root>
		<Drawer.Trigger>Open</Drawer.Trigger>
		<Drawer.Portal>
			<Drawer.Viewport>
				<Drawer.Popup data-testid="popup">Drawer</Drawer.Popup>
			</Drawer.Viewport>
		</Drawer.Portal>
	</Drawer.Root>
{:else if scenario === 'provider-registration'}
	<Drawer.Provider>
		{#if showDrawer}
			<Drawer.Root modal={false} bind:open />
		{/if}
		<Drawer.IndentBackground data-testid="background" />
	</Drawer.Provider>
{:else if scenario === 'close-watcher'}
	{#if oneWay}
		<Drawer.Root open={true} onOpenChange={watcherChange}>{@render watcherPopup()}</Drawer.Root>
	{:else}
		<Drawer.Root bind:open onOpenChange={watcherChange}>{@render watcherPopup()}</Drawer.Root>
	{/if}
{/if}

{#snippet watcherPopup()}
	<Drawer.Portal>
		<Drawer.Viewport>
			<Drawer.Popup>{step === undefined ? text : `step ${step}`}</Drawer.Popup>
		</Drawer.Viewport>
	</Drawer.Portal>
{/snippet}
