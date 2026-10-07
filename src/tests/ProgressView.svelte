<script lang="ts">
	import { Progress } from '#lib';

	let {
		value,
		min = 0,
		max = 100,
		format = undefined,
		locale = undefined,
		getAriaValueText = undefined,
		label = 'Upload progress',
		showLabel = true,
		labelId = undefined,
		customValue = false
	}: {
		value: number | null;
		min?: number;
		max?: number;
		format?: Intl.NumberFormatOptions;
		locale?: Intl.LocalesArgument;
		getAriaValueText?: (formattedValue: string, value: number | null) => string;
		label?: string;
		showLabel?: boolean;
		labelId?: string;
		customValue?: boolean;
	} = $props();
</script>

<Progress.Root {value} {min} {max} {format} {locale} {getAriaValueText}>
	{#if showLabel}
		<Progress.Label data-testid="label" id={labelId}>{label}</Progress.Label>
	{/if}
	{#if customValue}
		<Progress.Value data-testid="value">
			{#snippet children(formatted, raw)}
				{formatted}|{raw === null ? 'null' : String(raw)}
			{/snippet}
		</Progress.Value>
	{:else}
		<Progress.Value data-testid="value" />
	{/if}
	<Progress.Track data-testid="track">
		<Progress.Indicator data-testid="indicator" />
	</Progress.Track>
</Progress.Root>
