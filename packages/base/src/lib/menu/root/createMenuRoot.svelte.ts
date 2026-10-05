// Original MenuRoot full business body at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// Native Svelte component initialization, context, live props and host effects; MIT.
import { DEV } from 'esm-env';
import { onDestroy, untrack } from 'svelte';
import { Timeout } from '@sveltery/utils/useTimeout';


import { EMPTY_ARRAY, EMPTY_OBJECT } from '@sveltery/utils/empty';
import { useDismiss } from '../../floating-ui/hooks/useDismiss.svelte.js';
import { useFloatingNodeId, useFloatingParentNodeId } from '../../floating-ui/components/FloatingTree.svelte.js';
import { useListNavigation } from '../../floating-ui/hooks/useListNavigation.svelte.js';
import { useTypeahead } from '../../floating-ui/hooks/useTypeahead.svelte.js';
import { useSyncedFloatingRootContext } from '../../floating-ui/hooks/useSyncedFloatingRootContext.svelte.js';
import { useMenuRootContext } from './MenuRootContext.js';
import { useMenubarContext } from '../../menubar/MenubarContext.js';
import { TYPEAHEAD_RESET_MS } from '../../internals/constants.js';
import { useDirection } from '../../direction-provider/context.js';
import { useOpenInteractionType } from '../../utils/useOpenInteractionType.svelte.js';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails.js';
import { attachPreventUnmountOnClose } from '../../utils/popups/popupStoreUtils.svelte.js';
import { REASONS } from '../../internals/reasons.js';
import { useContextMenuRootContext } from '../../context-menu/root/ContextMenuRootContext.js';
import { mergeProps } from '../../merge-props/index.js';
import { useAnimationsFinished } from '../../internals/useAnimationsFinished.js';
import { MenuStore, type State as MenuStoreState } from '../store/MenuStore.svelte.js';
import { FOCUSABLE_POPUP_PROPS, createPopupOpenState, useImplicitActiveTrigger, useOpenStateTransitions, usePopupInteractionProps } from '../../utils/popups/popupStoreUtils.svelte.js';
import { useMenuSubmenuRootContext } from '../submenu-root/MenuSubmenuRootContext.js';
import type { MenuRootProps, MenuRoot, MenuParent } from '../types.js';
export function createMenuRoot<Payload>(getProps: () => MenuRootProps<Payload>, rootId: string, floatingId: string) {
    const { open: openProp, onOpenChange, onOpenChangeComplete, defaultOpen = false, disabled: disabledProp = false, modal: modalProp, loopFocus = true, orientation = 'vertical', closeParentOnEsc = false, triggerId: triggerIdProp, defaultTriggerId: defaultTriggerIdProp = null, highlightItemOnHover = true, } = $derived(getProps());
    const contextMenuContext = useContextMenuRootContext(true);
    const parentMenuRootContext = useMenuRootContext(true);
    const menubarContext = useMenubarContext(true);
    const isSubmenu = useMenuSubmenuRootContext();
    const parentFromContext: MenuParent = (() => {
        if (isSubmenu && parentMenuRootContext) {
            return {
                type: 'menu',
                store: parentMenuRootContext.store,
            };
        }
        if (menubarContext) {
            return {
                type: 'menubar',
                context: menubarContext,
            };
        }
        // Ensure this is not a Menu nested inside ContextMenu.Trigger.
        // ContextMenu parentContext is always undefined as ContextMenu.Root is instantiated with
        // <MenuRootContext.Provider value={undefined}>
        if (contextMenuContext && !parentMenuRootContext) {
            return {
                type: 'context-menu',
                context: contextMenuContext,
            };
        }
        return {
            type: undefined,
        };
    })();
    const floatingParentNodeIdFromContext = useFloatingParentNodeId();
    const parentMenuStore = parentFromContext.type === 'menu' ? parentFromContext.store : undefined;
    // An initially open submenu should animate in only when the user watches it appear, i.e. when
    // its subtree mounts because the parent popup is playing its own enter transition. A parent
    // that was `defaultOpen` at page load never passes through `'starting'`, and under a
    // `keepMounted` parent these initializers run at page load while the parent's status is still
    // `undefined` — in both cases the submenu is page-load content that must not animate. Gated on
    // being open at mount so a closed submenu doesn't seed `instantType` it would never clear. Read
    // during the first render only — consumed exclusively by first-render initializers below
    // (`useState` and the store's initial state).
    const animateInitialOpen = untrack(() => (openProp ?? defaultOpen) && parentMenuStore?.state.transitionStatus === 'starting');
    // Mirror an instantly-opened parent (e.g. keyboard click) so `[data-instant]` styling
    // suppresses the enter transition on both popups or neither. Captured once —
    // `animateInitialOpen` is only meaningful during the first render.
    const seededInstantType = animateInitialOpen ? parentMenuStore?.state.instantType : undefined;
    const store = untrack(() => useMenuRootStore<Payload>({
        open: defaultOpen,
        openProp,
        activeTriggerId: defaultTriggerIdProp,
        triggerIdProp,
        parent: parentFromContext,
        disabled: disabledProp,
        highlightItemOnHover,
        modal: parentFromContext.type === undefined ? modalProp : undefined,
        rootId,
        instantType: seededInstantType,
    }, floatingId, floatingParentNodeIdFromContext != null));
    store.useControlledProp('openProp', () => openProp);
    store.useControlledProp('triggerIdProp', () => triggerIdProp);
    store.context.onOpenChangeComplete = (nextOpen) => onOpenChangeComplete?.(nextOpen);
    const floatingTreeRoot = $derived(store.useState('floatingTreeRoot'));
    const floatingNodeIdFromContext = useFloatingNodeId(floatingId, store.select('floatingTreeRoot'));
    const open = $derived(store.useState('open'));
    const activeTriggerElement = $derived(store.useState('activeTriggerElement'));
    const positionerElement = $derived(store.useState('positionerElement'));
    const hoverEnabled = $derived(store.useState('hoverEnabled'));
    const disabled = $derived(store.useState('disabled'));
    const lastOpenChangeReason = $derived(store.useState('lastOpenChangeReason'));
    const parent = $derived(store.useState('parent'));
    const activeIndex = $derived(store.useState('activeIndex'));
    const payload = $derived(store.useState('payload') as Payload | undefined);
    const floatingParentNodeId = $derived(store.useState('floatingParentNodeId'));
    const openEventRef = { current: null as Event | null };
    const allowOutsidePressDismissalRef = { current: untrack(() => parent.type !== 'context-menu') };
    const allowOutsidePressDismissalTimeout = new Timeout();
    onDestroy(allowOutsidePressDismissalTimeout.clear);
    const allowTouchToCloseRef = { current: true };
    const allowTouchToCloseTimeout = new Timeout();
    onDestroy(allowTouchToCloseTimeout.clear);
    const nested = $derived(floatingParentNodeId != null);
    $effect(() => {
      if (DEV) {
        if (parent.type !== undefined && modalProp !== undefined) {
            console.warn('Base UI: The `modal` prop is not supported on nested menus. It will be ignored.');
        }
      }
    });
    const interaction = useOpenInteractionType(() => open);
    const openMethod = $derived(interaction.openMethod);
    const interactionTypeProps = interaction.triggerProps;
    store.useSyncedValues(() => ({
        disabled: disabledProp,
        highlightItemOnHover,
        modal: parent.type === undefined ? modalProp : undefined,
        openMethod,
        rootId,
    }));
    useImplicitActiveTrigger(store);
    const transitions = useOpenStateTransitions(() => open, store, () => {
        store.set('allowMouseEnter', false);
    }, animateInitialOpen);
    const forceUnmount = transitions.forceUnmount;
    const transitionStatus = $derived(transitions.transitionStatus);
    const runOnceAnimationsFinish = useAnimationsFinished(store.context.popupRef);
    // An inherited `instantType` is only for the initial reveal. A later controlled `open` flip
    // bypasses `setOpen`, so nothing would reset it and `[data-instant]` would wrongly suppress
    // every subsequent transition. Clear it once the enter phase settles, unless an interactive
    // open change already replaced it.
    $effect(() => {
        if (seededInstantType === undefined) {
            return undefined;
        }
        const clearSeededInstantType = () => {
            if (store.state.instantType === seededInstantType) {
                store.set('instantType', undefined);
            }
        };
        // A controlled close can interrupt the initial enter before the animations-finished cleanup
        // below fires (its abort cancels the pending callback, and a closed popup schedules no new
        // one). Nothing is left to protect once closing starts — the exit's suppression was already
        // decided at its trigger commit — so clear now or the next reopen renders a stale
        // `[data-instant]`.
        if (!open) {
            clearSeededInstantType();
            return undefined;
        }
        if (transitionStatus !== undefined) {
            return undefined;
        }
        // With no popup element (e.g. its subtree is suspended or waiting on data), there is no
        // enter transition to protect, and `useAnimationsFinished` would return without invoking the
        // callback — a ref assignment alone would never rerun this effect, leaving the seed stuck.
        // Clear immediately: a popup that appears after the reveal settles is page-load-like content.
        if (store.context.popupRef.current == null) {
            clearSeededInstantType();
            return undefined;
        }
        const abortController = new AbortController();
        runOnceAnimationsFinish(clearSeededInstantType, abortController.signal);
        return () => {
            abortController.abort();
        };
    });
    $effect(() => {
        if (contextMenuContext && !parentMenuRootContext) {
            // This is a context menu root.
            // It doesn't support detached triggers yet, so we have to sync the parent context manually.
            store.update({
                parent: {
                    type: 'context-menu',
                    context: contextMenuContext,
                },
                floatingNodeId: floatingNodeIdFromContext,
                floatingParentNodeId: floatingParentNodeIdFromContext,
            });
        }
        else if (parentMenuRootContext) {
            store.update({
                floatingNodeId: floatingNodeIdFromContext,
                floatingParentNodeId: floatingParentNodeIdFromContext,
            });
        }
    });
    $effect(() => {
        if (!open) {
            openEventRef.current = null;
        }
        if (parent.type !== 'context-menu') {
            return;
        }
        if (!open) {
            allowOutsidePressDismissalTimeout.clear();
            allowOutsidePressDismissalRef.current = false;
            return;
        }
        // With `mousedown` outside press events and long press touch input, there
        // needs to be a grace period after opening to ensure the dismissal event
        // doesn't fire immediately after open.
        allowOutsidePressDismissalTimeout.start(500, () => {
            allowOutsidePressDismissalRef.current = true;
        });
    });
    $effect(() => {
        if (!open && !hoverEnabled) {
            store.set('hoverEnabled', true);
        }
    });
    const setOpen = (nextOpen: boolean, eventDetails: Omit<MenuRoot.ChangeEventDetails, 'preventUnmountOnClose'>) => {
        const reason = eventDetails.reason;
        // Read the store directly, as relayed tree events and stale hover timers can request
        // a close after the state changed but before this component re-rendered.
        if (!nextOpen && !store.select('open')) {
            return;
        }
        if (open === nextOpen &&
            eventDetails.trigger === activeTriggerElement &&
            lastOpenChangeReason === reason) {
            return;
        }
        const shouldPreventUnmountOnClose = attachPreventUnmountOnClose(eventDetails as MenuRoot.ChangeEventDetails);
        // Do not immediately reset the activeTriggerId to allow
        // exit animations to play and focus to be returned correctly.
        if (!nextOpen && eventDetails.trigger == null) {
            eventDetails.trigger = activeTriggerElement ?? undefined;
        }
        onOpenChange?.(nextOpen, eventDetails as MenuRoot.ChangeEventDetails);
        if (eventDetails.isCanceled) {
            return;
        }
        store.state.floatingRootContext.dispatchOpenChange(nextOpen, eventDetails);
        const nativeEvent = eventDetails.event as Event;
        if (nextOpen === false &&
            nativeEvent?.type === 'click' &&
            (nativeEvent as PointerEvent).pointerType === 'touch' &&
            !allowTouchToCloseRef.current) {
            return;
        }
        // Prevent the menu from closing on mobile devices that have a delayed click event.
        // In some cases the menu, when tapped, will fire the focus event first and then the click event.
        // Without this guard, the menu will close immediately after opening.
        if (nextOpen && reason === REASONS.triggerFocus) {
            allowTouchToCloseRef.current = false;
            allowTouchToCloseTimeout.start(300, () => {
                allowTouchToCloseRef.current = true;
            });
        }
        else {
            allowTouchToCloseRef.current = true;
            allowTouchToCloseTimeout.clear();
        }
        // Keyboard and assistive-technology activations produce `detail === 0` clicks;
        // mouse-gesture clicks (including the synthesized drag-release click from
        // `useMenuItemCommonProps`) carry `detail >= 1`.
        const isKeyboardClick = (reason === REASONS.triggerPress || reason === REASONS.itemPress) &&
            (nativeEvent as MouseEvent).detail === 0;
        const isDismissClose = !nextOpen && (reason === REASONS.escapeKey || reason == null);
        openEventRef.current = eventDetails.event;
        const popupOpenState = createPopupOpenState(store.state, nextOpen, eventDetails.trigger, shouldPreventUnmountOnClose()) as ReturnType<typeof createPopupOpenState> & {
            openChangeReason: MenuRoot.ChangeEventReason;
            instantType: MenuStoreState<Payload>['instantType'];
        };
        popupOpenState.openChangeReason = reason;
        if (parent.type === 'menubar' &&
            (reason === REASONS.triggerFocus ||
                reason === REASONS.focusOut ||
                reason === REASONS.triggerHover ||
                reason === REASONS.listNavigation ||
                reason === REASONS.siblingOpen)) {
            popupOpenState.instantType = 'group';
        }
        else if (isKeyboardClick || isDismissClose) {
            popupOpenState.instantType = isKeyboardClick ? 'click' : 'dismiss';
        }
        else {
            popupOpenState.instantType = undefined;
        }
        // `instantType` must land in the same update that mounts the popup subtree: in React 17
        // legacy mode this `update` can flush synchronously, and a separate `instantType` write
        // after it would come too late for an initially open submenu seeding its own store from
        // this one during that flush.
        store.update(popupOpenState);
    };
    const floatingRootContext = useSyncedFloatingRootContext({
        popupStore: store,
        floatingRootContext: store.state.floatingRootContext,
        floatingId,
        nested: floatingParentNodeIdFromContext != null,
        onOpenChange: setOpen,
    });
    const floatingEvents = floatingRootContext.context.events;
    // Registered in a layout effect (not a passive one) so `setOpen` emits from imperative
    // `MenuHandle.open()` calls made in the same commit this root mounts — e.g. from another layout
    // effect during a route-transition handoff — are received instead of being silently dropped.
    $effect(() => {
        const handleSetOpenEvent = ({ open: nextOpen, eventDetails, }: {
            open: boolean;
            eventDetails: MenuRoot.ChangeEventDetails;
        }) => setOpen(nextOpen, eventDetails);
        floatingEvents.on('setOpen', handleSetOpenEvent);
        return () => {
            floatingEvents?.off('setOpen', handleSetOpenEvent);
        };
    });
    const handleImperativeClose = () => {
        store.setOpen(false, createChangeEventDetails(REASONS.imperativeAction));
    };
    const ctx = $derived(parent.type === 'context-menu' ? parent.context : undefined);
    $effect(() => {
        if (!ctx)
            return;
        ctx.positionerRef.current = positionerElement;
        ctx.actionsRef.current = { setOpen };
        return () => { if (ctx) {
            ctx.positionerRef.current = null;
            ctx.actionsRef.current = null;
        } };
    });
    const dismiss = useDismiss(() => floatingRootContext, () => ({
        enabled: !disabled,
        bubbles: { escapeKey: closeParentOnEsc && parent.type === 'menu' },
        outsidePress() {
            if (parent.type !== 'context-menu' || openEventRef.current?.type === 'contextmenu') {
                return true;
            }
            return allowOutsidePressDismissalRef.current;
        },
        externalTree: nested ? floatingTreeRoot : undefined,
    }));
    const direction = useDirection();
    const setActiveIndex = (index: number | null) => {
        if (store.select('activeIndex') === index) {
            return;
        }
        store.set('activeIndex', index);
    };
    const listNavigation = useListNavigation(() => floatingRootContext, () => ({
        enabled: !disabled,
        listRef: store.context.itemDomElements,
        activeIndex,
        nested: parent.type !== undefined,
        loopFocus,
        orientation,
        parentOrientation: parent.type === 'menubar' ? parent.context.orientation : undefined,
        rtl: direction() === 'rtl',
        disabledIndices: EMPTY_ARRAY,
        onNavigate: setActiveIndex,
        openOnArrowKeyDown: parent.type !== 'context-menu',
        externalTree: nested ? floatingTreeRoot : undefined,
        focusItemOnHover: highlightItemOnHover,
    }));
    const onTyping = (nextTyping: boolean) => {
        store.context.typingRef.current = nextTyping;
    };
    const typeahead = useTypeahead(() => floatingRootContext, () => ({
        enabled: !disabled,
        listRef: store.context.itemLabels,
        elementsRef: store.context.itemDomElements,
        activeIndex,
        resetMs: TYPEAHEAD_RESET_MS,
        onMatch: (index) => {
            if (open && index !== activeIndex) {
                store.set('activeIndex', index);
            }
        },
        onTyping,
    }));
    const activeTriggerProps = $derived.by(() => {
        const mergedProps = mergeProps(typeahead.reference, listNavigation.reference, dismiss.reference, {
            onmousemove() {
                store.set('allowMouseEnter', true);
            },
        }, interactionTypeProps);
        mergedProps['aria-haspopup'] = 'menu';
        mergedProps['aria-expanded'] = open;
        return mergedProps;
    });
    const inactiveTriggerProps = $derived.by(() => {
        const mergedProps = mergeProps(listNavigation.trigger, dismiss.trigger, interactionTypeProps);
        mergedProps['aria-haspopup'] = 'menu';
        mergedProps['aria-expanded'] = false;
        return mergedProps;
    });
    // The initial render has no store subscribers yet. Seed these props before triggers render so
    // the synchronization effect below doesn't make every trigger render twice in the first commit.
    store.update({ inactiveTriggerProps });
    const popupProps = $derived.by(() => mergeProps(FOCUSABLE_POPUP_PROPS, {
        id: floatingId,
        role: 'menu' as const,
        // `menu` is implicitly vertical, so only the non-default value needs to be rendered.
        'aria-orientation': orientation === 'horizontal' ? 'horizontal' : undefined,
        'aria-labelledby': activeTriggerElement?.id,
        onmousemove() {
            store.set('allowMouseEnter', true);
            if (parent.type === 'menu') {
                store.set('hoverEnabled', false);
            }
        },
        onclick() {
            if (store.select('hoverEnabled')) {
                store.set('hoverEnabled', false);
            }
        },
        onkeydown(event: KeyboardEvent) {
            // The Menubar's CompositeRoot captures keyboard events via
            // event delegation. This works well when Menu.Root is nested inside Menubar,
            // but with detached triggers we need to manually forward the event to the CompositeRoot.
            const relay = store.select('keyboardEventRelay');
            if (relay && !event.cancelBubble) {
                relay(event);
            }
        },
    }, typeahead.floating, listNavigation.floating, dismiss.floating));
    const itemProps = $derived(listNavigation.item ?? EMPTY_OBJECT);
    usePopupInteractionProps(store, () => ({
        floatingRootContext,
        activeTriggerProps,
        inactiveTriggerProps,
        popupProps,
        itemProps,
    }));
    return { store, parent: parentFromContext, close: handleImperativeClose, unmount: forceUnmount, get payload() { return payload; } };
}
function useMenuRootStore<Payload>(initialState: Partial<MenuStoreState<Payload>>, floatingId: string | undefined, nested: boolean) {
    // The store is owned by this Root instance and created exactly once. It is not tied to the handle:
    // the handle attaches to it, so swapping the handle re-attaches rather than recreating state.
    // Default values are only initial values; controlled values and root state are synced after creation.
    // Unlike other popups, Menu wires its floating root context separately (it relays open changes
    // through an event).
    const store = new MenuStore<Payload>(initialState, floatingId, nested);
    return store;
}
