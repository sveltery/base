<!--
	Groups all parts of the progress bar and provides the task completion status to screen readers.
	Renders a `<div>` element.
	Derived from Base UI v1.8.0 packages/react/src/progress/root/ProgressRoot.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { visuallyHidden } from '@sveltery/utils';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { normalizeProgressValue } from './compute.js';
	import { toCssStyle } from '../internal/css-style.js';
	import { ProgressRootContext, provideProgressRootContext } from './ProgressRootContext.svelte.js';
	import { progressStateAttributesMapping } from './stateAttributesMapping.js';
	import type { ProgressRootProps, ProgressState } from './types.js';

	let {
		value,
		min = 0,
		max = 100,
		format,
		locale,
		getAriaValueText,
		'aria-valuetext': ariaValueTextProp,
		render,
		children,
		...elementProps
	}: ProgressRootProps = $props();

	const hiddenStyle = toCssStyle(visuallyHidden);

	const context = new ProgressRootContext(() => ({
		value: normalizeProgressValue(value),
		min,
		max,
		format,
		locale
	}));
	provideProgressRootContext(context);

	const computed = $derived(context.computed);
	const state: ProgressState = $derived({ status: computed.status });
	const ariaValueText = $derived(
		ariaValueTextProp ??
			(getAriaValueText
				? getAriaValueText(computed.formattedValue, context.value)
				: computed.defaultAriaValueText)
	);

	const hostProps: HTMLAttributes<HTMLDivElement> = $derived.by(() => {
		const props: HTMLAttributes<HTMLDivElement> = {
			...elementProps,
			...getStateAttributesProps(state, progressStateAttributesMapping),
			role: 'progressbar',
			'aria-valuemin': min,
			'aria-valuemax': max,
			'aria-valuetext': ariaValueText
		};
		if (context.labelId !== undefined) {
			props['aria-labelledby'] = context.labelId;
		}
		if (computed.clampedValue != null) {
			props['aria-valuenow'] = computed.clampedValue;
		}
		return props;
	});
</script>

{#snippet content()}
	{@render children?.()}
	<!-- force NVDA to read the label https://github.com/mui/base-ui/issues/4184 -->
	<span role="presentation" style={hiddenStyle}>x</span>
{/snippet}

{#if render}
	{@render render(hostProps, state, content)}
{:else}
	<div {...hostProps}>{@render content()}</div>
{/if}
