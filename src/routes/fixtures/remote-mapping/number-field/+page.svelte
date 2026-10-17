<script lang="ts">
	import { page } from '$app/state';
	import { Field, Form, NumberField } from '#lib';
	import FixturePage from '../../form/shared/FixturePage.svelte';
	import { errorsFor } from '../shared/issues.js';
	import { numberForm as f } from '../shared/mapping.remote.js';

	const v = page.url.searchParams.get('v') ?? 'name';
	const age = f.fields.age.as('number');
</script>

{#snippet parts()}
	<NumberField.Group>
		<NumberField.Decrement>-</NumberField.Decrement>
		<NumberField.Input data-testid="control" />
		<NumberField.Increment>+</NumberField.Increment>
	</NumberField.Group>
{/snippet}

<FixturePage debug={{ result: f.result ?? null, kit: f.fields.value() }}>
	<Form {...f} errors={errorsFor(age.name, f.fields.age.issues())}>
		<Field.Root data-field="age" name={v === 'root-name' ? age.name : undefined}>
			<Field.Label>Age</Field.Label>
			{#if v === 'root-name'}
				<NumberField.Root>{@render parts()}</NumberField.Root>
			{:else if v === 'spread'}
				<!-- `.as()` types `value` as a string, so the spread needs a cast. -->
				<NumberField.Root {...age as Record<string, unknown>}>{@render parts()}</NumberField.Root>
			{:else if v === 'name'}
				<NumberField.Root name={age.name}>{@render parts()}</NumberField.Root>
			{:else if v === 'controlled'}
				<NumberField.Root
					name={age.name}
					value={f.fields.age.value() ?? null}
					onValueChange={(value) => f.fields.age.set(value ?? undefined!)}
					>{@render parts()}</NumberField.Root
				>
			{/if}
			<Field.Error data-testid="error" />
		</Field.Root>
		<button type="submit">Submit</button>
	</Form>
</FixturePage>
