<!--
	Spec harness for the Autocomplete port of Base UI v1.9.0
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts" module>
	export interface AutocompleteHarnessItem {
		value: unknown;
		/** The rendered item text. Defaults to the value as a string. */
		text?: string;
	}
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import {
		Autocomplete,
		Field,
		Form,
		Input,
		type AutocompleteInputProps,
		type AutocompletePortalProps,
		type AutocompleteRootProps,
		type FieldRootProps,
		type FormProps
	} from '#lib';

	let {
		value = $bindable(),
		open = $bindable(false),
		root = {},
		items,
		staticItems = [],
		itemLabel,
		itemProps = {},
		input = {},
		noInput = false,
		inputInside = false,
		inline = false,
		inputGroup = false,
		trigger = false,
		clear = false,
		empty,
		separator = false,
		portal = {},
		listProps = {},
		popupLess = false,
		fieldAwareInput = false,
		valueChildren,
		valueText = false,
		field,
		fieldLabel,
		fieldLabelSpan = false,
		description,
		errorMatch,
		errorText,
		form,
		nativeForm = false,
		onsubmit,
		submit = false,
		outside = false,
		refuseValue = false,
		api
	}: {
		value?: string | null;
		open?: boolean;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any -- specs pass typed item callbacks
		root?: Partial<AutocompleteRootProps<any>> & Record<string, unknown>;
		/** Passed as the root's `items` and rendered through `Autocomplete.Collection`. */
		items?: unknown[];
		/** Rendered as items without the root's `items` prop. */
		staticItems?: AutocompleteHarnessItem[];
		/** The rendered text of an `items` entry. */
		itemLabel?: (item: never) => string;
		/** Extra props spread on each item. */
		itemProps?: Record<string, unknown>;
		input?: Partial<AutocompleteInputProps> & Record<string, unknown>;
		noInput?: boolean;
		/** Renders the input inside the popup and a trigger with the value outside it. */
		inputInside?: boolean;
		/** Renders the list without a popup. */
		inline?: boolean;
		inputGroup?: boolean;
		trigger?: boolean;
		clear?: boolean;
		empty?: string;
		separator?: boolean;
		portal?: Partial<AutocompletePortalProps>;
		listProps?: HTMLAttributes<HTMLDivElement> & Record<string, unknown>;
		/** Renders an empty positioner, without a popup or list. */
		popupLess?: boolean;
		/** Renders the input through `Input`, which is itself field-aware. */
		fieldAwareInput?: boolean;
		valueChildren?: Snippet<[value: string]>;
		/** Renders `Autocomplete.Value` in a span outside the trigger. */
		valueText?: boolean;
		/** Wraps the autocomplete in a `Field.Root` with these props. */
		field?: Partial<FieldRootProps> & Record<string, unknown>;
		fieldLabel?: string;
		/** Renders Field.Label as a `<span>` with `nativeLabel={false}`. */
		fieldLabelSpan?: boolean;
		description?: string;
		errorMatch?: 'valueMissing';
		/** Error text. Without `errorMatch` the error shows the field's own message. */
		errorText?: string;
		/** Wraps everything in a `Form` with these props. */
		form?: Partial<FormProps> & Record<string, unknown>;
		/** Wraps everything in a plain `<form>` whose submit calls `onsubmit`. */
		nativeForm?: boolean;
		onsubmit?: (data: FormData) => void;
		submit?: boolean;
		/** Renders a button after the autocomplete. */
		outside?: boolean;
		/** Binds `value` through a setter that ignores writes, as a parent refusing a change. */
		refuseValue?: boolean;
		/** Receives the root's `close` and `unmount`, for a test that also binds props. */
		api?: (methods: { close(): void; unmount(): void }) => void;
	} = $props();

	function labelOf(item: unknown): string {
		if (itemLabel) return itemLabel(item as never);
		if (item && typeof item === 'object' && 'label' in item) return String(item.label);
		if (item && typeof item === 'object' && 'value' in item) return String(item.value);
		return String(item);
	}

	let autocomplete = $state<{ close(): void; unmount(): void }>();

	// svelte-ignore state_referenced_locally
	api?.({ close: () => autocomplete?.close(), unmount: () => autocomplete?.unmount() });

	export function close() {
		autocomplete?.close();
	}

	export function unmount() {
		autocomplete?.unmount();
	}
</script>

{#snippet entries()}
	{#if items !== undefined}
		<Autocomplete.Collection>
			{#snippet children(entry: unknown)}
				<Autocomplete.Item value={entry} {...itemProps}>{labelOf(entry)}</Autocomplete.Item>
			{/snippet}
		</Autocomplete.Collection>
	{:else}
		{#each staticItems as entry, index (entry.value)}
			{#if separator && index > 0}<Autocomplete.Separator data-testid="separator" />{/if}
			<Autocomplete.Item value={entry.value} {...itemProps}
				>{entry.text ?? String(entry.value)}</Autocomplete.Item
			>
		{/each}
	{/if}
{/snippet}

{#snippet list()}
	{#if empty !== undefined}<Autocomplete.Empty data-testid="empty">{empty}</Autocomplete.Empty>{/if}
	<Autocomplete.List {...listProps}>{@render entries()}</Autocomplete.List>
{/snippet}

{#snippet theInput()}
	{#if fieldAwareInput}
		<Autocomplete.Input {...input}>
			{#snippet render(props)}<Input {...props} data-testid="input" />{/snippet}
		</Autocomplete.Input>
	{:else if !noInput}
		<Autocomplete.Input data-testid="input" {...input} />
	{/if}
{/snippet}

{#snippet control()}
	{@render theInput()}
	{#if clear}<Autocomplete.Clear data-testid="clear" aria-label="Clear" />{/if}
	{#if trigger}<Autocomplete.Trigger data-testid="trigger" aria-label="Open" />{/if}
{/snippet}

{#snippet theAutocomplete()}
	<Autocomplete.Root
		bind:this={autocomplete}
		bind:value={
			() => value,
			(next) => {
				if (!refuseValue) value = next;
			}
		}
		bind:open
		{...items !== undefined ? { items } : {}}
		{inline}
		{...root}
	>
		{#if inputInside}
			<Autocomplete.Trigger data-testid="trigger">
				<Autocomplete.Value children={valueChildren} />
			</Autocomplete.Trigger>
		{:else if inputGroup}
			<Autocomplete.InputGroup data-testid="input-group"
				>{@render control()}</Autocomplete.InputGroup
			>
		{:else}
			{@render control()}
		{/if}
		{#if valueText}<span data-testid="value"><Autocomplete.Value children={valueChildren} /></span
			>{/if}
		{#if inline}
			{@render list()}
		{:else if popupLess}
			<Autocomplete.Portal {...portal}><Autocomplete.Positioner /></Autocomplete.Portal>
		{:else}
			<Autocomplete.Portal {...portal}>
				<Autocomplete.Positioner data-testid="positioner">
					<Autocomplete.Popup data-testid="popup" aria-label="Suggestions">
						{#if inputInside}{@render theInput()}{/if}
						{@render list()}
					</Autocomplete.Popup>
				</Autocomplete.Positioner>
			</Autocomplete.Portal>
		{/if}
	</Autocomplete.Root>
{/snippet}

{#snippet label()}
	{#if fieldLabelSpan}
		<Field.Label data-testid="field-label" nativeLabel={false}>
			{#snippet render(props)}<span {...props}>{fieldLabel}</span>{/snippet}
		</Field.Label>
	{:else if fieldLabel !== undefined}
		<Field.Label data-testid="field-label">{fieldLabel}</Field.Label>
	{/if}
{/snippet}

{#snippet content()}
	{#if field}
		<Field.Root data-testid="field" {...field}>
			{@render theAutocomplete()}
			{@render label()}
			{#if description}<Field.Description data-testid="description">{description}</Field.Description
				>{/if}
			{#if errorText}
				<Field.Error data-testid="error" match={errorMatch}>{errorText}</Field.Error>
			{:else}
				<Field.Error data-testid="error" />
			{/if}
		</Field.Root>
	{:else}
		{@render theAutocomplete()}
	{/if}
	{#if submit}<button type="submit" data-testid="submit">Submit</button>{/if}
	{#if outside}<button type="button" data-testid="outside">Outside</button>{/if}
{/snippet}

{#if form}
	<Form data-testid="form" {...form}>{@render content()}</Form>
{:else if nativeForm}
	<form
		data-testid="form"
		onsubmit={(event) => {
			event.preventDefault();
			onsubmit?.(new FormData(event.currentTarget));
		}}
	>
		{@render content()}
	</form>
{:else}
	{@render content()}
{/if}
