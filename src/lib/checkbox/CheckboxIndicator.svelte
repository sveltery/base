<!--
	Indicates whether the checkbox is ticked.
	Renders a `<span>` while ticked, mixed, or kept mounted.
	Derived from Base UI v1.8.0 packages/react/src/checkbox/indicator/CheckboxIndicator.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { createAttachmentKey, type Attachment } from 'svelte/attachments';
	import type { HTMLAttributes } from 'svelte/elements';
	import { checkboxIndicatorAttributes } from './attributes.js';
	import { useFieldContext } from '../internal/field-root-context.js';
	import { useCheckboxContext } from './context.js';
	import { TransitionStatus } from '../internal/useTransitionStatus.svelte.js';
	import type { CheckboxIndicatorProps, CheckboxIndicatorState } from './types.js';

	let { keepMounted = false, render, children, ...elementProps }: CheckboxIndicatorProps = $props();

	const ctx = useCheckboxContext();
	const field = useFieldContext();
	const rendered = $derived(ctx.checked || ctx.indeterminate);
	const indicatorKey = createAttachmentKey();

	const transition = new TransitionStatus(() => rendered);
	let indicatorNode: HTMLElement | null = $state(null);

	function registerIndicator(element: HTMLElement) {
		indicatorNode = element;
		return () => {
			if (indicatorNode === element) indicatorNode = null;
		};
	}

	transition.unmountAfterExit(() => indicatorNode, true);

	const indicatorState: CheckboxIndicatorState = $derived({
		...field.state,
		checked: ctx.checked,
		disabled: ctx.disabled,
		readOnly: ctx.readOnly,
		required: ctx.required,
		indeterminate: ctx.indeterminate,
		transitionStatus: transition.transitionStatus
	});

	const hostProps: HTMLAttributes<HTMLSpanElement> & Record<symbol, Attachment<HTMLElement>> =
		$derived({
			...checkboxIndicatorAttributes(indicatorState),
			...elementProps,
			[indicatorKey]: registerIndicator
		});

	const shouldRender = $derived(keepMounted || transition.mounted);
</script>

{#if shouldRender}
	{#if render}
		{@render render(hostProps, indicatorState, children)}
	{:else}
		<span {...hostProps}>{@render children?.()}</span>
	{/if}
{/if}
