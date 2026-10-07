// Derived from Base UI v1.8.0 packages/react/src/number-field/utils/getViewportRect.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import { ownerWindow } from '../internal/owner.js';

/** Bounds the virtual scrub cursor wraps within, as absolute edge coordinates. */
export function getViewportRect(teleportDistance: number | undefined, scrubAreaEl: HTMLElement) {
	const win = ownerWindow(scrubAreaEl);

	if (teleportDistance != null) {
		const rect = scrubAreaEl.getBoundingClientRect();
		return {
			left: rect.left - teleportDistance / 2,
			top: rect.top - teleportDistance / 2,
			right: rect.right + teleportDistance / 2,
			bottom: rect.bottom + teleportDistance / 2
		};
	}

	const visualViewport = win.visualViewport;
	if (visualViewport) {
		return {
			left: visualViewport.offsetLeft,
			top: visualViewport.offsetTop,
			right: visualViewport.offsetLeft + visualViewport.width,
			bottom: visualViewport.offsetTop + visualViewport.height
		};
	}

	return {
		left: 0,
		top: 0,
		right: win.document.documentElement.clientWidth,
		bottom: win.document.documentElement.clientHeight
	};
}
