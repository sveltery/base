<!--
	A text element displaying the current value.
	Renders a `<span>` element.
	Derived from Base UI v1.9.0 packages/react/src/meter/value/MeterValue.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { useMeterRootContext } from './context.js';
	import type { MeterValueProps, MeterValueState } from './types.js';

	let { render, children, ...elementProps }: MeterValueProps = $props();

	const meter = useMeterRootContext();
	const formattedValue = $derived(meter.formattedValue);
	const value = $derived(meter.value);
	const partState: MeterValueState = {};

	const hostProps: HTMLAttributes<HTMLSpanElement> = $derived({
		'aria-hidden': true,
		...elementProps
	});
</script>

{#snippet content()}
	{#if children}
		{@render children(formattedValue, value)}
	{:else}
		{formattedValue}
	{/if}
{/snippet}

{#if render}
	{@render render(hostProps, partState, content)}
{:else}
	<span {...hostProps}>{@render content()}</span>
{/if}
