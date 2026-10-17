<!--
	One field of a remote form, with the control's `.as()` spread as its only name. `?mode=errors`
	passes Kit's issues to Form `errors` under that name; `?mode=match` sets Field.Root `invalid`
	and Field.Error `match` from them, and revalidates on input so they clear. `&root` also puts
	the name on Field.Root.
-->
<script lang="ts">
	import { page } from '$app/state';
	import type { Snippet } from 'svelte';
	import { Field, Form } from '#lib';
	import FixturePage from '../../form/shared/FixturePage.svelte';
	import { errorsFor } from '../shared/issues.js';

	interface Props {
		// Any remote form; each fixture passes its own.
		form: any; // eslint-disable-line @typescript-eslint/no-explicit-any
		field: string;
		/** The name the spread gives the control. */
		name: string;
		label: string;
		children: Snippet;
	}

	let { form: f, field, name, label, children }: Props = $props();

	const mode = page.url.searchParams.get('mode') ?? 'errors';
	const rootName = $derived(page.url.searchParams.has('root') ? name : undefined);
	const issues = $derived(f.fields[field].issues() as { message: string }[] | undefined);
</script>

<FixturePage debug={{ result: f.result ?? null, kit: f.fields.value() }}>
	{#if mode === 'match'}
		<Form {...f} oninput={() => f.validate()}>
			<Field.Root data-field={field} name={rootName} invalid={!!issues}>
				<Field.Label>{label}</Field.Label>
				{@render children()}
				<Field.Error data-testid="error" match={!!issues}>
					{#each issues ?? [] as issue (issue.message)}{issue.message}{/each}
				</Field.Error>
			</Field.Root>
			<button type="submit">Submit</button>
		</Form>
	{:else}
		<Form {...f} errors={errorsFor(name, issues)}>
			<Field.Root data-field={field} name={rootName}>
				<Field.Label>{label}</Field.Label>
				{@render children()}
				<Field.Error data-testid="error" />
			</Field.Root>
			<button type="submit">Submit</button>
		</Form>
	{/if}
</FixturePage>
