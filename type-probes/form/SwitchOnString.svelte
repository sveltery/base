<!-- expect-error: Type '"switch"' is not assignable to type -->
<script lang="ts">
	import { Field, Form } from '#lib';
	import { signup } from '../../src/routes/fixtures/form/shared/forms.remote.js';
</script>

<Form form={signup}>
	<Field.Root field={signup.fields.name} type="switch" />
</Form>
