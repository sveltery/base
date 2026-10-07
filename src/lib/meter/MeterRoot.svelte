<!--
	Groups all parts of the meter and provides the value for screen readers.
	Renders a `<div>` element.
	Derived from Base UI v1.8.0 packages/react/src/meter/root/MeterRoot.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { clamp } from '../internal/clamp.js';
	import { formatNumber } from '../internal/formatNumber.js';
	import { valueToPercent } from '../internal/valueToPercent.js';
	import { visuallyHidden } from '../internal/visuallyHidden.js';
	import { setMeterRootContext, type MeterRootContextValue } from './context.js';
	import type { MeterRootProps, MeterRootState } from './types.js';

	let {
		format,
		getAriaValueText,
		locale,
		max = 100,
		min = 0,
		value,
		render,
		children,
		...elementProps
	}: MeterRootProps = $props();

	let labelId = $state<string | undefined>(undefined);

	// `clamp` handles infinity, but NaN needs an explicit fallback before normalizing range outputs.
	const rawPercentage = $derived(valueToPercent(value, min, max));
	const percentageValue = $derived(clamp(Number.isNaN(rawPercentage) ? 0 : rawPercentage, 0, 100));
	const clampedValue = $derived(clamp(Number.isNaN(value) ? min : value, min, max));

	// Format the clamped value so visible and accessible text stay in sync with `aria-valuenow` and
	// the indicator fill. The raw value remains available as the second `getAriaValueText` argument.
	const formattedValue = $derived(
		format
			? formatNumber(clampedValue, locale, format)
			: formatNumber(percentageValue / 100, locale, { style: 'percent' })
	);
	const ariaValuetext = $derived(
		getAriaValueText ? getAriaValueText(formattedValue, value) : formattedValue
	);

	const partState: MeterRootState = {};

	// Getters read the live props so parts see the raw value, not only the clamped display.
	const context: MeterRootContextValue = {
		get formattedValue() {
			return formattedValue;
		},
		get percentageValue() {
			return percentageValue;
		},
		get value() {
			return value;
		},
		get labelId() {
			return labelId;
		},
		set labelId(next) {
			labelId = next;
		}
	};
	setMeterRootContext(context);

	const hiddenStyle = Object.entries(visuallyHidden)
		.map(([key, declaration]) => {
			const property = key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
			return `${property}:${declaration}`;
		})
		.join(';');

	const hostProps: HTMLAttributes<HTMLDivElement> = $derived({
		role: 'meter',
		'aria-valuemax': max,
		'aria-valuemin': min,
		'aria-valuenow': clampedValue,
		'aria-valuetext': ariaValuetext,
		...(labelId !== undefined ? { 'aria-labelledby': labelId } : {}),
		...elementProps
	});
</script>

{#snippet content()}
	{@render children?.()}
	<!-- force NVDA to read the label: https://github.com/mui/base-ui/issues/4184 -->
	<span role="presentation" style={hiddenStyle}>x</span>
{/snippet}

{#if render}
	{@render render(hostProps, partState, content)}
{:else}
	<div {...hostProps}>{@render content()}</div>
{/if}
