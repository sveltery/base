<!--
	The constraint gate in each browser engine: a Field cancels the `invalid` bubble for the
	controls it owns, including a composite's hidden input, and leaves the bubble for the rest.
-->
<script lang="ts">
	import { Checkbox, Field, Form, Select } from '#lib';
	import FixturePage from '../shared/FixturePage.svelte';

	let submitted = $state(0);
	const fruits = [
		{ value: 'apple', label: 'Apple' },
		{ value: 'pear', label: 'Pear' }
	];
</script>

<FixturePage debug={{ submitted }}>
	<Form
		data-testid="form"
		onsubmit={(event) => {
			event.preventDefault();
			submitted += 1;
		}}
	>
		<Field.Root name="email" data-field="email">
			<Field.Label>Email</Field.Label>
			<Field.Control type="email" required />
			<Field.Error data-testid="error" />
		</Field.Root>
		<Field.Root name="terms" data-field="terms">
			<Field.Label>
				<Checkbox.Root
					required
					data-testid="terms"
					style="display: inline-block; width: 1rem; height: 1rem; border: 1px solid"
					><Checkbox.Indicator /></Checkbox.Root
				>
				Accept the terms
			</Field.Label>
			<Field.Error data-testid="error" />
		</Field.Root>
		<Field.Root name="fruit" data-field="fruit">
			<Field.Label>Fruit</Field.Label>
			<Select.Root items={fruits} required>
				<Select.Trigger data-testid="fruit"
					><Select.Value placeholder="Pick a fruit" /></Select.Trigger
				>
				<Select.Portal>
					<Select.Positioner>
						<Select.Popup>
							{#each fruits as { value, label } (value)}
								<Select.Item {value}><Select.ItemText>{label}</Select.ItemText></Select.Item>
							{/each}
						</Select.Popup>
					</Select.Positioner>
				</Select.Portal>
			</Select.Root>
			<Field.Error data-testid="error" />
		</Field.Root>
		<label>Outside any Field <input name="loose" data-testid="loose" /></label>
		<button type="submit">Send</button>
	</Form>
</FixturePage>
