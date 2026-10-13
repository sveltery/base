<!--
	Spec harness for the Combobox port of Base UI v1.9.0
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
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
		| 'field-disabled-chips'
		| 'live-region'
		| 'orphan'
		| 'group-labels'
		| 'indicator'
		| 'touch-popup'
		| 'group-without-items';

	let {
		scenario,
		showTrigger = true,
		root = {},
		part = 'status',
		text,
		custom = false,
		orphan = 'indicator',
		labels = 'old',
		value,
		keepMounted = false,
		popupProps = {},
		labelProps = {}
	}: {
		scenario: Scenario;
		showTrigger?: boolean;
		root?: Record<string, unknown>;
		/** The live region a `live-region` scenario renders in the popup. */
		part?: 'status' | 'empty';
		text?: string;
		/** Renders the live region through a `render` snippet with a `<p>`. */
		custom?: boolean;
		/** The part an `orphan` scenario renders inside the root but outside its own provider. */
		orphan?: 'indicator' | 'group-label' | 'popup' | 'arrow';
		/** Which of the two group labels a `group-labels` scenario renders. */
		labels?: 'old' | 'both' | 'new';
		value?: string;
		keepMounted?: boolean;
		popupProps?: Record<string, unknown>;
		labelProps?: Record<string, unknown>;
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
			<Combobox.InputGroup data-testid="input-group" style="padding: 10px">
				<Combobox.Chips data-testid="chips">
					<Combobox.Chip>apple</Combobox.Chip>
					<Combobox.Input data-testid="input" />
				</Combobox.Chips>
			</Combobox.InputGroup>
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
{:else if scenario === 'live-region'}
	<Combobox.Root {...root}>
		<Combobox.Input data-testid="input" />
		<Combobox.Portal>
			<Combobox.Positioner>
				<Combobox.Popup>
					{#if custom}
						{@const Region = part === 'status' ? Combobox.Status : Combobox.Empty}
						<Region>
							{#snippet render(props, _state, content)}
								<p {...props} data-testid="custom">{@render content?.()}</p>
							{/snippet}
							{text}
						</Region>
					{:else if part === 'status'}
						<Combobox.Status data-testid="status">{text}</Combobox.Status>
					{:else}
						<Combobox.Empty data-testid="empty">{text}</Combobox.Empty>
					{/if}
					<Combobox.List>
						{#if root.items}
							<Combobox.Collection>
								{#snippet children(item: string)}
									<Combobox.Item value={item}>{item}</Combobox.Item>
								{/snippet}
							</Combobox.Collection>
						{:else}
							<Combobox.Item value="a">a</Combobox.Item>
						{/if}
					</Combobox.List>
				</Combobox.Popup>
			</Combobox.Positioner>
		</Combobox.Portal>
	</Combobox.Root>
{:else if scenario === 'orphan'}
	<Combobox.Root {...root}>
		{#if orphan === 'indicator'}<Combobox.ItemIndicator />
		{:else if orphan === 'group-label'}<Combobox.GroupLabel />
		{:else if orphan === 'popup'}<Combobox.Popup />
		{:else}<Combobox.Arrow />{/if}
	</Combobox.Root>
{:else if scenario === 'group-labels'}
	<Combobox.Root open {...root}>
		<Combobox.Group>
			{#if labels !== 'new'}<Combobox.GroupLabel id="old-label" {...labelProps}
					>Old</Combobox.GroupLabel
				>{/if}
			{#if labels !== 'old'}<Combobox.GroupLabel id="new-label" {...labelProps}
					>New</Combobox.GroupLabel
				>{/if}
		</Combobox.Group>
	</Combobox.Root>
{:else if scenario === 'indicator'}
	<Combobox.Root {value} open {...root}>
		<Combobox.Input />
		<Combobox.Portal>
			<Combobox.Positioner>
				<Combobox.Popup>
					<Combobox.List>
						<Combobox.Item value="a">
							a
							<Combobox.ItemIndicator {keepMounted} data-testid="indicator" />
						</Combobox.Item>
						<Combobox.Item value="b">b</Combobox.Item>
					</Combobox.List>
				</Combobox.Popup>
			</Combobox.Positioner>
		</Combobox.Portal>
	</Combobox.Root>
{:else if scenario === 'touch-popup'}
	<Combobox.Root {...root}>
		<Combobox.Trigger data-testid="trigger">Open</Combobox.Trigger>
		<Combobox.Portal>
			<Combobox.Positioner>
				<Combobox.Popup data-testid="popup" {...popupProps}>
					<Combobox.Input data-testid="input" />
				</Combobox.Popup>
			</Combobox.Positioner>
		</Combobox.Portal>
	</Combobox.Root>
{:else if scenario === 'group-without-items'}
	<Combobox.Root open {...root}>
		<Combobox.Portal>
			<Combobox.Positioner>
				<Combobox.Popup>
					<Combobox.List>
						<Combobox.Group data-testid="group"
							><Combobox.Collection
								>{#snippet children(item: string)}<span>{item}</span>{/snippet}</Combobox.Collection
							></Combobox.Group
						>
					</Combobox.List>
				</Combobox.Popup>
			</Combobox.Positioner>
		</Combobox.Portal>
	</Combobox.Root>
{/if}
