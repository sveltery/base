<!-- The gaps between Kit's remote form and Base's Form. `full` combines every workaround. -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { Field, Form } from '#lib';
	import FixturePage from '../../form/shared/FixturePage.svelte';
	import { errorsFor } from '../shared/issues.js';
	import { textForm as f } from '../shared/mapping.remote.js';

	const v = page.url.searchParams.get('v') ?? 'base';
	const has = (part: string) => v === part || v === 'full';
	const email = f.fields.email.as('email');
	const issues = $derived(f.fields.email.issues());

	// Kit sends a submit even when Base's Form blocked it, so the callback checks first.
	// `enhance` replaces the callback on the shared instance, so only these variants call it.
	const form = has('enhance')
		? f.enhance(async ({ element, submit }) => {
				if (element.checkValidity()) await submit();
			})
		: f;
	// Without JS the browser validates natively. Once hydrated, Base's Form takes over.
	let hydrated = $state(false);
	onMount(() => (hydrated = true));
	const novalidate = $derived(v === 'native' ? false : has('browser') ? hydrated : true);
	const blocked = (value: unknown) =>
		value === 'blocked@example.com' ? 'This address is blocked' : null;
</script>

<FixturePage debug={{ result: f.result ?? null, kit: f.fields.value() }}>
	<Form {...form} errors={errorsFor(email.name, issues)} {novalidate}>
		<Field.Root data-field="email" name={email.name} validate={blocked}>
			<Field.Label>Email</Field.Label>
			{#if v === 'spread'}
				<Field.Control {...email} required />
			{:else}
				<Field.Control
					type="email"
					required
					defaultValue={has('repopulate') ? f.fields.email.value() : undefined}
				/>
			{/if}
			<Field.Error data-testid="error" />
		</Field.Root>
		<button type="submit">Submit</button>
	</Form>
</FixturePage>
