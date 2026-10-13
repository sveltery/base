<!-- expect-error: Property 'emial' does not exist -->
<script lang="ts">
	import { Field, Form } from '#lib';
	import { actionForm } from '#lib/form/kit/index.js';
	import { signupSchema } from '../../src/routes/fixtures/form/shared/schemas.js';

	let { form }: { form: unknown } = $props();
	const f = actionForm(signupSchema, () => form);
</script>

<Form form={f}>
	<Field.Root field={f.fields.emial} type="email" />
</Form>
