<!--
	An area that opens the menu on right click or long press. Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/context-menu/trigger/ContextMenuTrigger.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import { on } from 'svelte/events';
	import type { HTMLAttributes } from 'svelte/elements';
	import {
		ScopedTimeout,
		contains,
		createChangeEventDetails,
		getTarget,
		ownerDocument,
		ownerWindow,
		REASONS
	} from '@sveltery/utils';
	import { mergeProps } from '../internal/mergeProps.js';
	import { pressableTriggerOpenStateMapping } from '../internal/popupStateMapping.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { useMenuRoot } from '../menu/context.svelte.js';
	import { findRootOwnerId } from '../menu/dom.js';
	import { useContextMenuRoot } from './context.svelte.js';
	import type { ContextMenuTriggerProps, ContextMenuTriggerState } from './types.js';

	const LONG_PRESS_DELAY = 500;
	const TOUCH_MOVE_THRESHOLD = 10;

	let { render, children, ...elementProps }: ContextMenuTriggerProps = $props();

	const context = useContextMenuRoot();
	const { store } = useMenuRoot();

	let touchPosition: { x: number; y: number } | null = null;
	const longPressTimeout = new ScopedTimeout();
	const allowMouseUpTimeout = new ScopedTimeout();
	let allowMouseUp = false;
	let mouseUpAbort: AbortController | null = null;

	function openAt(x: number, y: number, event: MouseEvent | TouchEvent) {
		context.initialCursorPoint = { x, y };
		context.anchorAt(x, y, event.type.startsWith('touch'));
		allowMouseUp = false;
		context.menu?.setOpen(true, createChangeEventDetails(REASONS.triggerPress, event));
		allowMouseUpTimeout.start(LONG_PRESS_DELAY, () => {
			allowMouseUp = true;
		});
	}

	/** Ends the right-click gesture: a release outside the menu after the delay closes it. */
	function handleMouseUp(event: MouseEvent) {
		context.mouseUpGate.allow = false;
		if (!allowMouseUp) return;
		allowMouseUpTimeout.clear();
		allowMouseUp = false;

		const target = getTarget(event) as Element | null;
		if (contains(context.menu?.positionerElement, target)) return;
		if (target && findRootOwnerId(target) === context.rootId) return;

		context.menu?.setOpen(false, createChangeEventDetails(REASONS.cancelOpen, event));
	}

	function handleContextMenu(event: MouseEvent) {
		if (store.disabled) return;
		context.mouseUpGate.allow = true;
		event.preventDefault();
		event.stopPropagation();
		openAt(event.clientX, event.clientY, event);

		// A previous gesture that never saw its mouseup leaves a listener behind.
		// Upstream listens on the document, behind React's root and portal listeners. Svelte
		// delegates item handlers to the document, and may add that listener after this one, so
		// the window keeps the item's mouseup first.
		mouseUpAbort?.abort();
		mouseUpAbort = new AbortController();
		ownerWindow(context.triggerElement).addEventListener('mouseup', handleMouseUp, {
			once: true,
			signal: mouseUpAbort.signal
		});
	}

	function cancelLongPress() {
		longPressTimeout.clear();
		touchPosition = null;
	}

	function handleTouchStart(event: TouchEvent) {
		if (store.disabled) {
			cancelLongPress();
			return;
		}
		context.mouseUpGate.allow = false;
		if (event.touches.length !== 1) {
			cancelLongPress();
			return;
		}
		event.stopPropagation();
		const touch = event.touches[0];
		const start = { x: touch.clientX, y: touch.clientY };
		touchPosition = start;
		longPressTimeout.start(LONG_PRESS_DELAY, () => openAt(start.x, start.y, event));
	}

	function handleTouchMove(event: TouchEvent) {
		if (event.touches.length !== 1) {
			cancelLongPress();
			return;
		}
		if (!longPressTimeout.isStarted() || !touchPosition) return;
		const touch = event.touches[0];
		if (
			Math.abs(touch.clientX - touchPosition.x) > TOUCH_MOVE_THRESHOLD ||
			Math.abs(touch.clientY - touchPosition.y) > TOUCH_MOVE_THRESHOLD
		) {
			cancelLongPress();
		}
	}

	$effect(() => () => mouseUpAbort?.abort());

	// The native context menu stays closed over the trigger and both backdrops, also when a
	// consumer handler skipped the trigger's own handler.
	$effect(() => {
		const triggerElement = context.triggerElement;
		if (store.disabled || !triggerElement) return;
		return on(ownerDocument(triggerElement), 'contextmenu', (event) => {
			const target = getTarget(event) as Element | null;
			if (
				contains(triggerElement, target) ||
				contains(context.internalBackdropElement, target) ||
				contains(context.backdropElement, target)
			) {
				event.preventDefault();
			}
		});
	});

	const triggerState: ContextMenuTriggerState = $derived({ open: store.open });

	const bindKey = createAttachmentKey();
	function bindTrigger(node: HTMLElement) {
		context.triggerElement = node;
		return () => {
			if (context.triggerElement === node) context.triggerElement = null;
		};
	}

	const hostProps: HTMLAttributes<HTMLDivElement> = $derived(
		mergeProps(
			{
				oncontextmenu: handleContextMenu,
				ontouchstart: handleTouchStart,
				ontouchmove: handleTouchMove,
				ontouchend: cancelLongPress,
				ontouchcancel: cancelLongPress,
				style: '-webkit-touch-callout: none',
				...getStateAttributesProps(triggerState, pressableTriggerOpenStateMapping),
				[bindKey]: bindTrigger
			},
			elementProps
		)
	);
</script>

{#if render}
	{@render render(hostProps, triggerState, children)}
{:else}
	<div {...hostProps}>{@render children?.()}</div>
{/if}
