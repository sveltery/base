<script lang="ts">
	import { page } from '$app/state';
	import { Field, Form, Select } from '#lib';
	import FixturePage from '../../form/shared/FixturePage.svelte';
	import { errorsFor } from '../shared/issues.js';
	import { selectForm as f } from '../shared/mapping.remote.js';

	const v = page.url.searchParams.get('v') ?? 'name';
	const countries = [
		{ value: 'us', label: 'United States' },
		{ value: 'fr', label: 'France' }
	];
	const country = f.fields.country.as('select');
</script>

{#snippet parts()}
	<Select.Trigger data-testid="control">
		<Select.Value placeholder="Pick a country" />
		<Select.Icon />
	</Select.Trigger>
	<Select.Portal>
		<Select.Positioner>
			<Select.Popup>
				{#each countries as { value, label } (value)}
					<Select.Item {value}><Select.ItemText>{label}</Select.ItemText></Select.Item>
				{/each}
			</Select.Popup>
		</Select.Positioner>
	</Select.Portal>
{/snippet}

<FixturePage debug={{ result: f.result ?? null, kit: f.fields.value() }}>
	<Form {...f} errors={errorsFor(country.name, f.fields.country.issues())}>
		<Field.Root data-field="country" name={v === 'root-name' ? country.name : undefined}>
			<Field.Label>Country</Field.Label>
			{#if v === 'root-name'}
				<Select.Root items={countries}>{@render parts()}</Select.Root>
			{:else if v === 'name'}
				<Select.Root items={countries} name={country.name}>{@render parts()}</Select.Root>
			{:else if v === 'spread'}
				<Select.Root items={countries} {...country}>{@render parts()}</Select.Root>
			{:else if v === 'controlled'}
				<Select.Root
					items={countries}
					name={country.name}
					value={f.fields.country.value() ?? null}
					onValueChange={(value) => f.fields.country.set(value ?? '')}
					>{@render parts()}</Select.Root
				>
			{/if}
			<Field.Error data-testid="error" />
		</Field.Root>
		<button type="submit">Submit</button>
	</Form>
</FixturePage>
