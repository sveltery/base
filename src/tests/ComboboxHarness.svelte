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
		Input,
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
		chipProps = {},
		chipRemoveProps = {},
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
		refuseValue = false,
		mapValue,
		refuseOpen = false,
		rows,
		rowGroups,
		filteredItems,
		staticFilter,
		noInput = false,
		chipLimit,
		inputOnlyWhenOpen = false,
		inputElement,
		fieldAwareInput = false,
		onOuterKeydown,
		popupRenderId
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
		chipProps?: Record<string, unknown>;
		chipRemoveProps?: Record<string, unknown>;
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
		/** Binds `value` through a setter that stores this mapping of each write, as a parent remapping a change. */
		mapValue?: (next: unknown) => unknown;
		/** Binds `open` through a setter that ignores writes, as a parent ignoring a request. */
		refuseOpen?: boolean;
		/** Grid rows of item values, rendered without the root's `items` prop. */
		rows?: string[][];
		/** Groups of grid rows, each with an optional label. */
		rowGroups?: { label?: string; rows: string[][] }[];
		/** Derives the root's `filteredItems` from the bound input value and value, as a parent would. */
		filteredItems?: (inputValue: string, value: unknown) => unknown[];
		/** Renders only the static items this keeps for the bound input value, as a parent filtering its own children. */
		staticFilter?: (item: HarnessItem, inputValue: string) => boolean;
		/** Renders no input; with `trigger`, the trigger is the only control. */
		noInput?: boolean;
		/** Renders chips for only this many selected values. */
		chipLimit?: number;
		/** Renders the input only while the bound `open` is true. */
		inputOnlyWhenOpen?: boolean;
		/** Renders the input as a `<textarea>` or an `<input type="number">`. */
		inputElement?: 'textarea' | 'number';
		/** Renders the input through `Input`, which is itself field-aware. */
		fieldAwareInput?: boolean;
		/** Wraps everything in a `<div>` with this keydown listener. */
		onOuterKeydown?: (event: KeyboardEvent) => void;
		/** Renders the popup through a `render` snippet whose element sets this id. */
		popupRenderId?: string;
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
		{#if indicator}<Combobox.ItemIndicator
				{...indicatorProps}
				data-testid="indicator-{labelOf(entry)}"
			/>{/if}{labelOf(entry)}</Combobox.Item
	>
{/snippet}

{#snippet staticItem(entry: HarnessItem, index: number)}
	{#if separator && index > 0}<Combobox.Separator data-testid="separator" />{/if}
	<Combobox.Item
		value={entry.value}
		disabled={entry.disabled}
		data-testid={entry.testid}
		{...entry.props}
	>
		{#if indicator}<Combobox.ItemIndicator
				{...indicatorProps}
				data-testid="indicator-{entry.text ?? String(entry.value)}"
			/>{/if}{entry.text ?? String(entry.value)}</Combobox.Item
	>
{/snippet}

{#snippet gridRows(list: string[][])}
	{#each list as row, index (index)}
		<Combobox.Row>
			{#each row as cell (cell)}
				<Combobox.Item value={cell} data-testid="item-{cell}">{cell}</Combobox.Item>
			{/each}
		</Combobox.Row>
	{/each}
{/snippet}

{#snippet entries()}
	{#if items !== undefined || filteredItems}
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
	{:else if rows || rowGroups}
		{#if rows}{@render gridRows(rows)}{/if}
		{#each rowGroups ?? [] as group, index (index)}
			<Combobox.Group>
				{#if group.label}<Combobox.GroupLabel>{group.label}</Combobox.GroupLabel>{/if}
				{@render gridRows(group.rows)}
			</Combobox.Group>
		{/each}
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
			{#each staticFilter ? staticItems.filter( (entry) => staticFilter(entry, inputValue ?? '') ) : staticItems as entry, index (entry.value)}
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
	{#if inputElement === 'textarea'}
		<Combobox.Input data-testid="input" {...input}>
			{#snippet render(props)}<textarea {...props as Record<string, unknown>}></textarea>{/snippet}
		</Combobox.Input>
	{:else if inputElement === 'number'}
		<Combobox.Input data-testid="input" {...input}>
			{#snippet render(props)}<input {...props} type="number" />{/snippet}
		</Combobox.Input>
	{:else if fieldAwareInput}
		<Combobox.Input {...input}>
			{#snippet render(props)}<Input {...props} data-testid="input" />{/snippet}
		</Combobox.Input>
	{:else if !noInput && (!inputOnlyWhenOpen || open)}
		<Combobox.Input data-testid="input" {...input} />
	{/if}
{/snippet}

{#snippet popupContent()}
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
{/snippet}

{#snippet positioned()}
	{#if backdrop}<Combobox.Backdrop data-testid="backdrop" />{/if}
	<Combobox.Positioner data-testid="positioner" {...positioner}>
		{#if popupRenderId}
			<Combobox.Popup data-testid="popup" {...popup}>
				{#snippet render(props, _state, content)}
					<div {...props} id={popupRenderId}>{@render content?.()}</div>
				{/snippet}
				{@render popupContent()}
			</Combobox.Popup>
		{:else}
			<Combobox.Popup data-testid="popup" {...popup}>{@render popupContent()}</Combobox.Popup>
		{/if}
	</Combobox.Positioner>
{/snippet}

{#snippet control()}
	{#if chips}
		<Combobox.Chips data-testid="chips">
			{#each selectedValues.slice(0, chipLimit) as selected, index (index)}
				<Combobox.Chip data-testid="chip-{labelOf(selected)}" {...chipProps}>
					{labelOf(selected)}
					{#if chipRemove}
						<Combobox.ChipRemove
							data-testid="remove-{labelOf(selected)}"
							aria-label="Remove"
							{...chipRemoveProps}>x</Combobox.ChipRemove
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
		bind:value={
			() => value,
			(next) => {
				if (!refuseValue) value = mapValue ? mapValue(next) : next;
			}
		}
		bind:inputValue
		bind:open={
			() => open,
			(next) => {
				if (!refuseOpen) open = next;
			}
		}
		{...items !== undefined ? { items: items as never } : {}}
		{...filteredItems ? { filteredItems: filteredItems(inputValue ?? '', value) as never } : {}}
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

{#snippet directed()}
	{#if direction}
		<DirectionProvider {direction}>{@render comboboxBlock()}</DirectionProvider>
	{:else}
		{@render comboboxBlock()}
	{/if}
{/snippet}

{#if onOuterKeydown}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div data-testid="outer" onkeydown={onOuterKeydown}>{@render directed()}</div>
{:else}
	{@render directed()}
{/if}
