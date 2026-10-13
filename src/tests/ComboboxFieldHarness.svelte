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
		onsubmit?: (data: FormData) => void;
	} = $props();
</script>

{#snippet theCombobox()}
	<ComboboxHarness bind:value bind:inputValue bind:open {...combobox} />
{/snippet}

{#snippet content()}
	{#if field === false}
		{@render theCombobox()}
	{:else}
		<Field.Root data-testid="field" {...field}>
			{#if fieldLabel !== undefined}
				<Field.Label data-testid="field-label">{fieldLabel}</Field.Label>
			{/if}
			{@render theCombobox()}
			{#if description}<Field.Description data-testid="description"
					>{description}</Field.Description
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
