<!--
	A viewport for displaying content transitions. Renders a `<div>` element.
	Derived from Base UI v1.8.0 packages/react/src/popover/viewport/PopoverViewport.tsx
	and packages/react/src/utils/usePopupViewport.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
	Previous content is a cloned node, not an HTML string. Ids are stripped so
	aria links keep pointing at the live title and description.
-->
<script lang="ts">
	import { untrack } from 'svelte';
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
	const resizeFrame = AnimationFrame.create();

	let currentEl = $state<HTMLDivElement | null>(null);
	let previousSlot = $state<HTMLDivElement | null>(null);
	let previousNode = $state<HTMLElement | null>(null);
	let activationDirection = $state<string | undefined>(undefined);
	let showStarting = $state(false);
	let committedSize: { width: number; height: number } | null = null;

	$effect(() => {
		store.adaptiveOrigin = adaptiveOriginMiddleware;
		return () => {
			if (store.adaptiveOrigin === adaptiveOriginMiddleware) store.adaptiveOrigin = undefined;
		};
	});

	$effect(() => {
		const generation = store.triggerSwitch;
		if (generation === 0) return;
		const controller = new AbortController();
		let host: HTMLDivElement | null = null;
		untrack(() => {
			const source = currentEl;
			const active = store.domReferenceElement;
			const previous = store.switchedFrom;
			const slot = previousSlot;
			if (!source || !active || !previous || !slot) return;
			// Insert the clone in the same turn the previous pane appears. A later
			// attachment leaves an empty shell that observers can read first.
			host = source.ownerDocument.createElement('div');
			host.setAttribute('data-previous', '');
			host.inert = true;
			host.setAttribute('aria-hidden', 'true');
			host.style.position = 'absolute';
			host.appendChild(snapshot(source));
			slot.replaceChildren(host);
			previousNode = host;
			activationDirection = directionBetween(previous, active);
			showStarting = true;
			frame.request(() => {
				showStarting = false;
				const node = currentEl;
				if (!node) return;
				runOnceAnimationsFinish(
					node,
					() => {
						if (controller.signal.aborted) return;
						dropPrevious(host);
					},
					controller.signal,
					false
				);
			});
		});
		return () => {
			controller.abort();
			frame.cancel();
			dropPrevious(host);
		};
	});

	$effect(() => {
		const host = previousNode;
		if (!host) return;
		if (showStarting) host.removeAttribute('data-ending-style');
		else host.setAttribute('data-ending-style', '');
	});

	function dropPrevious(host: HTMLElement | null) {
		host?.remove();
		if (host && previousNode === host) {
			previousNode = null;
			activationDirection = undefined;
		}
	}

	$effect(() => {
		const content = store.payload;
		const mounted = store.mounted;
		const popup = store.popupElement;
		const positioner = store.positionerElement;
		const side = positioning.side;
		const textDirection = direction.direction;
		if (!mounted || !popup || !positioner) {
			committedSize = null;
			store.positionerVars = {};
			store.popupVars = {};
			return;
		}
		const controller = beginResize(content, popup, side, textDirection);
		return () => {
			controller.abort();
			resizeFrame.cancel();
		};
	});

	function beginResize(
		content: unknown,
		popup: HTMLElement,
		side: string | null,
		textDirection: string
	) {
		const mark = content;
		const anchor = anchoring(side, textDirection);
		const previous = committedSize;
		store.popupVars = { ...anchor, '--popup-width': 'auto', '--popup-height': 'auto' };
		store.positionerVars = {
			'--positioner-width': 'max-content',
			'--positioner-height': 'max-content'
		};
		const controller = new AbortController();
		resizeFrame.request(() => {
			if (controller.signal.aborted || !popup.isConnected || !Object.is(mark, store.payload))
				return;
			const next = cssSize(popup);
			committedSize = next;
			store.positionerVars = sizeVars('positioner', next);
			if (!previous) {
				store.popupVars = { ...anchor, ...sizeVars('popup', next) };
				return;
			}
			store.popupVars = { ...anchor, ...sizeVars('popup', previous) };
			resizeFrame.request(() => {
				if (controller.signal.aborted) return;
				store.popupVars = { ...anchor, ...sizeVars('popup', next) };
				runOnceAnimationsFinish(
					popup,
					() => {
						if (controller.signal.aborted) return;
						store.popupVars = { ...anchor, '--popup-width': 'auto', '--popup-height': 'auto' };
					},
					controller.signal,
					false
				);
			});
		});
		return controller;
	}

	function anchoring(side: string | null, textDirection: string) {
		const anchorTop = side === 'top';
		const anchorLeft =
			side === 'left' || side === (textDirection === 'rtl' ? 'inline-end' : 'inline-start');
		if (!anchorTop && !anchorLeft) return {};
		const vars: Record<string, string> = { position: 'absolute' };
		vars[anchorTop ? 'bottom' : 'top'] = '0';
		vars[anchorLeft ? 'right' : 'left'] = '0';
		return vars;
	}

	function cssSize(element: HTMLElement) {
		const css = getComputedStyle(element);
		let width = parseFloat(css.width) || 0;
		let height = parseFloat(css.height) || 0;
		if (Math.round(width) !== element.offsetWidth || Math.round(height) !== element.offsetHeight) {
			width = element.offsetWidth;
			height = element.offsetHeight;
		}
		return { width, height };
	}

	function sizeVars(kind: 'popup' | 'positioner', size: { width: number; height: number }) {
		const prefix = kind === 'popup' ? '--popup' : '--positioner';
		return {
			[`${prefix}-width`]: `${size.width}px`,
			[`${prefix}-height`]: `${size.height}px`
		};
	}

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
	<div bind:this={previousSlot} style="display: contents"></div>
{/snippet}
