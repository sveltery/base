<!-- Scenario 5: composite controls bound to a remote form. Each writes a native input. -->
<script lang="ts">
	import {
		Checkbox,
		CheckboxGroup,
		Field,
		Fieldset,
		Form,
		NumberField,
		Radio,
		RadioGroup,
		Slider,
		Switch
	} from '#lib';
	import FixturePage from '../shared/FixturePage.svelte';
	import { prefs } from '../shared/forms.remote.js';
	import { prefsSchema } from '../shared/schemas.js';

	const f = prefs.preflight(prefsSchema);
	const box = 'display: inline-block; width: 16px; height: 16px; border: 1px solid';
</script>

<FixturePage
	debug={{
		pending: f.pending,
		result: f.result ?? null,
		input: f.fields.value(),
		issues: f.fields.allIssues() ?? []
	}}
>
	<Form form={f}>
		<Field.Root field={f.fields.plan} type="radio" data-field="plan">
			<Fieldset.Root>
				<Fieldset.Legend>Plan</Fieldset.Legend>
				<RadioGroup defaultValue="free">
					<Radio.Root value="free" style={box}>Free</Radio.Root>
					<Radio.Root value="pro" style={box}>Pro</Radio.Root>
				</RadioGroup>
			</Fieldset.Root>
			<Field.Error data-testid="error" />
		</Field.Root>

		<Field.Root field={f.fields.tags} type="checkbox" data-field="tags">
			<Fieldset.Root>
				<Fieldset.Legend>Topics</Fieldset.Legend>
				<CheckboxGroup>
					<Checkbox.Root value="svelte" style={box}>Svelte</Checkbox.Root>
					<Checkbox.Root value="kit" style={box}>SvelteKit</Checkbox.Root>
				</CheckboxGroup>
			</Fieldset.Root>
			<Field.Error data-testid="error" />
		</Field.Root>

		<Field.Root field={f.fields.seats} type="number" data-field="seats">
			<Field.Label>Seats</Field.Label>
			<NumberField.Root defaultValue={1} min={0} locale="en-US">
				<NumberField.Group>
					<NumberField.Decrement />
					<NumberField.Input />
					<NumberField.Increment />
				</NumberField.Group>
			</NumberField.Root>
			<Field.Error data-testid="error" />
		</Field.Root>

		<Field.Root field={f.fields.agree} type="checkbox" data-field="agree">
			<Field.Label><Checkbox.Root style={box} /> I accept the terms</Field.Label>
			<Field.Error data-testid="error" />
		</Field.Root>

		<Field.Root field={f.fields.newsletter} type="switch" data-field="newsletter">
			<Field.Label><Switch.Root style={box} /> Send me the newsletter</Field.Label>
		</Field.Root>

		<Field.Root field={f.fields.volume} type="range" data-field="volume">
			<Field.Label>Volume</Field.Label>
			<Slider.Root defaultValue={30} locale="en-US">
				<Slider.Control style="width: 200px; height: 16px">
					<Slider.Track>
						<Slider.Thumb />
					</Slider.Track>
				</Slider.Control>
			</Slider.Root>
			<Field.Error data-testid="error" />
		</Field.Root>

		<button>Save</button>
		<button type="reset">Reset</button>
	</Form>
</FixturePage>
