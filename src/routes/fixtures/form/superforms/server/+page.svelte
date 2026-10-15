<!-- Scenario 5: sveltekit-superforms with a form action, wired as the Forms handbook shows. -->
<script lang="ts">
	import { fromAction } from 'svelte/attachments';
	import { superForm } from 'sveltekit-superforms';
	import { valibot } from 'sveltekit-superforms/adapters';
	import { Field, Form, isSubmitBlocked } from '#lib';
	import FixturePage from '../../shared/FixturePage.svelte';
	import { schema } from './schema.js';

	let { data } = $props();
	let saved = $state<unknown>(null);
	// svelte-ignore state_referenced_locally
	const { form, errors, enhance } = superForm(data.form, {
		validators: valibot(schema),
		onSubmit: ({ formElement, cancel }) => {
			if (isSubmitBlocked(formElement)) cancel();
		},
		onUpdate: ({ form }) => {
			if (form.valid) saved = form.data;
		}
	});
</script>

<FixturePage debug={{ saved }}>
	<Form method="POST" {@attach fromAction(enhance)}>
		<Field.Root name="email" invalid={!!$errors.email} data-field="email">
			<Field.Label>Email</Field.Label>
			<Field.Control type="email" required bind:value={$form.email} />
			{#if $errors.email}
				<Field.Error match={true} data-testid="error">{$errors.email[0]}</Field.Error>
			{/if}
		</Field.Root>
		<button>Submit</button>
	</Form>
</FixturePage>
