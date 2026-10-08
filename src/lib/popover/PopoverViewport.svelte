<!--
	A viewport for displaying content transitions. Renders a `<div>` element.
	Derived from Base UI v1.8.0 packages/react/src/popover/viewport/PopoverViewport.tsx
	and packages/react/src/utils/usePopupViewport.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
	Previous content is a DOM clone. Svelte does not keep the old snippet instance.
-->
<script lang="ts">
	import { mergeProps } from '../internal/mergeProps.js';
	import { useDirection } from '../internal/direction-context.js';
	import { AnimationFrame } from '../internal/timeout.js';
	import { runOnceAnimationsFinish } from '../internal/animations-finished.js';
	import { adaptiveOrigin } from './adaptive-origin.js';
	import { usePopoverPositioner, usePopoverRoot } from './context.svelte.js';
	import { asHost, loose } from './loose-props.js';
	import type { PopoverViewportProps, PopoverViewportState } from './types.js';

	let { render, children, ...elementProps }: PopoverViewportProps = $props();

	const store = usePopoverRoot();
	const positioning = usePopoverPositioner();
	const direction = useDirection();
	const frame = AnimationFrame.create();

	let currentEl = $state<HTMLDivElement | null>(null);
	let previousEl = $state<HTMLDivElement | null>(null);
	let previousHtml = $state<string | null>(null);
	let activationDirection = $state<string | undefined>(undefined);
	let showStarting = $state(false);
	let transitionAbort: AbortController | null = null;

	$effect(() => {
		store.adaptiveOrigin = adaptiveOrigin;
		store.onTriggerSwitch = (previous, next) => {
			if (!currentEl) return;
			previousHtml = currentEl.innerHTML;
			activationDirection = directionBetween(previous, next);
			showStarting = true;
			transitionAbort?.abort();
			const controller = new AbortController();
			transitionAbort = controller;
			frame.request(() => {
				showStarting = false;
				const node = currentEl;
				if (!node) return;
				runOnceAnimationsFinish(
					node,
					() => {
						previousHtml = null;
						activationDirection = undefined;
					},
					controller.signal,
					false
				);
			});
		};
		return () => {
			if (store.adaptiveOrigin === adaptiveOrigin) store.adaptiveOrigin = undefined;
			store.onTriggerSwitch = null;
			transitionAbort?.abort();
		};
	});

	$effect(() => {
		const node = previousEl;
		const html = previousHtml;
		if (!node || html == null) return;
		node.innerHTML = html;
	});

	$effect(() => {
		const popup = store.popupElement;
		const positioner = store.positionerElement;
		const side = positioning.side;
		if (!store.mounted || !popup || !positioner) return;
		const width = popup.offsetWidth;
		const height = popup.offsetHeight;
		positioner.style.setProperty('--positioner-width', `${width}px`);
		positioner.style.setProperty('--positioner-height', `${height}px`);
		popup.style.setProperty('--popup-width', `${width}px`);
		popup.style.setProperty('--popup-height', `${height}px`);
		const textDirection = direction.direction;
		const anchorTop = side === 'top';
		const anchorLeft =
			side === 'left' || side === (textDirection === 'rtl' ? 'inline-end' : 'inline-start');
		if (!anchorTop && !anchorLeft) return;
		const restore = popup.style.position;
		popup.style.position = 'absolute';
		popup.style.setProperty(anchorTop ? 'bottom' : 'top', '0');
		popup.style.setProperty(anchorLeft ? 'right' : 'left', '0');
		return () => {
			popup.style.position = restore;
		};
	});

	const partState: PopoverViewportState = $derived({
		activationDirection,
		transitioning: previousHtml != null,
		instant: store.instantType
	});

	const hostProps = $derived(
		asHost<HTMLDivElement>(
			mergeProps(
				loose(elementProps),
				loose({
					...(activationDirection ? { 'data-activation-direction': activationDirection } : {}),
					...(previousHtml != null ? { 'data-transitioning': '' } : {}),
					...(store.instantType ? { 'data-instant': store.instantType } : {})
				})
			)
		)
	);

	function directionBetween(from: Element, to: Element) {
		const fromRect = from.getBoundingClientRect();
		const toRect = to.getBoundingClientRect();
		const horizontal = toRect.left + toRect.width / 2 - (fromRect.left + fromRect.width / 2);
		const vertical = toRect.top + toRect.height / 2 - (fromRect.top + fromRect.height / 2);
		return `${label(horizontal, 'right', 'left')} ${label(vertical, 'down', 'up')}`;
	}

	function label(value: number, positive: string, negative: string) {
		if (value > 5) return positive;
		if (value < -5) return negative;
		return '';
	}
</script>

{#if render}
	{@render render(hostProps, partState, content)}
{:else}
	<div {...hostProps}>{@render content()}</div>
{/if}

{#snippet content()}
	{#if previousHtml != null}
		<div
			bind:this={previousEl}
			data-previous
			data-ending-style={showStarting ? undefined : ''}
			inert
			style="position: absolute"
		></div>
	{/if}
	<div bind:this={currentEl} data-current data-starting-style={showStarting ? '' : undefined}>
		{@render children?.()}
	</div>
{/snippet}
