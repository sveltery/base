<script lang="ts">
	import { page } from '$app/state';
	import { Combobox } from '#lib';
	import Shell from '../Shell.svelte';
	import { comboboxForm as f } from '../../shared/mapping.remote.js';

	const v = page.url.searchParams.get('v') ?? 'spread';
	const fruits = ['Apple', 'Banana', 'Durian'];
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

<Shell form={f} field="fruit" name={f.fields.fruit.as('text').name} label="Fruit">
	{#if v === 'spread'}
		<Combobox.Root items={fruits} {...f.fields.fruit.as('text')}>{@render parts()}</Combobox.Root>
	{:else if v === 'value'}
		<Combobox.Root
			items={fruits}
			{...f.fields.fruit.as('text')}
			value={f.fields.fruit.value() ?? null}>{@render parts()}</Combobox.Root
		>
	{/if}
</Shell>
