// Derived from Base UI v1.8.0 packages/react/src/popover/root/PopoverRootContext.ts,
// packages/react/src/popover/portal/PopoverPortalContext.ts, and
// packages/react/src/popover/positioner/PopoverPositionerContext.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import { getContext, hasContext, setContext } from 'svelte';
import type { UseAnchorPositioningReturn } from '../internal/popups/index.js';
import type { PopoverStore } from './store.svelte.js';

const ROOT = Symbol('popover-root');
const PORTAL = Symbol('popover-portal');
const POSITIONER = Symbol('popover-positioner');
const CLOSE_PARTS = Symbol('popover-close-parts');

const ROOT_ERROR =
	'Base UI: PopoverRootContext is missing. Popover parts must be placed within <Popover.Root>.';
const PORTAL_ERROR = 'Base UI: <Popover.Portal> is missing.';
const POSITIONER_ERROR =
	'Base UI: PopoverPositionerContext is missing. PopoverPositioner parts must be placed within <Popover.Positioner>.';

export function setPopoverRoot(store: PopoverStore) {
	setContext(ROOT, store);
}

export function usePopoverRoot(optional: true): PopoverStore | undefined;
export function usePopoverRoot(optional?: false): PopoverStore;
export function usePopoverRoot(optional = false) {
	if (!hasContext(ROOT)) {
		if (optional) return undefined;
		throw new Error(ROOT_ERROR);
	}
	return getContext<PopoverStore>(ROOT);
}

export function setPopoverPortal() {
	setContext(PORTAL, true);
}

export function usePopoverPortal() {
	if (!hasContext(PORTAL)) throw new Error(PORTAL_ERROR);
	return getContext<boolean>(PORTAL);
}

export function setPopoverPositioner(positioning: UseAnchorPositioningReturn) {
	setContext(POSITIONER, positioning);
}

export function usePopoverPositioner() {
	if (!hasContext(POSITIONER)) throw new Error(POSITIONER_ERROR);
	return getContext<UseAnchorPositioningReturn>(POSITIONER);
}

export interface ClosePartRegistration {
	count: number;
	register: () => () => void;
}

export function setCloseParts(parts: ClosePartRegistration) {
	setContext(CLOSE_PARTS, parts);
}

export function useCloseParts(): ClosePartRegistration | undefined {
	if (!hasContext(CLOSE_PARTS)) return undefined;
	return getContext<ClosePartRegistration>(CLOSE_PARTS);
}
