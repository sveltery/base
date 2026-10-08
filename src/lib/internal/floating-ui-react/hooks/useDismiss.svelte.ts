// Derived from Base UI v1.8.0 packages/react/src/floating-ui-react/hooks/useDismiss.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// A press is inside when the target is in this portal host, a descendant portal, or a
// floating-tree child. There is no insideReactTree flag.

import { on } from 'svelte/events';
import { createChangeEventDetails, REASONS } from '../../event-details.js';
import { ownerDocument } from '../../owner.js';
import { platform } from '../../platform.js';
import { contains, getTarget } from '../../shadow-dom.js';
import { Timeout } from '../../timeout.js';
import { getNodeChildren } from '../components/FloatingTreeStore.js';
import { useFloatingTree } from '../components/FloatingTree.svelte.js';
import type { FloatingRootStore } from '../components/FloatingRootStore.svelte.js';
import { PopupStore } from '../../popups/store.svelte.js';

export interface UseDismissProps {
	enabled?: boolean;
	escapeKey?: boolean;
	outsidePress?: boolean | ((event: MouseEvent | PointerEvent) => boolean);
	outsidePressEvent?: 'sloppy' | 'intentional' | (() => 'sloppy' | 'intentional');
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
	if (contains(store.portalElement, target)) return true;
	return false;
}

export function useDismiss(store: FloatingRootStore, props: () => UseDismissProps = () => ({})) {
	const tree = useFloatingTree();
	const compositionTimeout = Timeout.create();
	let composing = false;
	let sawPressWhileOpen = false;

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
			return (
				contains(context.floatingElement, target) ||
				contains(context.portalElement, target) ||
				contains(context.popupElement, target)
			);
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

	function closeOnOutside(event: MouseEvent | PointerEvent) {
		const current = options();
		if (!store.isOpen() || !current.enabled || current.outsidePress === false) return;
		if (current.outsidePressEvent === 'intentional' && event.type !== 'click') return;
		if (current.outsidePressEvent === 'sloppy' && event.type === 'click') return;
		if (event.type === 'pointerdown' && event.button !== 0) return;
		if (insideDismissTree(event)) return;
		if (current.outsidePressEvent === 'intentional' && !sawPressWhileOpen) return;
		if (typeof current.outsidePress === 'function' && !current.outsidePress(event)) return;
		if (!current.outsidePressBubbles && childBlocks('outsidePressBubbles')) return;
		store.setOpen(false, createChangeEventDetails(REASONS.outsidePress, event));
	}

	$effect(() => {
		const current = options();
		store.data.escapeKeyBubbles = current.escapeKeyBubbles;
		store.data.outsidePressBubbles = current.outsidePressBubbles;
		if (!current.enabled || !store.isOpen()) {
			if (!store.isOpen()) sawPressWhileOpen = false;
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
				if (event.button === 0) sawPressWhileOpen = true;
				closeOnOutside(event);
			}),
			on(doc, 'click', (event) => closeOnOutside(event))
		];
		return () => {
			for (const cleanup of cleanups) cleanup();
			compositionTimeout.clear();
		};
	});

	return {
		reference: { onkeydown: closeOnEscape },
		floating: { onkeydown: closeOnEscape },
		trigger: { onkeydown: closeOnEscape }
	};
}
