<script lang="ts">
	import { Combobox } from '@sveltery/base/combobox';
	import styles from './index.module.css';
	import { Dialog } from '@sveltery/base/dialog';

	const id = $props.id();

	const chipProps = { 'aria-description': 'Press Backspace or Delete to remove' };

	function inputProps(selectedCount: number) {
		return {
			'aria-description':
				selectedCount > 0
					? `${selectedCount} selected. From the start of the input, press Left Arrow to focus the selected items`
					: undefined
		};
	}

	interface LabelItem {
		creatable?: string;
		id: string;
		value: string;
	}

	const initialLabels: LabelItem[] = [
		{ id: 'bug', value: 'bug' },
		{ id: 'docs', value: 'documentation' },
		{ id: 'enhancement', value: 'enhancement' },
		{ id: 'help-wanted', value: 'help wanted' },
		{ id: 'good-first-issue', value: 'good first issue' }
	];

	let labels = $state.raw<LabelItem[]>(initialLabels);
	let selected = $state.raw<LabelItem[]>([]);
	let query = $state('');
	let openDialog = $state(false);
	let pendingQuery = $state('');

	let createInput = $state<HTMLInputElement>();
	let highlightedItem: LabelItem | undefined;

	function handleInputKeyDown(event: KeyboardEvent) {
		if (event.key !== 'Enter' || highlightedItem) {
			return;
		}

		const currentTrimmed = query.trim();
		if (currentTrimmed === '') {
			return;
		}

		const normalized = currentTrimmed.toLocaleLowerCase();
		const existing = labels.find((label) => label.value.trim().toLocaleLowerCase() === normalized);

		if (existing) {
			selected = selected.some((item) => item.id === existing.id)
				? selected
				: [...selected, existing];
			query = '';
			return;
		}

		pendingQuery = currentTrimmed;
		openDialog = true;
	}

	function handleCreate() {
		const value = createInput ? createInput.value.trim() : '';
		if (!value) {
			return;
		}

		const normalized = value.toLocaleLowerCase();
		const baseId = normalized.replace(/\s+/g, '-');
		const existing = labels.find((l) => l.value.trim().toLocaleLowerCase() === normalized);

		if (existing) {
			selected = selected.some((i) => i.id === existing.id) ? selected : [...selected, existing];
			openDialog = false;
			query = '';
			return;
		}

		// Ensure we don't collide with an existing id (e.g., value "docs" vs. existing id "docs")
		const existingIds = new Set(labels.map((l) => l.id));
		let uniqueId = baseId;
		if (existingIds.has(uniqueId)) {
			let i = 2;
			while (existingIds.has(`${baseId}-${i}`)) {
				i += 1;
			}
			uniqueId = `${baseId}-${i}`;
		}

		const newItem: LabelItem = { id: uniqueId, value };

		if (!selected.find((item) => item.id === newItem.id)) {
			labels = [...labels, newItem];
			selected = [...selected, newItem];
		}

		openDialog = false;
		query = '';
	}

	const trimmed = $derived(query.trim());
	const lowered = $derived(trimmed.toLocaleLowerCase());
	const exactExists = $derived(labels.some((l) => l.value.trim().toLocaleLowerCase() === lowered));
	// Show the creatable item alongside matches if there's no exact match
	const itemsForView: LabelItem[] = $derived(
		trimmed !== '' && !exactExists
			? [...labels, { creatable: trimmed, id: `create:${lowered}`, value: `Create "${trimmed}"` }]
			: labels
	);
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

{#snippet PlusIcon()}
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
		<path d="M1.5 8h13M8 14.5v-13" />
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

<Combobox.Root
	items={itemsForView}
	multiple
	bind:value={selected}
	bind:inputValue={query}
	onValueChange={(next, eventDetails) => {
		const creatableSelection = next.find(
			(item) => item.creatable && !selected.some((current) => current.id === item.id)
		);

		if (creatableSelection && creatableSelection.creatable) {
			pendingQuery = creatableSelection.creatable;
			openDialog = true;
			eventDetails.cancel();
			return;
		}
		query = '';
	}}
	onItemHighlighted={(item) => {
		highlightedItem = item;
	}}
>
	<div class={styles.Container}>
		<label class={styles.Label} for={id}> Labels </label>
		<Combobox.InputGroup class={styles.InputGroup}>
			<Combobox.Value>
				{#snippet children(selectedValue)}
					{@const value = selectedValue as LabelItem[]}
					<Combobox.Chips
						class={styles.Chips}
						aria-label={value.length > 0 ? 'Selected labels' : undefined}
					>
						{#each value as label (label.id)}
							<Combobox.Chip class={styles.Chip} aria-label={label.value} {...chipProps}>
								{label.value}
								<Combobox.ChipRemove class={styles.ChipRemove} aria-label="Remove {label.value}">
									{@render XIcon()}
								</Combobox.ChipRemove>
							</Combobox.Chip>
						{/each}
						<Combobox.Input
							{id}
							placeholder={value.length > 0 ? '' : 'e.g. bug'}
							{...inputProps(value.length)}
							class={styles.Input}
							onkeydown={handleInputKeyDown}
						/>
					</Combobox.Chips>
				{/snippet}
			</Combobox.Value>
		</Combobox.InputGroup>
	</div>

	<Combobox.Portal>
		<Combobox.Positioner class={styles.Positioner} sideOffset={4}>
			<Combobox.Popup class={styles.Popup}>
				<Combobox.Empty>
					<div class={styles.Empty}>No labels found.</div>
				</Combobox.Empty>
				<Combobox.List>
					<Combobox.Collection>
						{#snippet children(item: LabelItem)}
							{#if item.creatable}
								<Combobox.Item value={item} class={styles.Item}>
									<span class={styles.ItemIndicator}>
										{@render PlusIcon()}
									</span>
									<span class={styles.ItemText}>Create "{item.creatable}"</span>
								</Combobox.Item>
							{:else}
								<Combobox.Item value={item} class={styles.Item}>
									<Combobox.ItemIndicator class={styles.ItemIndicator}>
										{@render CheckIcon()}
									</Combobox.ItemIndicator>
									<span class={styles.ItemText}>{item.value}</span>
								</Combobox.Item>
							{/if}
						{/snippet}
					</Combobox.Collection>
				</Combobox.List>
			</Combobox.Popup>
		</Combobox.Positioner>
	</Combobox.Portal>
</Combobox.Root>

<Dialog.Root bind:open={openDialog}>
	<Dialog.Portal>
		<Dialog.Backdrop class={styles.Backdrop} />
		<Dialog.Popup class={styles.DialogPopup} initialFocus={() => createInput}>
			<Dialog.Title class={styles.Title}>Create new label</Dialog.Title>
			<Dialog.Description class={styles.Description}>Add a new label to select.</Dialog.Description>
			<form
				onsubmit={(event) => {
					event.preventDefault();
					handleCreate();
				}}
			>
				<input
					bind:this={createInput}
					class={styles.TextField}
					placeholder="Label name"
					value={pendingQuery}
				/>
				<div class={styles.Actions}>
					<Dialog.Close class={styles.Button}>Cancel</Dialog.Close>
					<button type="submit" class={styles.Button}>Create</button>
				</div>
			</form>
		</Dialog.Popup>
	</Dialog.Portal>
</Dialog.Root>
