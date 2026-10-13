<script lang="ts">
	import { Drawer, type DrawerChangeEventDetails, type DrawerSnapPoint } from '#lib';
	import type { DrawerCase } from './cases.js';

	let { scenario = 'standalone' as DrawerCase } = $props();

	const snapPoints: DrawerSnapPoint[] = ['160px', 1];
	let snapPoint = $state<DrawerSnapPoint | null | undefined>('160px');
	let calls = $state<{ open: boolean; reason: string; canceled: boolean }[]>([]);

	function changed(open: boolean, details: DrawerChangeEventDetails) {
		calls.push({ open, reason: details.reason, canceled: details.isCanceled });
	}
</script>

{#snippet content()}
	<Drawer.Title>Title</Drawer.Title>
	<Drawer.Description>Description</Drawer.Description>
	<button type="button">Inside</button>
	<Drawer.Close>Close</Drawer.Close>
{/snippet}

{#snippet drawer()}
	<Drawer.Root
		onOpenChange={changed}
		snapPoints={scenario === 'snap' ? snapPoints : undefined}
		bind:snapPoint={
			() => (scenario === 'snap' ? snapPoint : undefined), (next) => (snapPoint = next)
		}
	>
		<Drawer.Trigger>Open</Drawer.Trigger>
		{#if scenario === 'swipe-area'}
			<Drawer.SwipeArea data-testid="swipe-area" />
		{/if}
		<Drawer.Portal>
			<Drawer.Backdrop data-testid="backdrop" />
			<Drawer.Viewport data-testid="viewport">
				<Drawer.Popup data-testid="popup">
					{@render content()}
					{#if scenario === 'nested'}
						<Drawer.Root>
							<Drawer.Trigger>Open nested</Drawer.Trigger>
							<Drawer.Portal>
								<Drawer.Viewport data-testid="nested-viewport">
									<Drawer.Popup data-testid="nested-popup">
										<Drawer.Title>Nested</Drawer.Title>
										<Drawer.Close>Close nested</Drawer.Close>
									</Drawer.Popup>
								</Drawer.Viewport>
							</Drawer.Portal>
						</Drawer.Root>
					{/if}
				</Drawer.Popup>
			</Drawer.Viewport>
		</Drawer.Portal>
	</Drawer.Root>
{/snippet}

<button type="button" data-testid="outside">Outside</button>
{#if scenario === 'provider'}
	<Drawer.Provider>
		<Drawer.IndentBackground data-testid="indent-background" />
		<Drawer.Indent data-testid="indent">
			{@render drawer()}
		</Drawer.Indent>
	</Drawer.Provider>
{:else}
	{@render drawer()}
{/if}
<output data-testid="snap-point">{JSON.stringify(snapPoint)}</output>
<output data-testid="calls">{JSON.stringify(calls)}</output>
