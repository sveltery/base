<script lang="ts">
	import { Combobox } from '#lib';

	type Scenario =
		| 'textarea-reference'
		| 'div-trigger'
		| 'toggle-trigger'
		| 'remove-outside-chip'
		| 'div-chip-remove'
		| 'chips-popup-input';

	let {
		scenario,
		showTrigger = true,
		root = {}
	}: {
		scenario: Scenario;
		showTrigger?: boolean;
		root?: Record<string, unknown>;
	} = $props();
</script>

{#if scenario === 'textarea-reference'}
	<Combobox.Root {...root}>
		<Combobox.Trigger>Open</Combobox.Trigger>
		<textarea aria-label="notes"></textarea>
	</Combobox.Root>
{:else if scenario === 'div-trigger'}
	<Combobox.Root {...root}>
		<Combobox.Trigger disabled nativeButton={false} data-testid="trigger">
			{#snippet render(props)}<div {...props}></div>{/snippet}
		</Combobox.Trigger>
	</Combobox.Root>
{:else if scenario === 'toggle-trigger'}
	<Combobox.Root {...root}>
		{#if showTrigger}<Combobox.Trigger data-testid="trigger" />{/if}
		<Combobox.Portal>
			<Combobox.Positioner>
				<Combobox.Popup><Combobox.Input /></Combobox.Popup>
			</Combobox.Positioner>
		</Combobox.Portal>
	</Combobox.Root>
{:else if scenario === 'remove-outside-chip'}
	<Combobox.Root multiple {...root}>
		<Combobox.Chips><Combobox.ChipRemove /></Combobox.Chips>
	</Combobox.Root>
{:else if scenario === 'div-chip-remove'}
	<Combobox.Root multiple defaultValue={['apple']} {...root}>
		<Combobox.Chips>
			<Combobox.Chip>
				apple
				<Combobox.ChipRemove data-testid="remove" nativeButton={false}>
					{#snippet render(props)}<div {...props as Record<string, unknown>}></div>{/snippet}
				</Combobox.ChipRemove>
			</Combobox.Chip>
		</Combobox.Chips>
	</Combobox.Root>
{:else if scenario === 'chips-popup-input'}
	<Combobox.Root items={['apple', 'banana']} multiple defaultValue={['apple']} {...root}>
		<Combobox.Chips>
			<Combobox.Value>
				{#snippet children(value)}
					{#each value as string[] as item (item)}
						<Combobox.Chip>
							{item}
							<Combobox.ChipRemove data-testid="remove-{item}" />
						</Combobox.Chip>
					{/each}
				{/snippet}
			</Combobox.Value>
		</Combobox.Chips>
		<Combobox.Trigger>Open</Combobox.Trigger>
		<Combobox.Portal>
			<Combobox.Positioner>
				<Combobox.Popup>
					<Combobox.Input data-testid="input" />
					<Combobox.List>
						<Combobox.Collection>
							{#snippet children(item: string)}
								<Combobox.Item value={item}>{item}</Combobox.Item>
							{/snippet}
						</Combobox.Collection>
					</Combobox.List>
				</Combobox.Popup>
			</Combobox.Positioner>
		</Combobox.Portal>
	</Combobox.Root>
{/if}
