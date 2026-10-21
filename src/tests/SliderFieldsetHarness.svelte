<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { Field, Fieldset, Form, Slider } from '#lib';
	import { submitTo } from '../routes/fixtures/form-log.js';

	/** Renders the slider as the fieldset through `render`, as upstream's handbook does. */
	let { rendered = false }: { rendered?: boolean } = $props();

	let submitted = $state('');
	const format: Intl.NumberFormatOptions = { style: 'percent', maximumFractionDigits: 0 };
</script>

{#snippet parts()}
	<Fieldset.Legend>Scaling threshold</Fieldset.Legend>
	<Slider.Value data-testid="value" />
	<Slider.Control>
		<Slider.Track>
			<Slider.Indicator />
			<Slider.Thumb index={0} aria-label="Minimum threshold" />
			<Slider.Thumb index={1} aria-label="Maximum threshold" />
		</Slider.Track>
	</Slider.Control>
{/snippet}

<Form onsubmit={submitTo((values) => (submitted = JSON.stringify(values)))}>
	<Field.Root name="scalingThreshold">
		{#if rendered}
			<Fieldset.Root>
				{#snippet render(props, _state, children)}
					<Slider.Root
						{...props as HTMLAttributes<HTMLDivElement>}
						defaultValue={[0.2, 0.8]}
						min={0}
						max={1}
						step={0.01}
						{format}
						locale="en-US"
						data-testid="fieldset"
					>
						{@render children?.()}
					</Slider.Root>
				{/snippet}
				{@render parts()}
			</Fieldset.Root>
		{:else}
			<Fieldset.Root data-testid="fieldset">
				<Slider.Root defaultValue={[0.2, 0.8]} min={0} max={1} step={0.01} {format} locale="en-US">
					{@render parts()}
				</Slider.Root>
			</Fieldset.Root>
		{/if}
	</Field.Root>
	<button type="submit">Submit</button>
</Form>
<output data-testid="submitted">{submitted}</output>
