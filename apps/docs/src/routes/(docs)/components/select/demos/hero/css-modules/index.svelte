<script lang="ts">
	import { Select } from '@sveltery/base/select';
	import styles from './index.module.css';

	const apples = [
		{ label: 'Gala', value: 'gala' },
		{ label: 'Fuji', value: 'fuji' },
		{ label: 'Honeycrisp', value: 'honeycrisp' },
		{ label: 'Granny Smith', value: 'granny-smith' },
		{ label: 'Pink Lady', value: 'pink-lady' }
	];
</script>

<div class={styles.Field}>
	<Select.Root items={apples}>
		<Select.Label class={styles.Label}>Apple</Select.Label>
		<Select.Trigger class={styles.Select}>
			<Select.Value class={styles.Value} placeholder="Select apple" />
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
						{#each apples as { label, value } (label)}
							<Select.Item {value} class={styles.Item}>
								<Select.ItemIndicator class={styles.ItemIndicator}>
									{@render checkIcon()}
								</Select.ItemIndicator>
								<Select.ItemText class={styles.ItemText}>{label}</Select.ItemText>
							</Select.Item>
						{/each}
					</Select.List>
					<Select.ScrollDownArrow class={styles.ScrollArrow}>
						{@render caretDownIcon()}
					</Select.ScrollDownArrow>
				</Select.Popup>
			</Select.Positioner>
		</Select.Portal>
	</Select.Root>
</div>

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
