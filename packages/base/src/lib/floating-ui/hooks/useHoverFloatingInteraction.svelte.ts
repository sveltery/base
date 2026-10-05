import { onDestroy } from 'svelte';
// Original Base UI 1.8.0 at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// MIT: THIRD_PARTY_NOTICES.md. Native Svelte live readers/effects replace React hooks.
import { addEventListener } from '@sveltery/utils/addEventListener';
import { mergeCleanups } from '@sveltery/utils/mergeCleanups';

import { ownerDocument } from '@sveltery/utils/owner';

import { Timeout } from '@sveltery/utils/useTimeout';
import { isElement } from '@floating-ui/utils/dom';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails.js';
import { REASONS } from '../../internals/reasons.js';
import { useFloatingParentNodeId, useFloatingTree } from '../components/FloatingTree.svelte.js';
import type { FloatingContext, FloatingRootContext } from '../types.js';
import { contains, getTarget } from '../utils/element.js';
import { getNodeChildren } from '../utils/nodes.js';
import { applySafePolygonPointerEventsMutation, clearSafePolygonPointerEventsMutation, isInteractiveElement, useHoverInteractionSharedState, } from './useHoverInteractionSharedState.svelte.js';
import { getDelay, isClickLikeOpenEvent as isClickLikeOpenEventShared, isHoverOpenEvent, isInsideEnabledTrigger, } from './useHoverShared.js';
export type UseHoverFloatingInteractionProps = {
    /**
     * Whether the Hook is enabled, including all internal Effects and event
     * handlers.
     * @default true
     */
    enabled?: boolean | undefined;
    /**
     * Waits for the specified time when the event listener runs before changing
     * the `open` state.
     * @default 0
     */
    closeDelay?: number | (() => number) | undefined;
    /**
     * Tree node id override for floating elements that participate in the tree
     * without a `FloatingContext`, such as inline nested navigation menus.
     */
    nodeId?: string | undefined;
};
/**
 * Provides hover interactions that should be attached to the floating element.
 */
export function useHoverFloatingInteraction(getContext: () => FloatingRootContext | FloatingContext, getProps: () => UseHoverFloatingInteractionProps = () => ({})): void {
    const context = $derived(getContext());
    const { enabled = true, closeDelay: closeDelayProp = 0, nodeId: nodeIdProp } = $derived(getProps());
    const store = $derived('rootStore' in context ? context.rootStore : context);
    const open = $derived(store.useState('open'));
    const floatingElement = $derived(store.useState('floatingElement'));
    const domReferenceElement = $derived(store.useState('domReferenceElement'));
    const { dataRef } = $derived(store.context);
    const tree = useFloatingTree();
    const parentId = useFloatingParentNodeId();
    const getInstance = useHoverInteractionSharedState(() => store);
    const instance = $derived(getInstance());
    const childClosedTimeout = new Timeout();
    onDestroy(childClosedTimeout.clear);
    const isClickLikeOpenEvent = () => {
        return isClickLikeOpenEventShared(dataRef.current.openEvent?.type, instance.interactedInside);
    };
    const isHoverOpen = () => {
        return isHoverOpenEvent(dataRef.current.openEvent?.type);
    };
    const clearPointerEvents = () => {
        clearSafePolygonPointerEventsMutation(instance);
    };
    $effect(() => {
        if (!open) {
            instance.pointerType = undefined;
            instance.restTimeoutPending = false;
            instance.interactedInside = false;
            clearPointerEvents();
        }
    });
    $effect(() => {
        return clearPointerEvents;
    });
    $effect(() => {
        if (!enabled) {
            return undefined;
        }
        if (open &&
            instance.handleCloseOptions?.blockPointerEvents &&
            isHoverOpen() &&
            isElement(domReferenceElement) &&
            floatingElement) {
            const ref = domReferenceElement as HTMLElement | SVGSVGElement;
            const floatingEl = floatingElement;
            const doc = ownerDocument(floatingElement);
            const parentFloating = tree?.nodesRef.current.find((node) => node.id === parentId)?.context
                ?.elements.floating as HTMLElement | null;
            if (parentFloating) {
                parentFloating.style.pointerEvents = '';
            }
            // A keep-mounted submenu can appear in the tree before it opens, so a
            // cached scope or parent lookup may resolve to the submenu itself. That
            // would not shield sibling items in the parent menu.
            const cachedScopeElement = instance.pointerEventsScopeElement !== floatingEl
                ? instance.pointerEventsScopeElement
                : null;
            const parentScopeElement = parentFloating !== floatingEl ? parentFloating : null;
            const scopeElement = instance.handleCloseOptions?.getScope?.() ??
                cachedScopeElement ??
                parentScopeElement ??
                (ref.closest('[data-rootownerid]') as HTMLElement | SVGSVGElement | null) ??
                doc.body;
            applySafePolygonPointerEventsMutation(instance, {
                scopeElement,
                referenceElement: ref,
                floatingElement: floatingEl,
            });
            return () => {
                clearPointerEvents();
            };
        }
        return undefined;
    });
    $effect(() => {
        if (!enabled) {
            return undefined;
        }
        function hasParentChildren() {
            return !!(tree && parentId && getNodeChildren(tree.nodesRef.current, parentId).length > 0);
        }
        function closeWithDelay(event: MouseEvent) {
            const closeDelay = getDelay(closeDelayProp, 'close', instance.pointerType);
            const close = () => {
                store.setOpen(false, createChangeEventDetails(REASONS.triggerHover, event));
                tree?.events.emit('floating.closed', event);
            };
            if (closeDelay) {
                instance.openChangeTimeout.start(closeDelay, close);
            }
            else {
                instance.openChangeTimeout.clear();
                close();
            }
        }
        function handleInteractInside(event: PointerEvent) {
            const target = getTarget(event) as Element | null;
            if (!isInteractiveElement(target)) {
                instance.interactedInside = false;
                return;
            }
            instance.interactedInside = target?.closest('[aria-haspopup]') != null;
        }
        function onFloatingMouseEnter() {
            instance.openChangeTimeout.clear();
            childClosedTimeout.clear();
            tree?.events.off('floating.closed', onNodeClosed);
            clearPointerEvents();
        }
        function onFloatingMouseLeave(event: MouseEvent) {
            if (hasParentChildren() && tree) {
                tree.events.on('floating.closed', onNodeClosed);
                return;
            }
            if (isInsideEnabledTrigger(event.relatedTarget, store.context.triggerElements)) {
                // If the mouse is leaving the reference element to another trigger, don't explicitly close the popup
                // as it will be moved.
                return;
            }
            const currentNodeId = dataRef.current.floatingContext?.nodeId ?? nodeIdProp;
            const relatedTarget = event.relatedTarget;
            const isMovingIntoDescendantFloating = tree &&
                currentNodeId &&
                isElement(relatedTarget) &&
                getNodeChildren(tree.nodesRef.current, currentNodeId, false).some((node) => contains(node.context?.elements.floating, relatedTarget));
            if (isMovingIntoDescendantFloating) {
                return;
            }
            // If the safePolygon handler is active, let it handle the close logic.
            if (instance.handler) {
                instance.handler(event);
                return;
            }
            clearPointerEvents();
            if (isHoverOpen() && !isClickLikeOpenEvent()) {
                closeWithDelay(event);
            }
        }
        function onNodeClosed(event: MouseEvent) {
            if (!tree || !parentId || hasParentChildren()) {
                return;
            }
            // Allow the mouseenter event to fire in case child was closed because mouse moved into parent.
            childClosedTimeout.start(0, () => {
                tree.events.off('floating.closed', onNodeClosed);
                store.setOpen(false, createChangeEventDetails(REASONS.triggerHover, event));
                tree.events.emit('floating.closed', event);
            });
        }
        const floating = floatingElement;
        return mergeCleanups(floating && addEventListener(floating, 'mouseenter', onFloatingMouseEnter), floating && addEventListener(floating, 'mouseleave', onFloatingMouseLeave), floating && addEventListener(floating, 'pointerdown', handleInteractInside, true), () => {
            tree?.events.off('floating.closed', onNodeClosed);
        });
    });
}
