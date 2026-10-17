<!-- Page code, not Base API. Puts a Kit remote form in context and passes every registered
field's issues to Base's Form `errors`, keyed by the name Kit gave that field. -->
<script module lang="ts">
	import { getContext } from 'svelte';

	export interface KitFieldLike {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		as: (...args: any[]) => { name: string };
		issues: () => { message: string }[] | undefined;
	}
	const key = Symbol('kit-form');
	export const getKitForm = () => getContext<Map<string, KitFieldLike>>(key);
</script>

<script lang="ts">
	import { setContext, type Snippet } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import { Form } from '#lib';
	/** The remote form instance: its `method`, `action` and enhance attachment. */
	let { form, children }: { form: object; children: Snippet } = $props();

	const fields = new SvelteMap<string, KitFieldLike>();
	setContext(key, fields);

	// A getter, so the server render reads `errors` after the fields below have registered.
	const lazy = {
		get errors() {
			const errors: Record<string, string[]> = {};
			for (const [name, field] of fields) {
				const issues = field.issues();
				if (issues) errors[name] = issues.map((issue) => issue.message);
			}
			return errors;
		}
	};
</script>

<Form {...form} {...lazy}>{@render children()}</Form>
