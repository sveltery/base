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
		submit?: boolean;
	} = $props();
</script>

{#snippet fieldRoot()}
	<Field.Root data-testid="field" {...field}>
		{#if fieldLabel}<Field.Label data-testid="field-label">{fieldLabel}</Field.Label>{/if}
		<SelectHarness bind:value bind:open {...select} />
		{#if description}<Field.Description data-testid="description">{description}</Field.Description>{/if}
		{#if error}<Field.Error data-testid="error" />{/if}
	</Field.Root>
	{#if submit}<button type="submit">Submit</button>{/if}
{/snippet}

{#if form}
	<Form data-testid="form" {...form}>{@render fieldRoot()}</Form>
{:else}
	{@render fieldRoot()}
{/if}
