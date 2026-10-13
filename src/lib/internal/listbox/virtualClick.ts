// Derived from Base UI v1.9.0 packages/react/src/floating-ui-react/utils/event.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// The floating-ui-svelte package keeps its copy internal.

import { platform } from '@sveltery/utils';

/** A click from the keyboard or assistive technology rather than a pointer. */
export function isVirtualClick(event: MouseEvent | PointerEvent): boolean {
	if ('pointerType' in event && event.pointerType === '' && event.isTrusted) return true;
	if (platform.os.android && 'pointerType' in event && event.pointerType) {
		return event.type === 'click' && event.buttons === 1;
	}
	return event.detail === 0 && !('pointerType' in event && event.pointerType);
}
