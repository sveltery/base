<script lang="ts">
	import { Meter, type MeterRootProps } from '#lib';

	let {
		value,
		min = undefined,
		max = undefined,
		locale = undefined,
		format = undefined,
		getAriaValueText = undefined,
		label = undefined,
		rootStyle = undefined,
		ariaValuetext = undefined,
		indicatorStyle = undefined,
		showIndicator = true
	}: {
		value: number;
		min?: number;
		max?: number;
		locale?: Intl.LocalesArgument;
		format?: Intl.NumberFormatOptions;
		getAriaValueText?: MeterRootProps['getAriaValueText'];
		label?: string;
		rootStyle?: string;
		ariaValuetext?: string;
		indicatorStyle?: string;
		showIndicator?: boolean;
	} = $props();
</script>

<Meter.Root
	{value}
	{min}
	{max}
	{locale}
	{format}
	{getAriaValueText}
	style={rootStyle}
	{...ariaValuetext === undefined ? {} : { 'aria-valuetext': ariaValuetext }}
>
	{#if label}
		<Meter.Label>{label}</Meter.Label>
	{/if}
	<Meter.Value data-testid="value" />
	{#if showIndicator}
		<Meter.Track data-testid="track">
			<Meter.Indicator data-testid="indicator" style={indicatorStyle} />
		</Meter.Track>
	{/if}
</Meter.Root>
