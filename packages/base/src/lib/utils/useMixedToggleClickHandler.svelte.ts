// Original mixed-toggle handler full business, native live-reader boundary (MIT).
/* eslint-disable @typescript-eslint/no-empty-object-type -- Original empty State contract. */
import { ownerDocument } from './owner.js';
import { EMPTY_OBJECT } from './empty.js';
import type { BaseUIEvent } from '../internals/types.js';
/**
 * Returns `click` and `mousedown` handlers that fix the behavior of triggers of popups that are toggled by different events.
 * For example, a button that opens a popup on mousedown and closes it on click.
 * This hook prevents the popup from closing immediately after the mouse button is released.
 */
export function useMixedToggleClickHandler(getParams: () => UseMixedToggleClickHandlerParameters) {
    const { enabled = true, mouseDownAction, open } = $derived(getParams());
    const ignoreClickRef = { current: false };
    const props = $derived.by(() => {
        if (!enabled) {
            return EMPTY_OBJECT;
        }
        return {
            onmousedown: (event: MouseEvent) => {
                if ((mouseDownAction === 'open' && !open) || (mouseDownAction === 'close' && open)) {
                    ignoreClickRef.current = true;
                    ownerDocument(event.currentTarget as Element).addEventListener('click', () => {
                        ignoreClickRef.current = false;
                    }, { once: true });
                }
            },
            onclick: (event: BaseUIEvent<MouseEvent>) => {
                if (ignoreClickRef.current) {
                    ignoreClickRef.current = false;
                    event.preventBaseUIHandler();
                }
            },
        };
    });
    return () => props;
}
export interface UseMixedToggleClickHandlerParameters {
    /**
     * Whether the mixed toggle click handler is enabled.
     * @default true
     */
    enabled?: boolean | undefined;
    /**
     * Determines what action is performed on mousedown.
     */
    mouseDownAction: 'open' | 'close';
    /**
     * The current open state of the popup.
     */
    open: boolean;
}
export interface UseMixedToggleClickHandlerState {
}
