<!--
	Indicates whether the checkbox is ticked.
	Renders a `<span>` while ticked, mixed, or kept mounted.
	Derived from Base UI v1.8.0 packages/react/src/checkbox/indicator/CheckboxIndicator.tsx,
	packages/react/src/internals/useTransitionStatus.ts (default arguments),
	and packages/react/src/internals/useOpenChangeComplete.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import { createAttachmentKey, type Attachment } from 'svelte/attachments';
	import type { HTMLAttributes } from 'svelte/elements';
	import { checkboxIndicatorAttributes } from './attributes.js';
	import { useCheckboxContext } from './context.js';
	import { runOnceAnimationsFinish } from '../internal/animations-finished.js';
	import { useAnimationFrame } from '../internal/timeout.svelte.js';
	import type {
		CheckboxIndicatorPhase,
		CheckboxIndicatorProps,
		CheckboxIndicatorState
	} from './types.js';

	let { keepMounted = false, render, children, ...elementProps }: CheckboxIndicatorProps = $props();

	const ctx = useCheckboxContext();
	const rendered = $derived(ctx.checked || ctx.indeterminate);
	const indicatorKey = createAttachmentKey();

	let mounted = $state(untrack(() => ctx.checked || ctx.indeterminate));
	let transitionStatus: CheckboxIndicatorPhase = $state(undefined);
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

	const settleFrame = useAnimationFrame();

	$effect(() => {
		if (!rendered) return;
		settleFrame.request(() => {
			transitionStatus = undefined;
		});
		return () => settleFrame.cancel();
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

	const indicatorState: CheckboxIndicatorState = $derived({
		checked: ctx.checked,
		disabled: ctx.disabled,
		readOnly: ctx.readOnly,
		required: ctx.required,
		indeterminate: ctx.indeterminate,
		transitionStatus
	});

	const hostProps: HTMLAttributes<HTMLSpanElement> & Record<symbol, Attachment<HTMLElement>> =
		$derived({
			...checkboxIndicatorAttributes(indicatorState),
			...elementProps,
			[indicatorKey]: registerIndicator
		});

	const shouldRender = $derived(keepMounted || mounted);
</script>

{#if shouldRender}
	{#if render}
		{@render render(hostProps, indicatorState, children)}
	{:else}
		<span {...hostProps}>{@render children?.()}</span>
	{/if}
{/if}
