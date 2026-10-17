<!-- Direction A, every composite control. The values arrive typed from each Field. -->
<script lang="ts">
	import { Checkbox, CheckboxGroup, Field, Form, NumberField, Radio, RadioGroup } from '#lib';
	import { Select } from '#lib';
	import FixturePage from '../../../form/shared/FixturePage.svelte';
	import type { Profile } from '../../shared/schemas.js';
	import { saveProfile } from '../../shared/mapping2.remote.js';
	import { box, countries, plans, toppings } from '../../shared/ui.js';

	let errors = $state({});
	let received = $state<Profile | null>(null);
	let sent = $state<unknown>(null);
</script>

<FixturePage debug={{ received, sent }}>
	<Form
		bind:errors
		onFormSubmit={async (values: Profile) => {
			sent = values;
			const outcome = await saveProfile(values);
			errors = outcome.errors ?? {};
			received = outcome.data ?? null;
		}}
	>
		<Field.Root name={'plan' satisfies keyof Profile} data-field="plan">
			<Field.Label>Plan</Field.Label>
			<RadioGroup>
				{#each plans as plan (plan)}
					<Field.Item>
						<Field.Label
							><Radio.Root value={plan} data-testid="radio-{plan}" style={box}
								><Radio.Indicator /></Radio.Root
							>{plan}</Field.Label
						>
					</Field.Item>
				{/each}
			</RadioGroup>
			<Field.Error data-testid="error" />
		</Field.Root>

		<Field.Root name={'country' satisfies keyof Profile} data-field="country">
			<Field.Label>Country</Field.Label>
			<Select.Root items={countries}>
				<Select.Trigger data-testid="country"><Select.Value placeholder="Pick" /></Select.Trigger>
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
			<Field.Error data-testid="error" />
		</Field.Root>

		<Field.Root name={'toppings' satisfies keyof Profile} data-field="toppings">
			<Field.Label>Toppings</Field.Label>
			<CheckboxGroup defaultValue={[]}>
				{#each toppings as topping (topping)}
					<Field.Item>
						<Field.Label
							><Checkbox.Root value={topping} data-testid="box-{topping}" style={box}
								><Checkbox.Indicator /></Checkbox.Root
							>{topping}</Field.Label
						>
					</Field.Item>
				{/each}
			</CheckboxGroup>
			<Field.Error data-testid="error" />
		</Field.Root>

		<Field.Root name={'agree' satisfies keyof Profile} data-field="agree">
			<Field.Label
				><Checkbox.Root data-testid="agree" style={box}><Checkbox.Indicator /></Checkbox.Root>Accept
				the terms</Field.Label
			>
			<Field.Error data-testid="error" />
		</Field.Root>

		<Field.Root name={'age' satisfies keyof Profile} data-field="age">
			<Field.Label>Age</Field.Label>
			<NumberField.Root>
				<NumberField.Input data-testid="age" />
			</NumberField.Root>
			<Field.Error data-testid="error" />
		</Field.Root>

		<button type="submit">Submit</button>
	</Form>
</FixturePage>
