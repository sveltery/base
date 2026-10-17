<!-- Direction A: Base UI's own flow. Plain names, `onFormSubmit`, errors back from a command. -->
<script lang="ts">
	import { Field, Form } from '#lib';
	import FixturePage from '../../../form/shared/FixturePage.svelte';
	import type { Signup } from '../../shared/schemas.js';
	import { saveSignup } from '../../shared/mapping2.remote.js';

	let errors = $state({});
	let received = $state<Signup | null>(null);
</script>

<FixturePage debug={{ received }}>
	<Form
		bind:errors
		onFormSubmit={async (values: Signup) => {
			const outcome = await saveSignup(values);
			errors = outcome.errors ?? {};
			received = outcome.data ?? null;
		}}
	>
		<Field.Root name={'name' satisfies keyof Signup} data-field="name">
			<Field.Label>Name</Field.Label>
			<Field.Control required />
			<Field.Error data-testid="error" />
		</Field.Root>
		<Field.Root name={'email' satisfies keyof Signup} data-field="email">
			<Field.Label>Email</Field.Label>
			<Field.Control type="email" required />
			<Field.Error data-testid="error" />
		</Field.Root>
		<button type="submit">Submit</button>
	</Form>
</FixturePage>
