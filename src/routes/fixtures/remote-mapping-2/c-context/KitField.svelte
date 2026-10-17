<!-- Page code, not Base API. A Field.Root named by the Kit field it is given. -->
<script lang="ts">
	import { onDestroy, type Snippet } from 'svelte';
	import { Field } from '#lib';
	import { getKitForm, type KitFieldLike } from './KitForm.svelte';

	let {
		field,
		type,
		children,
		...rest
	}: {
		field: KitFieldLike;
		/** Kit's input type, which sets the name's prefix. `checkbox[]` is a checkbox group. */
		type: 'text' | 'email' | 'number' | 'range' | 'checkbox' | 'checkbox[]' | 'radio' | 'select';
		children: Snippet;
		[attribute: `data-${string}`]: string;
	} = $props();

	// Radio and checkbox-group options share one name, so any option value gives it.
	// A field keeps its Kit field for life, so its name is read once.
	// svelte-ignore state_referenced_locally
	const name =
		type === 'checkbox[]'
			? field.as('checkbox', '_').name
			: field.as(type, type === 'radio' ? '_' : undefined).name;

	// Registered during setup, not in an effect, so the server render sees it too.
	const fields = getKitForm();
	// svelte-ignore state_referenced_locally
	fields.set(name, field);
	onDestroy(() => fields.delete(name));
</script>

<Field.Root {name} {...rest}>{@render children()}</Field.Root>
