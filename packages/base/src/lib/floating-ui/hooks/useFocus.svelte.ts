import { onDestroy } from 'svelte';
// Original Base UI 1.8.0 at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// MIT: THIRD_PARTY_NOTICES.md. Native Svelte live readers/effects replace React hooks.

import { addEventListener } from '@sveltery/utils/addEventListener';
import { platform } from '@sveltery/utils/platform';
import { mergeCleanups } from '@sveltery/utils/mergeCleanups';
import { ownerDocument } from '@sveltery/utils/owner';
import { Timeout } from '@sveltery/utils/useTimeout';
import { getWindow, isElement, isHTMLElement } from '@floating-ui/utils/dom';
import type { ElementProps, FloatingContext, FloatingRootContext } from '../types.js';
import { createAttribute } from '../utils/createAttribute.js';
import { activeElement, contains, getTarget, isTargetInsideEnabledTrigger, isTypeableElement, matchesFocusVisible, } from '../utils/element.js';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails.js';
import { REASONS } from '../../internals/reasons.js';
import type { FloatingUIOpenChangeDetails } from '../types.js';
const isMacSafari = platform.os.mac && platform.engine.webkit;
export interface UseFocusProps {
    /**
     * Whether the Hook is enabled, including all internal Effects and event
     * handlers.
     * @default true
     */
    enabled?: boolean | undefined;
    /**
     * Waits for the specified time before opening.
     * @default undefined
     */
    delay?: number | (() => number | undefined) | undefined;
}
/**
 * Opens the floating element while the reference element has focus, like CSS
 * `:focus`.
 * @see https://floating-ui.com/docs/useFocus
 */
export function useFocus(getContext: () => FloatingRootContext | FloatingContext, getProps: () => UseFocusProps = () => ({})): ElementProps {
    const context = $derived(getContext());
    const { enabled = true, delay } = $derived(getProps());
    const store = $derived('rootStore' in context ? context.rootStore : context);
    const { events, dataRef } = $derived(store.context);
    const blockFocusRef = { current: false };
    // Track which reference should be blocked from re-opening after Escape/press dismissal.
    const blockedReferenceRef = { current: null as Element | null };
    const keyboardModalityRef = { current: true };
    const timeout = new Timeout();
    onDestroy(timeout.clear);
    $effect(() => {
        const domReference = store.select('domReferenceElement');
        if (!enabled) {
            return undefined;
        }
        const win = getWindow(domReference);
        // If the reference was focused and the user left the tab/window, and the
        // floating element was not open, the focus should be blocked when they
        // return to the tab/window.
        function onfocusout() {
            const currentDomReference = store.select('domReferenceElement');
            if (!store.select('open') &&
                isHTMLElement(currentDomReference) &&
                currentDomReference === activeElement(ownerDocument(currentDomReference))) {
                blockFocusRef.current = true;
                blockedReferenceRef.current = currentDomReference;
            }
        }
        function onkeydown() {
            keyboardModalityRef.current = true;
        }
        function onpointerdown() {
            keyboardModalityRef.current = false;
        }
        return mergeCleanups(addEventListener(win, 'blur', onfocusout), isMacSafari && addEventListener(win, 'keydown', onkeydown, true), isMacSafari && addEventListener(win, 'pointerdown', onpointerdown, true));
    });
    $effect(() => {
        if (!enabled) {
            return undefined;
        }
        function onOpenChangeLocal(details: FloatingUIOpenChangeDetails) {
            if (details.reason === REASONS.triggerPress || details.reason === REASONS.escapeKey) {
                const referenceElement = store.select('domReferenceElement');
                if (isElement(referenceElement)) {
                    blockedReferenceRef.current = referenceElement;
                    blockFocusRef.current = true;
                }
            }
        }
        const installedEvents = events;
        installedEvents.on('openchange', onOpenChangeLocal);
        return () => {
            installedEvents.off('openchange', onOpenChangeLocal);
        };
    });
    const reference: ElementProps['reference'] = $derived.by(() => {
        function resetBlockedFocus() {
            blockFocusRef.current = false;
            blockedReferenceRef.current = null;
        }
        return {
            onmouseleave() {
                resetBlockedFocus();
            },
            onfocusin(event: FocusEvent) {
                const focusTarget = event.currentTarget as Element;
                if (blockFocusRef.current) {
                    if (blockedReferenceRef.current === focusTarget) {
                        return;
                    }
                    resetBlockedFocus();
                }
                const target = getTarget(event);
                if (isElement(target)) {
                    // Safari fails to match `:focus-visible` if focus was initially
                    // outside the document.
                    if (isMacSafari && !event.relatedTarget) {
                        if (!keyboardModalityRef.current && !isTypeableElement(target)) {
                            return;
                        }
                    }
                    else if (!matchesFocusVisible(target)) {
                        return;
                    }
                }
                const movedFromOtherEnabledTrigger = isTargetInsideEnabledTrigger(event.relatedTarget, store.context.triggerElements);
                const nativeEvent = event;
                const currentTarget = event.currentTarget;
                const delayValue = typeof delay === 'function' ? delay() : delay;
                if ((store.select('open') && movedFromOtherEnabledTrigger) ||
                    delayValue === 0 ||
                    delayValue === undefined) {
                    store.setOpen(true, createChangeEventDetails(REASONS.triggerFocus, nativeEvent, currentTarget as HTMLElement));
                    return;
                }
                timeout.start(delayValue, () => {
                    if (blockFocusRef.current) {
                        return;
                    }
                    store.setOpen(true, createChangeEventDetails(REASONS.triggerFocus, nativeEvent, currentTarget as HTMLElement));
                });
            },
            onfocusout(event: FocusEvent) {
                resetBlockedFocus();
                const relatedTarget = event.relatedTarget;
                const nativeEvent = event;
                // Hit the non-modal focus management portal guard. Focus will be
                // moved into the floating element immediately after.
                const movedToFocusGuard = isElement(relatedTarget) &&
                    relatedTarget.hasAttribute(createAttribute('focus-guard')) &&
                    relatedTarget.getAttribute('data-type') === 'outside';
                // Wait for the window blur listener to fire.
                timeout.start(0, () => {
                    const domReference = store.select('domReferenceElement');
                    const activeEl = activeElement(ownerDocument(domReference));
                    // Focus left the page, keep it open.
                    if (!relatedTarget && activeEl === domReference) {
                        return;
                    }
                    // When focusing the reference element (e.g. regular click), then
                    // clicking into the floating element, prevent it from hiding.
                    // Note: it must be focusable, e.g. `tabindex="-1"`.
                    // We can not rely on relatedTarget to point to the correct element
                    // as it will only point to the shadow host of the newly focused element
                    // and not the element that actually has received focus if it is located
                    // inside a shadow root.
                    if (contains(dataRef.current.floatingContext?.refs.floating.current, activeEl) ||
                        contains(domReference, activeEl) ||
                        movedToFocusGuard) {
                        return;
                    }
                    // If the next focused element is one of the triggers, do not close
                    // the floating element. The focus handler of that trigger will
                    // handle the open state.
                    const nextFocusedElement = relatedTarget ?? activeEl;
                    if (isTargetInsideEnabledTrigger(nextFocusedElement, store.context.triggerElements)) {
                        return;
                    }
                    store.setOpen(false, createChangeEventDetails(REASONS.triggerFocus, nativeEvent));
                });
            },
        };
    });
    return { get reference() { return enabled ? reference : undefined; }, get trigger() { return enabled ? reference : undefined; } };
}
