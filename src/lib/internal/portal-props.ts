// Derived from Base UI v1.8.0 packages/react/src/dialog/portal/DialogPortal.tsx
// and packages/react/src/popover/portal/PopoverPortal.tsx
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// Dialog and Popover share this host contract so the attribute props are not copied.

import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export interface PortalProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Whether to keep the portal mounted in the DOM while the popup is hidden.
	 * @default false
	 */
	keepMounted?: boolean;
	/** A parent element to render the portal element into. */
	container?: HTMLElement | ShadowRoot | null;
	children?: Snippet;
}
