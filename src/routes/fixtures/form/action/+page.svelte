<!-- Scenario 2: a SvelteKit form action with `use:enhance`, wired as the Forms handbook shows. -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { fromAction } from 'svelte/attachments';
	import { Field, Form } from '#lib';
	import FixturePage from '../shared/FixturePage.svelte';

	let { form } = $props();
</script>

<FixturePage debug={{ welcome: form?.welcome ?? null }}>
	<Form method="POST" errors={form?.errors} {@attach fromAction(enhance)}>
		<Field.Root name="email" data-field="email">
			<Field.Label>Email</Field.Label>
			<Field.Control type="email" required defaultValue={form?.values?.email} />
			<Field.Error data-testid="error" />
		</Field.Root>
		<Field.Root name="name" data-field="name">
			<Field.Label>Name</Field.Label>
			<Field.Control required defaultValue={form?.values?.name} />
			<Field.Error data-testid="error" />
		</Field.Root>
		<button>Sign up</button>
	</Form>
</FixturePage>
