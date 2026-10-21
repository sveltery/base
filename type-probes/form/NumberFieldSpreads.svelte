<!-- NumberField takes a `number` spread, and its handlers see the hidden number input. -->
<script lang="ts">
	import type { RemoteForm } from '$app/server';
	import { Field, Form, NumberField } from '#lib';

	const f = {} as RemoteForm<{ seats: number }, unknown>;
	let count = $state<number | string | null>(1);
	const read = (event: Event & { currentTarget: HTMLInputElement }) =>
		event.currentTarget.valueAsNumber;
</script>

<Form form={f}>
	<Field.Root name="seats">
		<NumberField.Root {...f.fields.seats.as('number', 2)} min={1}>
			<NumberField.Input />
		</NumberField.Root>
	</Field.Root>
</Form>

<NumberField.Root
	bind:value={count}
	name="count"
	form="outer"
	required
	readonly
	oninput={read}
	onchange={read}
	host={{ 'data-count': '' }}
>
	<NumberField.Input />
</NumberField.Root>
