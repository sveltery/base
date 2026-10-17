<!-- Scenario 2: a SvelteKit form action posted natively, wired as the Forms handbook shows. -->
<script lang="ts">
	import { Field, Form } from '#lib';
	import FixturePage from '../shared/FixturePage.svelte';

	let { form } = $props();
</script>

<FixturePage debug={{ welcome: form?.welcome ?? null }}>
	<Form method="POST" errors={form?.errors}>
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
