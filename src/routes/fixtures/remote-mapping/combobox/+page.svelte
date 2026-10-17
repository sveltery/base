<script lang="ts">
	import { page } from '$app/state';
	import { Combobox, Field, Form } from '#lib';
	import FixturePage from '../../form/shared/FixturePage.svelte';
	import { errorsFor } from '../shared/issues.js';
	import { comboboxForm as f } from '../shared/mapping.remote.js';

	const v = page.url.searchParams.get('v') ?? 'name';
	const fruits = ['Apple', 'Banana', 'Durian'];
	const fruit = f.fields.fruit.as('text');
</script>

{#snippet parts()}
	<Combobox.InputGroup>
		<Combobox.Input data-testid="control" />
		<Combobox.Trigger aria-label="Open" />
	</Combobox.InputGroup>
	<Combobox.Portal>
		<Combobox.Positioner>
			<Combobox.Popup>
				<Combobox.List>
					<Combobox.Collection>
						{#snippet children(item: string)}
							<Combobox.Item value={item}>{item}</Combobox.Item>
						{/snippet}
					</Combobox.Collection>
				</Combobox.List>
			</Combobox.Popup>
		</Combobox.Positioner>
	</Combobox.Portal>
{/snippet}

<FixturePage debug={{ result: f.result ?? null, kit: f.fields.value() }}>
	<Form {...f} errors={errorsFor(fruit.name, f.fields.fruit.issues())}>
		<Field.Root data-field="fruit" name={v === 'root-name' ? fruit.name : undefined}>
			<Field.Label>Fruit</Field.Label>
			{#if v === 'root-name'}
				<Combobox.Root items={fruits}>{@render parts()}</Combobox.Root>
			{:else if v === 'name'}
				<Combobox.Root items={fruits} name={fruit.name}>{@render parts()}</Combobox.Root>
			{:else if v === 'controlled'}
				<Combobox.Root
					items={fruits}
					name={fruit.name}
					value={f.fields.fruit.value() ?? null}
					onValueChange={(value) => f.fields.fruit.set(value ?? '')}
					>{@render parts()}</Combobox.Root
				>
			{/if}
			<Field.Error data-testid="error" />
		</Field.Root>
		<button type="submit">Submit</button>
	</Form>
</FixturePage>
