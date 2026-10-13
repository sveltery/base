<!-- expect-error: Property 'emial' does not exist -->
<script lang="ts">
	import { Field, Form } from '#lib';
	import { signup } from '../../src/routes/fixtures/form/shared/forms.remote.js';
</script>

<Form form={signup}>
	<Field.Root field={signup.fields.emial} type="email" />
</Form>
