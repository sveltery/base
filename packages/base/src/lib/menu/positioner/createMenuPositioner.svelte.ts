// Original MenuPositioner complete business body, native component/render boundary (MIT).
import { untrack } from 'svelte';
import { useIsoLayoutEffect } from '../../utils/useIsoLayoutEffect.svelte.js';
import { useTimeout } from '../../utils/useTimeout.js';
import { useMenuPortalContext } from '../portal/MenuPortalContext.js';
import { useContextMenuRootContext } from '../../context-menu/root/ContextMenuRootContext.js';
import { useAnchorPositioning } from '../../internals/anchor-positioning/useAnchorPositioning.svelte.js';
import { DROPDOWN_COLLISION_AVOIDANCE, POPUP_COLLISION_AVOIDANCE } from '../../internals/constants.js';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails.js';
import { REASONS } from '../../internals/reasons.js';
import { useAnimationsFinished } from '../../internals/useAnimationsFinished.js';
import { usePositioner } from '../../utils/usePositioner.svelte.js';
import { useAnchoredPopupScrollLock } from '../../utils/useAnchoredPopupScrollLock.svelte.js';
import type { MenuPositionerProps, MenuPositionerState, MenuRoot } from '../types.js';
import type { MenuStore } from '../store/MenuStore.svelte.js';
interface MenuOpenEventDetails {
    open: boolean;
    reason: MenuRoot.ChangeEventReason | null;
    nodeId: string | undefined;
    parentNodeId: string | null;
}
export function createMenuPositioner(getProps: () => MenuPositionerProps, store: MenuStore<unknown>, getRef: (node: HTMLElement | null) => void) {
    const { anchor: anchorProp, positionMethod: positionMethodProp = 'absolute', class: className, render, side, align: alignProp, sideOffset: sideOffsetProp = 0, alignOffset: alignOffsetProp = 0, collisionBoundary = 'clipping-ancestors', collisionPadding = 5, arrowPadding = 5, sticky = false, disableAnchorTracking = false, collisionAvoidance: collisionAvoidanceProp = DROPDOWN_COLLISION_AVOIDANCE, style, children, ref, ...elementProps } = $derived(getProps());
    // Host render/ref fields are consumed by the native component, excluded from forwarded props.
    untrack(() => { void [render, className, style, children, ref]; });
    const keepMounted = useMenuPortalContext();
    const contextMenuContext = useContextMenuRootContext(true);
    const parent = $derived(store.useState('parent'));
    const floatingRootContext = $derived(store.useState('floatingRootContext'));
    const floatingTreeRoot = $derived(store.useState('floatingTreeRoot'));
    const mounted = $derived(store.useState('mounted'));
    const open = $derived(store.useState('open'));
    const modal = $derived(store.useState('modal'));
    const openMethod = $derived(store.useState('openMethod'));
    const triggerElement = $derived(store.useState('activeTriggerElement'));
    const transitionStatus = $derived(store.useState('transitionStatus'));
    const positionerElement = $derived(store.useState('positionerElement'));
    const instantType = $derived(store.useState('instantType'));
    const adaptiveOrigin = $derived(store.useState('adaptiveOrigin'));
    const lastOpenChangeReason = $derived(store.useState('lastOpenChangeReason'));
    const floatingNodeId = $derived(store.useState('floatingNodeId'));
    const floatingParentNodeId = $derived(store.useState('floatingParentNodeId'));
    const domReference = $derived(floatingRootContext.useState('domReferenceElement'));
    const previousTriggerRef = { current: null as Element | null };
    const runOnceAnimationsFinish = useAnimationsFinished({ get current() { return positionerElement; } });
    const positioner = useAnchorPositioning(() => {
        let anchor = anchorProp;
        let sideOffset = sideOffsetProp;
        let alignOffset = alignOffsetProp;
        let align = alignProp;
        let collisionAvoidance = collisionAvoidanceProp;
        if (parent.type === 'context-menu') {
            anchor = anchorProp ?? parent.context?.anchor;
            align = align ?? 'start';
            if (!side && align !== 'center') {
                alignOffset = getProps().alignOffset ?? 2;
                sideOffset = getProps().sideOffset ?? -5;
            }
        }
        let computedSide = side;
        let computedAlign = align;
        if (parent.type === 'menu') {
            computedSide = computedSide ?? 'inline-end';
            computedAlign = computedAlign ?? 'start';
            collisionAvoidance = getProps().collisionAvoidance ?? POPUP_COLLISION_AVOIDANCE;
        }
        else if (parent.type === 'menubar') {
            computedSide =
                computedSide ?? (parent.context.orientation === 'vertical' ? 'inline-end' : 'bottom');
            computedAlign = computedAlign ?? 'start';
        }
        const contextMenu = parent.type === 'context-menu';
        return {
            anchor,
            floatingRootContext,
            open,
            positionMethod: contextMenuContext ? 'fixed' : positionMethodProp,
            mounted,
            side: computedSide,
            sideOffset,
            align: computedAlign,
            alignOffset,
            arrowPadding: contextMenu ? 0 : arrowPadding,
            collisionBoundary,
            collisionPadding,
            sticky,
            nodeId: floatingNodeId,
            keepMounted: keepMounted(),
            disableAnchorTracking,
            collisionAvoidance,
            shift: contextMenu
                ? {
                    crossAxis: !('side' in collisionAvoidance && collisionAvoidance.side === 'flip'),
                    rootBoundary: 'layoutViewport',
                }
                : undefined,
            externalTree: floatingTreeRoot,
            adaptiveOrigin,
        };
    });
    useIsoLayoutEffect(() => {
        function onMenuOpenChange(details: MenuOpenEventDetails) {
            if (details.open) {
                if (details.parentNodeId === floatingNodeId) {
                    store.set('hoverEnabled', false);
                }
                if (details.nodeId !== floatingNodeId &&
                    details.parentNodeId === store.select('floatingParentNodeId')) {
                    store.setOpen(false, createChangeEventDetails(REASONS.siblingOpen));
                }
            }
        }
        floatingTreeRoot.events.on('menuopenchange', onMenuOpenChange);
        return () => {
            floatingTreeRoot.events.off('menuopenchange', onMenuOpenChange);
        };
    }, () => [store, floatingTreeRoot.events, floatingNodeId]);
    useIsoLayoutEffect(() => {
        if (store.select('floatingParentNodeId') == null) {
            return undefined;
        }
        function onParentClose(details: MenuOpenEventDetails) {
            if (details.open || details.nodeId !== store.select('floatingParentNodeId')) {
                return;
            }
            const reason: MenuRoot.ChangeEventReason = details.reason ?? REASONS.siblingOpen;
            store.setOpen(false, createChangeEventDetails(reason));
        }
        floatingTreeRoot.events.on('menuopenchange', onParentClose);
        return () => {
            floatingTreeRoot.events.off('menuopenchange', onParentClose);
        };
    }, () => [floatingTreeRoot.events, store]);
    const closeTimeout = useTimeout();
    // Clear pending close timeout when the menu closes.
    useIsoLayoutEffect(() => {
        if (!open) {
            closeTimeout.clear();
        }
    }, () => [open, closeTimeout]);
    // Close unrelated child submenus when hovering a different item in the parent menu.
    useIsoLayoutEffect(() => {
        function onItemHover(event: {
            nodeId: string | undefined;
            target: Element | null;
        }) {
            // If an item within our parent menu is hovered, and this menu's trigger is not that item,
            // close this submenu. This ensures hovering a different item in the parent closes other branches.
            if (!open || event.nodeId !== store.select('floatingParentNodeId')) {
                return;
            }
            if (event.target && triggerElement && triggerElement !== event.target) {
                const delay = store.select('closeDelay');
                if (delay > 0) {
                    if (!closeTimeout.isStarted()) {
                        closeTimeout.start(delay, () => {
                            store.setOpen(false, createChangeEventDetails(REASONS.siblingOpen));
                        });
                    }
                }
                else {
                    store.setOpen(false, createChangeEventDetails(REASONS.siblingOpen));
                }
            }
            else {
                // User re-hovered the submenu trigger, cancel pending close.
                closeTimeout.clear();
            }
        }
        floatingTreeRoot.events.on('itemhover', onItemHover);
        return () => {
            floatingTreeRoot.events.off('itemhover', onItemHover);
        };
    }, () => [floatingTreeRoot.events, open, triggerElement, store, closeTimeout]);
    useIsoLayoutEffect(() => {
        const eventDetails: MenuOpenEventDetails = {
            open,
            nodeId: floatingNodeId,
            parentNodeId: floatingParentNodeId,
            reason: store.select('lastOpenChangeReason'),
        };
        floatingTreeRoot.events.emit('menuopenchange', eventDetails);
    }, () => [floatingTreeRoot.events, open, store, floatingNodeId, floatingParentNodeId]);
    // Keep positioner transition behavior aligned with Popover when switching detached triggers.
    useIsoLayoutEffect(() => {
        const currentTrigger = domReference;
        const previousTrigger = previousTriggerRef.current;
        if (currentTrigger) {
            previousTriggerRef.current = currentTrigger;
        }
        if (previousTrigger && currentTrigger && currentTrigger !== previousTrigger) {
            store.set('instantType', undefined);
            const abortController = new AbortController();
            runOnceAnimationsFinish(() => {
                store.set('instantType', 'trigger-change');
            }, abortController.signal);
            return () => {
                abortController.abort();
            };
        }
        return undefined;
    }, () => [domReference, runOnceAnimationsFinish, store]);
    const state: MenuPositionerState = $derived({
        open,
        side: positioner.side,
        align: positioner.align,
        anchorHidden: positioner.anchorHidden,
        nested: parent.type === 'menu',
        instant: instantType,
    });
    const menubarModal = $derived(parent.type === 'menubar' && parent.context.modal);
    const popupModal = $derived(modal && lastOpenChangeReason !== REASONS.triggerHover);
    useAnchoredPopupScrollLock(() => open && (menubarModal || popupModal), () => openMethod === 'touch', () => positionerElement, () => triggerElement);
    const element = usePositioner(() => state, () => ({
        styles: positioner.positionerStyles,
        transitionStatus,
        props: elementProps,
        refs: [getRef, store.useStateSetter('positionerElement')],
        hidden: !mounted,
        inert: !open,
    }));
    const shouldRenderBackdrop = $derived(mounted &&
        parent.type !== 'menu' &&
        ((parent.type !== 'menubar' && modal && lastOpenChangeReason !== REASONS.triggerHover) ||
            (parent.type === 'menubar' && parent.context.modal)));
    // cuts a hole in the backdrop to allow pointer interaction with the menubar or dropdown menu trigger element
    const backdropCutout = $derived(parent.type === 'menubar' ? parent.context.contentElement : parent.type === undefined ? triggerElement as HTMLElement | null : null);
    return { store, positioner, element, get state() { return state; }, get shouldRenderBackdrop() { return shouldRenderBackdrop; }, get backdropCutout() { return backdropCutout; }, get parent() { return parent; }, get open() { return open; } };
}
