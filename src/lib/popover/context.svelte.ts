// Derived from Base UI v1.8.0 packages/react/src/popover/root/PopoverRootContext.ts,
// packages/react/src/popover/portal/PopoverPortalContext.ts, and
// packages/react/src/popover/positioner/PopoverPositionerContext.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import { defineContext, defineOptionalContext } from '../internal/context.js';
import type { AnchorPositioning } from '../internal/popups/index.js';
import type { PopoverStore } from './store.svelte.js';

export const [usePopoverRoot, setPopoverRoot, findPopoverRoot] = defineContext<PopoverStore>(
	'Base UI: PopoverRootContext is missing. Popover parts must be placed within <Popover.Root>.'
);

export const [usePopoverPortal, setPopoverPortal] = defineContext<true>(
	'Base UI: <Popover.Portal> is missing.'
);

export const [usePopoverPositioner, setPopoverPositioner] = defineContext<AnchorPositioning>(
	'Base UI: PopoverPositionerContext is missing. PopoverPositioner parts must be placed within <Popover.Positioner>.'
);

export interface ClosePartRegistration {
	count: number;
	register: () => () => void;
}

export const [useCloseParts, setCloseParts] = defineOptionalContext<
	ClosePartRegistration | undefined
>(undefined);
