<script lang="ts">
	import { Field, Fieldset, Form, Slider } from '#lib';

	let submitted = $state('');
</script>

<Form onFormSubmit={(values) => (submitted = JSON.stringify(values))}>
	<Field.Root name="scalingThreshold">
		<Fieldset.Root data-testid="fieldset">
			<Fieldset.Legend>Scaling threshold</Fieldset.Legend>
			<Slider.Root
				defaultValue={[0.2, 0.8]}
				min={0}
				max={1}
				step={0.01}
				format={{ style: 'percent', maximumFractionDigits: 0 }}
				locale="en-US"
			>
				<Slider.Value data-testid="value" />
				<Slider.Control>
					<Slider.Track>
						<Slider.Indicator />
						<Slider.Thumb index={0} aria-label="Minimum threshold" />
						<Slider.Thumb index={1} aria-label="Maximum threshold" />
					</Slider.Track>
				</Slider.Control>
			</Slider.Root>
		</Fieldset.Root>
	</Field.Root>
	<button type="submit">Submit</button>
</Form>
<output data-testid="submitted">{submitted}</output>
