<script lang="ts">
	import { Combobox } from '@sveltery/base/combobox';
	import styles from './index.module.css';

	const id = $props.id();

	interface Fruit {
		label: string;
		value: string;
	}

	const fruits: Fruit[] = [
		{ label: 'Apple', value: 'apple' },
		{ label: 'Banana', value: 'banana' },
		{ label: 'Orange', value: 'orange' },
		{ label: 'Pineapple', value: 'pineapple' },
		{ label: 'Grape', value: 'grape' },
		{ label: 'Mango', value: 'mango' },
		{ label: 'Strawberry', value: 'strawberry' },
		{ label: 'Blueberry', value: 'blueberry' },
		{ label: 'Raspberry', value: 'raspberry' },
		{ label: 'Blackberry', value: 'blackberry' },
		{ label: 'Cherry', value: 'cherry' },
		{ label: 'Peach', value: 'peach' },
		{ label: 'Pear', value: 'pear' },
		{ label: 'Plum', value: 'plum' },
		{ label: 'Kiwi', value: 'kiwi' },
		{ label: 'Watermelon', value: 'watermelon' },
		{ label: 'Cantaloupe', value: 'cantaloupe' },
		{ label: 'Honeydew', value: 'honeydew' },
		{ label: 'Papaya', value: 'papaya' },
		{ label: 'Guava', value: 'guava' },
		{ label: 'Lychee', value: 'lychee' },
		{ label: 'Pomegranate', value: 'pomegranate' },
		{ label: 'Apricot', value: 'apricot' },
		{ label: 'Grapefruit', value: 'grapefruit' },
		{ label: 'Passionfruit', value: 'passionfruit' }
	];
</script>

{#snippet CheckIcon()}
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

{#snippet XIcon()}
	<svg
		width="16"
		height="16"
		viewBox="0 0 16 16"
		fill="none"
		stroke="currentColor"
		stroke-linecap="square"
		stroke-linejoin="round"
		style="display: block"
	>
		<path d="m4.5 4.5 7 7m-7 0 7-7" />
	</svg>
{/snippet}

{#snippet CaretDownIcon()}
	<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="display: block">
		<path d="M12 6H4l4 4.5z" />
	</svg>
{/snippet}

<Combobox.Root items={fruits}>
	<div class={styles.Label}>
		<label for={id}>Choose a fruit</label>
		<Combobox.InputGroup class={styles.InputGroup}>
			<Combobox.Input placeholder="e.g. Apple" {id} class={styles.Input} />
			<div class={styles.ActionButtons}>
				<Combobox.Clear class={styles.Clear} aria-label="Clear selection">
					{@render XIcon()}
				</Combobox.Clear>
				<Combobox.Trigger class={styles.Trigger} aria-label="Open popup">
					{@render CaretDownIcon()}
				</Combobox.Trigger>
			</div>
		</Combobox.InputGroup>
	</div>

	<Combobox.Portal>
		<Combobox.Positioner class={styles.Positioner} sideOffset={4}>
			<Combobox.Popup class={styles.Popup}>
				<Combobox.Empty>
					<div class={styles.Empty}>No fruits found.</div>
				</Combobox.Empty>
				<Combobox.List class={styles.List}>
					<Combobox.Collection>
						{#snippet children(item: Fruit)}
							<Combobox.Item value={item} class={styles.Item}>
								<Combobox.ItemIndicator class={styles.ItemIndicator}>
									{@render CheckIcon()}
								</Combobox.ItemIndicator>
								<span class={styles.ItemText}>{item.label}</span>
							</Combobox.Item>
						{/snippet}
					</Combobox.Collection>
				</Combobox.List>
			</Combobox.Popup>
		</Combobox.Positioner>
	</Combobox.Portal>
</Combobox.Root>
