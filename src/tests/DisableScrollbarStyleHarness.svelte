<script lang="ts">
	import { CSPProvider, ScrollArea, Select } from '#lib';

	let {
		nonce,
		disableStyleElements = false,
		areas = 1,
		select = false
	}: {
		nonce?: string;
		disableStyleElements?: boolean;
		areas?: number;
		select?: boolean;
	} = $props();
</script>

<CSPProvider {nonce} {disableStyleElements}>
	{#each { length: areas }, index (index)}
		<ScrollArea.Root data-testid="area-{index}" style="width: 80px; height: 80px">
			<ScrollArea.Viewport style="width: 100%; height: 100%">
				<div style="width: 20px; height: 200px"></div>
			</ScrollArea.Viewport>
		</ScrollArea.Root>
	{/each}
	{#if select}
		<Select.Root open>
			<Select.Trigger data-testid="trigger"><Select.Value /></Select.Trigger>
			<Select.Portal>
				<Select.Positioner>
					<Select.Popup data-testid="popup">
						<Select.Item value="a">A</Select.Item>
					</Select.Popup>
				</Select.Positioner>
			</Select.Portal>
		</Select.Root>
	{/if}
</CSPProvider>
