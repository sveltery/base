<!--
	The upstream reset bug and Base's workaround side by side. After a user clicks a reset button,
	a raw Kit form's `fields.value()` keeps the edited value while the input shows its default.
	Base's Form replays the reset (src/lib/form/kit-reset-replay.ts), so its source matches.
-->
<script lang="ts">
	import { Field, Form } from '#lib';
	import FixturePage from '../shared/FixturePage.svelte';
	import { signup } from '../shared/forms.remote.js';

	const raw = signup.for('raw');
	const base = signup.for('base');
</script>

<FixturePage debug={{ raw: raw.fields.value(), base: base.fields.value() }}>
	<form {...raw} data-testid="raw">
		<input aria-label="Raw name" {...raw.fields.name.as('text', 'Draft')} />
		<button type="reset">Reset raw</button>
	</form>

	<Form form={base} data-testid="base">
		<Field.Root field={base.fields.name}>
			<Field.Label>Base name</Field.Label>
			<Field.Control defaultValue="Draft" />
		</Field.Root>
		<button type="reset">Reset base</button>
	</Form>
</FixturePage>
