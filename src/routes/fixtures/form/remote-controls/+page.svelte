<!--
	A remote form of Select, Slider and NumberField. Language, Volume, Price and Seats spread
	Kit's props; Region, Guests bind themselves to their Field. More than 8 seats fails on the server.
-->
<script lang="ts">
	import { Field, Form, NumberField, Select, Slider } from '#lib';
	import FixturePage from '../shared/FixturePage.svelte';
	import { order } from '../shared/forms.remote.js';

	const languages = [
		{ value: 'en', label: 'English' },
		{ value: 'fr', label: 'Français' },
		{ value: 'de', label: 'Deutsch' }
	];
	const regions = [
		{ value: 'eu', label: 'Europe' },
		{ value: 'us', label: 'United States' },
		{ value: 'asia', label: 'Asia' }
	];
</script>

{#snippet options(items: { value: string; label: string }[])}
	<Select.Portal>
		<Select.Positioner>
			<Select.Popup>
				{#each items as item (item.value)}
					<Select.Item value={item.value}>
						<Select.ItemText>{item.label}</Select.ItemText>
					</Select.Item>
				{/each}
			</Select.Popup>
		</Select.Positioner>
	</Select.Portal>
{/snippet}

{#snippet numberParts(label: string)}
	<NumberField.Group>
		<NumberField.Decrement aria-label="Fewer {label}" />
		<NumberField.Input />
		<NumberField.Increment aria-label="More {label}" />
	</NumberField.Group>
{/snippet}

<FixturePage debug={{ result: order.result ?? null }}>
	<Form form={order}>
		<Field.Root name="language" data-field="language">
			<Select.Root {...order.fields.language.as('select')} items={languages}>
				<Select.Label>Language</Select.Label>
				<Select.Trigger data-testid="trigger"><Select.Value /></Select.Trigger>
				{@render options(languages)}
			</Select.Root>
		</Field.Root>
		<Field.Root name="region" data-field="region">
			<Select.Root items={regions} defaultValue="eu">
				<Select.Label>Region</Select.Label>
				<Select.Trigger data-testid="trigger"><Select.Value /></Select.Trigger>
				{@render options(regions)}
			</Select.Root>
		</Field.Root>
		<Field.Root name="volume" data-field="volume">
			<Slider.Root {...order.fields.volume.as('range', 50)}>
				<Slider.Label>Volume</Slider.Label>
				<Slider.Control>
					<Slider.Track>
						<Slider.Indicator />
						<Slider.Thumb />
					</Slider.Track>
				</Slider.Control>
			</Slider.Root>
		</Field.Root>
		<Field.Root name="price" data-field="price">
			<Slider.Root min={0} max={1000} step={10} defaultValue={[0, 1000]}>
				<Slider.Label>Price</Slider.Label>
				<Slider.Control>
					<Slider.Track>
						<Slider.Indicator data-testid="indicator" />
						<Slider.Thumb {...order.fields.price[0].as('range', 0)} aria-label="Minimum price" />
						<Slider.Thumb {...order.fields.price[1].as('range', 1000)} aria-label="Maximum price" />
					</Slider.Track>
				</Slider.Control>
			</Slider.Root>
		</Field.Root>
		<Field.Root name="seats" data-field="seats">
			<Field.Label>Seats</Field.Label>
			<NumberField.Root {...order.fields.seats.as('number', 1)} min={1}>
				{@render numberParts('seats')}
			</NumberField.Root>
			<Field.Error data-testid="error" />
		</Field.Root>
		<Field.Root name="guests" data-field="guests">
			<Field.Label>Guests</Field.Label>
			<NumberField.Root defaultValue={2} min={0}>
				{@render numberParts('guests')}
			</NumberField.Root>
		</Field.Root>
		<button type="submit">Order</button>
	</Form>
</FixturePage>
