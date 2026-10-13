<script lang="ts">
	import { Select } from '#lib';

	let {
		scroller = {},
		items = [],
		itemProps = () => ({}),
		list = true,
		popup = true
	}: {
		/** Props for the element that scrolls: the list, or the popup without one. */
		scroller?: Record<string, unknown>;
		items?: string[];
		itemProps?: (index: number) => Record<string, unknown>;
		list?: boolean;
		popup?: boolean;
	} = $props();
</script>

{#snippet entries()}
	{#each items as item, index (item)}
		<Select.Item value={item} {...itemProps(index)}>{item}</Select.Item>
	{/each}
{/snippet}

<Select.Root open>
	<Select.Trigger>Open</Select.Trigger>
	<Select.Portal>
		<Select.Positioner alignItemWithTrigger={false}>
			{#if popup}
				<Select.Popup {...list ? {} : scroller}>
					<Select.ScrollUpArrow keepMounted data-testid="up" />
					{#if list}
						<Select.List {...scroller}>{@render entries()}</Select.List>
					{:else}
						{@render entries()}
					{/if}
					<Select.ScrollDownArrow keepMounted data-testid="down" />
				</Select.Popup>
			{:else}
				<Select.ScrollDownArrow keepMounted data-testid="down" />
			{/if}
		</Select.Positioner>
	</Select.Portal>
</Select.Root>
