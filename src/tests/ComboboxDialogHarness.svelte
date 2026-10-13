<script lang="ts">
	import { onMount } from 'svelte';
	import { Combobox, Dialog } from '#lib';

	let {
		pattern,
		multiple = false,
		open = $bindable(false),
		onValueChange,
		onItemHighlighted
	}: {
		/**
		 * `keep-mounted` shares a bound `open` between an inline combobox and a kept-mounted dialog,
		 * `unbound` nests an inline combobox in an uncontrolled dialog, `async` enables a combobox in an
		 * open dialog after a timeout, and `multiple` and `single` are the dialog patterns of the docs.
		 */
		pattern: 'keep-mounted' | 'unbound' | 'async' | 'multiple' | 'single';
		multiple?: boolean;
		open?: boolean;
		onValueChange?: (value: unknown) => void;
		onItemHighlighted?: (...args: never[]) => void;
	} = $props();

	const fruits = ['Apple', 'Apricot', 'Banana', 'Grape', 'Orange'];
	// Positioned, so the popup paints above the dialog's fixed internal backdrop.
	const above = 'position: relative';
	let loading = $state(true);
	let asyncValue = $state<string | null>(null);

	onMount(() => {
		if (pattern !== 'async') return;
		// eslint-disable-next-line sveltery/no-unscoped-timer -- the async load the test waits for
		const timeout = setTimeout(() => (loading = false), 0);
		return () => clearTimeout(timeout);
	});
</script>

{#snippet itemList()}
	<Combobox.List>
		<Combobox.Collection>
			{#snippet children(item: string)}
				<Combobox.Item value={item}>{item}</Combobox.Item>
			{/snippet}
		</Combobox.Collection>
	</Combobox.List>
{/snippet}

{#if pattern === 'keep-mounted'}
	<Combobox.Root
		inline
		{multiple}
		items={['Apple', 'Banana']}
		bind:open
		{onItemHighlighted}
		onValueChange={(value) => {
			onValueChange?.(value);
			open = false;
		}}
	>
		<Dialog.Root bind:open>
			<Dialog.Trigger>Choose fruit</Dialog.Trigger>
			<Dialog.Portal keepMounted>
				<Dialog.Popup
					aria-label="Fruit chooser"
					style="position: relative; opacity: {open ? 1 : 0}; transition: opacity 50ms"
				>
					<Combobox.Input />
					{@render itemList()}
					<Dialog.Close>Done</Dialog.Close>
				</Dialog.Popup>
			</Dialog.Portal>
		</Dialog.Root>
	</Combobox.Root>
{:else if pattern === 'unbound'}
	<Combobox.Root inline items={['Apple', 'Banana', 'Cherry']}>
		<Dialog.Root>
			<Dialog.Trigger>Choose fruit</Dialog.Trigger>
			<Dialog.Portal>
				<Dialog.Popup aria-label="Fruit chooser" style={above}>
					<Combobox.Input />
					{@render itemList()}
				</Dialog.Popup>
			</Dialog.Portal>
		</Dialog.Root>
	</Combobox.Root>
{:else if pattern === 'async'}
	<Dialog.Root open>
		<Dialog.Portal>
			<Dialog.Backdrop />
			<Dialog.Popup style={above}>
				<form>
					<label for="name">Name</label>
					<input id="name" disabled={loading} />

					<label for="fruit">Fruit</label>
					<Combobox.Root items={['apple', 'banana', 'cherry']} bind:value={asyncValue} disabled={loading}>
						<Combobox.Input id="fruit" placeholder="Select fruit..." />
						<Combobox.Trigger aria-label="Open" />
						<Combobox.Portal>
							<Combobox.Positioner>
								<Combobox.Popup>{@render itemList()}</Combobox.Popup>
							</Combobox.Positioner>
						</Combobox.Portal>
					</Combobox.Root>

					<button type="button">Cancel</button>
					<button type="submit" disabled={loading}>Save</button>
				</form>
			</Dialog.Popup>
		</Dialog.Portal>
	</Dialog.Root>
{:else if pattern === 'multiple'}
	<Combobox.Root multiple items={fruits} inline>
		<Dialog.Root bind:open>
			<Dialog.Trigger>Trigger</Dialog.Trigger>
			<Dialog.Portal>
				<Dialog.Popup aria-label="Fruit chooser" style={above}>
					<Combobox.Chips>
						<Combobox.Input data-testid="dialog-input" />
						{@render itemList()}
					</Combobox.Chips>
				</Dialog.Popup>
			</Dialog.Portal>
		</Dialog.Root>
	</Combobox.Root>
{:else}
	<Combobox.Root items={fruits} bind:open inline>
		<Dialog.Root bind:open>
			<Dialog.Trigger data-testid="dialog-trigger">
				<Combobox.Value>
					{#snippet children(value: unknown)}{value == null ? 'Select a fruit' : String(value)}{/snippet}
				</Combobox.Value>
			</Dialog.Trigger>
			<Dialog.Portal>
				<Dialog.Popup aria-label="Fruit chooser" style={above}>
					<div>
						<label for="dialog-fruit">Fruit</label>
						<Combobox.Input id="dialog-fruit" data-testid="dialog-input" placeholder="e.g. Apple" />
					</div>
					{@render itemList()}
					<Dialog.Close>Done</Dialog.Close>
				</Dialog.Popup>
			</Dialog.Portal>
		</Dialog.Root>
	</Combobox.Root>
{/if}
