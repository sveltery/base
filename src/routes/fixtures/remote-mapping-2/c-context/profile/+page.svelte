<!-- Direction C, every composite control, on Kit's remote form. -->
<script lang="ts">
	import { Checkbox, CheckboxGroup, Field, NumberField, Radio, RadioGroup } from '#lib';
	import { Select } from '#lib';
	import FixturePage from '../../../form/shared/FixturePage.svelte';
	import { profileForm as f } from '../../shared/mapping2.remote.js';
	import { box, countries, plans, toppings } from '../../shared/ui.js';
	import KitField from '../KitField.svelte';
	import KitForm from '../KitForm.svelte';
</script>

<FixturePage debug={{ received: f.result?.data ?? null, kit: f.fields.value() }}>
	<KitForm form={f}>
		<KitField field={f.fields.plan} type="radio" data-field="plan">
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
		</KitField>

		<KitField field={f.fields.country} type="select" data-field="country">
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
		</KitField>

		<KitField field={f.fields.toppings} type="checkbox[]" data-field="toppings">
			<Field.Label>Toppings</Field.Label>
			<CheckboxGroup>
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
		</KitField>

		<KitField field={f.fields.agree} type="checkbox" data-field="agree">
			<Field.Label
				><Checkbox.Root data-testid="agree" style={box}><Checkbox.Indicator /></Checkbox.Root>Accept
				the terms</Field.Label
			>
			<Field.Error data-testid="error" />
		</KitField>

		<KitField field={f.fields.age} type="number" data-field="age">
			<Field.Label>Age</Field.Label>
			<NumberField.Root>
				<NumberField.Input data-testid="age" />
			</NumberField.Root>
			<Field.Error data-testid="error" />
		</KitField>

		<button type="submit">Submit</button>
	</KitForm>
</FixturePage>
