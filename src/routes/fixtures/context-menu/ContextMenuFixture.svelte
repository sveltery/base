<script lang="ts">
	import { ContextMenu } from '#lib';
	import type { ContextMenuCase } from './cases.js';

	let { scenario }: { scenario: ContextMenuCase } = $props();

	const items = ['Copy', 'Paste', 'Rename'];
	let calls = $state<{ open: boolean; reason: string }[]>([]);
	let clicks = $state<string[]>([]);
</script>

<button type="button">Outside</button>
<pre data-testid="calls">{JSON.stringify(calls)}</pre>
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
					<ContextMenu.Item onclick={() => clicks.push(item)}>{item}</ContextMenu.Item>
				{/each}
				<ContextMenu.Separator />
				<ContextMenu.Item disabled>Delete</ContextMenu.Item>
			</ContextMenu.Popup>
		</ContextMenu.Positioner>
	</ContextMenu.Portal>
</ContextMenu.Root>
