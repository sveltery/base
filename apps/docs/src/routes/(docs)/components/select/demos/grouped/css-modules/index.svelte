<script lang="ts">
	import { Field } from '@sveltery/base/field';
	import { Select } from '@sveltery/base/select';
	import styles from './index.module.css';

	const groupedProduce = [
		{
			value: 'Fruits',
			items: [
				{ value: 'apple', label: 'Apple' },
				{ value: 'banana', label: 'Banana' },
				{ value: 'mango', label: 'Mango' },
				{ value: 'kiwi', label: 'Kiwi' },
				{ value: 'grape', label: 'Grape' },
				{ value: 'orange', label: 'Orange' },
				{ value: 'strawberry', label: 'Strawberry' },
				{ value: 'watermelon', label: 'Watermelon' }
			]
		},
		{
			value: 'Vegetables',
			items: [
				{ value: 'broccoli', label: 'Broccoli' },
				{ value: 'carrot', label: 'Carrot' },
				{ value: 'cauliflower', label: 'Cauliflower' },
				{ value: 'cucumber', label: 'Cucumber' },
				{ value: 'kale', label: 'Kale' },
				{ value: 'pepper', label: 'Bell pepper' },
				{ value: 'spinach', label: 'Spinach' },
				{ value: 'zucchini', label: 'Zucchini' }
			]
		}
	];
</script>

<Field.Root class={styles.Field}>
	<Field.Label class={styles.Label} nativeLabel={false}>
		{#snippet render(props, _state, children)}
			<div {...props}>{@render children?.()}</div>
		{/snippet}
		Produce
	</Field.Label>
	<Select.Root items={groupedProduce}>
		<Select.Trigger class={styles.Select}>
			<Select.Value class={styles.Value} placeholder="Select produce" />
			<Select.Icon>
				{@render caretUpDownIcon()}
			</Select.Icon>
		</Select.Trigger>
		<Select.Portal>
			<Select.Positioner class={styles.Positioner} sideOffset={4}>
				<Select.Popup class={styles.Popup}>
					<Select.ScrollUpArrow class={styles.ScrollArrow}>
						{@render caretUpIcon()}
					</Select.ScrollUpArrow>
					<Select.List class={styles.List}>
						{#each groupedProduce as group, index (group.value)}
							<Select.Group class={styles.Group}>
								<Select.GroupLabel class={styles.GroupLabel}>
									{group.value}
								</Select.GroupLabel>
								{#each group.items as item (item.value)}
									<Select.Item value={item.value} class={styles.Item}>
										<Select.ItemIndicator class={styles.ItemIndicator}>
											{@render checkIcon()}
										</Select.ItemIndicator>
										<Select.ItemText class={styles.ItemText}>{item.label}</Select.ItemText>
									</Select.Item>
								{/each}
							</Select.Group>
							{#if index < groupedProduce.length - 1}
								<Select.Separator class={styles.Separator} />
							{/if}
						{/each}
					</Select.List>
					<Select.ScrollDownArrow class={styles.ScrollArrow}>
						{@render caretDownIcon()}
					</Select.ScrollDownArrow>
				</Select.Popup>
			</Select.Positioner>
		</Select.Portal>
	</Select.Root>
</Field.Root>

{#snippet caretUpDownIcon()}
	<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="display: block">
		<path d="M11 10H5l3 3.5zm0-4H5l3-3.5z" />
	</svg>
{/snippet}

{#snippet checkIcon()}
	<svg
		width="16"
		height="16"
		viewBox="0 0 16 16"
		fill="none"
		stroke="currentColor"
		style="display: block"
	>
		<path d="m2.5 8.5 4 4 7-9" />
	</svg>
{/snippet}

{#snippet caretUpIcon()}
	<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="display: block">
		<path d="M12 10H4l4-4.5z" />
	</svg>
{/snippet}

{#snippet caretDownIcon()}
	<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="display: block">
		<path d="M12 6H4l4 4.5z" />
	</svg>
{/snippet}
