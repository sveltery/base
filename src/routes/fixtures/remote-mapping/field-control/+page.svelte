<script lang="ts">
	import { page } from '$app/state';
	import { Field, Form } from '#lib';
	import FixturePage from '../../form/shared/FixturePage.svelte';
	import { errorsFor } from '../shared/issues.js';
	import { textForm as f } from '../shared/mapping.remote.js';

	const v = page.url.searchParams.get('v') ?? 'errors';
	const email = f.fields.email.as('email');
	const issues = $derived(f.fields.email.issues());
</script>

<FixturePage debug={{ result: f.result ?? null, kit: f.fields.value() }}>
	{#if v === 'errors'}
		<Form {...f} errors={errorsFor(email.name, issues)}>
			<Field.Root data-field="email">
				<Field.Label>Email</Field.Label>
				<Field.Control {...email} />
				<Field.Error data-testid="error" />
			</Field.Root>
			<button type="submit">Submit</button>
		</Form>
	{:else if v === 'root-name'}
		<Form {...f} errors={errorsFor(email.name, issues)}>
			<Field.Root data-field="email" name={email.name}>
				<Field.Label>Email</Field.Label>
				<Field.Control type="email" />
				<Field.Error data-testid="error" />
			</Field.Root>
			<button type="submit">Submit</button>
		</Form>
	{:else if v === 'match'}
		<Form {...f}>
			<Field.Root data-field="email" invalid={!!issues}>
				<Field.Label>Email</Field.Label>
				<Field.Control {...email} />
				<Field.Error data-testid="error" match={!!issues}>
					{#each issues ?? [] as issue (issue.message)}{issue.message}{/each}
				</Field.Error>
			</Field.Root>
			<button type="submit">Submit</button>
		</Form>
	{/if}
</FixturePage>
