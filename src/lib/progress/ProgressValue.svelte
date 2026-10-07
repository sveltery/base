<!--
	A text element displaying the current value.
	Renders a `<span>` element.
	Derived from Base UI v1.8.0 packages/react/src/progress/value/ProgressValue.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { useProgressRootContext } from './ProgressRootContext.svelte.js';
	import { progressStateAttributesMapping } from './stateAttributesMapping.js';
	import type { ProgressState, ProgressValueProps } from './types.js';

	let { render, children, ...elementProps }: ProgressValueProps = $props();

	const context = useProgressRootContext();
	const state: ProgressState = $derived({ status: context.computed.status });
	const rawValue = $derived(context.value);
	const formattedValue = $derived(context.computed.formattedValue);

	// Follow `status` rather than re-deriving it: a non-finite `value` is also indeterminate, and
	// has no formatted text to show.
	const indeterminate = $derived(state.status === 'indeterminate');
	const formattedValueArg = $derived(indeterminate ? 'indeterminate' : formattedValue);
	const formattedValueDisplay = $derived(indeterminate ? null : formattedValue);

	const hostProps: HTMLAttributes<HTMLSpanElement> = $derived({
		...elementProps,
		...getStateAttributesProps(state, progressStateAttributesMapping),
		'aria-hidden': true
	});
</script>

{#if render}
	{@render render(hostProps, state)}
{:else}
	<span {...hostProps}
		>{#if children}{@render children(
				formattedValueArg,
				rawValue
			)}{:else if formattedValueDisplay != null}{formattedValueDisplay}{/if}</span
	>
{/if}
