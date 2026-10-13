<!-- expect-error: Type '"switch"' is not assignable to type -->
<script lang="ts">
	import { Field, Form } from '#lib';
	import { prefs } from '../../src/routes/fixtures/form/shared/forms.remote.js';
</script>

<Form form={prefs}>
	<Field.Root field={prefs.fields.tags} type="switch" />
</Form>
