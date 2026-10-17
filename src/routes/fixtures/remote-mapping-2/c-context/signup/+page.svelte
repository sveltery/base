<!-- Direction C: Kit's remote form, carried to each Field by page-level context. -->
<script lang="ts">
	import { Field } from '#lib';
	import FixturePage from '../../../form/shared/FixturePage.svelte';
	import { signupForm as f } from '../../shared/mapping2.remote.js';
	import KitField from '../KitField.svelte';
	import KitForm from '../KitForm.svelte';
</script>

<FixturePage debug={{ received: f.result?.data ?? null }}>
	<KitForm form={f}>
		<KitField field={f.fields.name} type="text" data-field="name">
			<Field.Label>Name</Field.Label>
			<Field.Control required />
			<Field.Error data-testid="error" />
		</KitField>
		<KitField field={f.fields.email} type="email" data-field="email">
			<Field.Label>Email</Field.Label>
			<Field.Control type="email" required />
			<Field.Error data-testid="error" />
		</KitField>
		<button type="submit">Submit</button>
	</KitForm>
</FixturePage>
