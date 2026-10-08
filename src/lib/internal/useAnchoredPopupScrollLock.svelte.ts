// Derived from Base UI v1.8.0 packages/react/src/utils/useAnchoredPopupScrollLock.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// A touch-opened popup locks only when it is within 20px of the viewport width.
// Hover-open passes `enabled: false`, so it does not lock.

import { ownerDocument } from './owner.js';
import { useScrollLock } from './useScrollLock.svelte.js';

const VIEWPORT_WIDTH_TOLERANCE_PX = 20;

export function useAnchoredPopupScrollLock(
	params: () => {
		enabled: boolean;
		touchOpen: boolean;
		positionerElement: HTMLElement | null;
		referenceElement: Element | null;
	}
) {
	let touchOpenShouldLockScroll = $state(false);

	$effect.pre(() => {
		const { enabled, touchOpen, positionerElement } = params();
		if (!enabled || !touchOpen || positionerElement == null) {
			touchOpenShouldLockScroll = false;
			return;
		}
		const viewportWidth = ownerDocument(positionerElement).documentElement.clientWidth;
		const popupWidth = positionerElement.offsetWidth;
		touchOpenShouldLockScroll =
			viewportWidth > 0 &&
			popupWidth > 0 &&
			popupWidth >= viewportWidth - VIEWPORT_WIDTH_TOLERANCE_PX;
	});

	useScrollLock(() => {
		const { enabled, touchOpen, referenceElement } = params();
		return {
			enabled: enabled && (!touchOpen || touchOpenShouldLockScroll),
			referenceElement
		};
	});
}
