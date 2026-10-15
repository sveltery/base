<!-- Every pairing here type-checks. -->
<script lang="ts">
	import { Checkbox, CheckboxGroup, Field, Form, NumberField, Switch } from '#lib';
	import { prefs, signup } from '../../src/routes/fixtures/form/shared/forms.remote.js';
	import { signupSchema } from '../../src/routes/fixtures/form/shared/schemas.js';

	const f = signup.preflight(signupSchema);
	const p = prefs;
</script>

<Form form={f} enhance={async ({ submit }) => void (await submit().updates())}>
	<Field.Root field={f.fields.email} type="email"><Field.Control /></Field.Root>
	<Field.Root field={f.fields.name}><Field.Control /></Field.Root>
	<Field.Root field={f.fields.age} type="number"><Field.Control /></Field.Root>
	<Field.Root field={f.fields.age} type="range"><Field.Control /></Field.Root>
	<Field.Root name="anything"><Field.Control /></Field.Root>
</Form>
<Form form={p}>
	<Field.Root field={p.fields.tags} type="checkbox"><CheckboxGroup /></Field.Root>
	<Field.Root field={p.fields.agree} type="checkbox"><Checkbox.Root /></Field.Root>
	<Field.Root field={p.fields.newsletter} type="switch"><Switch.Root /></Field.Root>
	<Field.Root field={p.fields.plan} type="radio" />
	<Field.Root field={p.fields.seats} type="number"><NumberField.Root /></Field.Root>
</Form>
