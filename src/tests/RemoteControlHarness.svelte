<!--
	One control in a named Field of a remote form on Kit's own `fields` proxy. With `spread`, the
	control takes it, as `{...f.fields.x.as(kind)}`. Without one, the control binds itself.
	A slider renders one thumb per `thumbs` entry, each with that entry as its spread. A number
	field renders its input between a decrement and an increment button.
-->
<script lang="ts">
	import { Field, Form, NumberField, Select, Slider } from '#lib';

	let {
		fields,
		name,
		control,
		spread,
		props = {},
		thumbs = [undefined]
	}: {
		/** Kit's `fields` proxy. */
		fields: unknown;
		/** Field.Root's path. */
		name: string;
		control: 'select' | 'select multiple' | 'range' | 'number';
		spread?: Record<string, unknown>;
		/** More props for the control's root. */
		props?: Record<string, unknown>;
		/** A slider's thumbs, each with its own spread or none. */
		thumbs?: (Record<string, unknown> | undefined)[];
	} = $props();

	const remote = $derived({
		method: 'POST' as const,
		action: '?/remote=form',
		fields,
		pending: 0,
		submitted: false
	});
	const languages = [
		{ value: 'en', label: 'English' },
		{ value: 'fr', label: 'Français' },
		{ value: 'de', label: 'Deutsch' }
	];
</script>

<Form form={remote}>
	<Field.Root {name} data-testid="field">
		{#if control === 'select' || control === 'select multiple'}
			<Select.Root
				{...spread}
				{...props}
				items={languages}
				multiple={control === 'select multiple'}
			>
				<Select.Trigger data-testid="trigger"><Select.Value /></Select.Trigger>
				<Select.Portal>
					<Select.Positioner>
						<Select.Popup>
							{#each languages as language (language.value)}
								<Select.Item value={language.value}>
									<Select.ItemText>{language.label}</Select.ItemText>
								</Select.Item>
							{/each}
						</Select.Popup>
					</Select.Positioner>
				</Select.Portal>
			</Select.Root>
		{:else if control === 'range'}
			<Slider.Root {...spread} {...props} host={{ 'data-testid': 'slider' }}>
				<Slider.Control>
					<Slider.Track>
						<Slider.Indicator data-testid="indicator" />
						{#each thumbs as thumb, index (index)}
							<Slider.Thumb {...thumb} aria-label={`Thumb ${index}`} />
						{/each}
					</Slider.Track>
				</Slider.Control>
				<Slider.Value data-testid="value" />
			</Slider.Root>
		{:else if control === 'number'}
			<NumberField.Root {...spread} {...props} host={{ 'data-testid': 'number-field' }}>
				<NumberField.Group>
					<NumberField.Decrement data-testid="decrement" />
					<NumberField.Input data-testid="input" />
					<NumberField.Increment data-testid="increment" />
				</NumberField.Group>
			</NumberField.Root>
		{/if}
		<Field.Error data-testid="error" />
	</Field.Root>
</Form>
