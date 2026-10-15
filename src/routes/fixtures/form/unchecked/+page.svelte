<!-- Scenario: a bound Checkbox and Switch with `uncheckedValue` submit it while unchecked. -->
<script lang="ts">
	import { Checkbox, Field, Form, Switch } from '#lib';
	import FixturePage from '../shared/FixturePage.svelte';
	import { consent } from '../shared/forms.remote.js';

	const box = 'display: inline-block; width: 16px; height: 16px; border: 1px solid';
</script>

<FixturePage debug={{ result: consent.result ?? null }}>
	<Form form={consent}>
		<Field.Root field={consent.fields.agree} type="checkbox" data-field="agree">
			<Field.Label><Checkbox.Root uncheckedValue="off" style={box} /> I agree</Field.Label>
		</Field.Root>
		<Field.Root field={consent.fields.newsletter} type="switch" data-field="newsletter">
			<Field.Label><Switch.Root uncheckedValue="off" style={box} /> Newsletter</Field.Label>
		</Field.Root>
		<button>Save</button>
	</Form>
</FixturePage>
