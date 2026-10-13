<script lang="ts">
	import {
		Checkbox,
		CheckboxGroup,
		Field,
		Form,
		NumberField,
		OTPField,
		Radio,
		RadioGroup,
		Slider,
		Switch
	} from '#lib';
	import type { ControlKind } from '#lib/form/source.js';
	import BoundFieldScope from './BoundFieldScope.svelte';
	import type { FakeRemoteForm } from './fake-remote-form.svelte.js';

	type BoundScenario =
		| 'checkbox'
		| 'switch'
		| 'radio-group'
		| 'checkbox-group'
		| 'number-field'
		| 'slider'
		| 'range-slider'
		| 'otp-field';

	let {
		source,
		scenario,
		type,
		real = false
	}: {
		source: FakeRemoteForm;
		scenario: BoundScenario;
		type?: ControlKind;
		/** Bind a real `Field.Root field={...}` instead of re-providing a named Field's context. */
		real?: boolean;
	} = $props();

	const box = 'display: inline-block; width: 16px; height: 16px';
	const paths: Record<BoundScenario, [string, ControlKind]> = {
		checkbox: ['agree', 'checkbox'],
		switch: ['alerts', 'switch'],
		'radio-group': ['plan', 'radio'],
		'checkbox-group': ['tags', 'checkbox'],
		'number-field': ['seats', 'number'],
		slider: ['volume', 'range'],
		'range-slider': ['volume', 'range'],
		'otp-field': ['code', 'text']
	};
	const [path, kind] = $derived(paths[scenario]);
</script>

{#snippet control()}
	{#if scenario === 'checkbox'}
		<Checkbox.Root value="yes" uncheckedValue="no" data-testid="control" style={box} />
	{:else if scenario === 'switch'}
		<Switch.Root value="yes" uncheckedValue="no" data-testid="control" style={box} />
	{:else if scenario === 'radio-group'}
		<RadioGroup defaultValue="free">
			<Radio.Root value="free" data-testid="free" style={box} />
			<Radio.Root value="pro" data-testid="pro" style={box} />
		</RadioGroup>
	{:else if scenario === 'checkbox-group'}
		<CheckboxGroup defaultValue={['svelte']}>
			<Checkbox.Root value="svelte" data-testid="svelte" style={box} />
			<Checkbox.Root value="kit" data-testid="kit" style={box} />
		</CheckboxGroup>
	{:else if scenario === 'number-field'}
		<NumberField.Root defaultValue={1}>
			<NumberField.Input data-testid="control" />
		</NumberField.Root>
	{:else if scenario === 'slider' || scenario === 'range-slider'}
		<Slider.Root defaultValue={scenario === 'slider' ? 30 : [20, 80]}>
			<Slider.Control>
				<Slider.Track>
					<Slider.Thumb index={scenario === 'slider' ? undefined : 0} />
					{#if scenario === 'range-slider'}<Slider.Thumb index={1} />{/if}
				</Slider.Track>
			</Slider.Control>
		</Slider.Root>
	{:else if scenario === 'otp-field'}
		<OTPField.Root length={4} defaultValue="12">
			{#each [0, 1, 2, 3] as index (index)}
				<OTPField.Input data-testid={`slot-${index}`} />
			{/each}
		</OTPField.Root>
	{/if}
{/snippet}

<Form data-testid="form" {@attach source.attach}>
	{#if real}
		<Field.Root field={source.field(path)} type={type ?? kind}>
			{@render control()}
		</Field.Root>
	{:else}
		<Field.Root name={path}>
			<BoundFieldScope binding={source.field(path)} type={type ?? kind}>
				{@render control()}
			</BoundFieldScope>
		</Field.Root>
	{/if}
</Form>
