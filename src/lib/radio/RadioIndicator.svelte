<!--
	Indicates whether the radio button is selected.
	Renders a `<span>` element.
	Derived from Base UI v1.8.0 packages/react/src/radio/indicator/RadioIndicator.tsx (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { createAttachmentKey, type Attachment } from 'svelte/attachments';
	import type { HTMLAttributes } from 'svelte/elements';
	import { radioIndicatorAttributes } from './attributes.js';
	import { useFieldContext } from '../internal/field-root-context.js';
	import { useRadioContext } from './context.js';
	import { TransitionStatus } from '../internal/useTransitionStatus.svelte.js';
	import type { RadioIndicatorProps, RadioIndicatorState } from './types.js';

	let { keepMounted = false, render, children, ...elementProps }: RadioIndicatorProps = $props();

	const ctx = useRadioContext();
	const field = useFieldContext();
	const rendered = $derived(ctx.checked);
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

	const indicatorState: RadioIndicatorState = $derived({
		...field.state,
		checked: ctx.checked,
		disabled: ctx.disabled,
		readOnly: ctx.readOnly,
		required: ctx.required,
		transitionStatus: transition.transitionStatus
	});

	const hostProps: HTMLAttributes<HTMLSpanElement> & Record<symbol, Attachment<HTMLElement>> =
		$derived({
			...radioIndicatorAttributes(indicatorState),
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
