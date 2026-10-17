<script lang="ts">
	import { Select } from '@sveltery/base/select';
	import styles from './index.module.css';

	interface ShippingMethod {
		id: string;
		name: string;
		duration: string;
		price: string;
	}

	const shippingMethods: ShippingMethod[] = [
		{
			id: 'standard',
			name: 'Standard',
			duration: 'Delivers in 4-6 business days',
			price: '$4.99'
		},
		{
			id: 'express',
			name: 'Express',
			duration: 'Delivers in 2-3 business days',
			price: '$9.99'
		},
		{
			id: 'overnight',
			name: 'Overnight',
			duration: 'Delivers next business day',
			price: '$19.99'
		}
	];
</script>

<div class={styles.Field}>
	<Select.Root
		defaultValue={shippingMethods[0]}
		itemToStringValue={(item: ShippingMethod) => item.id}
	>
		<Select.Label class={styles.Label}>Shipping method</Select.Label>
		<Select.Trigger class={styles.Select}>
			<Select.Value>
				{#snippet children(value)}
					{@const method = value as ShippingMethod}
					<span class={styles.ValueText}>
						<span class={styles.ValuePrimary}>{method.name}</span>
						<span class={styles.ValueSecondary}>
							{method.duration} ({method.price})
						</span>
					</span>
				{/snippet}
			</Select.Value>
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
						{#each shippingMethods as method (method.id)}
							<Select.Item value={method} class={styles.Item}>
								<Select.ItemIndicator class={styles.ItemIndicator}>
									{@render checkIcon()}
								</Select.ItemIndicator>
								<Select.ItemText class={styles.ItemText}>
									<span class={styles.ItemLabel}>{method.name}</span>
									<span class={styles.ItemDescription}>
										{method.duration} ({method.price})
									</span>
								</Select.ItemText>
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
