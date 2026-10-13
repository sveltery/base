<script lang="ts">
	import { Combobox, Field } from '#lib';

	type Scenario =
		| 'textarea-reference'
		| 'div-trigger'
		| 'toggle-trigger'
		| 'remove-outside-chip'
		| 'div-chip-remove'
		| 'chips-popup-input'
		| 'clear-outside-popup-input'
		| 'popup-clear'
		| 'field-disabled-chips';

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
{:else if scenario === 'clear-outside-popup-input'}
	<Combobox.Root items={['a', 'b']} defaultValue="a" {...root}>
		<Combobox.Trigger><Combobox.Value /></Combobox.Trigger>
		<Combobox.Clear data-testid="clear" />
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
{:else if scenario === 'popup-clear'}
	<Combobox.Root defaultValue="a" {...root}>
		<Combobox.Trigger data-testid="trigger"><Combobox.Value placeholder="None" /></Combobox.Trigger>
		<Combobox.Portal>
			<Combobox.Positioner data-testid="positioner">
				<Combobox.Popup>
					<Combobox.Input data-testid="input" />
					<Combobox.Clear keepMounted data-testid="clear" />
					<Combobox.List><Combobox.Item value="a">a</Combobox.Item></Combobox.List>
				</Combobox.Popup>
			</Combobox.Positioner>
		</Combobox.Portal>
	</Combobox.Root>
{:else if scenario === 'field-disabled-chips'}
	<Field.Root disabled>
		<Combobox.Root items={['apple', 'banana']} multiple defaultValue={['apple']} {...root}>
			<Combobox.Chips data-testid="chips">
				<Combobox.Chip>apple</Combobox.Chip>
				<Combobox.Input data-testid="input" />
			</Combobox.Chips>
			<Combobox.Portal>
				<Combobox.Positioner>
					<Combobox.Popup>
						<Combobox.List>
							<Combobox.Item value="apple">apple</Combobox.Item>
							<Combobox.Item value="banana">banana</Combobox.Item>
						</Combobox.List>
					</Combobox.Popup>
				</Combobox.Positioner>
			</Combobox.Portal>
		</Combobox.Root>
	</Field.Root>
{/if}
