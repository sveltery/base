<script lang="ts">
	import { ContextMenu } from '#lib';
	import type { ContextMenuCase } from './cases.js';

	let { scenario }: { scenario: ContextMenuCase } = $props();

	const items = ['Copy', 'Paste', 'Rename'];
	let calls = $state<{ open: boolean; reason: string }[]>([]);
	let innerCalls = $state<{ open: boolean; reason: string }[]>([]);
	let clicks = $state<string[]>([]);
</script>

<button type="button">Outside</button>
<pre data-testid="calls">{JSON.stringify(calls)}</pre>
<pre data-testid="inner-calls">{JSON.stringify(innerCalls)}</pre>
<pre data-testid="clicks">{JSON.stringify(clicks)}</pre>

<ContextMenu.Root
	disabled={scenario === 'disabled'}
	onOpenChange={(open, details) => calls.push({ open, reason: details.reason })}
>
	<ContextMenu.Trigger
		data-testid="area"
		style="width: 300px; height: 200px; border: 1px dashed; display: grid; place-items: center"
		>Right click here</ContextMenu.Trigger
	>
	<ContextMenu.Portal>
		<ContextMenu.Positioner data-testid="positioner">
			<ContextMenu.Popup aria-label="Actions">
				{#each items as item (item)}
					{#if scenario === 'nested' && item === 'Rename'}
						<ContextMenu.Root
							onOpenChange={(open, details) => innerCalls.push({ open, reason: details.reason })}
						>
							<ContextMenu.Trigger data-testid="inner-area">
								<ContextMenu.Item onclick={() => clicks.push(item)}>{item}</ContextMenu.Item>
							</ContextMenu.Trigger>
							<ContextMenu.Portal>
								<ContextMenu.Positioner>
									<ContextMenu.Popup aria-label="Rename options">
										<ContextMenu.Item onclick={() => clicks.push('Rename all')}
											>Rename all</ContextMenu.Item
										>
									</ContextMenu.Popup>
								</ContextMenu.Positioner>
							</ContextMenu.Portal>
						</ContextMenu.Root>
					{:else}
						<ContextMenu.Item onclick={() => clicks.push(item)}>{item}</ContextMenu.Item>
					{/if}
				{/each}
				<ContextMenu.Separator />
				<ContextMenu.Item disabled>Delete</ContextMenu.Item>
			</ContextMenu.Popup>
		</ContextMenu.Positioner>
	</ContextMenu.Portal>
</ContextMenu.Root>
