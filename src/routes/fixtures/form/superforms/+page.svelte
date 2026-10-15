<!-- Scenario 5: sveltekit-superforms owns values and errors. Base shows its state. -->
<script lang="ts">
	import { fromAction } from 'svelte/attachments';
	import { defaults, superForm } from 'sveltekit-superforms';
	import { valibot } from 'sveltekit-superforms/adapters';
	import * as v from 'valibot';
	import { Autocomplete, Field, Form } from '#lib';
	import FixturePage from '../shared/FixturePage.svelte';

	const schema = v.object({
		username: v.pipe(v.string(), v.minLength(3, 'At least 3 characters')),
		email: v.pipe(v.string(), v.email('Invalid email address')),
		city: v.pipe(v.string(), v.minLength(3, 'At least 3 characters'))
	});
	const adapter = valibot(schema);
	let saved = $state<unknown>(null);
	const { form, errors, tainted, enhance } = superForm(defaults(adapter), {
		SPA: true,
		validators: adapter,
		onUpdate: ({ form }) => {
			if (form.valid) saved = form.data;
		}
	});
</script>

<FixturePage debug={{ saved }}>
	<Form {@attach fromAction(enhance)}>
		<Field.Root
			name="username"
			invalid={!!$errors.username}
			dirty={!!$tainted?.username}
			data-field="username"
		>
			<Field.Label>Username</Field.Label>
			<Field.Control bind:value={$form.username} />
			{#if $errors.username}
				<Field.Error match={true} data-testid="error">{$errors.username[0]}</Field.Error>
			{/if}
		</Field.Root>
		<Field.Root name="email" invalid={!!$errors.email} dirty={!!$tainted?.email} data-field="email">
			<Field.Label>Email</Field.Label>
			<Field.Control type="email" bind:value={$form.email} />
			{#if $errors.email}
				<Field.Error match={true} data-testid="error">{$errors.email[0]}</Field.Error>
			{/if}
		</Field.Root>
		<Field.Root name="city" invalid={!!$errors.city} dirty={!!$tainted?.city} data-field="city">
			<Field.Label>City</Field.Label>
			<Autocomplete.Root items={['Oslo', 'Paris']} bind:value={$form.city}>
				<Autocomplete.Input />
			</Autocomplete.Root>
			{#if $errors.city}
				<Field.Error match={true} data-testid="error">{$errors.city[0]}</Field.Error>
			{/if}
		</Field.Root>
		<button>Submit</button>
	</Form>
</FixturePage>
