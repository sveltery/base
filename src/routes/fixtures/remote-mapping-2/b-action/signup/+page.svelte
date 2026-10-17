<!-- Direction B: direction A, plus a form action on the same page for when JS is off. -->
<script lang="ts">
	import { page } from '$app/state';
	import { Field, Form } from '#lib';
	import FixturePage from '../../../form/shared/FixturePage.svelte';
	import type { Signup } from '../../shared/schemas.js';
	import { saveSignup } from '../../shared/mapping2.remote.js';
	import type { ActionData } from './$types';

	const action = $derived(page.form as ActionData);
	let errors = $state(page.form?.errors ?? {});
	let received = $state<Signup | null>(page.form?.received ?? null);
</script>

<FixturePage debug={{ received }}>
	<Form
		method="POST"
		bind:errors
		onFormSubmit={async (values: Signup) => {
			const outcome = await saveSignup(values);
			errors = outcome.errors ?? {};
			received = outcome.data ?? null;
		}}
	>
		<Field.Root name={'name' satisfies keyof Signup} data-field="name">
			<Field.Label>Name</Field.Label>
			<Field.Control required defaultValue={action?.values?.name} />
			<Field.Error data-testid="error" />
		</Field.Root>
		<Field.Root name={'email' satisfies keyof Signup} data-field="email">
			<Field.Label>Email</Field.Label>
			<Field.Control type="email" required defaultValue={action?.values?.email} />
			<Field.Error data-testid="error" />
		</Field.Root>
		<button type="submit">Submit</button>
	</Form>
</FixturePage>
