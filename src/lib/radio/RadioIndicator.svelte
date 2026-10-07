<!--
	Indicates whether the radio button is selected.
	Renders a `<span>` while selected or kept mounted.
	Derived from Base UI v1.8.0 packages/react/src/radio/indicator/RadioIndicator.tsx,
	packages/react/src/internals/useTransitionStatus.ts (default arguments),
	and packages/react/src/internals/useOpenChangeComplete.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import { createAttachmentKey, type Attachment } from 'svelte/attachments';
	import type { HTMLAttributes } from 'svelte/elements';
	import { radioIndicatorAttributes } from './attributes.js';
	import { useRadioContext } from './context.js';
	import { runOnceAnimationsFinish } from '../internal/animations-finished.js';
	import type { RadioIndicatorPhase, RadioIndicatorProps, RadioIndicatorState } from './types.js';

	let { keepMounted = false, render, children, ...elementProps }: RadioIndicatorProps = $props();

	const ctx = useRadioContext();
	const rendered = $derived(ctx.checked);
	const indicatorKey = createAttachmentKey();

	let mounted = $state(untrack(() => ctx.checked));
	let transitionStatus: RadioIndicatorPhase = $state(undefined);
	let indicatorNode: HTMLElement | null = $state(null);

	function registerIndicator(element: HTMLElement) {
		indicatorNode = element;
		return () => {
			if (indicatorNode === element) indicatorNode = null;
		};
	}

	$effect.pre(() => {
		const open = rendered;
		if (open && !mounted) {
			mounted = true;
			transitionStatus = 'starting';
		}
		if (!open && mounted && transitionStatus !== 'ending') {
			transitionStatus = 'ending';
		}
		if (!open && !mounted && transitionStatus === 'ending') {
			transitionStatus = undefined;
		}
	});

	$effect(() => {
		if (!rendered) return;
		const frame = requestAnimationFrame(() => {
			transitionStatus = undefined;
		});
		return () => cancelAnimationFrame(frame);
	});

	$effect(() => {
		const element = indicatorNode;
		const open = rendered;
		const isMounted = mounted;
		if (open || !element || !isMounted) return;

		const abort = new AbortController();
		runOnceAnimationsFinish(
			element,
			() => {
				mounted = false;
			},
			abort.signal,
			true
		);
		return () => abort.abort();
	});

	const indicatorState: RadioIndicatorState = $derived({
		checked: ctx.checked,
		disabled: ctx.disabled,
		readOnly: ctx.readOnly,
		required: ctx.required,
		transitionStatus
	});

	const hostProps: HTMLAttributes<HTMLSpanElement> & Record<symbol, Attachment<HTMLElement>> =
		$derived({
			...radioIndicatorAttributes(indicatorState),
			...elementProps,
			[indicatorKey]: registerIndicator
		});

	const shouldRender = $derived(keepMounted || mounted);
</script>

{#if shouldRender}
	{#if render}
		{@render render(hostProps, indicatorState)}
	{:else}
		<span {...hostProps}>{@render children?.()}</span>
	{/if}
{/if}
