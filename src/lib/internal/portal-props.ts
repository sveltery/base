// Derived from Base UI v1.8.0 packages/react/src/dialog/portal/DialogPortal.tsx
// and packages/react/src/popover/portal/PopoverPortal.tsx
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// Dialog and Popover share this host contract so the attribute props are not copied.

import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export interface PortalProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Keep the portal mounted while the popup is closed.
	 * @default false
	 */
	keepMounted?: boolean;
	/**
	 * Element the portal is appended to.
	 * `undefined` uses the parent portal or `document.body`.
	 * `null` waits and does not mount until an element or shadow root is set.
	 * There is no ref object.
	 */
	container?: HTMLElement | ShadowRoot | null;
	children?: Snippet;
}
