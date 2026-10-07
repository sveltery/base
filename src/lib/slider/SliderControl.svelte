<!--
	The clickable, interactive part of the slider.
	Renders a `<div>` element.
	Derived from Base UI v1.8.0 packages/react/src/slider/control/SliderControl.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import type { Attachment } from 'svelte/attachments';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { sliderStateAttributes } from './attributes.js';
	import { useSliderContext } from './context.svelte.js';
	import { addEventListener } from './dom.js';
	import type { SliderControlProps, SliderRootState } from './types.js';

	const elementKey = createAttachmentKey();

	let { render, children, onpointerdown, ...elementProps }: SliderControlProps = $props();

	const model = useSliderContext();
	let controlEl: HTMLElement | null = $state(null);

	function remember(node: HTMLElement) {
		model.control = node;
		model.captureStyles(node);
		const stopTouch = addEventListener(
			node,
			'touchstart',
			(event) => model.onTouchStart(event as TouchEvent),
			{ passive: true }
		);
		return () => {
			stopTouch();
			model.stopListening();
			model.cancelFocusFrame();
			if (model.control === node) model.control = null;
		};
	}

	$effect(() => {
		const node = controlEl;
		if (!node) return;
		return remember(node);
	});

	$effect(() => {
		if (model.disabled) model.stopListening();
	});

	function handlePointerDown(
		event: PointerEvent & { currentTarget: EventTarget & HTMLDivElement }
	) {
		onpointerdown?.(event);
		if (event.defaultPrevented) return;
		model.onPointerDown(event);
	}

	const partState: SliderRootState = $derived(model.snapshot());

	const hostProps: HTMLAttributes<HTMLDivElement> & Record<symbol, Attachment<HTMLDivElement>> =
		$derived.by(() => {
			const props: HTMLAttributes<HTMLDivElement> & Record<symbol, Attachment<HTMLDivElement>> = {
				...elementProps,
				...getStateAttributesProps(partState, sliderStateAttributes),
				...(model.renderBeforeHydration ? { 'data-base-ui-slider-control': '' } : {}),
				onpointerdown: handlePointerDown
			};
			if (render) props[elementKey] = remember;
			return props;
		});
</script>

{#snippet content()}
	{@render children?.()}
{/snippet}

{#if render}
	{@render render(hostProps, partState, content)}
{:else}
	<div {...hostProps} bind:this={controlEl}>{@render content()}</div>
{/if}
