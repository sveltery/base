<!-- expect-error: Type '"checkbox"' is not assignable to type -->
<script lang="ts">
	import { CheckboxGroup, Field, Form } from '#lib';
	import { signup } from '../../src/routes/fixtures/form/shared/forms.remote.js';
</script>

<Form form={signup}>
	<Field.Root field={signup.fields.name} type="checkbox"><CheckboxGroup /></Field.Root>
</Form>
