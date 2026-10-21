<script lang="ts">
	import { Checkbox, CheckboxGroup, Field, Fieldset, Form, Radio, RadioGroup } from '#lib';
	import { submitTo } from '../routes/fixtures/form-log.js';

	let submitted = $state('');
</script>

<Form onsubmit={submitTo((values) => (submitted = JSON.stringify(values)))}>
	<Field.Root name="storageType">
		<RadioGroup defaultValue="hdd">
			<Fieldset.Legend>Storage type</Fieldset.Legend>
			<Radio.Root value="ssd" aria-label="SSD" />
			<Radio.Root value="hdd" aria-label="HDD" />
		</RadioGroup>
	</Field.Root>
	<Field.Root name="protocols">
		<CheckboxGroup defaultValue={['ssh']}>
			<Fieldset.Legend>Allowed network protocols</Fieldset.Legend>
			<Checkbox.Root value="http" aria-label="HTTP" />
			<Checkbox.Root value="ssh" aria-label="SSH" />
		</CheckboxGroup>
	</Field.Root>
	<button type="submit">Submit</button>
</Form>
<output data-testid="submitted">{submitted}</output>
