<!-- Slider takes `range` spreads on Root for one thumb and on each Thumb for a tuple, and its handlers see the range input. -->
<script lang="ts">
	import type { RemoteForm } from '$app/server';
	import { Field, Form, Slider } from '#lib';

	const f = {} as RemoteForm<{ volume: number; price: [number, number] }, unknown>;
	let level = $state(30);
	const read = (event: Event & { currentTarget: HTMLInputElement }) =>
		event.currentTarget.valueAsNumber;
</script>

<Form form={f}>
	<Field.Root name="volume">
		<Slider.Root {...f.fields.volume.as('range', 50)} min={0} max={100}>
			<Slider.Control><Slider.Thumb /></Slider.Control>
		</Slider.Root>
	</Field.Root>
	<Field.Root name="price">
		<Slider.Root min={0} max={1000}>
			<Slider.Control>
				<Slider.Thumb {...f.fields.price[0].as('range', 0)} aria-label="Minimum price" />
				<Slider.Thumb {...f.fields.price[1].as('range', 1000)} aria-label="Maximum price" />
			</Slider.Control>
		</Slider.Root>
	</Field.Root>
</Form>

<Slider.Root bind:value={level} name="level" form="outer" required oninput={read} onchange={read}>
	<Slider.Control><Slider.Thumb onchange={read} host={{ 'data-thumb': '' }} /></Slider.Control>
</Slider.Root>
