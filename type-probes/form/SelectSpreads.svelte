<!-- Select.Root takes `select` and `select multiple` spreads, and its handlers see the select. -->
<script lang="ts">
	import type { RemoteForm } from '$app/server';
	import { Field, Form, Select } from '#lib';

	const f = {} as RemoteForm<{ language: 'en' | 'fr'; tags: string[] }, unknown>;
	const items = [
		{ value: 'en', label: 'English' },
		{ value: 'fr', label: 'Français' }
	];
	let sort = $state<string | null>(null);
	const chosen = (event: Event & { currentTarget: HTMLSelectElement }) =>
		event.currentTarget.selectedOptions.length;
</script>

<Form form={f}>
	<Field.Root name="language">
		<Select.Root {...f.fields.language.as('select')} {items} required>
			<Select.Trigger><Select.Value /></Select.Trigger>
		</Select.Root>
	</Field.Root>
	<Field.Root name="tags">
		<Select.Root {...f.fields.tags.as('select multiple')} {items}>
			<Select.Trigger><Select.Value /></Select.Trigger>
		</Select.Root>
	</Field.Root>
</Form>

<Select.Root {items} bind:value={sort} name="sort" form="outer" onchange={chosen} oninput={chosen}>
	<Select.Trigger><Select.Value /></Select.Trigger>
</Select.Root>
