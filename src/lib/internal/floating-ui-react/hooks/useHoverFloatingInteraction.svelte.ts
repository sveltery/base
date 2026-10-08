// Derived from Base UI v1.8.0 packages/react/src/floating-ui-react/hooks/useHoverFloatingInteraction.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import { on } from 'svelte/events';
import { createChangeEventDetails, REASONS } from '../../event-details.js';
import { ownerDocument } from '../../owner.js';
import { contains, getTarget } from '../../shadow-dom.js';
import { PopupStore } from '../../popups/store.svelte.js';
import { useTimeout } from '../../timeout.svelte.js';
import type { FloatingRootStore } from '../components/FloatingRootStore.svelte.js';
import { useFloatingParentNodeId, useFloatingTree } from '../components/FloatingTree.svelte.js';
import { getNodeChildren } from '../components/FloatingTreeStore.js';
import { isInteractiveElement, isTargetInsideEnabledTrigger } from '../utils/element.js';
import {
	applySafePolygonPointerEventsMutation,
	clearSafePolygonPointerEventsMutation,
	hoverInteraction
} from './useHoverInteractionSharedState.svelte.js';
import { getDelay, isClickLikeOpenEvent, isHoverOpenEvent } from './useHoverShared.js';

export function useHoverFloatingInteraction(
	store: FloatingRootStore,
	props: () => { enabled?: boolean; closeDelay?: number | (() => number) } = () => ({})
) {
	const tree = useFloatingTree();
	const parentId = useFloatingParentNodeId();
	const instance = hoverInteraction(store);
	const childClosedTimeout = useTimeout();

	function options() {
		const value = props();
		return { enabled: value.enabled ?? true, closeDelay: value.closeDelay ?? 0 };
	}

	function triggers() {
		return store instanceof PopupStore ? store.triggers : null;
	}

	$effect(() => {
		if (store.isOpen()) return;
		instance.pointerType = undefined;
		instance.restTimeoutPending = false;
		instance.interactedInside = false;
		clearSafePolygonPointerEventsMutation(instance);
	});

	$effect(() => {
		const current = options();
		const floating = store.floatingElement;
		const reference = store.domReferenceElement;
		if (
			!current.enabled ||
			!store.isOpen() ||
			!instance.handleCloseOptions?.blockPointerEvents ||
			!isHoverOpenEvent(store.data.openEvent?.type) ||
			!(reference instanceof HTMLElement || reference instanceof SVGSVGElement) ||
			!floating
		) {
			return;
		}
		const parentFloating = tree?.nodes.find((node) => node.id === parentId)?.context
			?.floatingElement;
		const scope =
			instance.handleCloseOptions.getScope?.() ??
			(parentFloating && parentFloating !== floating ? parentFloating : null) ??
			ownerDocument(floating).body;
		applySafePolygonPointerEventsMutation(instance, {
			scopeElement: scope,
			referenceElement: reference,
			floatingElement: floating
		});
		return () => clearSafePolygonPointerEventsMutation(instance);
	});

	$effect(() => {
		const current = options();
		const floating = store.floatingElement;
		if (!current.enabled || !floating) return;

		function closeWithDelay(event: MouseEvent) {
			const closeDelay = getDelay(options().closeDelay, 'close', instance.pointerType);
			const close = () => {
				store.setOpen(false, createChangeEventDetails(REASONS.triggerHover, event));
				tree?.events.emit('floating.closed', event);
			};
			if (closeDelay) instance.openChangeTimeout.start(closeDelay, close);
			else {
				instance.openChangeTimeout.clear();
				close();
			}
		}

		function onNodeClosed(event?: unknown) {
			if (!tree || !parentId || getNodeChildren(tree.nodes, parentId).length > 0) return;
			childClosedTimeout.start(0, () => {
				tree.events.off('floating.closed', onNodeClosed);
				store.setOpen(false, createChangeEventDetails(REASONS.triggerHover, event as Event));
				tree.events.emit('floating.closed', event);
			});
		}

		const stopEnter = on(floating, 'mouseenter', () => {
			instance.openChangeTimeout.clear();
			childClosedTimeout.clear();
			tree?.events.off('floating.closed', onNodeClosed);
			clearSafePolygonPointerEventsMutation(instance);
		});
		const stopLeave = on(floating, 'mouseleave', (event) => {
			if (tree && parentId && getNodeChildren(tree.nodes, parentId).length > 0) {
				tree.events.on('floating.closed', onNodeClosed);
				return;
			}
			const map = triggers();
			if (map && isTargetInsideEnabledTrigger(event.relatedTarget, map.elements())) return;
			if (
				tree &&
				store.nodeId &&
				event.relatedTarget instanceof Node &&
				getNodeChildren(tree.nodes, store.nodeId, false).some((node) =>
					contains(node.context?.floatingElement ?? null, event.relatedTarget as Node)
				)
			) {
				return;
			}
			if (instance.handler) {
				instance.handler(event);
				return;
			}
			clearSafePolygonPointerEventsMutation(instance);
			if (
				isHoverOpenEvent(store.data.openEvent?.type) &&
				!isClickLikeOpenEvent(store.data.openEvent?.type, instance.interactedInside)
			) {
				closeWithDelay(event);
			}
		});
		const stopPointer = on(
			floating,
			'pointerdown',
			(event) => {
				const target = getTarget(event);
				if (!(target instanceof Element) || !isInteractiveElement(target)) {
					instance.interactedInside = false;
					return;
				}
				instance.interactedInside = target.closest('[aria-haspopup]') != null;
			},
			{ capture: true }
		);
		return () => {
			stopEnter();
			stopLeave();
			stopPointer();
			tree?.events.off('floating.closed', onNodeClosed);
			childClosedTimeout.clear();
		};
	});
}
