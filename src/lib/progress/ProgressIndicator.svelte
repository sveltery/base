<!--
	Visualizes the completion status of the task.
	Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/progress/indicator/ProgressIndicator.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { mergeCssStyle, toCssStyle } from '../internal/css-style.js';
	import { useProgressRootContext } from './ProgressRootContext.svelte.js';
	import { progressStateAttributesMapping } from './stateAttributesMapping.js';
	import type { ProgressIndicatorProps, ProgressState } from './types.js';

	let { render, children, style, ...elementProps }: ProgressIndicatorProps = $props();

	const context = useProgressRootContext();
	const state: ProgressState = $derived({ status: context.computed.status });
	const percentageValue = $derived(context.computed.percentageValue);

	const hostProps: HTMLAttributes<HTMLDivElement> = $derived.by(() => {
		const indicatorStyle =
			percentageValue == null
				? undefined
				: toCssStyle({
						insetInlineStart: 0,
						height: 'inherit',
						width: `${percentageValue}%`
					});
		const props: HTMLAttributes<HTMLDivElement> = {
			...elementProps,
			...getStateAttributesProps(state, progressStateAttributesMapping)
		};
		const merged = mergeCssStyle(indicatorStyle, style);
		if (merged !== undefined) {
			props.style = merged;
		}
		return props;
	});
</script>

{#if render}
	{@render render(hostProps, state, children)}
{:else}
	<div {...hostProps}>{@render children?.()}</div>
{/if}
