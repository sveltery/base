// Derived from Base UI v1.8.0 packages/react/src/floating-ui-react/hooks/useDismiss.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// A press is inside when the target is in the floating element, the trigger, or a
// floating-tree child's floating element. The portal host is not inside.

import { on } from 'svelte/events';
import { createChangeEventDetails, REASONS } from '../../event-details.js';
import { ownerDocument } from '../../owner.js';
import { platform } from '../../platform.js';
import { contains, getTarget } from '../../shadow-dom.js';
import { useTimeout } from '../../timeout.svelte.js';
import { getNodeChildren } from '../components/FloatingTreeStore.js';
import { useFloatingTree } from '../components/FloatingTree.svelte.js';
import type { FloatingRootStore } from '../components/FloatingRootStore.svelte.js';
import { PopupStore } from '../../popups/store.svelte.js';

export type PressMode = 'sloppy' | 'intentional';

export type OutsidePressEvent =
	| PressMode
	| { mouse?: PressMode; touch?: PressMode }
	| (() => PressMode | { mouse?: PressMode; touch?: PressMode });

export interface UseDismissProps {
	enabled?: boolean;
	escapeKey?: boolean;
	outsidePress?: boolean | ((event: MouseEvent | PointerEvent | TouchEvent) => boolean);
	outsidePressEvent?: OutsidePressEvent;
	bubbles?: boolean | { escapeKey?: boolean; outsidePress?: boolean };
}

function bubbleFlag(bubbles: UseDismissProps['bubbles'], key: 'escapeKey' | 'outsidePress') {
	if (typeof bubbles === 'boolean') return bubbles;
	return bubbles?.[key] ?? false;
}

function pressIsInside(store: FloatingRootStore, event: Event) {
	const target = getTarget(event);
	if (!(target instanceof Node)) return false;
	if (contains(store.floatingElement, target) || contains(store.popupElement, target)) return true;
	if (contains(store.domReferenceElement, target)) return true;
	return false;
}

function pointerIsTouch(event: Event) {
	return (
		(event instanceof PointerEvent && event.pointerType === 'touch') ||
		event.type.startsWith('touch')
	);
}

function resolvePressMode(
	configured: PressMode | { mouse?: PressMode; touch?: PressMode },
	event: Event
): PressMode {
	if (configured === 'sloppy' || configured === 'intentional') return configured;
	const touch = pointerIsTouch(event);
	return configured[touch ? 'touch' : 'mouse'] ?? (touch ? 'sloppy' : 'intentional');
}

export function useDismiss(store: FloatingRootStore, props: () => UseDismissProps = () => ({})) {
	const tree = useFloatingTree();
	const compositionTimeout = useTimeout();
	const cancelDismissOnEndTimeout = useTimeout();
	let composing = false;
	let sawPressWhileOpen = false;
	let pressStartedInside = false;
	/** The click after an inside press still belongs to that press. A cancel has no click. */
	let ignoreInsideReleaseClick = false;
	/** Sloppy touch: a small move dismisses on touchend; scrolling away dismisses during the move. */
	let touchState: {
		startX: number;
		startY: number;
		dismissOnTouchEnd: boolean;
		dismissOnMouseDown: boolean;
	} | null = null;

	function options() {
		const value = props();
		const outsidePressEvent = value.outsidePressEvent ?? 'sloppy';
		return {
			enabled: value.enabled ?? true,
			escapeKey: value.escapeKey ?? true,
			outsidePress: value.outsidePress ?? true,
			outsidePressEvent:
				typeof outsidePressEvent === 'function' ? outsidePressEvent() : outsidePressEvent,
			escapeKeyBubbles: bubbleFlag(value.bubbles, 'escapeKey'),
			outsidePressBubbles: bubbleFlag(value.bubbles, 'outsidePress')
		};
	}

	for (const key of ['escapeKeyBubbles', 'outsidePressBubbles'] as const) {
		Object.defineProperty(store.data, key, {
			configurable: true,
			enumerable: true,
			get() {
				return options()[key];
			}
		});
	}

	function pressMode(event: Event) {
		return resolvePressMode(options().outsidePressEvent, event);
	}

	function childBlocks(key: 'escapeKeyBubbles' | 'outsidePressBubbles') {
		if (!tree || !store.nodeId) return false;
		return getNodeChildren(tree.nodes, store.nodeId).some((node) => {
			const context = node.context;
			return !!context?.isOpen() && !context.data[key];
		});
	}

	function targetIsTrigger(event: Event) {
		const target = getTarget(event);
		if (!(target instanceof Element) || !(store instanceof PopupStore)) return false;
		return (
			store.triggers.hasElement(target) ||
			store.triggers.hasMatchingElement((trigger) => contains(trigger, target))
		);
	}

	function insideDismissTree(event: Event) {
		if (pressIsInside(store, event) || targetIsTrigger(event)) return true;
		if (!tree || !store.nodeId) return false;
		const target = getTarget(event);
		if (!(target instanceof Node)) return false;
		return getNodeChildren(tree.nodes, store.nodeId).some((node) => {
			const context = node.context;
			if (!context) return false;
			return contains(context.floatingElement, target) || contains(context.popupElement, target);
		});
	}

	function closeOnEscape(event: KeyboardEvent) {
		const current = options();
		if (!store.isOpen() || !current.enabled || !current.escapeKey || event.key !== 'Escape') return;
		if (composing) return;
		if (!current.escapeKeyBubbles && childBlocks('escapeKeyBubbles')) return;
		const details = createChangeEventDetails(REASONS.escapeKey, event);
		store.setOpen(false, details);
		if (!details.isCanceled) event.preventDefault();
		if (!current.escapeKeyBubbles && !details.isPropagationAllowed) event.stopPropagation();
	}

	function closeOnOutside(event: MouseEvent | PointerEvent | TouchEvent) {
		const current = options();
		const mode = pressMode(event);
		if (!store.isOpen() || !current.enabled || current.outsidePress === false) return;
		if (mode === 'intentional' && event.type !== 'click') return;
		if (mode === 'sloppy' && event.type === 'click') return;
		if (event.type === 'pointerdown' && 'button' in event && event.button !== 0) return;
		if (insideDismissTree(event)) return;
		if (pressStartedInside) return;
		if (mode === 'intentional' && !sawPressWhileOpen && event.detail !== 0) return;
		if (typeof current.outsidePress === 'function' && !current.outsidePress(event)) return;
		if (!current.outsidePressBubbles && childBlocks('outsidePressBubbles')) return;
		store.setOpen(false, createChangeEventDetails(REASONS.outsidePress, event));
	}

	$effect(() => {
		const current = options();
		if (!current.enabled || !store.isOpen()) {
			if (!store.isOpen()) {
				sawPressWhileOpen = false;
				pressStartedInside = false;
				ignoreInsideReleaseClick = false;
				touchState = null;
			}
			return;
		}

		const doc = ownerDocument(store.floatingElement ?? store.portalElement);
		const cleanups = [
			on(doc, 'compositionstart', () => {
				compositionTimeout.clear();
				composing = true;
			}),
			on(doc, 'compositionend', () => {
				compositionTimeout.start(platform.engine.webkit ? 5 : 0, () => {
					composing = false;
				});
			}),
			on(doc, 'keydown', closeOnEscape),
			on(doc, 'pointerdown', (event) => {
				if (event.button !== 0) return;
				ignoreInsideReleaseClick = false;
				if (insideDismissTree(event)) pressStartedInside = true;
				else sawPressWhileOpen = true;
				// Upstream `handlePointerDown` (useDismiss.ts 515–524): touch waits for
				// touchend or for the finger to scroll away. Mouse sloppy still closes here.
				if (event.pointerType === 'touch') return;
				closeOnOutside(event);
			}),
			on(
				doc,
				'touchstart',
				(event) => {
					cancelDismissOnEndTimeout.clear();
					if (pressMode(event) !== 'sloppy' || !store.isOpen() || !options().enabled) return;
					if (insideDismissTree(event)) return;
					const touch = event.touches[0];
					if (!touch) return;
					touchState = {
						startX: touch.clientX,
						startY: touch.clientY,
						dismissOnTouchEnd: false,
						dismissOnMouseDown: true
					};
					cancelDismissOnEndTimeout.start(1000, () => {
						if (!touchState) return;
						touchState.dismissOnTouchEnd = false;
						touchState.dismissOnMouseDown = false;
					});
				},
				{ capture: true, passive: true }
			),
			on(
				doc,
				'touchmove',
				(event) => {
					if (pressMode(event) !== 'sloppy' || !touchState || insideDismissTree(event)) return;
					const touch = event.touches[0];
					if (!touch) return;
					const deltaX = touch.clientX - touchState.startX;
					const deltaY = touch.clientY - touchState.startY;
					const distance = Math.hypot(deltaX, deltaY);
					if (distance > 5) touchState.dismissOnTouchEnd = true;
					if (distance > 10) {
						closeOnOutside(event);
						cancelDismissOnEndTimeout.clear();
						touchState = null;
					}
				},
				{ capture: true, passive: true }
			),
			on(
				doc,
				'touchend',
				(event) => {
					if (pressMode(event) !== 'sloppy' || !touchState || insideDismissTree(event)) {
						cancelDismissOnEndTimeout.clear();
						touchState = null;
						return;
					}
					if (touchState.dismissOnTouchEnd) closeOnOutside(event);
					cancelDismissOnEndTimeout.clear();
					touchState = null;
				},
				{ capture: true, passive: true }
			),
			on(
				doc,
				'pointerup',
				() => {
					if (!pressStartedInside) return;
					pressStartedInside = false;
					ignoreInsideReleaseClick = true;
				},
				{ capture: true }
			),
			on(
				doc,
				'pointercancel',
				() => {
					// A cancelled gesture, such as a scroll, produces no click.
					sawPressWhileOpen = false;
					pressStartedInside = false;
					ignoreInsideReleaseClick = false;
				},
				{ capture: true }
			),
			on(doc, 'click', (event) => {
				const startedInside = pressStartedInside || ignoreInsideReleaseClick;
				pressStartedInside = false;
				ignoreInsideReleaseClick = false;
				if (startedInside) return;
				closeOnOutside(event);
			})
		];
		return () => {
			for (const cleanup of cleanups) cleanup();
			compositionTimeout.clear();
			cancelDismissOnEndTimeout.clear();
			touchState = null;
		};
	});

	return {
		reference: { onkeydown: closeOnEscape },
		floating: { onkeydown: closeOnEscape },
		trigger: { onkeydown: closeOnEscape }
	};
}
