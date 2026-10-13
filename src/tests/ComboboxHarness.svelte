<script lang="ts" module>
	export interface HarnessItem {
		value: unknown;
		/** The rendered item text. Defaults to the value as a string. */
		text?: string;
		disabled?: boolean;
		testid?: string;
		/** Extra props spread on the item. */
		props?: Record<string, unknown>;
	}

	export interface HarnessGroup {
		value: string;
		items: unknown[];
	}
</script>

<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import ComboboxProbe from './ComboboxProbe.svelte';
	import {
		Combobox,
		DirectionProvider,
		Popover,
		type ComboboxClearProps,
		type ComboboxInputProps,
		type ComboboxItemIndicatorProps,
		type ComboboxPopupProps,
		type ComboboxPortalProps,
		type ComboboxPositionerProps,
		type ComboboxRootProps,
		type ComboboxTriggerProps,
		type ComboboxValueProps,
		type TextDirection
	} from '#lib';

	let {
		value = $bindable(),
		inputValue = $bindable(),
		open = $bindable(false),
		root = {},
		items,
		staticItems = [],
		itemLabel,
		input = {},
		inputInside = false,
		inline = false,
		trigger = false,
		triggerProps = {},
		clear = false,
		clearProps = {},
		chips = false,
		chipRemove = true,
		inputGroup = false,
		empty,
		status,
		valueText = false,
		valueProps = {},
		indicator = false,
		indicatorProps = {},
		label,
		positioner = {},
		popup = {},
		portal = {},
		listProps = {},
		arrow = false,
		backdrop = false,
		icon = false,
		separator = false,
		around = false,
		direction,
		noPortal = false,
		probe = false,
		popupExtra,
		inputWrapper = false,
		api,
		staticGroups,
		refuseValue = false
	}: {
		value?: unknown;
		inputValue?: string;
		open?: boolean;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any -- specs pass typed item callbacks
		root?: Partial<ComboboxRootProps<any, boolean, any>> & Record<string, unknown>;
		/** Passed as the root's `items` and rendered through `Combobox.Collection`. */
		items?: unknown;
		/** Rendered as items without the root's `items` prop. */
		staticItems?: HarnessItem[];
		/** The rendered text of an `items` entry. */
		itemLabel?: (item: never) => string;
		input?: Partial<ComboboxInputProps> & Record<string, unknown>;
		/** Renders the input inside the popup and a trigger with the value outside it. */
		inputInside?: boolean;
		/** Renders the list without a popup. */
		inline?: boolean;
		trigger?: boolean;
		triggerProps?: Partial<ComboboxTriggerProps> & Record<string, unknown>;
		clear?: boolean;
		clearProps?: Partial<ComboboxClearProps> & Record<string, unknown>;
		/** Renders the selected values as chips around the input. */
		chips?: boolean;
		chipRemove?: boolean;
		inputGroup?: boolean;
		empty?: string;
		status?: string;
		valueText?: boolean;
		valueProps?: Partial<ComboboxValueProps>;
		indicator?: boolean;
		indicatorProps?: Partial<ComboboxItemIndicatorProps> & Record<string, unknown>;
		label?: string;
		positioner?: Partial<ComboboxPositionerProps> & Record<string, unknown>;
		popup?: Partial<ComboboxPopupProps> & Record<string, unknown>;
		portal?: Partial<ComboboxPortalProps>;
		listProps?: HTMLAttributes<HTMLDivElement> & Record<string, unknown>;
		arrow?: boolean;
		backdrop?: boolean;
		icon?: boolean;
		separator?: boolean;
		/** Renders an input before the combobox, and an input and a button after it. */
		around?: boolean;
		direction?: TextDirection;
		/** Renders the positioner inline, without `Combobox.Portal`. */
		noPortal?: boolean;
		/** Renders the active and selected indices and a button that clears the highlight. */
		probe?: boolean;
		/** Extra content after the popup input: a control or a nested popover. */
		popupExtra?: 'button' | 'popover';
		/** Wraps the input and trigger in a padded `<div>` with a text span. */
		inputWrapper?: boolean;
		/** Receives the root's `close` and `unmount`, for a test that also binds props. */
		api?: (methods: { close(): void; unmount(): void }) => void;
		/** Grouped items rendered without the root's `items` prop. */
		staticGroups?: { label: string; items: HarnessItem[] }[];
		/** Binds `value` through a setter that ignores writes, as a parent refusing a change. */
		refuseValue?: boolean;
	} = $props();


	function labelOf(item: unknown): string {
		if (itemLabel) return itemLabel(item as never);
		if (item && typeof item === 'object' && 'label' in item) return String(item.label);
		return String(item);
	}

	function isGroup(entry: unknown): entry is HarnessGroup {
		return Boolean(entry && typeof entry === 'object' && 'items' in entry);
	}

	const grouped = $derived(Array.isArray(items) && items.length > 0 && isGroup(items[0]));
	const selectedValues = $derived(Array.isArray(value) ? (value as unknown[]) : []);

	let combobox = $state<{ close(): void; unmount(): void }>();

	// svelte-ignore state_referenced_locally
	api?.({ close: () => combobox?.close(), unmount: () => combobox?.unmount() });

	export function close() {
		combobox?.close();
	}

	export function unmount() {
		combobox?.unmount();
	}
</script>

{#snippet itemFor(entry: unknown)}
	<Combobox.Item value={entry} data-testid="item-{labelOf(entry)}">
		{#if indicator}
			<Combobox.ItemIndicator {...indicatorProps} data-testid="indicator-{labelOf(entry)}" />
		{/if}
		{labelOf(entry)}
	</Combobox.Item>
{/snippet}

{#snippet staticItem(entry: HarnessItem, index: number)}
	{#if separator && index > 0}<Combobox.Separator data-testid="separator" />{/if}
	<Combobox.Item
		value={entry.value}
		disabled={entry.disabled}
		data-testid={entry.testid}
		{...entry.props}
	>
		{#if indicator}
			<Combobox.ItemIndicator
				{...indicatorProps}
				data-testid="indicator-{entry.text ?? String(entry.value)}"
			/>
		{/if}
		{entry.text ?? String(entry.value)}
	</Combobox.Item>
{/snippet}

{#snippet entries()}
	{#if items !== undefined}
		{#if grouped}
			<Combobox.Collection>
				{#snippet children(group: HarnessGroup, index)}
					{#if separator && index > 0}<Combobox.Separator data-testid="separator" />{/if}
					<Combobox.Group items={group.items} data-testid="group-{group.value}">
						<Combobox.GroupLabel>{group.value}</Combobox.GroupLabel>
						<Combobox.Collection>
							{#snippet children(entry: unknown)}{@render itemFor(entry)}{/snippet}
						</Combobox.Collection>
					</Combobox.Group>
				{/snippet}
			</Combobox.Collection>
		{:else}
			<Combobox.Collection>
				{#snippet children(entry: unknown)}{@render itemFor(entry)}{/snippet}
			</Combobox.Collection>
		{/if}
	{:else}
		{#if staticGroups}
			{#each staticGroups as group (group.label)}
				<Combobox.Group data-testid="group-{group.label}">
					<Combobox.GroupLabel>{group.label}</Combobox.GroupLabel>
					{#each group.items as entry, index (entry.value)}
						{@render staticItem(entry, index)}
					{/each}
				</Combobox.Group>
			{/each}
		{:else}
			{#each staticItems as entry, index (entry.value)}
				{@render staticItem(entry, index)}
			{/each}
		{/if}
	{/if}
{/snippet}

{#snippet list()}
	{#if empty !== undefined}<Combobox.Empty data-testid="empty">{empty}</Combobox.Empty>{/if}
	<Combobox.List data-testid="list" {...listProps}>{@render entries()}</Combobox.List>
{/snippet}

{#snippet theInput()}
	<Combobox.Input data-testid="input" {...input} />
{/snippet}

{#snippet positioned()}
	{#if backdrop}<Combobox.Backdrop data-testid="backdrop" />{/if}
	<Combobox.Positioner data-testid="positioner" {...positioner}>
		<Combobox.Popup data-testid="popup" {...popup}>
			{#if arrow}<Combobox.Arrow data-testid="arrow" />{/if}
			{#if inputInside}{@render theInput()}{/if}
			{#if popupExtra === 'button'}<button type="button">Extra control</button>{/if}
			{@render list()}
			{#if popupExtra === 'popover'}
				<Popover.Root>
					<Popover.Trigger>Open nested popover</Popover.Trigger>
					<Popover.Portal>
						<Popover.Positioner>
							<Popover.Popup>
								<button type="button">Nested focusable content</button>
							</Popover.Popup>
						</Popover.Positioner>
					</Popover.Portal>
				</Popover.Root>
			{/if}
		</Combobox.Popup>
	</Combobox.Positioner>
{/snippet}

{#snippet control()}
	{#if chips}
		<Combobox.Chips data-testid="chips">
			{#each selectedValues as selected, index (index)}
				<Combobox.Chip data-testid="chip-{labelOf(selected)}">
					{labelOf(selected)}
					{#if chipRemove}
						<Combobox.ChipRemove data-testid="remove-{labelOf(selected)}" aria-label="Remove"
							>x</Combobox.ChipRemove
						>
					{/if}
				</Combobox.Chip>
			{/each}
			{@render theInput()}
		</Combobox.Chips>
	{:else}
		{@render theInput()}
	{/if}
	{#if clear}<Combobox.Clear data-testid="clear" {...clearProps} />{/if}
	{#if trigger}
		<Combobox.Trigger data-testid="trigger" {...triggerProps}>
			{#if icon}<Combobox.Icon data-testid="icon" />{/if}
		</Combobox.Trigger>
	{/if}
{/snippet}

{#snippet comboboxBlock()}
	{#if around}<input data-testid="before" aria-label="before" />{/if}
	<Combobox.Root
		bind:this={combobox}
		bind:value={() => value, (next) => {
			if (!refuseValue) value = next;
		}}
		bind:inputValue
		bind:open
		{...items !== undefined ? { items: items as never } : {}}
		{inline}
		{...root}
	>
		{#if label}<Combobox.Label data-testid="label">{label}</Combobox.Label>{/if}
		{#if inputInside}
			<Combobox.Trigger data-testid="trigger" {...triggerProps}>
				<Combobox.Value {...valueProps} />
				{#if icon}<Combobox.Icon data-testid="icon" />{/if}
			</Combobox.Trigger>
		{:else if inputGroup}
			<Combobox.InputGroup data-testid="input-group">{@render control()}</Combobox.InputGroup>
		{:else if inputWrapper}
			<div style="padding: 10px">
				<span data-testid="pad">padding</span>
				{@render control()}
			</div>
		{:else}
			{@render control()}
		{/if}
		{#if valueText}<span data-testid="value"><Combobox.Value {...valueProps} /></span>{/if}
		{#if status !== undefined}<Combobox.Status data-testid="status">{status}</Combobox.Status>{/if}
		{#if probe}<ComboboxProbe />{/if}
		{#if inline}
			{@render list()}
		{:else if noPortal}
			{@render positioned()}
		{:else}
			<Combobox.Portal {...portal}>{@render positioned()}</Combobox.Portal>
		{/if}
	</Combobox.Root>
	{#if around}
		<input data-testid="after" aria-label="after" />
		<button type="button" data-testid="outside">Outside</button>
	{/if}
{/snippet}

{#if direction}
	<DirectionProvider {direction}>{@render comboboxBlock()}</DirectionProvider>
{:else}
	{@render comboboxBlock()}
{/if}
