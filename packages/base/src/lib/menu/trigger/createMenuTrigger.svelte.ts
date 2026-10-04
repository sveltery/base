import { untrack } from 'svelte';
// Original MenuTrigger complete business, native live props/event/ref boundary (MIT).
import { useTimeout } from '../../utils/useTimeout.js';
import { ownerDocument } from '../../utils/owner.js';
import { useStableCallback } from '../../utils/useStableCallback.js';
import { useIsoLayoutEffect } from '../../utils/useIsoLayoutEffect.svelte.js';
import { EMPTY_OBJECT } from '../../utils/empty.js';
import { safePolygon } from '../../floating-ui/safePolygon.js';
import { useClick } from '../../floating-ui/hooks/useClick.svelte.js';
import { useFloatingTree, useFloatingNodeId, useFloatingParentNodeId } from '../../floating-ui/components/FloatingTree.svelte.js';
import { useFocus } from '../../floating-ui/hooks/useFocus.svelte.js';
import { useHoverReferenceInteraction } from '../../floating-ui/hooks/useHoverReferenceInteraction.svelte.js';
import { FloatingTreeStore } from '../../floating-ui/components/FloatingTreeStore.js';
import { contains } from '../../floating-ui/utils/element.js';
import { useMenuRootContext } from '../root/MenuRootContext.js';
import { useButton } from '../../internals/use-button/useButton.svelte.js';
import { isMouseWithinBounds } from '../../utils/getPseudoElementBounds.js';
import { useCompositeRootContext } from '../../internals/composite/root/CompositeRootContext.js';
import { findRootOwnerId } from '../utils/findRootOwnerId.js';
import { usePopupHandleStore } from '../../utils/popups/usePopupHandleStore.svelte.js';
import { useTriggerDataForwarding } from '../../utils/popups/popupStoreUtils.svelte.js';
import { useTriggerFocusGuards } from '../../utils/popups/useTriggerFocusGuards.svelte.js';
import { useBaseUiId } from '../../internals/useBaseUiId.js';
import { REASONS } from '../../internals/reasons.js';
import { useMixedToggleClickHandler } from '../../utils/useMixedToggleClickHandler.svelte.js';
import { useMenubarContext } from '../../menubar/MenubarContext.js';
import { PATIENT_CLICK_THRESHOLD } from '../../internals/constants.js';
import { mergeProps } from '../../merge-props/index.js';
import type { MenuTriggerProps, MenuTriggerState, MenuParent } from '../types.js';
import type { MenuHandleStore } from '../store/MenuStore.svelte.js';
export function createMenuTrigger<Payload>(getProps: () => MenuTriggerProps<Payload>, generatedId: string, setRef: (node: HTMLElement | null) => void) {
    const { render, class: className, style, disabled: disabledProp = false, nativeButton = true, id: idProp, openOnHover: openOnHoverProp, delay = 100, closeDelay = 0, handle, payload, children, ref: consumerRef, ...elementProps } = $derived(getProps());
    // Host render/ref fields are consumed by the native component, excluded from forwarded props.
    void [render, className, style, children, consumerRef];
    const rootContext = useMenuRootContext(true);
    const handleStore = usePopupHandleStore(() => handle);
    const store: MenuHandleStore<unknown> = $derived.by(() => {
        const value = handleStore.store ?? rootContext?.store;
        if (!value)
            throw new Error('Base UI: <Menu.Trigger> must be either used within a <Menu.Root> component or provided with a handle.');
        return value as MenuHandleStore<unknown>;
    });
    const thisTriggerId = $derived(useBaseUiId(idProp ?? undefined, generatedId));
    const isTriggerActive = $derived(store.useState('isTriggerActive', thisTriggerId));
    const floatingRootContext = $derived(store.useState('floatingRootContext'));
    const isOpenedByThisTrigger = $derived(store.useState('isOpenedByTrigger', thisTriggerId));
    const popupId = $derived(store.useState('triggerPopupId', thisTriggerId));
    const triggerElementRef = { current: null as HTMLElement | null };
    const parent = useMenuParent();
    const compositeRootContext = useCompositeRootContext(true);
    const floatingTreeRootFromContext = useFloatingTree();
    const floatingTreeRoot: FloatingTreeStore = $derived.by(() => {
        return floatingTreeRootFromContext ?? new FloatingTreeStore();
    });
    const floatingNodeId = useFloatingNodeId(`${generatedId}-node`, untrack(() => floatingTreeRoot));
    const floatingParentNodeId = useFloatingParentNodeId();
    const forwarding = useTriggerDataForwarding(() => thisTriggerId, triggerElementRef, () => store, () => ({
        payload,
        closeDelay,
        parent,
        floatingTreeRoot,
        floatingNodeId,
        floatingParentNodeId,
        keyboardEventRelay: compositeRootContext?.relayKeyboardEvent,
    }));
    const isInMenubar = $derived(parent.type === 'menubar');
    const rootDisabled = $derived(store.useState('disabled'));
    const disabled = $derived(disabledProp || rootDisabled || (parent.type === 'menubar' && parent.context.disabled));
    const { getButtonProps, buttonRef } = useButton(() => ({
        disabled,
        native: nativeButton,
    }));
    useIsoLayoutEffect(() => {
        if (!isOpenedByThisTrigger && parent.type === undefined) {
            store.context.allowMouseUpTriggerRef.current = false;
        }
    }, () => [store, isOpenedByThisTrigger, parent.type]);
    const triggerRef = { current: null as HTMLElement | null };
    const allowMouseUpTriggerTimeout = useTimeout();
    const handleDocumentMouseUp = useStableCallback((mouseEvent: MouseEvent) => {
        if (!triggerRef.current) {
            return;
        }
        allowMouseUpTriggerTimeout.clear();
        store.context.allowMouseUpTriggerRef.current = false;
        const mouseUpTarget = mouseEvent.target as Element | null;
        if (contains(triggerRef.current, mouseUpTarget) ||
            contains(store.select('positionerElement'), mouseUpTarget) ||
            mouseUpTarget === triggerRef.current) {
            return;
        }
        if (mouseUpTarget != null && findRootOwnerId(mouseUpTarget) === store.select('rootId')) {
            return;
        }
        if (isMouseWithinBounds(mouseEvent, triggerRef.current)) {
            return;
        }
        floatingTreeRoot.events.emit('close', { domEvent: mouseEvent, reason: REASONS.cancelOpen });
    });
    useIsoLayoutEffect(() => {
        if (isOpenedByThisTrigger && store.select('lastOpenChangeReason') === REASONS.triggerHover) {
            const doc = ownerDocument(triggerRef.current);
            doc.addEventListener('mouseup', handleDocumentMouseUp, { once: true });
        }
    }, () => [isOpenedByThisTrigger, handleDocumentMouseUp, store]);
    const parentMenubarHasSubmenuOpen = $derived(parent.type === 'menubar' && parent.context.hasSubmenuOpen);
    const openOnHover = $derived(openOnHoverProp ?? parentMenubarHasSubmenuOpen);
    const hoverProps = useHoverReferenceInteraction(() => floatingRootContext, () => ({
        enabled: openOnHover &&
            !disabled &&
            (!isInMenubar || (parentMenubarHasSubmenuOpen && !forwarding.isMountedByThisTrigger)),
        handleClose: safePolygon({ blockPointerEvents: !isInMenubar }),
        mouseOnly: true,
        move: false,
        restMs: parent.type === undefined ? delay : undefined,
        delay: { close: closeDelay },
        triggerElementRef,
        externalTree: floatingTreeRoot,
        isActiveTrigger: isTriggerActive,
        isClosing: () => store.select('transitionStatus') === 'ending',
    }));
    // Whether to ignore clicks to open the menu.
    // `lastOpenChangeReason` doesn't need to be reactive here, as we need to run this
    // only when `isOpenedByThisTrigger` changes.
    const stickIfOpen = useStickIfOpen(() => isOpenedByThisTrigger, () => store.select('lastOpenChangeReason'));
    const click = useClick(() => floatingRootContext, () => ({
        enabled: !disabled,
        event: isOpenedByThisTrigger && isInMenubar ? 'click' : 'mousedown',
        toggle: true,
        ignoreMouse: false,
        stickIfOpen: parent.type === undefined ? stickIfOpen() : false,
    }));
    const focus = useFocus(() => floatingRootContext, () => ({
        enabled: !disabled && parentMenubarHasSubmenuOpen,
    }));
    const mixedToggleHandlers = useMixedToggleClickHandler(() => ({
        open: isOpenedByThisTrigger,
        enabled: isInMenubar,
        mouseDownAction: 'open',
    }));
    const localInteractionProps = $derived.by(() => mergeProps(focus.reference, click.reference));
    const rootTriggerProps = $derived(store.useState('triggerProps', forwarding.isMountedByThisTrigger));
    const { preFocusGuardRef, handlePreFocusGuardFocus, handleFocusTargetFocus } = useTriggerFocusGuards(() => store, triggerElementRef);
    const state: MenuTriggerState = $derived({
        disabled,
        open: isOpenedByThisTrigger,
    });
    const ref = [triggerRef, setRef, buttonRef, forwarding.registerTrigger, triggerElementRef];
    const props = $derived([
        localInteractionProps,
        hoverProps() ?? EMPTY_OBJECT,
        rootTriggerProps,
        {
            'aria-haspopup': 'menu' as const,
            'aria-controls': popupId,
            id: thisTriggerId,
            onmousedown: (event: MouseEvent) => {
                if (store.select('open')) {
                    return;
                }
                // mousedown -> mouseup on menu item should not trigger it within 200ms.
                allowMouseUpTriggerTimeout.start(200, () => {
                    store.context.allowMouseUpTriggerRef.current = true;
                });
                const doc = ownerDocument(event.currentTarget as Element);
                doc.addEventListener('mouseup', handleDocumentMouseUp, { once: true });
            },
        },
        isInMenubar ? { role: 'menuitem' } : {},
        mixedToggleHandlers(),
        elementProps,
        getButtonProps,
    ]);
    return { get state() { return state; }, get ref() { return ref; }, get props() { return props; }, get isInMenubar() { return isInMenubar; }, get isOpenedByThisTrigger() { return isOpenedByThisTrigger; }, store: () => store, preFocusGuardRef, handlePreFocusGuardFocus, handleFocusTargetFocus };
}
function useStickIfOpen(getOpen: () => boolean, getOpenReason: () => string | null) {
    const stickIfOpenTimeout = useTimeout();
    let stickIfOpen = $state(false);
    const open = $derived(getOpen());
    const openReason = $derived(getOpenReason());
    useIsoLayoutEffect(() => {
        if (open && openReason === REASONS.triggerHover) {
            // Only allow "patient" clicks to close the menu if it's open.
            // If they clicked within 500ms of the menu opening, keep it open.
            stickIfOpen = true;
            stickIfOpenTimeout.start(PATIENT_CLICK_THRESHOLD, () => {
                stickIfOpen = false;
            });
        }
        else if (!open) {
            stickIfOpenTimeout.clear();
            stickIfOpen = false;
        }
    }, () => [open, openReason, stickIfOpenTimeout]);
    return () => stickIfOpen;
}
function useMenuParent() {
    const menubarContext = useMenubarContext(true);
    const parent: MenuParent = (() => {
        if (menubarContext) {
            return {
                type: 'menubar',
                context: menubarContext,
            };
        }
        return {
            type: undefined,
        };
    })();
    return parent;
}
