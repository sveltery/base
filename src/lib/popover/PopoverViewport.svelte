<!--
	A viewport for displaying content transitions. Renders a `<div>` element.
	Derived from Base UI v1.8.0 packages/react/src/popover/viewport/PopoverViewport.tsx
	and packages/react/src/utils/usePopupViewport.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
	Previous content is a cloned node, not an HTML string. Ids are stripped so
	aria links keep pointing at the live title and description.
-->
<script lang="ts">
	import { mergeProps } from '../internal/mergeProps.js';
	import { useDirection } from '../internal/direction-context.js';
	import { AnimationFrame } from '../internal/timeout.js';
	import { runOnceAnimationsFinish } from '../internal/animations-finished.js';
	import { adaptiveOriginMiddleware } from '../internal/adaptiveOriginMiddleware.js';
	import { usePopoverPositioner, usePopoverRoot } from './context.svelte.js';
	import type { PopoverViewportProps, PopoverViewportState } from './types.js';

	let { render, children, ...elementProps }: PopoverViewportProps = $props();

	const store = usePopoverRoot();
	const positioning = usePopoverPositioner();
	const direction = useDirection();
	const frame = AnimationFrame.create();

	let currentEl = $state<HTMLDivElement | null>(null);
	let previousNode = $state<HTMLElement | null>(null);
	let activationDirection = $state<string | undefined>(undefined);
	let showStarting = $state(false);
	let transitionAbort: AbortController | null = null;

	$effect(() => {
		store.adaptiveOrigin = adaptiveOriginMiddleware;
		store.hooks.triggerSwitch = (previous, next) => {
			if (!currentEl) return;
			previousNode = snapshot(currentEl);
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
						previousNode = null;
						activationDirection = undefined;
					},
					controller.signal,
					false
				);
			});
		};
		return () => {
			if (store.adaptiveOrigin === adaptiveOriginMiddleware) store.adaptiveOrigin = undefined;
			store.hooks.triggerSwitch = null;
			frame.cancel();
			transitionAbort?.abort();
		};
	});

	$effect(() => {
		const popup = store.popupElement;
		const positioner = store.positionerElement;
		const side = positioning.side;
		if (!store.mounted || !popup || !positioner) {
			store.positionerVars = {};
			store.popupVars = {};
			return;
		}
		const width = popup.offsetWidth;
		const height = popup.offsetHeight;
		store.positionerVars = {
			'--positioner-width': `${width}px`,
			'--positioner-height': `${height}px`
		};
		const textDirection = direction.direction;
		const anchorTop = side === 'top';
		const anchorLeft =
			side === 'left' || side === (textDirection === 'rtl' ? 'inline-end' : 'inline-start');
		const popupVars: Record<string, string> = {
			'--popup-width': `${width}px`,
			'--popup-height': `${height}px`
		};
		if (anchorTop || anchorLeft) {
			popupVars.position = 'absolute';
			popupVars[anchorTop ? 'bottom' : 'top'] = '0';
			popupVars[anchorLeft ? 'right' : 'left'] = '0';
		}
		store.popupVars = popupVars;
	});

	const partState: PopoverViewportState = $derived({
		activationDirection,
		transitioning: previousNode != null,
		instant: store.instantType
	});

	const hostProps = $derived(
		mergeProps(elementProps, {
			...(activationDirection ? { 'data-activation-direction': activationDirection } : {}),
			...(previousNode != null ? { 'data-transitioning': '' } : {}),
			...(store.instantType ? { 'data-instant': store.instantType } : {})
		})
	);

	function snapshot(source: HTMLElement) {
		const wrapper = source.ownerDocument.createElement('div');
		for (const child of source.childNodes) {
			const copy = child.cloneNode(true);
			if (child instanceof Element && copy instanceof Element) copyControlState(child, copy);
			wrapper.appendChild(copy);
		}
		stripIds(wrapper);
		return wrapper;
	}

	function copyControlState(from: Element, to: Element) {
		const sources = controls(from);
		const targets = controls(to);
		sources.forEach((node, index) => {
			const dest = targets[index];
			if (!dest) return;
			if (node instanceof HTMLInputElement && dest instanceof HTMLInputElement) {
				dest.value = node.value;
				dest.checked = node.checked;
			} else if (node instanceof HTMLTextAreaElement && dest instanceof HTMLTextAreaElement) {
				dest.value = node.value;
			} else if (node instanceof HTMLSelectElement && dest instanceof HTMLSelectElement) {
				dest.value = node.value;
			}
		});
	}

	function controls(node: Element) {
		const found = [...node.querySelectorAll('input, textarea, select')];
		if (node.matches('input, textarea, select')) found.unshift(node);
		return found;
	}

	function stripIds(node: Element) {
		if (node.id) node.removeAttribute('id');
		for (const child of node.querySelectorAll('[id]')) child.removeAttribute('id');
	}

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
	<div bind:this={currentEl} data-current data-starting-style={showStarting ? '' : undefined}>
		{@render children?.()}
	</div>
	{#if previousNode}
		<div
			data-previous
			data-ending-style={showStarting ? undefined : ''}
			inert
			aria-hidden="true"
			style="position: absolute"
			{@attach (host) => {
				const node = previousNode;
				if (!node) return;
				host.replaceChildren(node);
				return () => {
					if (node.parentNode === host) host.removeChild(node);
				};
			}}
		></div>
	{/if}
{/snippet}
