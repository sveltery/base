<script lang="ts">
	import { Autocomplete } from '#lib';
	import Shell from '../Shell.svelte';
	import { autocompleteForm as f } from '../spread.remote.js';
</script>

<Shell form={f} field="fruit" name={f.fields.fruit.as('text').name} label="Fruit">
	<Autocomplete.Root items={['Apple', 'Banana', 'Durian']} {...f.fields.fruit.as('text')}>
		<Autocomplete.Input data-testid="control" />
		<Autocomplete.Portal>
			<Autocomplete.Positioner>
				<Autocomplete.Popup>
					<Autocomplete.List>
						<Autocomplete.Collection>
							{#snippet children(item: string)}
								<Autocomplete.Item value={item}>{item}</Autocomplete.Item>
							{/snippet}
						</Autocomplete.Collection>
					</Autocomplete.List>
				</Autocomplete.Popup>
			</Autocomplete.Positioner>
		</Autocomplete.Portal>
	</Autocomplete.Root>
</Shell>
