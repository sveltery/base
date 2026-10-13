<script lang="ts">
	import { Select } from '#lib';

	interface Label {
		key: string;
		id?: string;
		text: string;
		props?: Record<string, unknown>;
	}

	let {
		labels = [{ key: 'fruits', text: 'Fruits' }],
		items = [],
		orphan
	}: {
		labels?: Label[];
		items?: string[];
		/** Renders a part outside the parent it needs. */
		orphan?: 'item-text' | 'group-label';
	} = $props();
</script>

<Select.Root open>
	{#if orphan === 'group-label'}
		<Select.GroupLabel />
	{:else}
		<Select.Portal>
			<Select.Positioner>
				{#if orphan === 'item-text'}
					<Select.ItemText />
				{:else}
					<Select.Group>
						{#each labels as label (label.key)}
							<Select.GroupLabel id={label.id} {...label.props}>{label.text}</Select.GroupLabel>
						{/each}
						{#each items as item (item)}
							<Select.Item value={item}>{item}</Select.Item>
						{/each}
					</Select.Group>
				{/if}
			</Select.Positioner>
		</Select.Portal>
	{/if}
</Select.Root>
