<script lang="ts">
	import { Select } from '#lib';
	import Shell from '../Shell.svelte';
	import { selectForm as f } from '../../shared/mapping.remote.js';

	const countries = [
		{ value: 'us', label: 'United States' },
		{ value: 'fr', label: 'France' }
	];
</script>

<Shell form={f} field="country" name={f.fields.country.as('select').name} label="Country">
	<Select.Root items={countries} {...f.fields.country.as('select')}>
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
	</Select.Root>
</Shell>
