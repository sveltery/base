<script lang="ts">
	import { Form } from '#lib';
	import type { Snippet } from 'svelte';

	let {
		accept,
		submitted = undefined,
		values = undefined,
		children
	}: {
		accept: (formValues: Record<string, unknown>, details: { event: Event }) => void;
		submitted?: number;
		values?: string;
		children: Snippet;
	} = $props();
</script>

<Form onFormSubmit={accept}>
	{@render children()}
	<button type="submit">Submit</button>
</Form>
{#if submitted !== undefined}
	<output data-testid="submitted">{submitted}</output>
{/if}
{#if values !== undefined}
	<output data-testid="values">{values}</output>
{/if}
