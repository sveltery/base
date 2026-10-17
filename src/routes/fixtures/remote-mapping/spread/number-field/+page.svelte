<script lang="ts">
	import { page } from '$app/state';
	import { NumberField } from '#lib';
	import Shell from '../Shell.svelte';
	import { numberForm as f } from '../../shared/mapping.remote.js';

	const v = page.url.searchParams.get('v') ?? 'spread';
	// `.as('number')` types `value` as a string, and NumberField takes a number.
	const age = () => f.fields.age.as('number') as Record<string, unknown>;
</script>

{#snippet parts()}
	<NumberField.Group>
		<NumberField.Decrement>-</NumberField.Decrement>
		<NumberField.Input data-testid="control" />
		<NumberField.Increment>+</NumberField.Increment>
	</NumberField.Group>
{/snippet}

<Shell form={f} field="age" name={f.fields.age.as('number').name} label="Age">
	{#if v === 'spread'}
		<NumberField.Root {...age()}>{@render parts()}</NumberField.Root>
	{:else if v === 'value'}
		<NumberField.Root {...age()} value={f.fields.age.value() ?? null}
			>{@render parts()}</NumberField.Root
		>
	{/if}
</Shell>
