<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { Field, Form, type FieldRootProps, type FormProps } from '#lib';
	import SelectHarness from './SelectHarness.svelte';

	let {
		value = $bindable(),
		open = $bindable(false),
		form,
		field = {},
		select = {},
		fieldLabel,
		description,
		error = true,
		errorMatch,
		errorText,
		fieldLabelProps = {},
		fieldLabelSpan = false,
		mounted = true,
		submit = false
	}: {
		value?: unknown;
		open?: boolean;
		/** Wraps the field in a `Form` with these props. */
		form?: Partial<FormProps> & Record<string, unknown>;
		field?: Partial<FieldRootProps> & Record<string, unknown>;
		select?: Partial<ComponentProps<typeof SelectHarness>>;
		fieldLabel?: string;
		description?: string;
		error?: boolean;
		errorMatch?: ComponentProps<typeof Field.Error>['match'];
		/** Static error text, shown only while `errorMatch` matches. */
		errorText?: string;
		fieldLabelProps?: Record<string, unknown>;
		/** Renders Field.Label as a `<span>` with `nativeLabel={false}`. */
		fieldLabelSpan?: boolean;
		mounted?: boolean;
		submit?: boolean;
	} = $props();
</script>

{#snippet fieldRoot()}
	<Field.Root data-testid="field" {...field}>
		{#if fieldLabelSpan}
			<Field.Label data-testid="field-label" nativeLabel={false}>
				{#snippet render(props)}<span {...props}>{fieldLabel}</span>{/snippet}
			</Field.Label>
		{:else if fieldLabel !== undefined}
			<Field.Label data-testid="field-label" {...fieldLabelProps}>{fieldLabel}</Field.Label>
		{/if}
		{#if mounted}<SelectHarness bind:value bind:open {...select} />{/if}
		{#if description}<Field.Description data-testid="description">{description}</Field.Description
			>{/if}
		{#if errorText}
			<Field.Error data-testid="error" match={errorMatch}>{errorText}</Field.Error>
		{:else if error}
			<Field.Error data-testid="error" />
		{/if}
	</Field.Root>
	{#if submit}<button type="submit">Submit</button>{/if}
	<button type="button" data-testid="field-outside">Outside</button>
{/snippet}

{#if form}
	<Form data-testid="form" {...form}>{@render fieldRoot()}</Form>
{:else}
	{@render fieldRoot()}
{/if}
