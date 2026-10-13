<!--
	Spec harness for the Combobox port of Base UI v1.9.0
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { Field, Form, type FieldRootProps, type FormProps } from '#lib';
	import ComboboxHarness from './ComboboxHarness.svelte';

	let {
		value = $bindable(),
		inputValue = $bindable(),
		open = $bindable(false),
		form,
		nativeForm = false,
		field = {},
		combobox = {},
		fieldLabel,
		description,
		error = true,
		errorMatch,
		errorText,
		submit = false,
		reset = false,
		mounted = true,
		fieldLabelSpan = false,
		labelAfter = false,
		onsubmit
	}: {
		value?: unknown;
		inputValue?: string;
		open?: boolean;
		/** Wraps the field in a `Form` with these props. */
		form?: Partial<FormProps> & Record<string, unknown>;
		/** Wraps the field in a plain `<form>` that does not navigate on submit. */
		nativeForm?: boolean;
		/** `false` renders the combobox without a `Field.Root`. */
		field?: (Partial<FieldRootProps> & Record<string, unknown>) | false;
		combobox?: Partial<ComponentProps<typeof ComboboxHarness>>;
		fieldLabel?: string;
		description?: string;
		error?: boolean;
		errorMatch?: ComponentProps<typeof Field.Error>['match'];
		/** Static error text, shown only while `errorMatch` matches. */
		errorText?: string;
		submit?: boolean;
		reset?: boolean;
		/** `false` unmounts the combobox, keeping the field. */
		mounted?: boolean;
		/** Renders Field.Label as a `<span>` with `nativeLabel={false}`. */
		fieldLabelSpan?: boolean;
		/** Renders Field.Label after the combobox. */
		labelAfter?: boolean;
		onsubmit?: (data: FormData) => void;
	} = $props();
</script>

{#snippet theCombobox()}
	<ComboboxHarness bind:value bind:inputValue bind:open {...combobox} />
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
	{#if field === false}
		{@render theCombobox()}
	{:else}
		<Field.Root data-testid="field" {...field}>
			{#if !labelAfter}{@render label()}{/if}
			{#if mounted}{@render theCombobox()}{/if}
			{#if labelAfter}{@render label()}{/if}
			{#if description}<Field.Description data-testid="description">{description}</Field.Description
				>{/if}
			{#if errorText}
				<Field.Error data-testid="error" match={errorMatch}>{errorText}</Field.Error>
			{:else if error}
				<Field.Error data-testid="error" />
			{/if}
		</Field.Root>
	{/if}
	{#if submit}<button type="submit" data-testid="submit">Submit</button>{/if}
	{#if reset}<button type="reset" data-testid="reset">Reset</button>{/if}
	<button type="button" data-testid="field-outside">Outside</button>
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
