<script lang="ts">
	import { untrack } from 'svelte';
	import { Field, Form, Slider } from '#lib';

	let {
		scenario = 'plain',
		defaultValue = 30,
		min = 0,
		max = 100,
		step = 1,
		largeStep = 10,
		orientation = 'horizontal',
		disabled = false,
		thumbAlignment = 'center',
		thumbCollisionBehavior = 'push',
		minStepsBetweenValues = 0,
		name,
		form,
		format,
		locale = 'en-US',
		ariaLabelledBy,
		dir,
		id,
		thumbCount = 1,
		disabledThumbs = [],
		getAriaLabel,
		getAriaValueText,
		ariaValueText,
		onValueChange,
		onValueCommitted,
		onkeydown,
		onBubble,
		validate,
		validationMode,
		fieldDisabled = false,
		fieldName,
		omitThumb = false,
		unrelated = false,
		valueChildren = false,
		knob = false
	}: {
		scenario?: string;
		defaultValue?: number | number[];
		min?: number;
		max?: number;
		step?: number;
		largeStep?: number;
		orientation?: 'horizontal' | 'vertical';
		disabled?: boolean;
		thumbAlignment?: 'center' | 'edge' | 'edge-client-only';
		thumbCollisionBehavior?: 'push' | 'swap' | 'none';
		minStepsBetweenValues?: number;
		name?: string;
		form?: string;
		format?: Intl.NumberFormatOptions;
		locale?: Intl.LocalesArgument;
		ariaLabelledBy?: string;
		dir?: 'ltr' | 'rtl';
		id?: string;
		thumbCount?: number;
		disabledThumbs?: number[];
		getAriaLabel?: (index: number) => string;
		getAriaValueText?: (formattedValue: string, value: number, index: number) => string;
		ariaValueText?: string;
		onValueChange?: (
			value: number | readonly number[],
			details: { cancel: () => void; reason: string; activeThumbIndex: number; event: Event }
		) => void;
		onValueCommitted?: (
			value: number | readonly number[],
			details: { reason: string; event: Event }
		) => void;
		onkeydown?: (event: KeyboardEvent) => void;
		onBubble?: (event: KeyboardEvent) => void;
		validate?: (value: unknown, formValues: Record<string, unknown>) => string | string[] | null;
		validationMode?: 'onSubmit' | 'onBlur' | 'onChange';
		fieldDisabled?: boolean;
		fieldName?: string;
		omitThumb?: boolean;
		unrelated?: boolean;
		valueChildren?: boolean;
		knob?: boolean;
	} = $props();

	let bound = $state<number | readonly number[]>(
		untrack(() => (Array.isArray(defaultValue) ? [...defaultValue] : defaultValue))
	);
	let errors = $state<Record<string, string>>({ slider: 'stale' });
	let submitted = $state('');

	function accept(values: Record<string, unknown>, details: { reason: string }) {
		submitted = JSON.stringify({ values, reason: details.reason });
	}

	function nativeSubmit(event: SubmitEvent) {
		event.preventDefault();
		const node = event.currentTarget;
		if (!(node instanceof HTMLFormElement)) return;
		submitted = JSON.stringify([...new FormData(node).getAll('slider')]);
	}
</script>

{#snippet valuePart()}
	{#if valueChildren}
		<Slider.Value data-testid="value">
			{#snippet children(formatted, values)}{formatted.join('/')}:{values.join(',')}{/snippet}
		</Slider.Value>
	{:else}
		<Slider.Value data-testid="value" />
	{/if}
{/snippet}

{#snippet thumbs()}
	{#if !omitThumb}
		{#each Array.from({ length: thumbCount }, (_, index) => index) as index (index)}
			<Slider.Thumb
				index={thumbCount > 1 ? index : undefined}
				disabled={disabledThumbs.includes(index)}
				{getAriaLabel}
				{getAriaValueText}
				aria-valuetext={ariaValueText}
				{onkeydown}
				data-testid={thumbCount > 1 ? `thumb-${index}` : 'thumb'}
			>
				{#if knob}<span data-testid="knob">knob</span>{/if}
			</Slider.Thumb>
		{/each}
	{/if}
{/snippet}

{#snippet slider()}
	{#if scenario === 'render'}
		<Slider.Root
			{defaultValue}
			{min}
			{max}
			{step}
			{largeStep}
			{orientation}
			{disabled}
			{thumbAlignment}
			{thumbCollisionBehavior}
			{minStepsBetweenValues}
			{name}
			{form}
			{format}
			{locale}
			{id}
			aria-labelledby={ariaLabelledBy}
			{onValueChange}
			{onValueCommitted}
		>
			{#snippet render(props, state, children)}
				<div {...props} data-testid="root" data-custom="" data-active={state.activeThumbIndex}>
					{@render children()}
				</div>
			{/snippet}
			{@render valuePart()}
			<Slider.Control data-testid="control">
				<Slider.Track data-testid="track">
					<Slider.Indicator data-testid="indicator" />
					{@render thumbs()}
				</Slider.Track>
			</Slider.Control>
		</Slider.Root>
	{:else if scenario === 'bound'}
		<Slider.Root
			bind:value={bound}
			{min}
			{max}
			{step}
			{largeStep}
			{orientation}
			{locale}
			data-testid="root"
			{onValueChange}
			{onValueCommitted}
		>
			{@render valuePart()}
			<Slider.Control data-testid="control">
				<Slider.Track data-testid="track">
					<Slider.Indicator data-testid="indicator" />
					{@render thumbs()}
				</Slider.Track>
			</Slider.Control>
		</Slider.Root>
		<output data-testid="bound">{JSON.stringify(bound)}</output>
		<button
			type="button"
			data-testid="set"
			onclick={() => (bound = Array.isArray(bound) ? [10, 80] : 70)}
		>
			Set
		</button>
	{:else}
		<Slider.Root
			{defaultValue}
			{min}
			{max}
			{step}
			{largeStep}
			{orientation}
			{disabled}
			{thumbAlignment}
			{thumbCollisionBehavior}
			{minStepsBetweenValues}
			{name}
			{form}
			{format}
			{locale}
			{id}
			aria-labelledby={ariaLabelledBy}
			data-testid="root"
			{onValueChange}
			{onValueCommitted}
		>
			{#if scenario === 'label' || scenario === 'field-label'}
				<Slider.Label data-testid="label">Volume</Slider.Label>
			{/if}
			{@render valuePart()}
			<Slider.Control data-testid="control">
				{#if unrelated}
					<input aria-label="Unrelated range" type="range" />
				{/if}
				<Slider.Track data-testid="track">
					<Slider.Indicator data-testid="indicator" />
					{@render thumbs()}
				</Slider.Track>
			</Slider.Control>
		</Slider.Root>
	{/if}
{/snippet}

{#snippet fieldBody()}
	{#if scenario === 'field-label'}
		<Field.Label data-testid="field-label">Volume</Field.Label>
	{/if}
	{@render slider()}
	<Field.Error data-testid="error" />
{/snippet}

{#if scenario === 'orphan'}
	<Slider.Control />
{:else if scenario === 'field' || scenario === 'field-label'}
	<Field.Root
		disabled={fieldDisabled}
		name={fieldName}
		{validate}
		{validationMode}
		data-testid="field"
	>
		{@render fieldBody()}
	</Field.Root>
{:else if scenario === 'form'}
	<Form onFormSubmit={accept}>
		<Field.Root name={fieldName ?? 'slider'} {validate} {validationMode}>
			{@render slider()}
			<Field.Error data-testid="error" />
		</Field.Root>
		<button type="submit">Submit</button>
	</Form>
	<output data-testid="submitted">{submitted}</output>
{:else if scenario === 'form-errors'}
	<Form bind:errors onFormSubmit={accept}>
		<Field.Root name="slider">
			{@render slider()}
		</Field.Root>
	</Form>
	<output data-testid="errors">{JSON.stringify(errors)}</output>
{:else if scenario === 'external'}
	<form id="external-form" onsubmit={nativeSubmit}>
		<button type="submit">Submit</button>
	</form>
	{@render slider()}
	<output data-testid="submitted">{submitted}</output>
{:else if scenario === 'bubble'}
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div data-testid="bubble" role="group" {dir} onkeydown={onBubble}>
		{@render slider()}
	</div>
{:else if dir}
	<div {dir}>
		{@render slider()}
	</div>
{:else}
	{@render slider()}
{/if}
