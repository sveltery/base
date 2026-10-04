// Original Base UI 1.8.0 at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// MIT: THIRD_PARTY_NOTICES.md. Native Svelte live readers/effects replace React hooks.
import { DEV } from 'esm-env';
import { untrack } from 'svelte';
import { useAnimationFrame } from '../../utils/useAnimationFrame.js';
import { useIsoLayoutEffect } from '../../utils/useIsoLayoutEffect.svelte.js';
import { ownerDocument } from '../../utils/owner.js';
import { useStableCallback } from '../../utils/useStableCallback.js';
import { platform } from '../../utils/platform/index.js';
import { isHTMLElement } from '@floating-ui/utils/dom';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails.js';
import { REASONS } from '../../internals/reasons.js';
import { useFloatingParentNodeId, useFloatingTree } from '../components/FloatingTree.svelte.js';
import { FloatingTreeStore } from '../components/FloatingTreeStore.js';
import type { ElementProps, FloatingContext, FloatingRootContext } from '../types.js';
import { findNonDisabledListIndex, getMaxListIndex, getMinListIndex, isIndexOutOfListBounds, } from '../utils/composite.js';
import type { gridNavigation } from './gridNavigation';
import { ARROW_DOWN, ARROW_LEFT, ARROW_RIGHT, ARROW_UP } from '../utils/constants.js';
import { activeElement, contains, getFloatingFocusElement, getTarget, isTypeableCombobox, } from '../utils/element.js';
import { enqueueFocus } from '../utils/enqueueFocus.js';
import { isVirtualClick, isVirtualPointerEvent, stopEvent } from '../utils/event.js';
export const ESCAPE = 'Escape';
// WebKit fires zero-delta `mousemove`/`pointermove` events when the list scrolls
// beneath a stationary pointer, moving the highlight during keyboard navigation.
// https://github.com/mui/base-ui/issues/4002
function isStationaryWebKitPointer(event: MouseEvent | PointerEvent) {
    return platform.engine.webkit && event.movementX === 0 && event.movementY === 0;
}
function doSwitch(orientation: UseListNavigationProps['orientation'], vertical: boolean, horizontal: boolean) {
    switch (orientation) {
        case 'vertical':
            return vertical;
        case 'horizontal':
            return horizontal;
        default:
            return vertical || horizontal;
    }
}
function isMainOrientationKey(key: string, orientation: UseListNavigationProps['orientation']) {
    const vertical = key === ARROW_UP || key === ARROW_DOWN;
    const horizontal = key === ARROW_LEFT || key === ARROW_RIGHT;
    return doSwitch(orientation, vertical, horizontal);
}
function isMainOrientationToEndKey(key: string, orientation: UseListNavigationProps['orientation'], rtl: boolean) {
    const vertical = key === ARROW_DOWN;
    const horizontal = rtl ? key === ARROW_LEFT : key === ARROW_RIGHT;
    return (doSwitch(orientation, vertical, horizontal) || key === 'Enter' || key === ' ' || key === '');
}
function isCrossOrientationOpenKey(key: string, orientation: UseListNavigationProps['orientation'], rtl: boolean) {
    const vertical = rtl ? key === ARROW_LEFT : key === ARROW_RIGHT;
    const horizontal = key === ARROW_DOWN;
    return doSwitch(orientation, vertical, horizontal);
}
function isCrossOrientationCloseKey(key: string, orientation: UseListNavigationProps['orientation'], rtl: boolean, grid: boolean) {
    const vertical = rtl ? key === ARROW_RIGHT : key === ARROW_LEFT;
    const horizontal = key === ARROW_UP;
    if (orientation === 'both' || (orientation === 'horizontal' && grid)) {
        return key === ESCAPE;
    }
    return doSwitch(orientation, vertical, horizontal);
}
export interface UseListNavigationProps {
    /**
     * A ref that holds an array of list items.
     * @default empty list
     */
    listRef: {
        current: Array<HTMLElement | null>;
    };
    /**
     * The index of the currently active (focused or highlighted) item, which may
     * or may not be selected.
     * @default null
     */
    activeIndex: number | null;
    /**
     * A callback that is called when the user navigates to a new active item,
     * passed in a new `activeIndex`.
     */
    onNavigate?: ((activeIndex: number | null, event: Event | undefined) => void) | undefined;
    /**
     * Whether the Hook is enabled, including all internal Effects and event
     * handlers.
     * @default true
     */
    enabled?: boolean | undefined;
    /**
     * The currently selected item index, which may or may not be active.
     * @default null
     */
    selectedIndex?: number | null | undefined;
    /**
     * Whether to focus the item upon opening the floating element. 'auto' infers
     * what to do based on the input type (keyboard vs. pointer), while a boolean
     * value will force the value.
     * @default 'auto'
     */
    focusItemOnOpen?: boolean | 'auto' | undefined;
    /**
     * Whether hovering an item synchronizes the focus.
     * @default true
     */
    focusItemOnHover?: boolean | undefined;
    /**
     * Whether pressing an arrow key on the navigation's main axis opens the
     * floating element.
     * @default true
     */
    openOnArrowKeyDown?: boolean | undefined;
    /**
     * By default elements with either a `disabled` or `aria-disabled` attribute
     * are skipped in the list navigation — however, this requires the items to
     * be rendered.
     * This prop allows you to manually specify indices which should be disabled,
     * overriding the default logic.
     * For Windows-style select popups, where the menu does not open when
     * navigating via arrow keys, specify an empty array.
     * @default undefined
     */
    disabledIndices?: ReadonlyArray<number> | ((index: number) => boolean) | undefined;
    /**
     * Determines whether focus can escape the list, such that nothing is selected
     * after navigating beyond the boundary of the list. In some
     * autocomplete/combobox components, this may be desired, as screen
     * readers will return to the input.
     * `loopFocus` must be `true`.
     * @default false
     */
    allowEscape?: boolean | undefined;
    /**
     * Determines whether focus should loop around when navigating past the first
     * or last item.
     * @default false
     */
    loopFocus?: boolean | undefined;
    /**
     * If the list is nested within another one (e.g. a nested submenu), the
     * navigation semantics change.
     * @default false
     */
    nested?: boolean | undefined;
    /**
     * Allows to specify the orientation of the parent list, which is used to
     * determine the direction of the navigation.
     * This is useful when list navigation is used within a Composite,
     * as the hook can't determine the orientation of the parent list automatically.
     */
    parentOrientation?: UseListNavigationProps['orientation'] | undefined;
    /**
     * Whether the direction of the floating element's navigation is in RTL
     * layout.
     * @default false
     */
    rtl?: boolean | undefined;
    /**
     * Whether the focus is virtual (using `aria-activedescendant`).
     * Use this if you need focus to remain on the reference element
     * (such as an input), but allow arrow keys to navigate list items.
     * This is common in autocomplete listbox components.
     * Your virtually-focused list items must have a unique `id` set on them.
     * @default false
     */
    virtual?: boolean | undefined;
    /**
     * The orientation in which navigation occurs.
     * @default 'vertical'
     */
    orientation?: 'vertical' | 'horizontal' | 'both' | undefined;
    /**
     * The id of the root component.
     */
    id?: string | undefined;
    /**
     * Whether to clear the active index when the pointer leaves an item.
     * @default true
     */
    resetOnPointerLeave?: boolean | undefined;
    /**
     * External FloatingTree to use when the one provided by context can't be used.
     */
    externalTree?: FloatingTreeStore | undefined;
    /**
     * Computes two-dimensional list navigation for grid-capable consumers.
     */
    grid?: typeof gridNavigation | null | undefined;
}
/**
 * Adds arrow key-based navigation of a list of items, either using real DOM
 * focus or virtual focus.
 * @see https://floating-ui.com/docs/useListNavigation
 */
export function useListNavigation(getContext: () => FloatingRootContext | FloatingContext, getProps: () => UseListNavigationProps): ElementProps {
    const context = $derived(getContext());
    const { listRef, activeIndex, onNavigate: onNavigateProp = () => { }, enabled = true, selectedIndex = null, allowEscape = false, loopFocus = false, nested = false, rtl = false, virtual = false, focusItemOnOpen = 'auto', focusItemOnHover = true, openOnArrowKeyDown = true, disabledIndices = undefined, orientation = 'vertical', parentOrientation, id, resetOnPointerLeave = true, externalTree, grid: navigateGrid, } = $derived(getProps());
    const isGrid = $derived(navigateGrid != null);
    useIsoLayoutEffect(() => {
      if (DEV) {
        if (allowEscape) {
            if (!loopFocus) {
                console.warn('`useListNavigation` looping must be enabled to allow escaping.');
            }
            if (!virtual) {
                console.warn('`useListNavigation` must be virtual to allow escaping.');
            }
        }
        if (orientation === 'vertical' && isGrid) {
            console.warn('In grid list navigation mode, the `orientation` should', 'be either "horizontal" or "both".');
        }
      }
    }, () => [allowEscape, loopFocus, virtual, orientation, isGrid]);
    const store = $derived('rootStore' in context ? context.rootStore : context);
    const open = $derived(store.useState('open'));
    const floatingElement = $derived(store.useState('floatingElement'));
    const domReferenceElement = $derived(store.useState('domReferenceElement'));
    const dataRef = $derived(store.context.dataRef);
    const floatingFocusElement = $derived(getFloatingFocusElement(floatingElement));
    const typeableComboboxReference = $derived(isTypeableCombobox(domReferenceElement));
    const floatingFocusElementRef = { get current() {
            return floatingFocusElement;
        } };
    const parentId = useFloatingParentNodeId();
    const contextTree = useFloatingTree();
    const tree = $derived(externalTree ?? contextTree);
    const focusItemOnOpenRef = { current: untrack(() => focusItemOnOpen) };
    const indexRef = { current: untrack(() => selectedIndex ?? -1) };
    const keyRef = { current: null as null | string };
    const isPointerModalityRef = { current: true };
    const onNavigate = useStableCallback((event?: Event) => {
        onNavigateProp(indexRef.current === -1 ? null : indexRef.current, event);
    });
    const previousMountedRef = { current: untrack(() => !!floatingElement) };
    const previousOpenRef = { current: untrack(() => open) };
    const forceSyncFocusRef = { current: false };
    const forceScrollIntoViewRef = { current: false };
    const cancelQueuedFocusRef = { current: null as (() => void) | null };
    const disabledIndicesRef = { get current() {
            return disabledIndices;
        } };
    const latestOpenRef = { get current() {
            return open;
        } };
    const selectedIndexRef = { get current() {
            return selectedIndex;
        } };
    const resetOnPointerLeaveRef = { get current() {
            return resetOnPointerLeave;
        } };
    const focusFrame = useAnimationFrame();
    const waitForListPopulatedFrame = useAnimationFrame();
    const focusItem = useStableCallback(() => {
        function runFocus(item: HTMLElement) {
            if (virtual) {
                tree?.events.emit('virtualfocus', item);
            }
            else {
                cancelQueuedFocusRef.current = enqueueFocus(item, {
                    sync: forceSyncFocusRef.current,
                    preventScroll: true,
                });
            }
        }
        const initialItem = listRef.current[indexRef.current];
        const forceScrollIntoView = forceScrollIntoViewRef.current;
        if (initialItem) {
            runFocus(initialItem);
        }
        const scheduler = forceSyncFocusRef.current
            ? (callback: () => void) => callback()
            : (callback: () => void) => focusFrame.request(callback);
        scheduler(() => {
            const waitedItem = listRef.current[indexRef.current] || initialItem;
            if (!waitedItem) {
                return;
            }
            if (!initialItem) {
                runFocus(waitedItem);
            }
            const shouldScrollIntoView = 
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            item && (forceScrollIntoView || !isPointerModalityRef.current);
            if (shouldScrollIntoView) {
                // JSDOM doesn't support `.scrollIntoView()` but it's widely supported
                // by all browsers.
                waitedItem.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
            }
        });
    });
    useIsoLayoutEffect(() => {
        dataRef.current.orientation = orientation;
    }, () => [dataRef, orientation]);
    // Sync `selectedIndex` to be the `activeIndex` upon opening the floating
    // element. Also, reset `activeIndex` upon closing the floating element.
    useIsoLayoutEffect(() => {
        if (!enabled) {
            return;
        }
        if (open && floatingElement) {
            indexRef.current = selectedIndex ?? -1;
            if (focusItemOnOpenRef.current && selectedIndex != null) {
                // Regardless of the pointer modality, we want to ensure the selected
                // item comes into view when the floating element is opened.
                forceScrollIntoViewRef.current = true;
                onNavigate();
            }
        }
        else if (previousMountedRef.current) {
            // Reset the active index when the list is no longer open and mounted (closing or
            // unmounting). `onNavigate` is a stable callback that always forwards to the latest
            // `onNavigate` prop.
            indexRef.current = -1;
            onNavigate();
        }
    }, () => [enabled, open, floatingElement, selectedIndex, onNavigate]);
    // Sync `activeIndex` to be the focused item while the floating element is
    // open.
    useIsoLayoutEffect(() => {
        if (!enabled) {
            return;
        }
        if (!open) {
            forceSyncFocusRef.current = false;
            return;
        }
        if (!floatingElement) {
            return;
        }
        if (activeIndex == null) {
            forceSyncFocusRef.current = false;
            if (selectedIndexRef.current != null) {
                return;
            }
            // Reset while the floating element was open (e.g. the list changed).
            if (previousMountedRef.current) {
                indexRef.current = -1;
                focusItem();
            }
            // Initial sync.
            if ((!previousOpenRef.current || !previousMountedRef.current) &&
                focusItemOnOpenRef.current &&
                (keyRef.current != null || (focusItemOnOpenRef.current === true && keyRef.current == null))) {
                let runs = 0;
                const waitForListPopulated = () => {
                    if (listRef.current[0] == null) {
                        // Avoid letting the browser paint if possible on the first try,
                        // otherwise use rAF. Don't try more than twice, since something
                        // is wrong otherwise.
                        if (runs < 2) {
                            const scheduler = runs
                                ? (callback: () => void) => waitForListPopulatedFrame.request(callback)
                                : queueMicrotask;
                            scheduler(waitForListPopulated);
                        }
                        runs += 1;
                    }
                    else {
                        // Initially focus the first non-disabled item. `disabledIndices` is deliberately
                        // omitted here so attribute-disabled items (`disabled`/`aria-disabled`) are skipped
                        // on open even when the consumer passes an empty `disabledIndices` array. Passing it
                        // would regress that behavior (see mui/base-ui#2604).
                        indexRef.current =
                            keyRef.current == null ||
                                isMainOrientationToEndKey(keyRef.current, orientation, rtl) ||
                                nested
                                ? getMinListIndex(listRef)
                                : getMaxListIndex(listRef);
                        keyRef.current = null;
                        onNavigate();
                    }
                };
                waitForListPopulated();
            }
        }
        else if (!isIndexOutOfListBounds(listRef.current, activeIndex)) {
            indexRef.current = activeIndex;
            focusItem();
            forceScrollIntoViewRef.current = false;
        }
    }, () => [
        enabled,
        open,
        floatingElement,
        activeIndex,
        selectedIndexRef,
        nested,
        listRef,
        orientation,
        rtl,
        onNavigate,
        focusItem,
        waitForListPopulatedFrame,
    ]);
    // Ensure the parent floating element has focus when a nested child closes
    // to allow arrow key navigation to work after the pointer leaves the child.
    useIsoLayoutEffect(() => {
        if (!enabled || floatingElement || !tree || virtual || !previousMountedRef.current) {
            return;
        }
        const nodes = tree.nodesRef.current;
        const parent = nodes.find((node) => node.id === parentId)?.context?.elements.floating;
        // `floatingElement` is null here (see the guard above), so resolve the owner document from an
        // in-DOM element for realm-safety (shadow DOM/iframes): the reference element, falling back to
        // the parent floating element when the reference is virtual (`domReferenceElement` is null).
        const activeEl = activeElement(ownerDocument(domReferenceElement ?? parent ?? null));
        const treeContainsActiveEl = nodes.some((node) => node.context && contains(node.context.elements.floating, activeEl));
        if (parent && !treeContainsActiveEl && isPointerModalityRef.current) {
            parent.focus({ preventScroll: true });
        }
    }, () => [enabled, floatingElement, domReferenceElement, tree, parentId, virtual]);
    useIsoLayoutEffect(() => {
        previousOpenRef.current = open;
        previousMountedRef.current = !!floatingElement;
    });
    useIsoLayoutEffect(() => {
        if (!open) {
            keyRef.current = null;
            focusItemOnOpenRef.current = focusItemOnOpen;
        }
    }, () => [open, focusItemOnOpen]);
    const hasActiveIndex = $derived(activeIndex != null);
    const syncCurrentTarget = useStableCallback((event: Event) => {
        if (!latestOpenRef.current) {
            return;
        }
        const index = listRef.current.indexOf(event.currentTarget as HTMLElement);
        if (index !== -1 && (indexRef.current !== index || activeIndex !== index)) {
            indexRef.current = index;
            onNavigate(event);
        }
    });
    const getParentOrientation = useStableCallback(() => {
        return (parentOrientation ??
            (tree?.nodesRef.current.find((node) => node.id === parentId)?.context?.dataRef?.current
                .orientation as UseListNavigationProps['orientation']));
    });
    const getMinEnabledIndex = useStableCallback(() => {
        return getMinListIndex(listRef, disabledIndicesRef.current);
    });
    const commonOnKeyDown = useStableCallback((event: KeyboardEvent) => {
        isPointerModalityRef.current = false;
        forceSyncFocusRef.current = true;
        // When composing a character, Chrome fires ArrowDown twice. Firefox/Safari
        // don't appear to suffer from this. `event.isComposing` is avoided due to
        // Safari not supporting it properly (although it's not needed in the first
        // place for Safari, just avoiding any possible issues).
        if (event.which === 229) {
            return;
        }
        // If the floating element is animating out, ignore navigation. Otherwise,
        // the `activeIndex` gets set to 0 despite not being open so the next time
        // the user ArrowDowns, the first item won't be focused.
        if (!latestOpenRef.current && event.currentTarget === floatingFocusElementRef.current) {
            return;
        }
        if (nested && isCrossOrientationCloseKey(event.key, orientation, rtl, isGrid)) {
            // If the nested list's close key is also the parent navigation key,
            // let the parent navigate. Otherwise, stop propagating the event.
            if (!isMainOrientationKey(event.key, getParentOrientation())) {
                stopEvent(event);
            }
            store.setOpen(false, createChangeEventDetails(REASONS.listNavigation, event));
            if (isHTMLElement(domReferenceElement)) {
                if (virtual) {
                    tree?.events.emit('virtualfocus', domReferenceElement);
                }
                else {
                    domReferenceElement.focus();
                }
            }
            return;
        }
        const currentIndex = indexRef.current;
        const minIndex = getMinListIndex(listRef, disabledIndices);
        const maxIndex = getMaxListIndex(listRef, disabledIndices);
        if (!typeableComboboxReference) {
            if (event.key === 'Home') {
                stopEvent(event);
                indexRef.current = minIndex;
                onNavigate(event);
            }
            if (event.key === 'End') {
                stopEvent(event);
                indexRef.current = maxIndex;
                onNavigate(event);
            }
        }
        // Grid navigation is injected by grid-capable consumers so non-grid
        // consumers (menu, select) tree-shake the grid helpers out.
        if (navigateGrid != null) {
            const index = navigateGrid(event, indexRef.current, listRef, orientation, loopFocus, rtl, disabledIndices, minIndex, maxIndex);
            if (index != null) {
                indexRef.current = index;
                onNavigate(event);
            }
            if (orientation === 'both') {
                return;
            }
        }
        if (isMainOrientationKey(event.key, orientation)) {
            stopEvent(event);
            // Reset the index if no item is focused.
            if (open &&
                !virtual &&
                activeElement((event.currentTarget as HTMLElement).ownerDocument) === event.currentTarget) {
                indexRef.current = isMainOrientationToEndKey(event.key, orientation, rtl)
                    ? minIndex
                    : maxIndex;
                onNavigate(event);
                return;
            }
            if (isMainOrientationToEndKey(event.key, orientation, rtl)) {
                if (loopFocus) {
                    if (currentIndex >= maxIndex) {
                        if (allowEscape && currentIndex !== listRef.current.length) {
                            indexRef.current = -1;
                        }
                        else {
                            // Give time for virtualizers to update the listRef.
                            forceSyncFocusRef.current = false;
                            indexRef.current = minIndex;
                        }
                    }
                    else {
                        indexRef.current = findNonDisabledListIndex(listRef.current, {
                            startingIndex: currentIndex,
                            disabledIndices,
                        });
                    }
                }
                else {
                    indexRef.current = Math.min(maxIndex, findNonDisabledListIndex(listRef.current, {
                        startingIndex: currentIndex,
                        disabledIndices,
                    }));
                }
            }
            else if (loopFocus) {
                if (currentIndex <= minIndex) {
                    if (allowEscape && currentIndex !== -1) {
                        indexRef.current = listRef.current.length;
                    }
                    else {
                        // Give time for virtualizers to update the listRef.
                        forceSyncFocusRef.current = false;
                        indexRef.current = maxIndex;
                    }
                }
                else {
                    indexRef.current = findNonDisabledListIndex(listRef.current, {
                        startingIndex: currentIndex,
                        decrement: true,
                        disabledIndices,
                    });
                }
            }
            else {
                indexRef.current = Math.max(minIndex, findNonDisabledListIndex(listRef.current, {
                    startingIndex: currentIndex,
                    decrement: true,
                    disabledIndices,
                }));
            }
            if (isIndexOutOfListBounds(listRef.current, indexRef.current)) {
                indexRef.current = -1;
            }
            onNavigate(event);
        }
    });
    const item = $derived.by(() => {
        const itemProps: ElementProps['item'] = {
            onfocusin(event: FocusEvent) {
                forceSyncFocusRef.current = true;
                syncCurrentTarget(event);
            },
            onclick: (event: MouseEvent) => (event.currentTarget as HTMLElement).focus({ preventScroll: true }), // Safari
            onmousemove(event: MouseEvent) {
                if (isStationaryWebKitPointer(event)) {
                    return;
                }
                forceSyncFocusRef.current = true;
                forceScrollIntoViewRef.current = false;
                if (focusItemOnHover) {
                    syncCurrentTarget(event);
                }
            },
            onpointerleave(event: PointerEvent) {
                if (!latestOpenRef.current ||
                    !isPointerModalityRef.current ||
                    event.pointerType === 'touch') {
                    return;
                }
                forceSyncFocusRef.current = true;
                const relatedTarget = event.relatedTarget as HTMLElement | null;
                if (!focusItemOnHover || listRef.current.includes(relatedTarget)) {
                    return;
                }
                if (!resetOnPointerLeaveRef.current) {
                    return;
                }
                cancelQueuedFocusRef.current?.();
                cancelQueuedFocusRef.current = null;
                indexRef.current = -1;
                onNavigate(event);
                if (!virtual) {
                    const floatingFocusEl = floatingFocusElementRef.current;
                    const activeEl = activeElement(ownerDocument(floatingFocusEl));
                    if (floatingFocusEl && contains(floatingFocusEl, activeEl)) {
                        floatingFocusEl.focus({ preventScroll: true });
                    }
                }
            },
        };
        return itemProps;
    });
    const ariaActiveDescendantProp = $derived.by(() => {
        return (virtual &&
            open &&
            hasActiveIndex && {
            'aria-activedescendant': `${id}-${activeIndex}`,
        });
    });
    const floating: ElementProps['floating'] = $derived.by(() => {
        return {
            ...(!typeableComboboxReference ? ariaActiveDescendantProp : {}),
            onkeydown(event: KeyboardEvent) {
                // Close submenu on Shift+Tab
                if (event.key === 'Tab' && event.shiftKey && open && !virtual) {
                    // If the event originated from within a nested element (e.g., a Dialog opened from
                    // within the menu), don't close the menu. The nested element has its own focus
                    // management and should handle the Tab key.
                    const target = getTarget(event) as Element | null;
                    if (target && !contains(floatingFocusElementRef.current, target)) {
                        return;
                    }
                    stopEvent(event);
                    store.setOpen(false, createChangeEventDetails(REASONS.focusOut, event));
                    if (isHTMLElement(domReferenceElement)) {
                        domReferenceElement.focus();
                    }
                    return;
                }
                commonOnKeyDown(event);
            },
            onpointermove(event: PointerEvent) {
                if (isStationaryWebKitPointer(event)) {
                    return;
                }
                isPointerModalityRef.current = true;
            },
        };
    });
    const trigger: ElementProps['trigger'] = $derived.by(() => {
        function openOnNavigationKeyDown(event: KeyboardEvent) {
            store.setOpen(true, createChangeEventDetails(REASONS.listNavigation, event, event.currentTarget as HTMLElement));
        }
        function checkVirtualMouse(event: PointerEvent) {
            if (focusItemOnOpen === 'auto' && isVirtualClick(event)) {
                focusItemOnOpenRef.current = !virtual;
            }
        }
        function checkVirtualPointer(event: PointerEvent) {
            // `pointerdown` fires first, reset the state then perform the checks.
            focusItemOnOpenRef.current = focusItemOnOpen;
            if (focusItemOnOpen === 'auto' && isVirtualPointerEvent(event)) {
                focusItemOnOpenRef.current = true;
            }
        }
        return {
            onkeydown(event: KeyboardEvent) {
                // non-reactive open state (to prevent re-creation of the handler)
                const currentOpen = store.select('open');
                isPointerModalityRef.current = false;
                const isArrowKey = event.key.startsWith('Arrow');
                const isParentCrossOpenKey = isCrossOrientationOpenKey(event.key, getParentOrientation(), rtl);
                const isMainKey = isMainOrientationKey(event.key, orientation);
                const isNavigationKey = (nested ? isParentCrossOpenKey : isMainKey) ||
                    event.key === 'Enter' ||
                    event.key.trim() === '';
                if (virtual && currentOpen) {
                    return commonOnKeyDown(event);
                }
                // If a floating element should not open on arrow key down, avoid
                // setting `activeIndex` while it's closed.
                if (!currentOpen && !openOnArrowKeyDown && isArrowKey) {
                    return undefined;
                }
                if (isNavigationKey) {
                    const isParentMainKey = isMainOrientationKey(event.key, getParentOrientation());
                    keyRef.current = nested && isParentMainKey ? null : event.key;
                }
                if (nested) {
                    if (isParentCrossOpenKey) {
                        stopEvent(event);
                        if (currentOpen) {
                            indexRef.current = getMinEnabledIndex();
                            onNavigate(event);
                        }
                        else {
                            openOnNavigationKeyDown(event);
                        }
                    }
                    return undefined;
                }
                if (isMainKey) {
                    if (selectedIndexRef.current != null) {
                        indexRef.current = selectedIndexRef.current;
                    }
                    stopEvent(event);
                    if (!currentOpen && openOnArrowKeyDown) {
                        openOnNavigationKeyDown(event);
                    }
                    else {
                        commonOnKeyDown(event);
                    }
                    if (currentOpen) {
                        onNavigate(event);
                    }
                }
                return undefined;
            },
            onfocusin(event: FocusEvent) {
                if (store.select('open') && !virtual) {
                    indexRef.current = -1;
                    onNavigate(event);
                }
            },
            onpointerdown: checkVirtualPointer,
            onpointerenter: checkVirtualPointer,
            onmousedown: checkVirtualMouse,
            onclick: checkVirtualMouse,
        };
    });
    const reference: ElementProps['reference'] = $derived.by(() => {
        return {
            ...ariaActiveDescendantProp,
            ...trigger,
        };
    });
    return { get reference() { return enabled ? reference : undefined; }, get floating() { return enabled ? floating : undefined; }, get item() { return enabled ? item : undefined; }, get trigger() { return enabled ? trigger : undefined; } };
}
