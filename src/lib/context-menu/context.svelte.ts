// Derived from Base UI v1.9.0 packages/react/src/context-menu/root/ContextMenuRootContext.ts
// and packages/react/src/context-menu/root/ContextMenuRoot.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// The menu parts read this object as `ContextMenuParentContext` (../menu/parent.svelte.ts).
// Upstream ref objects are mutable fields. `actionsRef` and `positionerRef` are `menu`, which
// `Menu.Root` publishes. `allowMouseUpTriggerRef` is `mouseUpGate`.

import { defineContext } from '../internal/context.js';
import type {
	ContextMenuParentContext,
	ContextMenuTarget,
	MouseUpGate
} from '../menu/parent.svelte.js';

type Anchor = { getBoundingClientRect(): DOMRect };

const ORIGIN: Anchor = {
	getBoundingClientRect: () => DOMRect.fromRect({ width: 0, height: 0, x: 0, y: 0 })
};

export class ContextMenuRootContext implements ContextMenuParentContext {
	anchor = $state.raw<Anchor>(ORIGIN);
	backdropElement = $state<HTMLElement | null>(null);
	internalBackdropElement = $state<HTMLElement | null>(null);
	triggerElement = $state<HTMLElement | null>(null);
	menu: ContextMenuTarget | null = null;
	readonly mouseUpGate: MouseUpGate = { allow: true };
	initialCursorPoint: { x: number; y: number } | null = null;

	constructor(readonly rootId: string) {}

	/** A touch anchor is a 10px square around the finger. A mouse anchor is the pointer. */
	anchorAt(x: number, y: number, touch: boolean) {
		const size = touch ? 10 : 0;
		this.anchor = {
			getBoundingClientRect: () => DOMRect.fromRect({ width: size, height: size, x, y })
		};
	}
}

export const [useContextMenuRoot, setContextMenuRoot] = defineContext<ContextMenuRootContext>(
	'Base UI: ContextMenuRootContext is missing. ContextMenu parts must be placed within <ContextMenu.Root>.'
);
